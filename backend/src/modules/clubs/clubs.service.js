const { db } = require("../../config/db");
const ApiError = require("../../shared/ApiError");
const { validateClubPayload } = require("./clubs.validation");

const DEMO_PUBLIC_CLUB_NAMES = new Set(["nile innovators club"]);

function filterPublicSignupClubs(clubs) {
  return (clubs ?? []).filter((club) => !DEMO_PUBLIC_CLUB_NAMES.has(String(club.name ?? "").trim().toLowerCase()));
}

function stripPrivateClubSettings(club) {
  const { whatsapp_group_name, whatsapp_onboarding_notes, ...publicClub } = club;
  return publicClub;
}

async function listVisibleClubs(options) {
  const { actor, database = db } = options;

  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  if (actor.role === "admin" || actor.role === "president" || actor.role === "student") {
    const clubs = await database.listClubs();
    return actor.role === "admin" ? clubs : clubs.map(stripPrivateClubSettings);
  }

  if (actor.role === "advisor") {
    return (await database.listClubs({ advisorId: actor.id })).map(stripPrivateClubSettings);
  }

  if (actor.role === "executive") {
    if (!actor.clubId) {
      return [];
    }

    return (await database.listClubs({ ids: [actor.clubId] })).map(stripPrivateClubSettings);
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
    return filteredScopedClubs.map(stripPrivateClubSettings);
  }

  // If production clubs exist but have not been flagged public yet, avoid a blank signup flow.
  return filterPublicSignupClubs(await database.listClubs()).map(stripPrivateClubSettings);
}

function requireAdmin(actor) {
  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  if (actor.role !== "admin") {
    throw new ApiError(403, "Only Club Services admins can manage clubs", "FORBIDDEN");
  }
}

async function createClub(options) {
  const { actor, payload, database = db } = options;
  requireAdmin(actor);
  const existingClubs = database.listClubs ? await database.listClubs() : [];
  const sharedSettings = existingClubs[0]?.id && database.getClubPaymentSettings
    ? await database.getClubPaymentSettings(existingClubs[0].id)
    : null;
  const club = await database.createClub({
    ...validateClubPayload(payload),
    dues_amount: 10000
  });

  if (database.upsertClubPaymentSettings) {
    await database.upsertClubPaymentSettings({
      club_id: club.id,
      bank_name: sharedSettings?.bank_name || "Providus Bank",
      account_number: sharedSettings?.account_number || "1305861314",
      account_name: sharedSettings?.account_name || "Nile Arts & Creative Hub",
      payment_instructions:
        sharedSettings?.payment_instructions ||
        "All students pay N10,000 per session. Submit the payment reference and receipt used for Club Services review.",
      fresher_dues_amount: 10000,
      returning_student_dues_amount: 10000
    });
  }

  return club;
}

async function updateClub(options) {
  const { actor, clubId, payload, database = db } = options;
  requireAdmin(actor);

  const club = await database.getClubById(clubId);

  if (!club) {
    throw new ApiError(404, "Club not found", "CLUB_NOT_FOUND");
  }

  return database.updateClub(clubId, validateClubPayload(payload, { partial: true }));
}

module.exports = {
  createClub,
  listPublicClubs,
  listVisibleClubs,
  updateClub
};
