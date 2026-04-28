const { db } = require("../../config/db");
const ApiError = require("../../shared/ApiError");

const DEMO_PUBLIC_CLUB_NAMES = new Set(["nile innovators club"]);

function filterPublicSignupClubs(clubs) {
  return (clubs ?? []).filter((club) => !DEMO_PUBLIC_CLUB_NAMES.has(String(club.name ?? "").trim().toLowerCase()));
}

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
  const scopedClubs =
    typeof database.listPublicClubs === "function"
      ? await database.listPublicClubs()
      : await database.listClubs();
  const filteredScopedClubs = filterPublicSignupClubs(scopedClubs);

  if (filteredScopedClubs.length > 0 || typeof database.listClubs !== "function") {
    return filteredScopedClubs;
  }

  // If production clubs exist but have not been flagged public yet, avoid a blank signup flow.
  return filterPublicSignupClubs(await database.listClubs());
}

module.exports = {
  listPublicClubs,
  listVisibleClubs
};
