const { db } = require("../../config/db");
const ApiError = require("../../shared/ApiError");
const { ensurePaginatedResult } = require("../../shared/pagination");
const {
  getPushConfig,
  isPushConfigured,
  registerPushSubscription,
  removePushSubscription
} = require("./push.service");

async function listOwnNotifications(options) {
  const { actor, pagination, database = db } = options;

  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  return ensurePaginatedResult(await database.listNotificationsByUserId(actor.id, {
    pagination,
    sort: pagination?.sort,
    order: pagination?.order
  }), pagination);
}

function getPushRegistrationConfig(options = {}) {
  const { env } = options;
  const config = getPushConfig(env);

  return {
    enabled: isPushConfigured(env),
    public_key: config.publicKey || null
  };
}

module.exports = {
  getPushRegistrationConfig,
  listOwnNotifications,
  registerPushSubscription,
  removePushSubscription
};
