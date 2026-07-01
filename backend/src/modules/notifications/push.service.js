const webpush = require("web-push");
const { getEnv } = require("../../config/env");

let configuredKey = null;

function getPushConfig(env = getEnv()) {
  return {
    publicKey: env.WEB_PUSH_PUBLIC_KEY,
    privateKey: env.WEB_PUSH_PRIVATE_KEY,
    subject: env.WEB_PUSH_SUBJECT
  };
}

function isPushConfigured(env = getEnv()) {
  const config = getPushConfig(env);
  return Boolean(config.publicKey && config.privateKey && config.subject);
}

function configureWebPush(env = getEnv()) {
  const config = getPushConfig(env);
  const nextKey = `${config.subject}:${config.publicKey}:${config.privateKey}`;

  if (!isPushConfigured(env)) {
    return false;
  }

  if (configuredKey !== nextKey) {
    webpush.setVapidDetails(config.subject, config.publicKey, config.privateKey);
    configuredKey = nextKey;
  }

  return true;
}

function buildBrowserSubscription(record) {
  return {
    endpoint: record.endpoint,
    keys: {
      p256dh: record.p256dh,
      auth: record.auth
    }
  };
}

function normalizeUrl(url) {
  if (!url) {
    return "/notifications";
  }

  return url.startsWith("/") ? url : "/notifications";
}

function getNotificationTitle(type) {
  const labels = {
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

  return labels[type] ?? "NileHive notification";
}

function buildPushPayloadFromNotification(notification, overrides = {}) {
  return {
    title: overrides.title ?? getNotificationTitle(notification.type),
    body: overrides.body ?? notification.message,
    url: normalizeUrl(overrides.url ?? "/notifications"),
    notification_id: notification.id ?? null,
    proposal_id: notification.proposal_id ?? null,
    announcement_id: notification.announcement_id ?? null,
    type: notification.type
  };
}

async function sendPushToUsers(options) {
  const {
    database,
    userIds,
    payload,
    env = getEnv(),
    logger = console
  } = options;
  const uniqueUserIds = [...new Set((userIds ?? []).filter(Boolean))];

  if (!uniqueUserIds.length || typeof database.listPushSubscriptionsByUserIds !== "function") {
    return { attempted: 0, sent: 0, skipped: true };
  }

  if (!configureWebPush(env)) {
    return { attempted: 0, sent: 0, skipped: true, reason: "push_not_configured" };
  }

  const subscriptions = await database.listPushSubscriptionsByUserIds(uniqueUserIds);
  const encodedPayload = JSON.stringify(payload);
  let sent = 0;

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(buildBrowserSubscription(subscription), encodedPayload);
        sent += 1;

        if (typeof database.markPushSubscriptionUsed === "function") {
          await database.markPushSubscriptionUsed(subscription.endpoint);
        }
      } catch (error) {
        const statusCode = error?.statusCode;

        if ((statusCode === 404 || statusCode === 410) && typeof database.deletePushSubscriptionByEndpoint === "function") {
          await database.deletePushSubscriptionByEndpoint(subscription.endpoint);
          return;
        }

        logger.warn?.("push.delivery_failed", {
          user_id: subscription.user_id,
          status_code: statusCode,
          cause: error instanceof Error ? error.message : "unknown_error"
        });
      }
    })
  );

  return {
    attempted: subscriptions.length,
    sent
  };
}

async function sendPushForNotifications(options) {
  const { notifications = [], database, logger, env } = options;

  if (!notifications.length) {
    return { attempted: 0, sent: 0 };
  }

  let attempted = 0;
  let sent = 0;

  for (const notification of notifications) {
    const result = await sendPushToUsers({
      database,
      userIds: [notification.user_id],
      payload: buildPushPayloadFromNotification(notification),
      logger,
      env
    });

    attempted += result.attempted ?? 0;
    sent += result.sent ?? 0;
  }

  return { attempted, sent };
}

function validateSubscriptionPayload(payload) {
  const endpoint = typeof payload?.endpoint === "string" ? payload.endpoint.trim() : "";
  const p256dh = typeof payload?.keys?.p256dh === "string" ? payload.keys.p256dh.trim() : "";
  const auth = typeof payload?.keys?.auth === "string" ? payload.keys.auth.trim() : "";

  if (!endpoint || !p256dh || !auth) {
    const ApiError = require("../../shared/ApiError");
    throw new ApiError(400, "Push subscription endpoint and keys are required", "VALIDATION_ERROR");
  }

  return { endpoint, p256dh, auth };
}

async function registerPushSubscription(options) {
  const { actor, payload, userAgent = null, database } = options;

  if (!actor) {
    const ApiError = require("../../shared/ApiError");
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  const subscription = validateSubscriptionPayload(payload);

  return database.upsertPushSubscription({
    user_id: actor.id,
    endpoint: subscription.endpoint,
    p256dh: subscription.p256dh,
    auth: subscription.auth,
    user_agent: userAgent
  });
}

async function removePushSubscription(options) {
  const { actor, payload, database } = options;

  if (!actor) {
    const ApiError = require("../../shared/ApiError");
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  const endpoint = typeof payload?.endpoint === "string" ? payload.endpoint.trim() : "";

  if (!endpoint) {
    const ApiError = require("../../shared/ApiError");
    throw new ApiError(400, "Push subscription endpoint is required", "VALIDATION_ERROR");
  }

  await database.deletePushSubscriptionForUser(actor.id, endpoint);

  return { removed: true };
}

module.exports = {
  buildPushPayloadFromNotification,
  getPushConfig,
  isPushConfigured,
  registerPushSubscription,
  removePushSubscription,
  sendPushForNotifications,
  sendPushToUsers
};
