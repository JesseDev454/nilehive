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
  router.get("/admin", auth, requireRole("admin"), controller.listAdminProposals);
  router.get("/admin/:proposalId", auth, requireRole("admin"), controller.getAdminProposalDetail);
  router.get(
    "/pending-advisor",
    auth,
    requireRole("advisor"),
    controller.listPendingAdvisorProposals
  );
  router.get("/", auth, requireRole("executive"), controller.listExecutiveProposals);
  router.get("/:proposalId", auth, requireRole("executive"), controller.getExecutiveProposalDetail);
  router.post(
    "/:proposalId/advisor-decision",
    auth,
    requireRole("advisor"),
    controller.submitAdvisorDecision
  );

  return router;
}

module.exports = { createProposalsRouter };
