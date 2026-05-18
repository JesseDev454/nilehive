const { db } = require("../../config/db");
const { logger: baseLogger } = require("../../config/logger");
const ApiError = require("../../shared/ApiError");
const { ensurePaginatedResult, mapPaginatedResult } = require("../../shared/pagination");
const {
  validateCreateMemberPayload,
  validateUpdateMemberPayload
} = require("./members.validation");
const {
  getCurrentAcademicSession,
  hasVerifiedCurrentSessionDues,
  recordMemberStatusHistory
} = require("./member-status");

function requireActor(actor) {
  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }
}

function requireSupportedMemberRole(actor) {
  if (!["admin", "president", "executive"].includes(actor.role)) {
    throw new ApiError(403, "This role cannot manage club members", "FORBIDDEN");
  }
}

function getScopedClubId(actor, requestedClubId = null) {
  if (actor.role === "admin") {
    return requestedClubId;
  }

  if (!actor.clubId) {
    throw new ApiError(409, "This profile is not linked to a club", "PROFILE_NOT_LINKED_TO_CLUB");
  }

  if (requestedClubId && requestedClubId !== actor.clubId) {
    throw new ApiError(403, "You can only manage members in your own club", "FORBIDDEN");
  }

  return actor.clubId;
}

function requirePresidentOrAdmin(actor) {
  if (!["admin", "president"].includes(actor.role)) {
    throw new ApiError(403, "Only presidents or admins can change member records", "FORBIDDEN");
  }
}

function ensureAllowedClubRoleChange(actor, requestedClubRole) {
  if (actor.role === "president" && requestedClubRole === "president") {
    throw new ApiError(403, "Only Club Services admins can assign president access", "FORBIDDEN");
  }
}

function isActivePresidentConstraintError(error) {
  const message = typeof error?.message === "string" ? error.message : "";
  const details = typeof error?.details === "string" ? error.details : "";
  const combined = `${message} ${details}`.toLowerCase();

  return (
    error?.code === "23505" &&
    (combined.includes("profiles_active_president_per_club_idx") ||
      combined.includes("active_president_per_club") ||
      combined.includes("role") && combined.includes("president") && combined.includes("club"))
  );
}

function formatPresidentConflictProfile(profile) {
  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    full_name: profile.full_name ?? null,
    student_id: profile.student_id ?? null,
    club_id: profile.club_id ?? null
  };
}

async function findExistingPresidentConflict({ database, member, targetProfileId = null }) {
  const existingPresidents = await database.listProfiles({
    role: "president",
    clubId: member.club_id
  });

  const currentPresident = existingPresidents.find((profile) => profile.id !== targetProfileId) ?? null;

  return currentPresident;
}

async function demoteExistingPresident({
  database,
  actor,
  currentPresident,
  clubId,
  log
}) {
  const updatedProfile = await database.updateProfile(currentPresident.id, {
    role: "student",
    club_id: currentPresident.club_id
  });

  const presidentMember = await database.getClubMemberByProfileAndClub(currentPresident.id, clubId);

  if (presidentMember) {
    await database.updateClubMember(presidentMember.id, {
      club_role: "member"
    });
  }

  if (database.createProfileRoleHistory) {
    await database.createProfileRoleHistory({
      profile_id: currentPresident.id,
      previous_role: currentPresident.role,
      new_role: "student",
      previous_club_id: currentPresident.club_id ?? null,
      new_club_id: currentPresident.club_id ?? null,
      changed_by: actor.id,
      remarks: "Demoted during president replacement from member management."
    });
  }

  log.info("members.president_replacement.demoted_existing_president", {
    demoted_profile_id: currentPresident.id,
    demoted_member_id: presidentMember?.id ?? null
  });

  return {
    profile: updatedProfile,
    member: presidentMember
  };
}

