const asyncHandler = require("../../shared/asyncHandler");
const { parsePaginationQuery } = require("../../shared/pagination");
const {
  getEventEngagement,
  listApprovedEvents,
  submitEventAttendance,
  submitEventRsvp
} = require("./events.service");

function createEventsController(options = {}) {
  const { database } = options;

  return {
    listApprovedEvents: asyncHandler(async (req, res) => {
      const events = await listApprovedEvents({
        actor: req.user,
        filters: {
          lifecycle: req.query.lifecycle
        },
        pagination: parsePaginationQuery(req.query, {
          defaultSort: "event_date",
          defaultOrder: "asc",
          allowedSorts: ["event_date", "created_at"]
        }),
        database
      });

      res.status(200).json({ data: events });
    }),

    getEventEngagement: asyncHandler(async (req, res) => {
      const engagement = await getEventEngagement({
        actor: req.user,
        proposalId: req.params.proposalId,
        database
      });

      res.status(200).json({ data: engagement });
    }),

    submitEventRsvp: asyncHandler(async (req, res) => {
      const rsvp = await submitEventRsvp({
        actor: req.user,
        proposalId: req.params.proposalId,
        payload: req.body,
        database
      });

      res.status(200).json({ data: rsvp });
    }),

    submitEventAttendance: asyncHandler(async (req, res) => {
      const attendance = await submitEventAttendance({
        actor: req.user,
        proposalId: req.params.proposalId,
        payload: req.body,
        database
      });

      res.status(200).json({ data: attendance });
    })
  };
}

module.exports = { createEventsController };
