const { Router } = require("express");
const { db } = require("../../config/db");
const { createAuthMiddleware } = require("../../middleware/auth");
const { createStorageController } = require("./storage.controller");

function createStorageRouter(options = {}) {
  const { database = db } = options;
  const router = Router();
  const auth = createAuthMiddleware({ database });
  const controller = createStorageController({ database });

  router.post("/upload", auth, controller.upload);
  router.post("/signed-url", auth, controller.createSignedUrl);

  return router;
}

module.exports = { createStorageRouter };