async function syncLinkedProfileRole({
  database,
  actor,
  member,
  previousClubRole = null,
  nextClubRole,
  replaceExistingPresident = false,
  logger = baseLogger
}) {
  if (!member?.profile_id || !nextClubRole || previousClubRole === nextClubRole) {
    return null;
  }

  const profile = await database.getProfileById(member.profile_id);

  if (!profile) {
    return null;
  }

  if (nextClubRole === "president") {
    const currentPresident = await findExistingPresidentConflict({
      database,
      member,
      targetProfileId: profile.id
    });

    if (currentPresident && !replaceExistingPresident) {
      logger.warn("members.president_replacement.conflict", {
        requested_member_id: member.id,
        requested_profile_id: profile.id,
        club_id: member.club_id,
        replacement_confirmed: false,
        current_president_id: currentPresident.id
      });

      throw new ApiError(
        409,
        "This club already has a president. Confirm replacement before continuing.",
        "PRESIDENT_ALREADY_EXISTS",
        {
          current_president: formatPresidentConflictProfile(currentPresident)
        }
      );
    }

    if (currentPresident) {
      await demoteExistingPresident({
        database,
        actor,
        currentPresident,
        clubId: member.club_id,
        log: logger
      });
    }

    let updatedProfile;

    try {
      updatedProfile = await database.updateProfile(profile.id, {
        role: "president",
        club_id: member.club_id
      });
    } catch (error) {
      if (isActivePresidentConstraintError(error)) {
        throw new ApiError(
          409,
          "This club already has a president. Confirm replacement before continuing.",
          "PRESIDENT_ALREADY_EXISTS",
          {
            current_president: formatPresidentConflictProfile(currentPresident)
          }
        );
      }

      throw error;
    }

    if (database.createProfileRoleHistory) {
      await database.createProfileRoleHistory({
        profile_id: profile.id,
        previous_role: profile.role,
        new_role: "president",
        previous_club_id: profile.club_id ?? null,
        new_club_id: member.club_id,
        changed_by: actor.id,
        remarks: "Club president assigned from member management."
      });
    }

    return updatedProfile;
  }

  if (nextClubRole === "executive") {
    const updatedProfile = await database.updateProfile(profile.id, {
      role: "executive",
      club_id: member.club_id
    });

    if (database.createProfileRoleHistory) {
      await database.createProfileRoleHistory({
        profile_id: profile.id,
        previous_role: profile.role,
        new_role: "executive",
        previous_club_id: profile.club_id ?? null,
        new_club_id: member.club_id,
        changed_by: actor.id,
        remarks:
          actor.role === "president"
            ? "Executive assigned by club president."
            : "Executive assigned from member management."
      });
    }

    return updatedProfile;
  }

  if (nextClubRole === "member" && ["executive", "president"].includes(profile.role) && profile.club_id === member.club_id) {
    const updatedProfile = await database.updateProfile(profile.id, {
      role: "student",
      club_id: member.club_id
    });

    if (database.createProfileRoleHistory) {
      await database.createProfileRoleHistory({
        profile_id: profile.id,
        previous_role: profile.role,
        new_role: "student",
        previous_club_id: profile.club_id ?? null,
        new_club_id: member.club_id,
        changed_by: actor.id,
        remarks: "Leadership access removed from member management."
      });
    }

    return updatedProfile;
  }

  return null;
}

function formatMember(member) {
  return {
    id: member.id,
    club_id: member.club_id,
    profile_id: member.profile_id,
    full_name: member.full_name,
    student_id: member.student_id,
    email: member.email,
    phone_number: member.phone_number,
    club_role: member.club_role,
    membership_status: member.membership_status,
    club: member.club
      ? {
          id: member.club.id,
          name: member.club.name,
          code: member.club.code
        }
      : null,
    created_at: member.created_at,
    updated_at: member.updated_at
  };
}

async function listMembers(options) {
  const { actor, filters = {}, pagination, database = db } = options;
  requireActor(actor);
  requireSupportedMemberRole(actor);

  const clubId = getScopedClubId(actor, filters.club_id);
  const members = ensurePaginatedResult(await database.listClubMembers({
    clubId,
    clubRoles: filters.team === "executive" ? ["executive", "president"] : undefined,
    membershipStatus: filters.membership_status,
    excludeMembershipStatuses: filters.membership_status ? undefined : ["alumni"],
    ...(pagination
      ? {
          pagination,
          sort: pagination.sort,
          order: pagination.order
        }
      : {})
  }), pagination);

  return pagination ? mapPaginatedResult(members, formatMember) : members.map(formatMember);
}

