function createRequestTimeoutMiddleware(options = {}) {
  const timeoutMs = Number(options.timeoutMs || 15000);

  return function requestTimeoutMiddleware(req, res, next) {
    req.setTimeout(timeoutMs);
    res.setTimeout(timeoutMs, () => {
      if (res.headersSent) {
        return;
      }

      req.log?.warn("request.timeout", {
        method: req.method,
        route: req.originalUrl,
        timeout_ms: timeoutMs
      });

      res.status(503).json({
        error: {
          code: "REQUEST_TIMEOUT",
          message: "The request took too long to complete"
        }
      });
    });

    next();
  };
}

module.exports = {
  createRequestTimeoutMiddleware
};
