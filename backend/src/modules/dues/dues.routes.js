const { Router } = require("express");
const { db } = require("../../config/db");
const { createAuthMiddleware } = require("../../middleware/auth");
const { createDuesController } = require("./dues.controller");

function createDuesRouter(options = {}) {
  const { database = db } = options;
  const router = Router();
  const auth = createAuthMiddleware({ database });
  const controller = createDuesController({ database });

  router.get("/me", auth, controller.listMyDuePayments);
  router.get("/payment-settings", auth, controller.getPaymentSettings);
  router.post("/payment-settings", auth, controller.upsertPaymentSettings);
  router.get("/", auth, controller.listDuePayments);
  router.post("/", auth, controller.createDuePayment);
  router.post("/:paymentId/submit-confirmation", auth, controller.submitDuePaymentConfirmation);
  router.post("/:paymentId", auth, controller.updateDuePayment);

  return router;
}

module.exports = { createDuesRouter };
