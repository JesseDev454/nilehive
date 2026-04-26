const { Router } = require("express");
const { db } = require("../../config/db");
const { createAuthUserMiddleware } = require("../../middleware/auth");
const { createProfileController } = require("./profile.controller");

function createProfileRouter(options = {}) {
  const { database = db } = options;
  const router = Router();
  const authUser = createAuthUserMiddleware({ database });
  const controller = createProfileController({ database });

  router.get("/me", authUser, controller.getMe);
  router.post("/signup-receipt", controller.uploadSignupReceipt);
  router.post("/onboarding", authUser, controller.completeOnboarding);

  return router;
}

module.exports = { createProfileRouter };
