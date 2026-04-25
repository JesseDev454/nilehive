const { Router } = require("express");
const { db } = require("../../config/db");
const { createAuthMiddleware } = require("../../middleware/auth");
const { createRateLimitMiddleware } = require("../../middleware/rateLimit");
const {
  createLeadershipApplicationsController
} = require("./leadership-applications.controller");

function createLeadershipApplicationsRouter(options = {}) {
  const { database = db } = options;
  const router = Router();
  const auth = createAuthMiddleware({ database });
  const leadershipWriteLimit = createRateLimitMiddleware({
    windowMs: 10 * 60 * 1000,
    max: 2,
    code: "LEADERSHIP_APPLICATION_RATE_LIMITED",
    message: "Too many leadership application attempts. Please wait before trying again.",
    key: (req) => `${req.user?.id || req.ip}:leadership-application:create`
  });
  const leadershipDecisionLimit = createRateLimitMiddleware({
    windowMs: 5 * 60 * 1000,
    max: 20,
    code: "LEADERSHIP_DECISION_RATE_LIMITED",
    message: "Too many leadership review attempts. Please wait before trying again.",
    key: (req) => `${req.user?.id || req.ip}:leadership-application:decision`
  });
  const controller = createLeadershipApplicationsController({ database });

  router.post("/", auth, leadershipWriteLimit, controller.createApplication);
  router.get("/", auth, controller.listApplications);
  router.get("/me", auth, controller.listMyApplications);
  router.post("/:applicationId/decision", auth, leadershipDecisionLimit, controller.decideApplication);

  return router;
}

module.exports = { createLeadershipApplicationsRouter };
