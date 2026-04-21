const { db } = require("../../config/db");
const ApiError = require("../../shared/ApiError");
const {
  validateCreateLeadershipApplicationPayload,
  validateLeadershipApplicationDecisionPayload
} = require("./leadership-applications.validation");

const REJECTION_COOLDOWN_DAYS = 30;
const OPEN_STATUSES = new Set(["pending", "needs_more_info"]);

function requireActor(actor) {
  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }
}

function requireAdmin(actor) {
  requireActor(actor);

  if (actor.role !== "admin") {
    throw new ApiError(403, "Only Club Services admins can review leadership applications", "FORBIDDEN");
  }
}

function formatClub(club) {
  return club ? { id: club.id, name: club.name, code: club.code ?? null } : null;
}

function formatProfile(profile) {
  return profile
    ? {
        id: profile.id,
        full_name: profile.full_name,
        student_id: profile.student_id ?? null,
        role: profile.role
      }
    : null;
}

function formatLeadershipApplication(application) {
  return {
    id: application.id,
    profile_id: application.profile_id,
    club_id: application.club_id,
    current_role: application.current_app_role ?? application.current_role,
    requested_role: application.requested_role,
    status: application.status,
    reason: application.reason,
    experience: application.experience,
    goals: application.goals,
    availability: application.availability,
    reviewed_by: application.reviewed_by,
    reviewed_at: application.reviewed_at,
    decision_remarks: application.decision_remarks,
    profile: formatProfile(application.profile),
    club: formatClub(application.club),
    created_at: application.created_at,
    updated_at: application.updated_at
  };
}

