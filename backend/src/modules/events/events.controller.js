const asyncHandler = require("../../shared/asyncHandler");
const { listApprovedEvents } = require("./events.service");

function createEventsController(options = {}) {
  const { database } = options;

  return {
    listApprovedEvents: asyncHandler(async (req, res) => {
      const events = await listApprovedEvents({
        actor: req.user,
        database
      });

      res.status(200).json({ data: events });
    })
  };
}

module.exports = { createEventsController };
