const { Router } = require("express");
const { db } = require("../../config/db");
const { createAuthMiddleware } = require("../../middleware/auth");
const { createRemindersController } = require("./reminders.controller");

function createRemindersRouter(options = {}) {
  const { database = db } = options;
  const router = Router();
  const auth = createAuthMiddleware({ database });
  const controller = createRemindersController({ database });

  router.get("/", auth, controller.listOwnReminders);

  return router;
}

module.exports = { createRemindersRouter };
