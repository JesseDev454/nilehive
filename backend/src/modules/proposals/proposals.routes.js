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

  router.post("/", auth, requireRole("president"), controller.createProposal);
  router.get("/admin", auth, requireRole("admin"), controller.listAdminProposals);
  router.post(
    "/admin/:proposalId/decision",
    auth,
    requireRole("admin"),
    controller.submitAdminDecision
  );
  router.get("/admin/:proposalId", auth, requireRole("admin"), controller.getAdminProposalDetail);
  router.get(
    "/advisor/:proposalId",
    auth,
    requireRole("advisor"),
    controller.getAdvisorProposalDetail
  );
  router.get(
    "/pending-advisor",
    auth,
    requireRole("advisor"),
    controller.listPendingAdvisorProposals
  );
  router.get("/", auth, requireRole("president"), controller.listPresidentProposals);
  router.get("/:proposalId", auth, requireRole("president"), controller.getPresidentProposalDetail);
  router.post("/:proposalId/edit", auth, requireRole("president"), controller.updatePresidentProposal);
  router.post(
    "/:proposalId/submit",
    auth,
    requireRole("president"),
    controller.submitPresidentProposalRevision
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
