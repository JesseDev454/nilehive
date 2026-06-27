const { Router } = require("express");
const { db } = require("../../config/db");
const { createAuthMiddleware } = require("../../middleware/auth");
const requireRole = require("../../middleware/requireRole");
const { createAnalyticsController } = require("./analytics.controller");

function createAnalyticsRouter(options = {}) {
  const database = options.database || db;
  const router = Router();
  const auth = createAuthMiddleware({ database });
  const controller = createAnalyticsController({ database });
  router.post("/activity", auth, controller.recordActivity);
  router.get("/admin", auth, requireRole("admin"), controller.getSummary);
  return router;
}

module.exports = { createAnalyticsRouter };