async function createMember(options) {
  const { actor, payload, database = db } = options;
  requireActor(actor);
  requireSupportedMemberRole(actor);
  requirePresidentOrAdmin(actor);

  const validatedPayload = validateCreateMemberPayload(payload);
  const clubId = getScopedClubId(actor, validatedPayload.club_id);

  if (!clubId) {
    throw new ApiError(400, "club_id is required when admin creates a member", "VALIDATION_ERROR", {
      field: "club_id"
    });
  }

  if (validatedPayload.profile_id) {
    const profile = await database.getProfileById(validatedPayload.profile_id);

    if (!profile || profile.club_id !== clubId) {
      throw new ApiError(400, "Linked profile must belong to the selected club", "INVALID_PROFILE");
    }
  }

  ensureAllowedClubRoleChange(actor, validatedPayload.club_role);

  if (validatedPayload.membership_status === "active") {
    throw new ApiError(
      409,
      `Members become active only after dues are verified for ${getCurrentAcademicSession()}`,
      "DUES_NOT_VERIFIED"
    );
  }

  if (actor.role === "president" && validatedPayload.club_role === "executive" && validatedPayload.membership_status !== "active") {
    throw new ApiError(
      409,
      "Presidents can only choose executives from active dues-verified members.",
      "ACTIVE_MEMBERSHIP_REQUIRED"
    );
  }

  if (validatedPayload.membership_status === "alumni" && actor.role !== "admin") {
    throw new ApiError(403, "Only Club Services admins can create alumni member records", "FORBIDDEN");
  }

  const member = await database.createClubMember({
    club_id: clubId,
    profile_id: validatedPayload.profile_id,
    full_name: validatedPayload.full_name,
    student_id: validatedPayload.student_id,
    email: validatedPayload.email,
    phone_number: validatedPayload.phone_number,
    club_role: validatedPayload.club_role,
    membership_status: validatedPayload.membership_status
  });

  await syncLinkedProfileRole({
    database,
    actor,
    member,
    previousClubRole: null,
    nextClubRole: validatedPayload.club_role
  });

  return formatMember(member);
}

async function updateMember(options) {
  const { actor, memberId, payload, database = db, logger = baseLogger } = options;
  requireActor(actor);
  requireSupportedMemberRole(actor);
  requirePresidentOrAdmin(actor);

  const member = await database.getClubMemberById(memberId);

  if (!member) {
    throw new ApiError(404, "Member not found", "MEMBER_NOT_FOUND");
  }

  getScopedClubId(actor, member.club_id);

  const validatedUpdate = validateUpdateMemberPayload(payload);
  const {
    replace_existing_president: replaceExistingPresident = false,
    ...update
  } = validatedUpdate;
  const requestedStatus = update.membership_status;
  const requestedClubRole = update.club_role;
  const requestLogger = logger.child
    ? logger.child({
        module: "members",
        member_id: memberId,
        club_id: member.club_id,
        requested_club_role: requestedClubRole ?? null,
        replacement_confirmed: replaceExistingPresident
      })
    : logger;

  if (requestedClubRole) {
    ensureAllowedClubRoleChange(actor, requestedClubRole);
  }

  if (requestedClubRole === "president") {
    requestLogger.info("members.president_replacement.requested", {
      actor_id: actor.id,
      actor_role: actor.role,
      target_profile_id: member.profile_id ?? null
    });
  }

  if (requestedStatus === "alumni" && actor.role !== "admin") {
    throw new ApiError(403, "Only Club Services admins can mark members as alumni", "FORBIDDEN");
  }

  if (requestedStatus === "active") {
    const hasCurrentPaidDues = await hasVerifiedCurrentSessionDues(member.id, database);

    if (!hasCurrentPaidDues) {
      throw new ApiError(
        409,
        `Member can only be active after dues are verified for ${getCurrentAcademicSession()}`,
        "DUES_NOT_VERIFIED"
      );
    }
  }

  if (actor.role === "president" && requestedClubRole === "executive") {
    const effectiveStatus = requestedStatus || member.membership_status;

    if (effectiveStatus !== "active") {
      throw new ApiError(
        409,
        "Presidents can only choose executives from active dues-verified members.",
        "ACTIVE_MEMBERSHIP_REQUIRED"
      );
    }
  }

  if (requestedClubRole === "president" && member.profile_id && member.club_role !== "president") {
    const currentPresident = await findExistingPresidentConflict({
      database,
      member,
      targetProfileId: member.profile_id
    });

    if (currentPresident && !replaceExistingPresident) {
      requestLogger.warn("members.president_replacement.precheck_conflict", {
        actor_id: actor.id,
        actor_role: actor.role,
        current_president_id: currentPresident.id,
        target_profile_id: member.profile_id
      });

      throw new ApiError(
        409,
        "This club already has a president. Confirm replacement before continuing.",
        "PRESIDENT_ALREADY_EXISTS",
        {
          current_president: formatPresidentConflictProfile(currentPresident)
        }
      );
    }
  }

  const updatedMember = await database.updateClubMember(memberId, update);

  if (requestedClubRole) {
    await syncLinkedProfileRole({
      database,
      logger: requestLogger,
      actor,
      member: updatedMember,
      previousClubRole: member.club_role,
      nextClubRole: requestedClubRole,
      replaceExistingPresident
    });
  }

  if (requestedStatus && requestedStatus !== member.membership_status) {
    await recordMemberStatusHistory({
      database,
      member,
      actor,
      previousStatus: member.membership_status,
      newStatus: requestedStatus,
      reason: payload.status_change_reason || `Manual member status update to ${requestedStatus}`
    });
  }

  return formatMember(updatedMember);
}

module.exports = {
  createMember,
  listMembers,
  updateMember
};
