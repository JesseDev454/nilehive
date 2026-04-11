const { Router } = require("express");
const { db } = require("../../config/db");
const { createAuthMiddleware } = require("../../middleware/auth");
const { createClubsController } = require("./clubs.controller");

function createClubsRouter(options = {}) {
  const { database = db } = options;
  const router = Router();
  const auth = createAuthMiddleware({ database });
  const controller = createClubsController({ database });

  router.get("/", auth, controller.listClubs);

  return router;
}

module.exports = { createClubsRouter };
