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

async function listOwnNotifications(options) {
  const { actor, pagination, database = db } = options;

  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

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
  return { ...result, items: result.items.map((notification) => ({ ...notification, delivery_channels: byNotification[notification.id] || {} })) };
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
  registerPushSubscription,
  removePushSubscription
};
