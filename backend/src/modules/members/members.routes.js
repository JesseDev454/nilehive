const { Router } = require("express");
const { db } = require("../../config/db");
const { createAuthMiddleware } = require("../../middleware/auth");
const { createMembersController } = require("./members.controller");

function createMembersRouter(options = {}) {
  const { database = db } = options;
  const router = Router();
  const auth = createAuthMiddleware({ database });
  const controller = createMembersController({ database });

  router.get("/", auth, controller.listMembers);
  router.post("/", auth, controller.createMember);
  router.post("/:memberId", auth, controller.updateMember);

  return router;
}

module.exports = { createMembersRouter };
