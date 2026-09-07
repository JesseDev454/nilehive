const { Router } = require("express");
const { db } = require("../../config/db");
const { createAuthMiddleware } = require("../../middleware/auth");
const { createReportsController } = require("./reports.controller");

function createReportsRouter(options = {}) {
  const { database = db } = options;
  const router = Router();
  const auth = createAuthMiddleware({ database });
  const controller = createReportsController({ database });

  router.get("/", auth, controller.listEventReports);
  router.post("/", auth, controller.createEventReport);
  router.get("/:reportId", auth, controller.getEventReportDetail);

  return router;
}

module.exports = { createReportsRouter };
