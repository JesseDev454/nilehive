const { db } = require("../../config/db");
const { formatAllowedEmailDomains, isAllowedEmail } = require("../../config/emailPolicy");
const ApiError = require("../../shared/ApiError");
const { validateCompleteProfilePayload } = require("./profile.validation");

function formatProfile(profile, authUser = null, user = null) {
  return {
    id: profile.id,
    email: profile.email ?? authUser?.email ?? null,
    portal_user_id: profile.portal_user_id ?? null,
    full_name: profile.full_name,
    role: profile.role,
    app_role: user?.appRole ?? profile.role,
    effective_role: user?.role ?? profile.role,
    portal_role: user?.portalRole ?? authUser?.metadata?.portal_role ?? "student",
    access_pending: Boolean(user?.accessPending),
    role_sync_state: user?.roleSyncState ?? "active",
    club_id: profile.club_id,
    student_id: profile.student_id ?? null,
    requested_role: profile.requested_role ?? null,
    onboarding_status: profile.onboarding_status ?? "complete",
    account_status: profile.account_status ?? "active",
    created_at: profile.created_at,
    updated_at: profile.updated_at
  };
}

async function getMyProfile(options) {
  const { authUser, profile, user, database = db } = options;

  if (!authUser) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  return {
    user: {
      id: authUser.id,
      email: authUser.email,
      role: user?.portalRole ?? authUser?.metadata?.portal_role ?? "student"
    },
    profile: profile ? formatProfile(profile, authUser, user) : null,
    requires_profile_setup: !profile
  };
}

async function completeProfileOnboarding(options) {
  const { authUser, profile: existingProfile, payload, database = db } = options;

  if (!authUser) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  if (existingProfile) {
    throw new ApiError(409, "Profile already exists for this user", "PROFILE_ALREADY_EXISTS");
  }

  if (!isAllowedEmail(authUser.email)) {
    throw new ApiError(
      403,
      `Please use your Nile University email address (${formatAllowedEmailDomains()}) to complete profile setup.`,
      "UNSUPPORTED_EMAIL_DOMAIN",
      {
        field: "email"
      }
    );
  }

  const validatedPayload = validateCompleteProfilePayload(payload);
  const club = await database.getClubById(validatedPayload.club_id);

  if (!club) {
    throw new ApiError(400, "Selected club does not exist", "INVALID_CLUB", {
      field: "club_id"
    });
  }

  const isAdvisorOnboarding = validatedPayload.requested_role === "advisor";
  const profile = await database.createProfile({
    id: authUser.id,
    full_name: validatedPayload.full_name,
    role: isAdvisorOnboarding ? "advisor" : "student",
    club_id: validatedPayload.club_id,
    student_id: validatedPayload.student_id,
    requested_role: validatedPayload.requested_role,
    onboarding_status: "complete",
    account_status: "active"
  });

  return formatProfile(profile, authUser);
}

module.exports = {
  completeProfileOnboarding,
  getMyProfile
};
