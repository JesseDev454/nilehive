const { Router } = require("express");
const { db } = require("../../config/db");
const { createAuthMiddleware } = require("../../middleware/auth");
const {
  createMembershipRequestsController
} = require("./membership-requests.controller");

function createMembershipRequestsRouter(options = {}) {
  const { database = db } = options;
  const router = Router();
  const auth = createAuthMiddleware({ database });
  const controller = createMembershipRequestsController({ database });

  router.post("/", auth, controller.createRequest);
  router.get("/", auth, controller.listRequests);
  router.get("/me", auth, controller.listMyRequests);
  router.post("/:requestId/decision", auth, controller.decideRequest);

  return router;
}

module.exports = { createMembershipRequestsRouter };
