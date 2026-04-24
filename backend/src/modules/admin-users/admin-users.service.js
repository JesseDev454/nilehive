const { db } = require("../../config/db");
const ApiError = require("../../shared/ApiError");
const { writeAuditLog } = require("../../shared/auditLog");
const {
  validateAdvisorAssignmentPayload,
  validateRoleUpdatePayload
} = require("./admin-users.validation");

function requireAdmin(actor) {
  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  if (actor.role !== "admin") {
    throw new ApiError(403, "Only admins can manage users", "FORBIDDEN");
  }
}

function formatClub(club) {
  return club ? { id: club.id, name: club.name, code: club.code } : null;
}

function formatProfile(profile) {
  return {
    id: profile.id,
    full_name: profile.full_name,
    role: profile.role,
    club_id: profile.club_id,
    student_id: profile.student_id ?? null,
    requested_role: profile.requested_role ?? null,
    onboarding_status: profile.onboarding_status ?? "complete",
    account_status: profile.account_status ?? "active",
    club: formatClub(profile.club),
    created_at: profile.created_at,
    updated_at: profile.updated_at
  };
}

async function writeRoleHistory(database, actor, profile, update, remarks) {
  if (!database.createProfileRoleHistory) {
    return null;
  }

  return database.createProfileRoleHistory({
    profile_id: profile.id,
    previous_role: profile.role,
    new_role: update.role,
    previous_club_id: profile.club_id ?? null,
    new_club_id: update.club_id ?? null,
    changed_by: actor.id,
    remarks: remarks ?? null
  });
}

async function listAdminUsers(options) {
  const { actor, filters = {}, database = db } = options;
  requireAdmin(actor);

  const profiles = await database.listProfiles({
    role: filters.role,
    clubId: filters.club_id,
    requestedRole: filters.requested_role,
    q: filters.q
  });

  return profiles.map(formatProfile);
}

async function getAdminUser(options) {
  const { actor, profileId, database = db } = options;
  requireAdmin(actor);

  const profile = await database.getProfileById(profileId);

  if (!profile) {
    throw new ApiError(404, "Profile not found", "PROFILE_NOT_FOUND");
  }

  return formatProfile(profile);
}

async function updateAdminUserRole(options) {
  const { actor, profileId, payload, database = db } = options;
  requireAdmin(actor);

  const profile = await database.getProfileById(profileId);

  if (!profile) {
    throw new ApiError(404, "Profile not found", "PROFILE_NOT_FOUND");
  }

  const validatedPayload = validateRoleUpdatePayload(payload);
  const update = {
    role: validatedPayload.role,
    club_id: validatedPayload.club_id
  };

  if (["executive", "president"].includes(update.role) && !update.club_id) {
    throw new ApiError(400, "A club is required for president and executive roles", "VALIDATION_ERROR", {
      field: "club_id"
    });
  }

  if (["student", "advisor", "admin"].includes(update.role) && update.club_id === undefined) {
    update.club_id = null;
  }

  if (update.club_id) {
    const club = await database.getClubById(update.club_id);

    if (!club) {
      throw new ApiError(400, "Selected club does not exist", "INVALID_CLUB", {
        field: "club_id"
      });
    }
  }

  if (profile.role === "advisor" && update.role !== "advisor" && database.clearClubAdvisorAssignments) {
    await database.clearClubAdvisorAssignments(profile.id);
  }

  const updatedProfile = await database.updateProfile(profile.id, update);
  const history = await writeRoleHistory(database, actor, profile, update, validatedPayload.remarks);
  await writeAuditLog(database, {
    actor_id: actor.id,
    entity_type: "profile",
    action: "role_updated",
    target_profile_id: profile.id,
    club_id: update.club_id ?? profile.club_id ?? null,
    remarks: validatedPayload.remarks,
    metadata: {
      previous_role: profile.role,
      new_role: update.role,
      previous_club_id: profile.club_id ?? null,
      new_club_id: update.club_id ?? null
    }
  });

  return { profile: formatProfile(updatedProfile), history };
}

async function assignAdvisorToClub(options) {
  const { actor, profileId, payload, database = db } = options;
  requireAdmin(actor);

  const profile = await database.getProfileById(profileId);

  if (!profile) {
    throw new ApiError(404, "Profile not found", "PROFILE_NOT_FOUND");
  }

  const validatedPayload = validateAdvisorAssignmentPayload(payload);
  const club = await database.getClubById(validatedPayload.club_id);

  if (!club) {
    throw new ApiError(400, "Selected club does not exist", "INVALID_CLUB", {
      field: "club_id"
    });
  }

  if (club.advisor_id && club.advisor_id !== profile.id && !validatedPayload.replace_existing) {
    throw new ApiError(409, "This club already has an advisor assigned", "ADVISOR_ALREADY_ASSIGNED");
  }

  if (database.clearClubAdvisorAssignments) {
    await database.clearClubAdvisorAssignments(profile.id);
  }

  const updatedProfile = await database.updateProfile(profile.id, { role: "advisor", club_id: club.id });
  const updatedClub = await database.updateClubAdvisor(club.id, profile.id);
  const history = await writeRoleHistory(
    database,
    actor,
    profile,
    { role: "advisor", club_id: club.id },
    validatedPayload.remarks
  );
  await writeAuditLog(database, {
    actor_id: actor.id,
    entity_type: "club",
    action: "advisor_assigned",
    target_profile_id: profile.id,
    club_id: club.id,
    remarks: validatedPayload.remarks,
    metadata: {
      replace_existing: validatedPayload.replace_existing,
      advisor_profile_id: profile.id,
      club_id: club.id
    }
  });

  return { profile: formatProfile(updatedProfile), club: updatedClub, history };
}

module.exports = {
  assignAdvisorToClub,
  getAdminUser,
  listAdminUsers,
  updateAdminUserRole
};
