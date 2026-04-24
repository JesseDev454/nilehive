const { Router } = require("express");
const { db } = require("../../config/db");
const ApiError = require("../../shared/ApiError");
const asyncHandler = require("../../shared/asyncHandler");
const { getEnv } = require("../../config/env");

function createHealthRouter(options = {}) {
  const { database = db } = options;
  const router = Router();

  router.get("/", buildHealthHandler(database));

  return router;
}

function createReadyRouter(options = {}) {
  const { database = db } = options;
  const router = Router();

  router.get("/", buildReadyHandler(database));

  return router;
}

function buildHealthHandler(database) {
  return asyncHandler(async (req, res) => {
    try {
      await database.ping();
    } catch (error) {
      throw new ApiError(503, "Database connectivity check failed", "DATABASE_UNAVAILABLE", {
        cause: error.message
      });
    }

    res.status(200).json({
      status: "ok",
      service: "nilehive-backend",
      database: "reachable"
    });
  });
}

function buildReadyHandler(database) {
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

    res.status(200).json({
      status: "ready",
      service: "nilehive-backend",
      database: "reachable",
      queue: env.ASYNC_JOBS_ENABLED === "true" ? "configured" : "not_required"
    });
  });
}

module.exports = { createHealthRouter, createReadyRouter };
