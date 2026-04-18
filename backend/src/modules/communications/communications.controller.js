const asyncHandler = require("../../shared/asyncHandler");
const {
  createAnnouncement,
  createFeedback,
  listAnnouncements,
  listFeedback,
  markAllAnnouncementsRead,
  markAnnouncementRead
} = require("./communications.service");

function createCommunicationsController(options = {}) {
  const { database } = options;

  return {
    listAnnouncements: asyncHandler(async (req, res) => {
      const announcements = await listAnnouncements({
        actor: req.user,
        filters: {
          audience: req.query.audience,
          club_id: req.query.club_id,
          priority: req.query.priority,
          unread: req.query.unread
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

    markAnnouncementRead: asyncHandler(async (req, res) => {
      const announcement = await markAnnouncementRead({
        actor: req.user,
        announcementId: req.params.announcementId,
        database
      });

      res.status(200).json({ data: announcement });
    }),

    markAllAnnouncementsRead: asyncHandler(async (req, res) => {
      const result = await markAllAnnouncementsRead({
        actor: req.user,
        filters: {
          audience: req.query.audience,
          club_id: req.query.club_id,
          priority: req.query.priority,
          unread: req.query.unread
        },
        database
      });

      res.status(200).json({ data: result });
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
