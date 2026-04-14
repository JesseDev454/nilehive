const { Router } = require("express");
const { db } = require("../../config/db");
const { createAuthMiddleware } = require("../../middleware/auth");
const { createCommunicationsController } = require("./communications.controller");

function createCommunicationsRouter(options = {}) {
  const { database = db } = options;
  const router = Router();
  const auth = createAuthMiddleware({ database });
  const controller = createCommunicationsController({ database });

  router.get("/announcements", auth, controller.listAnnouncements);
  router.post("/announcements", auth, controller.createAnnouncement);
  router.get("/feedback", auth, controller.listFeedback);
  router.post("/feedback", auth, controller.createFeedback);

  return router;
}

module.exports = { createCommunicationsRouter };
