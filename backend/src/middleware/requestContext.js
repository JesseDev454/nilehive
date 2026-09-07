const crypto = require("node:crypto");
const { logger } = require("../config/logger");

function createRequestContextMiddleware(options = {}) {
  const { baseLogger = logger } = options;

  return function requestContextMiddleware(req, res, next) {
    const startedAt = process.hrtime.bigint();
    const requestId = req.headers["x-request-id"] || crypto.randomUUID();

    req.requestId = requestId;
    req.log = baseLogger.child({
      request_id: requestId
    });

    res.setHeader("X-Request-Id", requestId);

    res.on("finish", () => {
      const latencyMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

      req.log.info("request.completed", {
        method: req.method,
        route: req.originalUrl,
        status_code: res.statusCode,
        latency_ms: Math.round(latencyMs * 100) / 100,
        user_id: req.user?.id ?? null,
        role: req.user?.role ?? null,
        club_id: req.user?.clubId ?? null
      });
    });

    next();
  };
}

module.exports = {
  createRequestContextMiddleware
};
