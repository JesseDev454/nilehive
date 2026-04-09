const { db } = require("../../config/db");
const ApiError = require("../../shared/ApiError");

async function listOwnNotifications(options) {
  const { actor, database = db } = options;

  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  return database.listNotificationsByUserId(actor.id);
}

module.exports = {
  listOwnNotifications
};
