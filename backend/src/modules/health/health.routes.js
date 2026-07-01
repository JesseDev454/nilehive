const { Router } = require("express");
const { db } = require("../../config/db");
const ApiError = require("../../shared/ApiError");
const asyncHandler = require("../../shared/asyncHandler");
const { getEnv } = require("../../config/env");
const queueModule = require("../../jobs/queue");

function createHealthRouter(options = {}) {
  const { database = db, queueService = queueModule } = options;
  const router = Router();

  router.get("/", buildHealthHandler(database, queueService));

  return router;
}

function createReadyRouter(options = {}) {
  const { database = db, queueService = queueModule } = options;
  const router = Router();

  router.get("/", buildReadyHandler(database, queueService));

  return router;
}

function buildHealthHandler(database, queueService) {
  return asyncHandler(async (req, res) => {
    try {
      await database.ping();
    } catch (error) {
      throw new ApiError(503, "Database connectivity check failed", "DATABASE_UNAVAILABLE", {
        cause: error.message
      });
    }

    const queue = await queueService.getQueueHealth();

    res.status(200).json({
      status: "ok",
      service: "nilehive-backend",
      database: "reachable",
      queue: queue.status,
      worker: queue.worker_status
    });
  });
}

function buildReadyHandler(database, queueService) {
  return asyncHandler(async (req, res) => {
    const env = getEnv();

    try {
      await database.ping();
    } catch (error) {
      throw new ApiError(503, "Database connectivity check failed", "DATABASE_UNAVAILABLE", {
        cause: error.message
      });
    }

    if (env.ASYNC_JOBS_ENABLED === "true" && !env.REDIS_URL) {
      throw new ApiError(503, "Async jobs are enabled but REDIS_URL is not configured", "QUEUE_UNAVAILABLE");
    }

    await queueService.ensureQueueReady({ requireWorker: true });
    const queue = await queueService.getQueueHealth();

    res.status(200).json({
      status: "ready",
      service: "nilehive-backend",
      database: "reachable",
      queue: queue.status,
      worker: queue.worker_status,
      queue_counts: {
        waiting: queue.waiting,
        active: queue.active,
        failed: queue.failed,
        delayed: queue.delayed
      }
    });
  });
}

module.exports = { createHealthRouter, createReadyRouter };
