const asyncHandler = require("../../shared/asyncHandler");
const {
  createAnnouncement,
  createFeedback,
  listAnnouncements,
  listFeedback
} = require("./communications.service");

function createCommunicationsController(options = {}) {
  const { database } = options;

  return {
    listAnnouncements: asyncHandler(async (req, res) => {
      const announcements = await listAnnouncements({
        actor: req.user,
        filters: {
          audience: req.query.audience,
          club_id: req.query.club_id
        },
        database
      });

      res.status(200).json({ data: announcements });
    }),

    createAnnouncement: asyncHandler(async (req, res) => {
      const announcement = await createAnnouncement({
        actor: req.user,
        payload: req.body,
        database
      });

      res.status(201).json({ data: announcement });
    }),

    listFeedback: asyncHandler(async (req, res) => {
      const feedback = await listFeedback({
        actor: req.user,
        filters: {
          club_id: req.query.club_id,
          proposal_id: req.query.proposal_id,
          status: req.query.status
        },
        database
      });

      res.status(200).json({ data: feedback });
    }),

    createFeedback: asyncHandler(async (req, res) => {
      const feedback = await createFeedback({
        actor: req.user,
        payload: req.body,
        database
      });

      res.status(201).json({ data: feedback });
    })
  };
}

module.exports = { createCommunicationsController };
