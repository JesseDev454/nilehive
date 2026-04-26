const { Router } = require("express");
const { db } = require("../../config/db");
const { createAuthMiddleware } = require("../../middleware/auth");
const { createRateLimitMiddleware } = require("../../middleware/rateLimit");
const { createDuesController } = require("./dues.controller");

function createDuesRouter(options = {}) {
  const { database = db } = options;
  const router = Router();
  const auth = createAuthMiddleware({ database });
  const duesDecisionLimit = createRateLimitMiddleware({
    windowMs: 5 * 60 * 1000,
    max: 20,
    code: "DUES_DECISION_RATE_LIMITED",
    message: "Too many dues review attempts. Please wait before trying again.",
    key: (req) => `${req.user?.id || req.ip}:dues:update`
  });
  const controller = createDuesController({ database });

  router.get("/me", auth, controller.listMyDuePayments);
  router.get("/payment-settings", auth, controller.getPaymentSettings);
  router.post("/payment-settings", auth, controller.upsertPaymentSettings);
  router.post("/payment-settings/apply-club-profile-all", auth, controller.applyClubPaymentProfileToAllClubs);
  router.post("/payment-settings/apply-all", auth, controller.applyDuesAmountToAllClubs);
  router.post("/payment-settings/apply-account-all", auth, controller.applyPaymentSettingsToAllClubs);
  router.get("/", auth, controller.listDuePayments);
  router.post("/", auth, controller.createDuePayment);
  router.post("/:paymentId/submit-confirmation", auth, controller.submitDuePaymentConfirmation);
  router.post("/:paymentId", auth, duesDecisionLimit, controller.updateDuePayment);

  return router;
}

module.exports = { createDuesRouter };
