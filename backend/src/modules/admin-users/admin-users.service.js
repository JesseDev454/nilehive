const { db } = require("../../config/db");
const { logger: baseLogger } = require("../../config/logger");
const ApiError = require("../../shared/ApiError");
const { writeAuditLog } = require("../../shared/auditLog");
const { ensurePaginatedResult, mapPaginatedResult } = require("../../shared/pagination");
const { isValidStudentId } = require("../../shared/studentId");
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

function formatAdvisorAssignments(assignments = []) {
  return assignments
    .filter(Boolean)
    .map((assignment) => ({
      id: assignment.id,
      club_id: assignment.club_id,
      assigned_by: assignment.assigned_by ?? null,
      remarks: assignment.remarks ?? null,
      created_at: assignment.created_at ?? null,
      club: formatClub(assignment.club)
    }));
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
    advisor_assignments: formatAdvisorAssignments(profile.advisor_assignments),
    created_at: profile.created_at,
    updated_at: profile.updated_at
  };
}

async function enrichProfilesWithAdvisorAssignments(database, profiles) {
  const advisorProfiles = profiles.filter((profile) => profile.role === "advisor" || profile.requested_role === "advisor");

  if (!advisorProfiles.length || !database.listClubAdvisorAssignments) {
    return profiles;
  }

  const assignments = await database.listClubAdvisorAssignments({
    advisorProfileIds: advisorProfiles.map((profile) => profile.id)
  });
  const assignmentsByProfileId = assignments.reduce((map, assignment) => {
    const currentAssignments = map.get(assignment.advisor_profile_id) || [];
    currentAssignments.push(assignment);
    map.set(assignment.advisor_profile_id, currentAssignments);
    return map;
  }, new Map());

  return profiles.map((profile) => ({
    ...profile,
    advisor_assignments: assignmentsByProfileId.get(profile.id) || []
  }));
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

function getDesiredClubMemberRole(role) {
  if (role === "president") {
    return "president";
  }

  if (role === "executive") {
    return "executive";
  }

  if (role === "student") {
    return "member";
  }

  return null;
}

function ensureProfileCanBecomeClubMember(profile, role, clubId) {
  if (!getDesiredClubMemberRole(role) || !clubId || isValidStudentId(profile.student_id)) {
    return;
  }

  throw new ApiError(
    400,
    "This user needs a University ID before they can be assigned to a club member, executive, or president role.",
    "VALIDATION_ERROR",
    {
      field: "student_id",
      message: "Add the user's University ID before assigning this club role."
    }
  );
}

async function archiveHistoricalMemberships({
  database,
  actor,
  profile,
  targetClubId
}) {
  if (!database.listClubMembers || !database.updateClubMember) {
    return [];
  }

  const memberRecords = await database.listClubMembers({
    profileId: profile.id,
    excludeMembershipStatuses: ["alumni"]
  });
  const historicalMembers = memberRecords.filter((member) => member.club_id !== targetClubId);

  for (const member of historicalMembers) {
    await database.updateClubMember(member.id, {
      membership_status: "alumni"
    });

    if (database.createClubMemberStatusHistory) {
      await database.createClubMemberStatusHistory({
        member_id: member.id,
        club_id: member.club_id,
        profile_id: member.profile_id,
        previous_status: member.membership_status,
        new_status: "alumni",
        changed_by: actor.id,
        reason: "Moved to a different active club through admin user management."
      });
    }
  }

  return historicalMembers;
}

async function upsertActiveClubMember({
  database,
  actor,
  profile,
  role,
  clubId
}) {
  const desiredClubRole = getDesiredClubMemberRole(role);

  if (!desiredClubRole || !clubId) {
    return null;
  }

  const existingMember = database.getClubMemberByProfileAndClub
    ? await database.getClubMemberByProfileAndClub(profile.id, clubId)
    : null;
  const nextMemberPayload = {
    full_name: profile.full_name,
    student_id: profile.student_id,
    email: existingMember?.email ?? profile.email ?? null,
    phone_number: profile.phone_number ?? existingMember?.phone_number ?? null,
    club_role: desiredClubRole,
    membership_status: "active"
  };

  if (existingMember) {
    const updatedMember = await database.updateClubMember(existingMember.id, nextMemberPayload);

    if (
      database.createClubMemberStatusHistory &&
      existingMember.membership_status !== "active"
    ) {
      await database.createClubMemberStatusHistory({
        member_id: existingMember.id,
        club_id: existingMember.club_id,
        profile_id: existingMember.profile_id,
        previous_status: existingMember.membership_status,
        new_status: "active",
        changed_by: actor.id,
        reason: "Reactivated through admin user management."
      });
    }

    return updatedMember;
  }

  return database.createClubMember({
    club_id: clubId,
    profile_id: profile.id,
    ...nextMemberPayload
  });
}

async function findExistingPresidentConflict({ database, clubId, targetProfileId }) {
  const existingPresidents = await database.listProfiles({
    role: "president",
    clubId
  });

  return existingPresidents.find((currentProfile) => currentProfile.id !== targetProfileId) ?? null;
}

async function demoteExistingPresident({
  database,
  actor,
  currentPresident,
  clubId,
  logger
}) {
  const updatedProfile = await database.updateProfile(currentPresident.id, {
    role: "student",
    club_id: currentPresident.club_id
  });

  const presidentMember = await database.getClubMemberByProfileAndClub
    ? await database.getClubMemberByProfileAndClub(currentPresident.id, clubId)
    : null;

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
      remarks: "Demoted during president replacement from admin user management."
    });
  }

  logger.info("admin_users.president_replacement.demoted_existing_president", {
    demoted_profile_id: currentPresident.id,
    demoted_member_id: presidentMember?.id ?? null
  });

  return updatedProfile;
}

