const ApiError = require("../shared/ApiError");

const buckets = new Map();

function pruneExpiredBuckets(now) {
  for (const [key, value] of buckets.entries()) {
    if (value.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

function createRateLimitMiddleware(options = {}) {
  const {
    windowMs = 60_000,
    max = 20,
    code = "RATE_LIMITED",
    message = "Too many requests. Please try again later.",
    key = (req) => `${req.ip}:${req.originalUrl}`
  } = options;

  return function rateLimitMiddleware(req, res, next) {
    const now = Date.now();
    pruneExpiredBuckets(now);

    const bucketKey = key(req);
    const current = buckets.get(bucketKey);

    if (!current || current.resetAt <= now) {
      buckets.set(bucketKey, {
        count: 1,
        resetAt: now + windowMs
      });
      next();
      return;
    }

    current.count += 1;

    if (current.count > max) {
      res.setHeader("Retry-After", Math.ceil((current.resetAt - now) / 1000));
      next(new ApiError(429, message, code));
      return;
    }

    next();
  };
}

module.exports = {
  createRateLimitMiddleware
};
