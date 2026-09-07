const test = require("node:test");
const assert = require("node:assert/strict");
const { createHealthRouter, createReadyRouter } = require("../src/modules/health/health.routes");
const express = require("express");
const { clearEnvCache } = require("../src/config/env");
const errorHandler = require("../src/middleware/errorHandler");

function createFakeDatabase(overrides = {}) {
  return {
    async ping() {
      return { ok: true };
    },
    ...overrides
  };
}

async function createTestServer(routerFactory) {
  const app = express();
  app.use(express.json());
  routerFactory(app);
  app.use(errorHandler);
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

function createQueueService(overrides = {}) {
  return {
    async ensureQueueReady() {
      return { status: "configured" };
    },
    async getQueueHealth() {
      return {
        status: "not_required",
        worker_status: "not_required",
        waiting: 0,
        active: 0,
        failed: 0,
        delayed: 0
      };
    },
    ...overrides
  };
}

test("ready endpoint reports not_required queue when async jobs are disabled", async (t) => {
  const previousAsyncJobs = process.env.ASYNC_JOBS_ENABLED;
  const previousRedisUrl = process.env.REDIS_URL;
  process.env.ASYNC_JOBS_ENABLED = "false";
  process.env.REDIS_URL = "";
  clearEnvCache();

  const server = await createTestServer((app) => {
    app.use("/api/v1/ready", createReadyRouter({
      database: createFakeDatabase(),
      queueService: createQueueService()
    }));
  });
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

  const server = await createTestServer((app) => {
    app.use("/api/v1/ready", createReadyRouter({
      database: createFakeDatabase(),
      queueService: createQueueService()
    }));
  });
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

test("ready endpoint fails when async jobs are enabled but worker heartbeat is missing", async (t) => {
  const previousAsyncJobs = process.env.ASYNC_JOBS_ENABLED;
  const previousRedisUrl = process.env.REDIS_URL;
  process.env.ASYNC_JOBS_ENABLED = "true";
  process.env.REDIS_URL = "redis://example.test:6379";
  clearEnvCache();

  const server = await createTestServer((app) => {
    app.use("/api/v1/ready", createReadyRouter({
      database: createFakeDatabase(),
      queueService: createQueueService({
        async ensureQueueReady() {
          const error = new Error("worker missing");
          error.statusCode = 503;
          error.code = "WORKER_UNAVAILABLE";
          throw error;
        }
      })
    }));
  });
  t.after(async () => {
    await server.close();
    process.env.ASYNC_JOBS_ENABLED = previousAsyncJobs;
    process.env.REDIS_URL = previousRedisUrl;
    clearEnvCache();
  });

  const response = await fetch(`${server.baseUrl}/api/v1/ready`);
  const payload = await response.json();

  assert.equal(response.status, 503);
  assert.equal(payload.error.code, "WORKER_UNAVAILABLE");
});

test("health endpoint reports queue and worker status", async (t) => {
  const server = await createTestServer((app) => {
    app.use("/api/v1/health", createHealthRouter({
      database: createFakeDatabase(),
      queueService: createQueueService({
        async getQueueHealth() {
          return {
            status: "running",
            worker_status: "running",
            waiting: 2,
            active: 1,
            failed: 0,
            delayed: 3
          };
        }
      })
    }));
  });

  t.after(async () => {
    await server.close();
  });

  const response = await fetch(`${server.baseUrl}/api/v1/health`);
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.queue, "running");
  assert.equal(payload.worker, "running");
});
