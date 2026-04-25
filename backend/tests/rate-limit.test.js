const test = require("node:test");
const assert = require("node:assert/strict");
const { createRateLimitMiddleware } = require("../src/middleware/rateLimit");

function createResponse() {
  return {
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value;
    }
  };
}

test("rate limit middleware returns 429 after configured threshold", async () => {
  const middleware = createRateLimitMiddleware({
    windowMs: 60_000,
    max: 1,
    code: "TEST_RATE_LIMITED",
    message: "Too many test requests.",
    key: () => "test-bucket",
    store: {
      calls: 0,
      async increment() {
        this.calls += 1;
        return {
          count: this.calls,
          resetAt: Date.now() + 60_000
        };
      }
    }
  });

  const firstResponse = createResponse();
  let firstError = null;
  await middleware({ ip: "127.0.0.1", originalUrl: "/test" }, firstResponse, (error) => {
    firstError = error ?? null;
  });
  assert.equal(firstError, null);

  const secondResponse = createResponse();
  let secondError = null;
  await middleware({ ip: "127.0.0.1", originalUrl: "/test" }, secondResponse, (error) => {
    secondError = error ?? null;
  });

  assert.equal(secondError?.statusCode, 429);
  assert.equal(secondError?.code, "TEST_RATE_LIMITED");
  assert.ok(Number(secondResponse.headers["Retry-After"]) >= 1);
});
