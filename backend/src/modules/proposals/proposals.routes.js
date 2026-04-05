const { Router } = require("express");
const { db } = require("../../config/db");
const { createAuthMiddleware } = require("../../middleware/auth");
const requireRole = require("../../middleware/requireRole");
const { createProposalsController } = require("./proposals.controller");

function createProposalsRouter(options = {}) {
  const { database = db } = options;
  const router = Router();
  const auth = createAuthMiddleware({ database });
  const controller = createProposalsController({ database });

  router.post("/", auth, requireRole("executive"), controller.createProposal);
  router.get(
    "/pending-advisor",
    auth,
    requireRole("advisor"),
    controller.listPendingAdvisorProposals
  );

  return router;
}

module.exports = { createProposalsRouter };

