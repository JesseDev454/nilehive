const { db } = require("../../config/db");
const ApiError = require("../../shared/ApiError");
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
  const { actor, filters = {}, database = db } = options;
  requireActor(actor);
  requireSupportedMemberRole(actor);

  const clubId = getScopedClubId(actor, filters.club_id);
  const members = await database.listClubMembers({
    clubId,
    clubRoles: filters.team === "executive" ? ["executive", "president"] : undefined,
    membershipStatus: filters.membership_status
  });

  return members.map(formatMember);
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

  if (validatedPayload.membership_status === "active") {
    throw new ApiError(
      409,
      `Members become active only after dues are verified for ${getCurrentAcademicSession()}`,
      "DUES_NOT_VERIFIED"
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

  const updatedMember = await database.updateClubMember(memberId, update);

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
