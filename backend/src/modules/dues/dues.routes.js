const { Router } = require("express");
const { db } = require("../../config/db");
const { createAuthMiddleware } = require("../../middleware/auth");
const { createDuesController } = require("./dues.controller");

function createDuesRouter(options = {}) {
  const { database = db } = options;
  const router = Router();
  const auth = createAuthMiddleware({ database });
  const controller = createDuesController({ database });

  router.get("/", auth, controller.listDuePayments);
  router.post("/", auth, controller.createDuePayment);
  router.post("/:paymentId", auth, controller.updateDuePayment);

  return router;
}

module.exports = { createDuesRouter };
