const { db } = require("../../config/db");
const ApiError = require("../../shared/ApiError");
const { ensurePaginatedResult } = require("../../shared/pagination");

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

module.exports = {
  listOwnNotifications
};
