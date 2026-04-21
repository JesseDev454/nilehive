const { Router } = require("express");
const { db } = require("../../config/db");
const { createAuthMiddleware } = require("../../middleware/auth");
const {
  createLeadershipApplicationsController
} = require("./leadership-applications.controller");

function createLeadershipApplicationsRouter(options = {}) {
  const { database = db } = options;
  const router = Router();
  const auth = createAuthMiddleware({ database });
  const controller = createLeadershipApplicationsController({ database });

  router.post("/", auth, controller.createApplication);
  router.get("/", auth, controller.listApplications);
  router.get("/me", auth, controller.listMyApplications);
  router.post("/:applicationId/decision", auth, controller.decideApplication);

  return router;
}

module.exports = { createLeadershipApplicationsRouter };
