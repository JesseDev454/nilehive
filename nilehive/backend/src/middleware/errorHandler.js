const { logger } = require("../config/logger");

function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;
  const payload = {
    error: {
      code: error.code || "INTERNAL_SERVER_ERROR",
      message: error.message || "Internal server error"
    }
  };

  if (error.details) {
    payload.error.details = error.details;
  }

  if (statusCode >= 500 && process.env.NODE_ENV !== "production" && error.stack) {
    payload.error.stack = error.stack;
  }

  const requestLogger = req?.log || logger;
  const logMethod = statusCode >= 500 ? "error" : "warn";
  requestLogger[logMethod]("request.failed", {
    code: payload.error.code,
    status_code: statusCode,
    route: req?.originalUrl ?? null,
    method: req?.method ?? null,
    user_id: req?.user?.id ?? null,
    role: req?.user?.role ?? null,
    club_id: req?.user?.clubId ?? null,
    details: error.details ?? null
  });

  res.status(statusCode).json(payload);
}

module.exports = errorHandler;
