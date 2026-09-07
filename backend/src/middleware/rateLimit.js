const ApiError = require("../shared/ApiError");
const { getEnv } = require("../config/env");
const { getSharedRedisConnection } = require("../config/redis");

class MemoryRateLimitStore {
  constructor() {
    this.buckets = new Map();
  }

  pruneExpiredBuckets(now) {
    for (const [key, value] of this.buckets.entries()) {
      if (value.resetAt <= now) {
        this.buckets.delete(key);
      }
    }
  }

  async increment(key, windowMs) {
    const now = Date.now();
    this.pruneExpiredBuckets(now);

    const current = this.buckets.get(key);

    if (!current || current.resetAt <= now) {
      this.buckets.set(key, {
        count: 1,
        resetAt: now + windowMs
      });

      return {
        count: 1,
        resetAt: now + windowMs
      };
    }

    current.count += 1;

    return {
      count: current.count,
      resetAt: current.resetAt
    };
  }
}

class RedisRateLimitStore {
  constructor(connection = getSharedRedisConnection()) {
    this.connection = connection;
  }

  async increment(key, windowMs) {
    const script = `
      local current = redis.call("INCR", KEYS[1])
      if current == 1 then
        redis.call("PEXPIRE", KEYS[1], ARGV[1])
      end
      local ttl = redis.call("PTTL", KEYS[1])
      return { current, ttl }
    `;
    const [count, ttl] = await this.connection.eval(script, 1, key, String(windowMs));

    return {
      count: Number(count),
      resetAt: Date.now() + Math.max(Number(ttl), 0)
    };
  }
}

function createRateLimitStore(options = {}) {
  if (options.store) {
    return options.store;
  }

  const env = getEnv();

  if (env.REDIS_URL) {
    return new RedisRateLimitStore();
  }

  return new MemoryRateLimitStore();
}

function createRateLimitMiddleware(options = {}) {
  const {
    windowMs = 60_000,
    max = 20,
    code = "RATE_LIMITED",
    message = "Too many requests. Please try again later.",
    key = (req) => `${req.ip}:${req.originalUrl}`,
    store = createRateLimitStore(options)
  } = options;

  return async function rateLimitMiddleware(req, res, next) {
    try {
      const bucketKey = key(req);
      const result = await store.increment(bucketKey, windowMs);

      if (result.count > max) {
        res.setHeader("Retry-After", Math.ceil((result.resetAt - Date.now()) / 1000));
        next(new ApiError(429, message, code));
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  MemoryRateLimitStore,
  RedisRateLimitStore,
  createRateLimitMiddleware,
  createRateLimitStore
};
