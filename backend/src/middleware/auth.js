const { randomUUID } = require("crypto");
const { db } = require("../config/db");
const { getEnv } = require("../config/env");
const { isAllowedEmail } = require("../config/emailPolicy");
const ApiError = require("../shared/ApiError");
const { readCampusOneSessionFromRequest } = require("../shared/campusOneSession");
const { resolveEffectiveRole } = require("../shared/portalAccess");

function extractBearerToken(authorizationHeader) {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token.trim();
}

function assertProfileIsAllowed(profile) {
  if (profile?.account_status === "suspended") {
    throw new ApiError(403, "This account has been suspended", "ACCOUNT_SUSPENDED");
  }
}

function isPortalAuthEnabled() {
  return getEnv().AUTH_PROVIDER === "portal";
}

function isCampusOneOidcAuthEnabled() {
  return getEnv().AUTH_PROVIDER === "campus_one_oidc";
}

async function getPortalSessionUser(cookieHeader) {
  if (!cookieHeader) {
    return null;
  }

  const env = getEnv();
  const response = await fetch(`${env.PORTAL_API_BASE_URL.replace(/\/+$/, "")}/api/session`, {
    method: "GET",
    headers: {
      Cookie: cookieHeader
    }
  });

  if (!response.ok) {
    return null;
  }

  const session = await response.json();
  return session?.user ?? null;
}

async function resolvePortalProfile(database, portalUser) {
  const portalUserId = String(portalUser.id || "").trim();
  const email = String(portalUser.email || "").trim().toLowerCase();
  const fullName = String(portalUser.name || portalUser.full_name || email || "Campus One User").trim();

  if (!portalUserId || !email) {
    throw new ApiError(401, "Invalid portal session", "INVALID_PORTAL_SESSION");
  }

  if (!isAllowedEmail(email)) {
    throw new ApiError(403, "Please use your Nile University email address", "UNSUPPORTED_EMAIL_DOMAIN", {
      field: "email"
    });
  }

  let profile = database.getProfileByPortalUserId
    ? await database.getProfileByPortalUserId(portalUserId)
    : null;

  if (!profile && database.getProfileByEmail) {
    profile = await database.getProfileByEmail(email);
  }

  if (profile) {
    const updates = {};

    if (!profile.portal_user_id) {
      updates.portal_user_id = portalUserId;
    }

    if (!profile.email) {
      updates.email = email;
    }

    if (!profile.full_name && fullName) {
      updates.full_name = fullName;
    }

    if (Object.keys(updates).length > 0) {
      profile = await database.updateProfile(profile.id, updates);
    }

    return profile;
  }

  return database.createProfile({
    id: randomUUID(),
    portal_user_id: portalUserId,
    email,
    full_name: fullName,
    role: "student",
    club_id: null,
    student_id: null,
    requested_role: "student",
    onboarding_status: "complete",
    account_status: "active"
  });
}

async function getPortalAuthContext(req, database) {
  const portalUser = await getPortalSessionUser(req.headers.cookie);

  if (!portalUser) {
    throw new ApiError(401, "Please sign in to continue", "AUTH_REQUIRED");
  }

  const profile = await resolvePortalProfile(database, portalUser);
  assertProfileIsAllowed(profile);
  const roleContext = resolveEffectiveRole({
    portalRole: portalUser.role,
    appRole: profile.role,
    customRoles: portalUser.custom_roles
  });

  const authUser = {
    id: profile.id,
    email: profile.email ?? portalUser.email ?? null,
    metadata: {
      portal_user_id: portalUser.id,
      portal_role: roleContext.portalRole,
      app_role: roleContext.appRole,
      custom_roles: roleContext.customRoles,
      effective_role: roleContext.effectiveRole,
      role_sync_state: roleContext.roleSyncState
    }
  };

  const user = {
    id: profile.id,
    email: authUser.email,
    fullName: profile.full_name ?? null,
    role: roleContext.effectiveRole,
    portalRole: roleContext.portalRole,
    appRole: roleContext.appRole,
    customRoles: roleContext.customRoles,
    clubId: profile.club_id,
    studentId: profile.student_id ?? null,
    requestedRole: profile.requested_role ?? null,
    accountStatus: profile.account_status ?? "active",
    accessPending: roleContext.accessPending,
    roleSyncState: roleContext.roleSyncState
  };

  return { authUser, profile, user };
}

