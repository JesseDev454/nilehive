const { Router } = require("express");
const { db } = require("../../config/db");
const { createAuthMiddleware } = require("../../middleware/auth");
const { createRateLimitMiddleware } = require("../../middleware/rateLimit");
const requireRole = require("../../middleware/requireRole");
const { createProposalsController } = require("./proposals.controller");

function createProposalsRouter(options = {}) {
  const { database = db } = options;
  const router = Router();
  const auth = createAuthMiddleware({ database });
  const adminDecisionLimit = createRateLimitMiddleware({
    windowMs: 5 * 60 * 1000,
    max: 20,
    code: "ADMIN_DECISION_RATE_LIMITED",
    message: "Too many admin review attempts. Please wait before trying again.",
    key: (req) => `${req.user?.id || req.ip}:proposal:admin-decision`
  });
  const advisorDecisionLimit = createRateLimitMiddleware({
    windowMs: 5 * 60 * 1000,
    max: 20,
    code: "ADVISOR_DECISION_RATE_LIMITED",
    message: "Too many advisor review attempts. Please wait before trying again.",
    key: (req) => `${req.user?.id || req.ip}:proposal:advisor-decision`
  });
  const controller = createProposalsController({ database });

  router.post("/", auth, requireRole("president"), controller.createProposal);
  router.get("/admin", auth, requireRole("admin"), controller.listAdminProposals);
  router.post(
    "/admin/:proposalId/decision",
    auth,
    requireRole("admin"),
    adminDecisionLimit,
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
    advisorDecisionLimit,
    controller.submitAdvisorDecision
  );

  return router;
}

module.exports = { createProposalsRouter };
