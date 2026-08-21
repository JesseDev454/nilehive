const { db } = require("../../config/db");
const ApiError = require("../../shared/ApiError");
const { ensurePaginatedResult } = require("../../shared/pagination");
const {
  getPushConfig,
  isPushConfigured,
  registerPushSubscription,
  removePushSubscription
} = require("./push.service");
const { getCampusOneConnectionStatus } = require("./campusOne.service");

function requireActor(actor) {
  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }
}

function withDeliveryChannels(notification, deliveriesByNotification = {}) {
  return {
    ...notification,
    delivery_channels: deliveriesByNotification[notification.id] || {}
  };
}

async function listOwnNotifications(options) {
  const { actor, pagination, database = db } = options;

  requireActor(actor);

  const result = ensurePaginatedResult(await database.listNotificationsByUserId(actor.id, {
    pagination,
    sort: pagination?.sort,
    order: pagination?.order
  }), pagination);
  const deliveries = database.listNotificationDeliveries
    ? await database.listNotificationDeliveries(result.items.map((notification) => notification.id).filter(Boolean))
    : [];
  const byNotification = deliveries.reduce((map, delivery) => {
    (map[delivery.notification_id] ||= {})[delivery.channel] = delivery;
    return map;
  }, {});
  return {
    ...result,
    items: result.items.map((notification) => withDeliveryChannels(notification, byNotification))
  };
}

async function markOwnNotificationRead(options) {
  const { actor, notificationId, database = db } = options;
  requireActor(actor);

  if (!notificationId || typeof notificationId !== "string") {
    throw new ApiError(404, "Notification not found", "NOTIFICATION_NOT_FOUND");
  }

  if (typeof database.markNotificationRead !== "function") {
    throw new ApiError(404, "Notification not found", "NOTIFICATION_NOT_FOUND");
  }

  const notification = await database.markNotificationRead(notificationId, actor.id);

  if (!notification) {
    throw new ApiError(404, "Notification not found", "NOTIFICATION_NOT_FOUND");
  }

  return withDeliveryChannels(notification);
}

function getPushRegistrationConfig(options = {}) {
  const { env, actor, database = db } = options;
  const config = getPushConfig(env);
  const browser = {
    enabled: isPushConfigured(env),
    public_key: config.publicKey || null
  };
  return getCampusOneConnectionStatus(actor?.id, database, env).then((campusOne) => ({ ...browser, browser, campus_one: campusOne }));
}

module.exports = {
  getPushRegistrationConfig,
  listOwnNotifications,
  markOwnNotificationRead,
  registerPushSubscription,
  removePushSubscription
};
