const { db } = require("../../config/db");
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

async function syncLinkedProfileRole({
  database,
  actor,
  member,
  previousClubRole = null,
  nextClubRole
}) {
  if (!member?.profile_id || !nextClubRole || previousClubRole === nextClubRole) {
    return null;
  }

  const profile = await database.getProfileById(member.profile_id);

  if (!profile) {
    return null;
  }

  if (nextClubRole === "president") {
    const updatedProfile = await database.updateProfile(profile.id, {
      role: "president",
      club_id: member.club_id
    });

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
  const { actor, memberId, payload, database = db } = options;
  requireActor(actor);
  requireSupportedMemberRole(actor);
  requirePresidentOrAdmin(actor);

  const member = await database.getClubMemberById(memberId);

  if (!member) {
    throw new ApiError(404, "Member not found", "MEMBER_NOT_FOUND");
  }

  getScopedClubId(actor, member.club_id);

  const update = validateUpdateMemberPayload(payload);
  const requestedStatus = update.membership_status;
  const requestedClubRole = update.club_role;

  if (requestedClubRole) {
    ensureAllowedClubRoleChange(actor, requestedClubRole);
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

  const updatedMember = await database.updateClubMember(memberId, update);

  if (requestedClubRole) {
    await syncLinkedProfileRole({
      database,
      actor,
      member: updatedMember,
      previousClubRole: member.club_role,
      nextClubRole: requestedClubRole
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
