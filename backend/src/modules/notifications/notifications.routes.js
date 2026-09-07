const { Router } = require("express");
const { db } = require("../../config/db");
const { createAuthMiddleware } = require("../../middleware/auth");
const { createNotificationsController } = require("./notifications.controller");

function createNotificationsRouter(options = {}) {
  const { database = db } = options;
  const router = Router();
  const auth = createAuthMiddleware({ database });
  const controller = createNotificationsController({ database });

  router.get("/push-config", auth, controller.getPushConfig);
  router.post("/push-subscriptions", auth, controller.registerPushSubscription);
  router.post("/push-subscriptions/remove", auth, controller.removePushSubscription);
  router.get("/", auth, controller.listOwnNotifications);

  return router;
}

module.exports = { createNotificationsRouter };
