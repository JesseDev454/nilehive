const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/app");
const { clearEnvCache } = require("../src/config/env");

function createFakeDatabase(overrides = {}) {
  return {
    async ping() {
      return { ok: true };
    },
    ...overrides
  };
}

async function createTestServer(database) {
  const app = createApp({ database });
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  return {
    baseUrl,
    close: () =>
      new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      })
  };
}

test("ready endpoint reports not_required queue when async jobs are disabled", async (t) => {
  const previousAsyncJobs = process.env.ASYNC_JOBS_ENABLED;
  const previousRedisUrl = process.env.REDIS_URL;
  process.env.ASYNC_JOBS_ENABLED = "false";
  process.env.REDIS_URL = "";
  clearEnvCache();

  const server = await createTestServer(createFakeDatabase());
  t.after(async () => {
    await server.close();
    process.env.ASYNC_JOBS_ENABLED = previousAsyncJobs;
    process.env.REDIS_URL = previousRedisUrl;
    clearEnvCache();
  });

  const response = await fetch(`${server.baseUrl}/api/v1/ready`);
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.status, "ready");
  assert.equal(payload.queue, "not_required");
});

test("ready endpoint fails when async jobs are enabled without redis", async (t) => {
  const previousAsyncJobs = process.env.ASYNC_JOBS_ENABLED;
  const previousRedisUrl = process.env.REDIS_URL;
  process.env.ASYNC_JOBS_ENABLED = "true";
  process.env.REDIS_URL = "";
  clearEnvCache();

  const server = await createTestServer(createFakeDatabase());
  t.after(async () => {
    await server.close();
    process.env.ASYNC_JOBS_ENABLED = previousAsyncJobs;
    process.env.REDIS_URL = previousRedisUrl;
    clearEnvCache();
  });

  const response = await fetch(`${server.baseUrl}/api/v1/ready`);
  const payload = await response.json();

  assert.equal(response.status, 503);
  assert.equal(payload.error.code, "QUEUE_UNAVAILABLE");
});
