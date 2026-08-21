const { getEnv } = require("../../config/env");
const { decryptToken, encryptToken } = require("./campusOneTokens");

function getNotificationTitle(type) {
  const titles = {
    announcement_published: "New announcement",
    proposal_submitted: "Proposal needs review",
    proposal_resubmitted: "Proposal resubmitted",
    advisor_approved: "Advisor approved proposal",
    advisor_rejected: "Advisor rejected proposal",
    pending_admin_review: "Proposal needs admin review",
    admin_approved: "Proposal approved",
    admin_rejected: "Proposal rejected",
    event_reminder: "Event reminder",
    event_report_submitted: "Event report submitted",
    missing_report_prompt: "Event report is due",
    dues_proof_rejected: "Dues proof needs another upload"
  };
  return titles[type] || "OneClub notification";
}

function isCampusOneNotificationsConfigured(env = getEnv()) {
  return String(env.CAMPUS_ONE_NOTIFICATIONS_ENABLED).toLowerCase() === "true"
    && Boolean(env.CAMPUS_ONE_API_BASE_URL && env.CAMPUS_ONE_CLIENT_ID && env.CAMPUS_ONE_CLIENT_SECRET && env.CAMPUS_ONE_TOKEN_ENCRYPTION_KEY);
}

function mapCampusOneType(notification) {
  if (["admin_approved", "advisor_approved"].includes(notification.type)) return "success";
  if (["admin_rejected", "advisor_rejected", "missing_report_prompt", "dues_proof_rejected"].includes(notification.type)) return "action_required";
  if (["proposal_submitted", "proposal_resubmitted", "pending_admin_review"].includes(notification.type)) return "warning";
  return "info";
}

async function refreshAuthorization(record, database, env) {
  const refreshToken = decryptToken(record.refresh_token_ciphertext, env);
  if (!refreshToken) return null;
  const response = await fetch(`${env.CAMPUS_ONE_ISSUER.replace(/\/+$/, "")}/api/auth/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: env.CAMPUS_ONE_CLIENT_ID,
      client_secret: env.CAMPUS_ONE_CLIENT_SECRET
    })
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.access_token) return null;
  return database.upsertCampusOneAuthorization({
    profile_id: record.profile_id,
    access_token_ciphertext: encryptToken(payload.access_token, env),
    refresh_token_ciphertext: encryptToken(payload.refresh_token || refreshToken, env),
    scopes: String(payload.scope || record.scopes.join(" ")).split(/\s+/).filter(Boolean),
    access_token_expires_at: payload.expires_in ? new Date(Date.now() + Number(payload.expires_in) * 1000).toISOString() : null,
    disconnected_at: null,
    updated_at: new Date().toISOString()
  });
}

async function getUsableAuthorization(profileId, database, env) {
  let record = await database.getCampusOneAuthorization(profileId);
  if (!record || record.disconnected_at || !record.scopes?.includes("notifications")) return null;
  if (record.access_token_expires_at && new Date(record.access_token_expires_at).getTime() <= Date.now() + 30_000) {
    record = await refreshAuthorization(record, database, env);
  }
  return record;
}

async function recordDelivery(database, notificationId, update) {
  if (!database.upsertNotificationDelivery || !notificationId) return null;
  return database.upsertNotificationDelivery({ notification_id: notificationId, channel: "campus_one", ...update, updated_at: new Date().toISOString() });
}

async function sendOne(notification, { database, env = getEnv(), logger = console }) {
  if (!notification.id || !isCampusOneNotificationsConfigured(env)) return { skipped: true, reason: "campus_one_disabled" };
  await recordDelivery(database, notification.id, { status: "pending", attempt_count: 1, last_error_code: null });
  let authorization = await getUsableAuthorization(notification.user_id, database, env);
  if (!authorization) {
    await recordDelivery(database, notification.id, { status: "skipped", attempt_count: 1, last_error_code: "consent_or_token_missing" });
    return { skipped: true, reason: "consent_or_token_missing" };
  }
  const request = async (record) => fetch(`${env.CAMPUS_ONE_API_BASE_URL.replace(/\/+$/, "")}/notifications`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${decryptToken(record.access_token_ciphertext, env)}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `clubly-notification-${notification.id}`
    },
    body: JSON.stringify({ title: getNotificationTitle(notification.type), body: notification.message, type: mapCampusOneType(notification), targetUrl: new URL("/notifications", env.FRONTEND_APP_URL).toString() })
  });
  let attemptCount = 1;
  let response = await request(authorization);
  if (response.status === 401) {
    authorization = await refreshAuthorization(authorization, database, env);
    if (authorization) response = await request(authorization);
  }
  while ((response.status === 429 || response.status >= 500) && attemptCount < 3) {
    await new Promise((resolve) => setTimeout(resolve, 250 * (2 ** (attemptCount - 1))));
    attemptCount += 1;
    response = await request(authorization);
  }
  const body = await response.json().catch(() => null);
  if (response.ok) {
    await recordDelivery(database, notification.id, { status: "sent", attempt_count: attemptCount, external_id: body?.id || null, last_error_code: null, sent_at: new Date().toISOString() });
    return { sent: true, externalId: body?.id || null };
  }
  const errorCode = response.status === 403 ? "consent_required" : response.status === 429 ? "rate_limited" : response.status >= 500 ? "campus_one_unavailable" : "campus_one_rejected";
  await recordDelivery(database, notification.id, { status: response.status === 403 ? "skipped" : "failed", attempt_count: attemptCount, last_error_code: errorCode });
  logger.warn?.("campus_one.notification_failed", { notification_id: notification.id, status_code: response.status, error_code: errorCode });
  return { sent: false, status: response.status, errorCode };
}

async function sendCampusOneForNotifications({ notifications = [], database, env, logger }) {
  const results = [];
  for (const notification of notifications) results.push(await sendOne(notification, { database, env, logger }));
  return { attempted: results.length, sent: results.filter((item) => item.sent).length, results };
}

async function getCampusOneConnectionStatus(profileId, database, env = getEnv()) {
  const authorization = database.getCampusOneAuthorization ? await database.getCampusOneAuthorization(profileId) : null;
  return {
    enabled: isCampusOneNotificationsConfigured(env),
    connected: Boolean(authorization && !authorization.disconnected_at && authorization.scopes?.includes("notifications")),
    consent_required: Boolean(isCampusOneNotificationsConfigured(env) && (!authorization || !authorization.scopes?.includes("notifications")))
  };
}

module.exports = { getCampusOneConnectionStatus, isCampusOneNotificationsConfigured, mapCampusOneType, sendCampusOneForNotifications };
