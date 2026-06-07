const asyncHandler = require("../../shared/asyncHandler");
const { parsePaginationQuery } = require("../../shared/pagination");
const {
  createEventReport,
  getEventReportDetail,
  listEventReports
} = require("./reports.service");

function createReportsController(options = {}) {
  const { database } = options;

  return {
    createEventReport: asyncHandler(async (req, res) => {
      const report = await createEventReport({
        actor: req.user,
        payload: req.body,
        database
      });

      res.status(201).json({ data: report });
    }),

    listEventReports: asyncHandler(async (req, res) => {
      const reports = await listEventReports({
        actor: req.user,
        filters: {
          club_id: req.query.club_id,
          proposal_id: req.query.proposal_id
        },
        pagination: parsePaginationQuery(req.query, {
          defaultSort: "submitted_at",
          defaultOrder: "desc",
          allowedSorts: ["submitted_at", "created_at", "attendance_count", "budget_used"]
        }),
        database
      });

      res.status(200).json({ data: reports });
    }),

    getEventReportDetail: asyncHandler(async (req, res) => {
      const report = await getEventReportDetail({
        actor: req.user,
        reportId: req.params.reportId,
        database
      });

      res.status(200).json({ data: report });
    })
  };
}

module.exports = { createReportsController };