function getCooldownUntil(application) {
  const rejectedAt = application?.reviewed_at || application?.updated_at || application?.created_at;

  if (!rejectedAt) {
    return null;
  }

  const rejectedDate = new Date(rejectedAt);

  if (Number.isNaN(rejectedDate.getTime())) {
    return null;
  }

  return new Date(rejectedDate.getTime() + REJECTION_COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
}

async function assertLeadershipEligibility({ actor, payload, database }) {
  if (!["student", "executive"].includes(actor.role)) {
    throw new ApiError(403, "This role cannot submit leadership applications", "FORBIDDEN");
  }

  if (actor.role === "executive" && payload.requested_role !== "president") {
    throw new ApiError(400, "Executives can only apply for president", "VALIDATION_ERROR", {
      field: "requested_role"
    });
  }

  if (actor.role === "student" && !["executive", "president"].includes(payload.requested_role)) {
    throw new ApiError(400, "Students can apply for executive or president", "VALIDATION_ERROR", {
      field: "requested_role"
    });
  }

  const club = await database.getClubById(payload.club_id);

  if (!club) {
    throw new ApiError(400, "Selected club does not exist", "INVALID_CLUB", {
      field: "club_id"
    });
  }

  const member = await database.getClubMemberByProfileAndClub(actor.id, payload.club_id);

  if (!member || member.membership_status !== "active") {
    throw new ApiError(
      403,
      "You must be an active dues-verified member of this club before applying for leadership",
      "ACTIVE_MEMBERSHIP_REQUIRED"
    );
  }

  const openApplication = await database.getOpenLeadershipApplication(actor.id, payload.club_id);

  if (openApplication) {
    throw new ApiError(409, "You already have an open leadership application for this club", "APPLICATION_ALREADY_OPEN");
  }

  const latestRejected = await database.getLatestRejectedLeadershipApplication(actor.id, payload.club_id);
  const cooldownUntil = getCooldownUntil(latestRejected);

  if (cooldownUntil && cooldownUntil.getTime() > Date.now()) {
    throw new ApiError(
      409,
      "Please wait before submitting another leadership application for this club",
      "LEADERSHIP_COOLDOWN_ACTIVE",
      {
        cooldown_until: cooldownUntil.toISOString()
      }
    );
  }

  return { club, member };
}

async function createLeadershipApplication(options) {
  const { actor, payload, database = db } = options;
  requireActor(actor);

  const validatedPayload = validateCreateLeadershipApplicationPayload(payload);
  const { member } = await assertLeadershipEligibility({
    actor,
    payload: validatedPayload,
    database
  });

  if (member.club_role === validatedPayload.requested_role) {
    throw new ApiError(409, `You are already listed as ${validatedPayload.requested_role} for this club`, "ROLE_ALREADY_ACTIVE");
  }

  const application = await database.createLeadershipApplication({
    profile_id: actor.id,
    club_id: validatedPayload.club_id,
    current_app_role: actor.role,
    requested_role: validatedPayload.requested_role,
    status: "pending",
    reason: validatedPayload.reason,
    experience: validatedPayload.experience,
    goals: validatedPayload.goals,
    availability: validatedPayload.availability
  });

  return formatLeadershipApplication(application);
}

async function listMyLeadershipApplications(options) {
  const { actor, database = db } = options;
  requireActor(actor);

  const applications = await database.listLeadershipApplications({
    profileId: actor.id
  });

  return applications.map(formatLeadershipApplication);
}

async function listLeadershipApplications(options) {
  const { actor, filters = {}, database = db } = options;
  requireAdmin(actor);

  const applications = await database.listLeadershipApplications({
    clubId: filters.club_id,
    status: filters.status,
    requestedRole: filters.requested_role
  });

  return applications.map(formatLeadershipApplication);
}

async function replaceExistingPresidentIfNeeded({ actor, application, database, replaceExistingPresident }) {
  if (application.requested_role !== "president") {
    return [];
  }

  const existingPresidents = await database.listProfiles({
    role: "president",
    clubId: application.club_id
  });
  const otherPresidents = existingPresidents.filter((profile) => profile.id !== application.profile_id);

  if (otherPresidents.length && !replaceExistingPresident) {
    throw new ApiError(
      409,
      "This club already has a president. Confirm replacement before approving.",
      "PRESIDENT_ALREADY_EXISTS"
    );
  }

  const demotedProfiles = [];

  for (const president of otherPresidents) {
    const updatedProfile = await database.updateProfile(president.id, {
      role: "student",
      club_id: president.club_id
    });

    const member = await database.getClubMemberByProfileAndClub(president.id, application.club_id);

    if (member) {
      await database.updateClubMember(member.id, {
        club_role: "member"
      });
    }

    if (database.createProfileRoleHistory) {
      await database.createProfileRoleHistory({
        profile_id: president.id,
        previous_role: president.role,
        new_role: "student",
        previous_club_id: president.club_id ?? null,
        new_club_id: president.club_id ?? null,
        changed_by: actor.id,
        remarks: "Demoted during president replacement approval."
      });
    }

    demotedProfiles.push(updatedProfile);
  }

  return demotedProfiles;
}

async function approveLeadershipApplication({ actor, application, decisionPayload, database }) {
  const profile = await database.getProfileById(application.profile_id);

  if (!profile) {
    throw new ApiError(404, "Applicant profile not found", "PROFILE_NOT_FOUND");
  }

  const member = await database.getClubMemberByProfileAndClub(application.profile_id, application.club_id);

  if (!member || member.membership_status !== "active") {
    throw new ApiError(409, "Applicant is no longer an active member of this club", "ACTIVE_MEMBERSHIP_REQUIRED");
  }

  const demotedPresidents = await replaceExistingPresidentIfNeeded({
    actor,
    application,
    database,
    replaceExistingPresident: decisionPayload.replace_existing_president
  });

  const updatedProfile = await database.updateProfile(application.profile_id, {
    role: application.requested_role,
    club_id: application.club_id
  });

  const updatedMember = await database.updateClubMember(member.id, {
    club_role: application.requested_role,
    membership_status: "active"
  });

  const updatedApplication = await database.updateLeadershipApplication(application.id, {
    status: "approved",
    reviewed_by: actor.id,
    reviewed_at: new Date().toISOString(),
    decision_remarks: decisionPayload.remarks
  });

  const history = database.createProfileRoleHistory
    ? await database.createProfileRoleHistory({
        profile_id: profile.id,
        previous_role: profile.role,
        new_role: application.requested_role,
        previous_club_id: profile.club_id ?? null,
        new_club_id: application.club_id,
        changed_by: actor.id,
        remarks: decisionPayload.remarks ?? "Leadership application approved."
      })
    : null;

  return {
    application: formatLeadershipApplication(updatedApplication),
    profile: updatedProfile,
    member: updatedMember,
    history,
    demoted_presidents: demotedPresidents
  };
}

async function decideLeadershipApplication(options) {
  const { actor, applicationId, payload, database = db } = options;
  requireAdmin(actor);

  const application = await database.getLeadershipApplicationById(applicationId);

  if (!application) {
    throw new ApiError(404, "Leadership application not found", "LEADERSHIP_APPLICATION_NOT_FOUND");
  }

  if (!OPEN_STATUSES.has(application.status)) {
    throw new ApiError(409, "Only open leadership applications can be reviewed", "INVALID_APPLICATION_STATE");
  }

  const decisionPayload = validateLeadershipApplicationDecisionPayload(payload);

  if (decisionPayload.decision === "approve") {
    return approveLeadershipApplication({
      actor,
      application,
      decisionPayload,
      database
    });
  }

  const status = decisionPayload.decision === "needs_more_info" ? "needs_more_info" : "rejected";
  const updatedApplication = await database.updateLeadershipApplication(application.id, {
    status,
    reviewed_by: actor.id,
    reviewed_at: new Date().toISOString(),
    decision_remarks: decisionPayload.remarks
  });

  return {
    application: formatLeadershipApplication(updatedApplication),
    profile: null,
    member: null,
    history: null,
    demoted_presidents: []
  };
}

module.exports = {
  createLeadershipApplication,
  decideLeadershipApplication,
  formatLeadershipApplication,
  listLeadershipApplications,
  listMyLeadershipApplications
};
