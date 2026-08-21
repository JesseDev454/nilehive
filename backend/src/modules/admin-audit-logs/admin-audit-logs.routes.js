const { Router } = require("express");
const { db } = require("../../config/db");
const { createAuthMiddleware } = require("../../middleware/auth");
const { createRateLimitMiddleware } = require("../../middleware/rateLimit");
const requireRole = require("../../middleware/requireRole");
const { createAdminAuditLogsController } = require("./admin-audit-logs.controller");

function createAdminAuditLogsRouter(options = {}) {
  const { database = db } = options;
  const router = Router();
  const auth = createAuthMiddleware({ database });
  const controller = createAdminAuditLogsController({ database });
  const listLimit = createRateLimitMiddleware({
    windowMs: 60_000,
    max: 60,
    code: "RATE_LIMITED",
    message: "Too many audit log requests. Please try again later.",
    key: (req) => `admin-audit-logs:${req.user?.id || req.ip}`
  });

  router.get("/", auth, requireRole("admin"), listLimit, controller.listAuditLogs);

  return router;
}

module.exports = { createAdminAuditLogsRouter };
