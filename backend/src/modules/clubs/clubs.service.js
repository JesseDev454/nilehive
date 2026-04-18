const { db } = require("../../config/db");
const ApiError = require("../../shared/ApiError");

async function listVisibleClubs(options) {
  const { actor, database = db } = options;

  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  if (actor.role === "admin" || actor.role === "president" || actor.role === "student") {
    return database.listClubs();
  }

  if (actor.role === "advisor") {
    return database.listClubs({ advisorId: actor.id });
  }

  if (actor.role === "executive") {
    if (!actor.clubId) {
      return [];
    }

    return database.listClubs({ ids: [actor.clubId] });
  }

  return [];
}

async function listPublicClubs(options = {}) {
  const { database = db } = options;
  return typeof database.listPublicClubs === "function"
    ? database.listPublicClubs()
    : database.listClubs();
}

module.exports = {
  listPublicClubs,
  listVisibleClubs
};
