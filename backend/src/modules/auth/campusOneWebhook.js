const crypto = require("crypto");
const { getEnv } = require("../../config/env");

function verifyCampusOneSignature(rawBody, signature, secret) {
  if (!rawBody || !signature || !secret) return false;
  const expected = `sha256=${crypto.createHmac("sha256", secret).update(rawBody).digest("hex")}`;
  const providedBuffer = Buffer.from(String(signature));
  const expectedBuffer = Buffer.from(expected);
  return providedBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(providedBuffer, expectedBuffer);
}

function createCampusOneWebhookHandler(options = {}) {
  const { database, env = getEnv(), logger = console } = options;
  return async function campusOneWebhook(req, res) {
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || "");
    if (!verifyCampusOneSignature(rawBody, req.get("x-campus-one-signature"), env.CAMPUS_ONE_WEBHOOK_SECRET)) {
      res.status(401).json({ error: { code: "INVALID_WEBHOOK_SIGNATURE", message: "Invalid signature" } });
      return;
    }
    let event;
    try {
      event = JSON.parse(rawBody.toString("utf8"));
    } catch {
      res.status(400).json({ error: { code: "INVALID_WEBHOOK_PAYLOAD", message: "Invalid JSON" } });
      return;
    }
    const deliveryId = req.get("x-campus-one-delivery") || event.id;
    const eventType = req.get("x-campus-one-event") || event.event;
    if (!deliveryId || !eventType) {
      res.status(400).json({ error: { code: "INVALID_WEBHOOK_PAYLOAD", message: "Missing delivery metadata" } });
      return;
    }
    const stored = await database.createCampusOneWebhookEvent({
      delivery_id: deliveryId,
      event_type: eventType,
      payload: event,
      occurred_at: event.occurredAt || event.timestamp || null,
      status: "received"
    });
    if (!stored) {
      res.status(200).json({ data: { accepted: true, duplicate: true } });
      return;
    }
    try {
      const portalUserId = event.data?.user_id || event.data?.userId;
      const profile = portalUserId && database.getProfileByPortalUserId ? await database.getProfileByPortalUserId(portalUserId) : null;
      if (profile && eventType === "user.updated") {
        const update = {};
        if (event.data?.email) update.email = String(event.data.email).trim().toLowerCase();
        if (event.data?.name || event.data?.full_name) update.full_name = String(event.data.name || event.data.full_name).trim();
        if (Object.keys(update).length) await database.updateProfile(profile.id, update);
      }
      if (profile && ["user.deleted", "user.disconnected"].includes(eventType)) {
        if (database.disconnectCampusOneAuthorization) await database.disconnectCampusOneAuthorization(profile.id);
        await database.updateProfile(profile.id, { account_status: eventType === "user.deleted" ? "suspended" : "active" });
      }
      await database.updateCampusOneWebhookEvent(deliveryId, { status: profile || eventType.startsWith("session.") ? "processed" : "ignored", processed_at: new Date().toISOString() });
      res.status(200).json({ data: { accepted: true, duplicate: false } });
    } catch (error) {
      logger.error?.("campus_one.webhook_failed", { delivery_id: deliveryId, event_type: eventType, cause: error instanceof Error ? error.message : "unknown_error" });
      await database.updateCampusOneWebhookEvent(deliveryId, { status: "failed", error_code: "processing_failed", processed_at: new Date().toISOString() });
      res.status(500).json({ error: { code: "WEBHOOK_PROCESSING_FAILED", message: "Webhook processing failed" } });
    }
  };
}

module.exports = { createCampusOneWebhookHandler, verifyCampusOneSignature };
