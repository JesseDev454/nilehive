const { Router } = require("express");
const { db } = require("../../config/db");
const { createAuthMiddleware } = require("../../middleware/auth");
const { createRateLimitMiddleware } = require("../../middleware/rateLimit");
const {
  createMembershipRequestsController
} = require("./membership-requests.controller");

function createMembershipRequestsRouter(options = {}) {
  const { database = db } = options;
  const router = Router();
  const auth = createAuthMiddleware({ database });
  const membershipWriteLimit = createRateLimitMiddleware({
    windowMs: 10 * 60 * 1000,
    max: 3,
    code: "MEMBERSHIP_REQUEST_RATE_LIMITED",
    message: "Too many membership requests. Please wait before trying again.",
    key: (req) => `${req.user?.id || req.ip}:membership-request:create`
  });
  const membershipDecisionLimit = createRateLimitMiddleware({
    windowMs: 5 * 60 * 1000,
    max: 20,
    code: "MEMBERSHIP_DECISION_RATE_LIMITED",
    message: "Too many membership review attempts. Please wait before trying again.",
    key: (req) => `${req.user?.id || req.ip}:membership-request:decision`
  });
  const whatsappOnboardingLimit = createRateLimitMiddleware({
    windowMs: 5 * 60 * 1000,
    max: 30,
    code: "WHATSAPP_ONBOARDING_RATE_LIMITED",
    message: "Too many WhatsApp onboarding updates. Please wait before trying again.",
    key: (req) => `${req.user?.id || req.ip}:membership-request:whatsapp`
  });
  const controller = createMembershipRequestsController({ database });

  router.post("/", auth, membershipWriteLimit, controller.createRequest);
  router.get("/", auth, controller.listRequests);
  router.get("/me", auth, controller.listMyRequests);
  router.post("/:requestId/decision", auth, membershipDecisionLimit, controller.decideRequest);
  router.post("/:requestId/whatsapp-added", auth, whatsappOnboardingLimit, controller.markWhatsAppAdded);

  return router;
}

module.exports = { createMembershipRequestsRouter };
