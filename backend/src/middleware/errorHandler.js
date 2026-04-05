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

  res.status(statusCode).json(payload);
}

module.exports = errorHandler;

