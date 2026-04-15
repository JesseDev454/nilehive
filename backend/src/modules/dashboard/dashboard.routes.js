const { Router } = require("express");
const { db } = require("../../config/db");
const { createAuthMiddleware } = require("../../middleware/auth");
const requireRole = require("../../middleware/requireRole");
const { createDashboardController } = require("./dashboard.controller");

function createDashboardRouter(options = {}) {
  const { database = db } = options;
  const router = Router();
  const auth = createAuthMiddleware({ database });
  const controller = createDashboardController({ database });

  router.get("/executive", auth, requireRole("executive"), controller.getExecutiveDashboard);
  router.get("/president", auth, requireRole("president"), controller.getPresidentDashboard);
  router.get("/admin-operations", auth, requireRole("admin"), controller.getAdminOperationsDashboard);

  return router;
}

module.exports = { createDashboardRouter };
