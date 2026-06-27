const { db } = require("../../config/db");
const ApiError = require("../../shared/ApiError");
const { writeAuditLog } = require("../../shared/auditLog");
const {
  validateClubMediaPayload,
  validateClubPayload,
  validateClubProfilePayload
} = require("./clubs.validation");

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

function requireClubContentManager(actor, clubId) {
  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  if (actor.role === "admin") {
    return;
  }

  if (actor.role !== "president" || actor.clubId !== clubId) {
    throw new ApiError(403, "You can only manage content for your assigned club", "FORBIDDEN");
  }
}

async function getClubOrThrow(database, clubId) {
  const club = await database.getClubById(clubId);

  if (!club) {
    throw new ApiError(404, "Club not found", "CLUB_NOT_FOUND");
  }

  return club;
}

async function getClubDetail(options) {
  const { actor, clubId, database = db } = options;

  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  const visibleClubs = await listVisibleClubs({ actor, database });
  const club = visibleClubs.find((item) => item.id === clubId);

  if (!club) {
    throw new ApiError(404, "Club not found", "CLUB_NOT_FOUND");
  }

  return {
    ...club,
    gallery: database.listClubMedia ? await database.listClubMedia(clubId) : []
  };
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

async function updateClubProfile(options) {
  const { actor, clubId, payload, database = db } = options;
  requireClubContentManager(actor, clubId);
  await getClubOrThrow(database, clubId);
  const update = validateClubProfilePayload(payload);
  const club = await database.updateClub(clubId, update);

  await writeAuditLog(database, {
    actor_id: actor.id,
    entity_type: "club",
    action: "club_profile_updated",
    club_id: clubId,
    remarks: club.name,
    metadata: {
      fields: Object.keys(update)
    }
  });

  return actor.role === "admin" ? club : stripPrivateClubSettings(club);
}

async function listClubMedia(options) {
  const { actor, clubId, database = db } = options;

  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  await getClubDetail({ actor, clubId, database });
  return database.listClubMedia ? database.listClubMedia(clubId) : [];
}

async function createClubMedia(options) {
  const { actor, clubId, payload, database = db } = options;
  requireClubContentManager(actor, clubId);
  const club = await getClubOrThrow(database, clubId);
  const media = validateClubMediaPayload(payload);

  if (!media.storage_path.startsWith(`${clubId}/`)) {
    throw new ApiError(400, "Gallery images must be uploaded inside the club folder", "VALIDATION_ERROR", {
      field: "storage_path"
    });
  }

  const existingMedia = database.listClubMedia ? await database.listClubMedia(clubId) : [];

  if (existingMedia.length >= 12) {
    throw new ApiError(400, "A club gallery can contain up to 12 images", "CLUB_MEDIA_LIMIT_REACHED");
  }

  const created = await database.createClubMedia({
    ...media,
    club_id: clubId,
    uploaded_by: actor.id
  });

  await writeAuditLog(database, {
    actor_id: actor.id,
    entity_type: "club_media",
    action: "club_media_added",
    club_id: clubId,
    remarks: club.name,
    metadata: { media_id: created.id }
  });

  return created;
}

async function updateClubMedia(options) {
  const { actor, clubId, mediaId, payload, database = db } = options;
  requireClubContentManager(actor, clubId);
  await getClubOrThrow(database, clubId);
  const existing = await database.getClubMediaById(mediaId);

  if (!existing || existing.club_id !== clubId) {
    throw new ApiError(404, "Gallery image not found", "CLUB_MEDIA_NOT_FOUND");
  }

  const updated = await database.updateClubMedia(
    mediaId,
    validateClubMediaPayload(payload, { partial: true })
  );

  await writeAuditLog(database, {
    actor_id: actor.id,
    entity_type: "club_media",
    action: "club_media_updated",
    club_id: clubId,
    metadata: { media_id: mediaId }
  });

  return updated;
}

async function deleteClubMedia(options) {
  const { actor, clubId, mediaId, database = db } = options;
  requireClubContentManager(actor, clubId);
  await getClubOrThrow(database, clubId);
  const existing = await database.getClubMediaById(mediaId);

  if (!existing || existing.club_id !== clubId) {
    throw new ApiError(404, "Gallery image not found", "CLUB_MEDIA_NOT_FOUND");
  }

  await database.deleteClubMedia(mediaId);
  await writeAuditLog(database, {
    actor_id: actor.id,
    entity_type: "club_media",
    action: "club_media_deleted",
    club_id: clubId,
    metadata: { media_id: mediaId, storage_path: existing.storage_path }
  });
}

module.exports = {
  createClubMedia,
  createClub,
  deleteClubMedia,
  getClubDetail,
  listClubMedia,
  listPublicClubs,
  listVisibleClubs,
  updateClub,
  updateClubMedia,
  updateClubProfile
};