async function listAdminUsers(options) {
  const { actor, filters = {}, pagination, database = db } = options;
  requireAdmin(actor);

  const profilesResult = ensurePaginatedResult(await database.listProfiles({
    role: filters.role,
    clubId: filters.club_id,
    requestedRole: filters.requested_role,
    q: filters.q,
    pagination,
    sort: pagination?.sort,
    order: pagination?.order
  }), pagination);
  const enrichedItems = await enrichProfilesWithAdvisorAssignments(
    database,
    pagination ? profilesResult.items : profilesResult
  );

  if (pagination) {
    return mapPaginatedResult(
      { ...profilesResult, items: enrichedItems },
      formatProfile
    );
  }

  return enrichedItems.map(formatProfile);
}

async function getAdminUser(options) {
  const { actor, profileId, database = db } = options;
  requireAdmin(actor);

  const profile = await database.getProfileById(profileId);

  if (!profile) {
    throw new ApiError(404, "Profile not found", "PROFILE_NOT_FOUND");
  }

  const [enrichedProfile] = await enrichProfilesWithAdvisorAssignments(database, [profile]);
  return formatProfile(enrichedProfile);
}

async function updateAdminUserRole(options) {
  const { actor, profileId, payload, database = db, logger = baseLogger } = options;
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
  const requestLogger = logger.child
    ? logger.child({
        module: "admin_users",
        target_profile_id: profileId,
        requested_role: update.role,
        requested_club_id: update.club_id ?? null,
        replacement_confirmed: validatedPayload.replace_existing_president
      })
    : logger;

  if (["executive", "president"].includes(update.role) && !update.club_id) {
    throw new ApiError(400, "A club is required for president and executive roles", "VALIDATION_ERROR", {
      field: "club_id"
    });
  }

  if (["student", "advisor"].includes(update.role) && update.club_id === undefined) {
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

  ensureProfileCanBecomeClubMember(profile, update.role, update.club_id);

  if (update.role === "president") {
    requestLogger.info("admin_users.president_replacement.requested", {
      actor_id: actor.id,
      current_role: profile.role
    });

    const currentPresident = await findExistingPresidentConflict({
      database,
      clubId: update.club_id,
      targetProfileId: profile.id
    });

    if (currentPresident && !validatedPayload.replace_existing_president) {
      requestLogger.warn("admin_users.president_replacement.conflict", {
        actor_id: actor.id,
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
        clubId: update.club_id,
        logger: requestLogger
      });
    }
  }

  if (profile.role === "advisor" && update.role !== "advisor" && database.clearClubAdvisorAssignments) {
    await database.clearClubAdvisorAssignments(profile.id);
  }

  await archiveHistoricalMemberships({
    database,
    actor,
    profile,
    targetClubId: update.club_id ?? null
  });

  const activeMember = await upsertActiveClubMember({
    database,
    actor,
    profile,
    role: update.role,
    clubId: update.club_id ?? null
  });

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
        new_club_id: update.club_id ?? null,
        active_member_id: activeMember?.id ?? null
      }
    });

  const [enrichedProfile] = await enrichProfilesWithAdvisorAssignments(database, [updatedProfile]);
  return { profile: formatProfile(enrichedProfile), history };
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

  const existingAssignments = database.listClubAdvisorAssignments
    ? await database.listClubAdvisorAssignments({ clubId: club.id })
    : [];

  if (existingAssignments.some((assignment) => assignment.advisor_profile_id === profile.id)) {
    throw new ApiError(409, "This advisor is already assigned to the selected club", "ADVISOR_ALREADY_ASSIGNED");
  }

  await archiveHistoricalMemberships({
    database,
    actor,
    profile,
    targetClubId: club.id
  });

  const updatedProfile = await database.updateProfile(profile.id, {
    role: "advisor",
    club_id: club.id
  });
  const assignment = database.createClubAdvisorAssignment
    ? await database.createClubAdvisorAssignment({
        club_id: club.id,
        advisor_profile_id: profile.id,
        assigned_by: actor.id,
        remarks: validatedPayload.remarks ?? null
      })
    : null;
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
      advisor_profile_id: profile.id,
      club_id: club.id
    }
  });

  const [enrichedProfile] = await enrichProfilesWithAdvisorAssignments(database, [updatedProfile]);

  return {
    profile: formatProfile(enrichedProfile),
    club: assignment?.club ?? formatClub(club),
    history
  };
}

module.exports = {
  assignAdvisorToClub,
  getAdminUser,
  listAdminUsers,
  updateAdminUserRole
};
