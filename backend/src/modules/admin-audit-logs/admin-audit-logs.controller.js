const asyncHandler = require("../../shared/asyncHandler");
const { parsePaginationQuery } = require("../../shared/pagination");
const { listAdminAuditLogs } = require("./admin-audit-logs.service");

function createAdminAuditLogsController(options = {}) {
  const { database } = options;

  return {
    listAuditLogs: asyncHandler(async (req, res) => {
      const logs = await listAdminAuditLogs({
        actor: req.user,
        query: req.query,
        pagination: parsePaginationQuery(req.query, {
          defaultPageSize: 20,
          maxPageSize: 50,
          defaultSort: "created_at",
          defaultOrder: "desc",
          allowedSorts: ["created_at"]
        }),
        database
      });

      res.setHeader("Cache-Control", "no-store");
      res.status(200).json({ data: logs });
    })
  };
}

module.exports = { createAdminAuditLogsController };
