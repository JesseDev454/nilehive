const { db } = require("../config/db");
const ApiError = require("../shared/ApiError");

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

function createAuthMiddleware(options = {}) {
  const { database = db } = options;

  return async function authMiddleware(req, res, next) {
    try {
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
        clubId: profile.club_id,
        studentId: profile.student_id ?? null,
        requestedRole: profile.requested_role ?? null,
        accountStatus: profile.account_status ?? "active"
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
            clubId: profile.club_id,
            studentId: profile.student_id ?? null,
            requestedRole: profile.requested_role ?? null,
            accountStatus: profile.account_status ?? "active"
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
  extractBearerToken
};
