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
  router.get("/", auth, requireRole("executive"), controller.listExecutiveProposals);
  router.get("/:proposalId", auth, requireRole("executive"), controller.getExecutiveProposalDetail);
  router.get(
    "/pending-advisor",
    auth,
    requireRole("advisor"),
    controller.listPendingAdvisorProposals
  );
  router.post(
    "/:proposalId/advisor-decision",
    auth,
    requireRole("advisor"),
    controller.submitAdvisorDecision
  );

  return router;
}

module.exports = { createProposalsRouter };
