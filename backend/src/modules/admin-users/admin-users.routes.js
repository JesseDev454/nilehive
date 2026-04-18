const { Router } = require("express");
const { db } = require("../../config/db");
const { createAuthMiddleware } = require("../../middleware/auth");
const { createAdminUsersController } = require("./admin-users.controller");

function createAdminUsersRouter(options = {}) {
  const { database = db } = options;
  const router = Router();
  const auth = createAuthMiddleware({ database });
  const controller = createAdminUsersController({ database });

  router.get("/", auth, controller.listUsers);
  router.get("/:profileId", auth, controller.getUser);
  router.post("/:profileId/role", auth, controller.updateRole);
  router.post("/:profileId/advisor-assignment", auth, controller.assignAdvisor);

  return router;
}

module.exports = { createAdminUsersRouter };
