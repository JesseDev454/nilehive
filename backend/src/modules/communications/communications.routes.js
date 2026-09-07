const { Router } = require("express");
const { db } = require("../../config/db");
const { createAuthMiddleware } = require("../../middleware/auth");
const { createRateLimitMiddleware } = require("../../middleware/rateLimit");
const { createCommunicationsController } = require("./communications.controller");

function createCommunicationsRouter(options = {}) {
  const { database = db } = options;
  const router = Router();
  const auth = createAuthMiddleware({ database });
  const announcementWriteLimit = createRateLimitMiddleware({
    windowMs: 60 * 1000,
    max: 5,
    code: "ANNOUNCEMENT_RATE_LIMITED",
    message: "Too many announcement attempts. Please wait before sending another announcement.",
    key: (req) => `${req.user?.id || req.ip}:announcement:create`
  });
  const feedbackWriteLimit = createRateLimitMiddleware({
    windowMs: 5 * 60 * 1000,
    max: 5,
    code: "FEEDBACK_RATE_LIMITED",
    message: "Too many feedback submissions. Please wait before trying again.",
    key: (req) => `${req.user?.id || req.ip}:feedback:create`
  });
  const controller = createCommunicationsController({ database });

  router.get("/announcements", auth, controller.listAnnouncements);
  router.post("/announcements", auth, announcementWriteLimit, controller.createAnnouncement);
  router.post("/announcements/read-all", auth, controller.markAllAnnouncementsRead);
  router.post("/announcements/:announcementId/read", auth, controller.markAnnouncementRead);
  router.get("/feedback", auth, controller.listFeedback);
  router.post("/feedback", auth, feedbackWriteLimit, controller.createFeedback);

  return router;
}

module.exports = { createCommunicationsRouter };
