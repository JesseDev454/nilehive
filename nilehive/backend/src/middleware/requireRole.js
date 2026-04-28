const ApiError = require("../shared/ApiError");

function requireRole(...allowedRoles) {
  return function roleGuard(req, res, next) {
    if (!req.user) {
      next(new ApiError(401, "Authentication is required", "AUTH_REQUIRED"));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new ApiError(403, "You do not have access to this route", "FORBIDDEN"));
      return;
    }

    next();
  };
}

module.exports = requireRole;

