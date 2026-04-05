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

      req.user = {
        id: authUser.id,
        email: authUser.email ?? null,
        fullName: profile.full_name ?? null,
        role: profile.role,
        clubId: profile.club_id
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

const auth = createAuthMiddleware();

module.exports = {
  auth,
  createAuthMiddleware,
  extractBearerToken
};

