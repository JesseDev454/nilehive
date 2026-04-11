const { Router } = require("express");
const { db } = require("../../config/db");
const { createAuthMiddleware } = require("../../middleware/auth");
const { createEventsController } = require("./events.controller");

function createEventsRouter(options = {}) {
  const { database = db } = options;
  const router = Router();
  const auth = createAuthMiddleware({ database });
  const controller = createEventsController({ database });

  router.get("/approved", auth, controller.listApprovedEvents);

  return router;
}

module.exports = { createEventsRouter };