async function getCampusOneOidcAuthContext(req, database) {
  const session = readCampusOneSessionFromRequest(req);
  const profile = await database.getProfileById(session.profileId);

  if (!profile) {
    throw new ApiError(401, "Please sign in again", "PROFILE_NOT_FOUND");
  }

  assertProfileIsAllowed(profile);
  const roleContext = resolveEffectiveRole({
    portalRole: session.portalRole,
    appRole: profile.role,
    customRoles: session.customRoles
  });

  const authUser = {
    id: profile.id,
    email: profile.email ?? session.email ?? null,
    metadata: {
      portal_user_id: session.portalUserId,
      portal_role: roleContext.portalRole,
      app_role: roleContext.appRole,
      custom_roles: roleContext.customRoles,
      effective_role: roleContext.effectiveRole,
      role_sync_state: roleContext.roleSyncState
    }
  };

  const user = {
    id: profile.id,
    email: authUser.email,
    fullName: profile.full_name ?? null,
    role: roleContext.effectiveRole,
    portalRole: roleContext.portalRole,
    appRole: roleContext.appRole,
    customRoles: roleContext.customRoles,
    clubId: profile.club_id,
    studentId: profile.student_id ?? null,
    requestedRole: profile.requested_role ?? null,
    accountStatus: profile.account_status ?? "active",
    accessPending: roleContext.accessPending,
    roleSyncState: roleContext.roleSyncState
  };

  return { authUser, profile, user };
}

function createAuthMiddleware(options = {}) {
  const { database = db } = options;

  return async function authMiddleware(req, res, next) {
    try {
      if (isPortalAuthEnabled()) {
        const context = await getPortalAuthContext(req, database);
        req.authUser = context.authUser;
        req.profile = context.profile;
        req.user = context.user;
        next();
        return;
      }

      if (isCampusOneOidcAuthEnabled()) {
        const context = await getCampusOneOidcAuthContext(req, database);
        req.authUser = context.authUser;
        req.profile = context.profile;
        req.user = context.user;
        next();
        return;
      }

      const accessToken = extractBearerToken(req.headers.authorization);

      if (!accessToken) {
        throw new ApiError(401, "Missing bearer token", "AUTH_REQUIRED");
      }

      const authUser = await database.getUserByAccessToken(accessToken);

      if (!authUser) {
        throw new ApiError(401, "Invalid or expired access token", "INVALID_TOKEN");
      }

      const profile = await database.getProfileById(authUser.id);

      if (!profile) {
        throw new ApiError(403, "No application profile found for this user", "PROFILE_NOT_FOUND");
      }

      assertProfileIsAllowed(profile);
      req.user = {
        id: authUser.id,
        email: authUser.email ?? null,
        fullName: profile.full_name ?? null,
        role: profile.role,
        portalRole: null,
        appRole: profile.role,
        clubId: profile.club_id,
        studentId: profile.student_id ?? null,
        requestedRole: profile.requested_role ?? null,
        accountStatus: profile.account_status ?? "active",
        accessPending: false,
        roleSyncState: "local_auth"
      };

      next();
    } catch (error) {
      if (error instanceof ApiError) {
        next(error);
        return;
      }

      next(new ApiError(500, "Authentication lookup failed", "AUTH_LOOKUP_FAILED", {
        cause: error.message
      }));
    }
  };
}

function createAuthUserMiddleware(options = {}) {
  const { database = db } = options;

  return async function authUserMiddleware(req, res, next) {
    try {
      if (isPortalAuthEnabled()) {
        const context = await getPortalAuthContext(req, database);
        req.authUser = context.authUser;
        req.profile = context.profile;
        req.user = context.user;
        next();
        return;
      }

      if (isCampusOneOidcAuthEnabled()) {
        const context = await getCampusOneOidcAuthContext(req, database);
        req.authUser = context.authUser;
        req.profile = context.profile;
        req.user = context.user;
        next();
        return;
      }

      const accessToken = extractBearerToken(req.headers.authorization);

      if (!accessToken) {
        throw new ApiError(401, "Missing bearer token", "AUTH_REQUIRED");
      }

      const authUser = await database.getUserByAccessToken(accessToken);

      if (!authUser) {
        throw new ApiError(401, "Invalid or expired access token", "INVALID_TOKEN");
      }

      const profile = await database.getProfileById(authUser.id);
      assertProfileIsAllowed(profile);

      req.authUser = {
        id: authUser.id,
        email: authUser.email ?? null,
        metadata: authUser.user_metadata ?? {}
      };
      req.profile = profile ?? null;
      req.user = profile
        ? {
            id: authUser.id,
            email: authUser.email ?? null,
            fullName: profile.full_name ?? null,
            role: profile.role,
            portalRole: null,
            appRole: profile.role,
            clubId: profile.club_id,
            studentId: profile.student_id ?? null,
            requestedRole: profile.requested_role ?? null,
            accountStatus: profile.account_status ?? "active",
            accessPending: false,
            roleSyncState: "local_auth"
          }
        : null;

      next();
    } catch (error) {
      if (error instanceof ApiError) {
        next(error);
        return;
      }

      next(new ApiError(500, "Authentication lookup failed", "AUTH_LOOKUP_FAILED", {
        cause: error.message
      }));
    }
  };
}

const auth = createAuthMiddleware();

module.exports = {
  auth,
  createAuthUserMiddleware,
  createAuthMiddleware,
  extractBearerToken,
  isCampusOneOidcAuthEnabled
};
