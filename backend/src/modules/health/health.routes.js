const { Router } = require("express");
const { db } = require("../../config/db");
const ApiError = require("../../shared/ApiError");
const asyncHandler = require("../../shared/asyncHandler");

function createHealthRouter(options = {}) {
  const { database = db } = options;
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (req, res) => {
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
    })
  );

  return router;
}

module.exports = { createHealthRouter };

