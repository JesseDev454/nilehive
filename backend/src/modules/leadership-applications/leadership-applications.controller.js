const asyncHandler = require("../../shared/asyncHandler");
const {
  createLeadershipApplication,
  decideLeadershipApplication,
  listLeadershipApplications,
  listMyLeadershipApplications
} = require("./leadership-applications.service");

function createLeadershipApplicationsController(options = {}) {
  const { database } = options;

  return {
    createApplication: asyncHandler(async (req, res) => {
      const application = await createLeadershipApplication({
        actor: req.user,
        payload: req.body,
        database
      });

      res.status(201).json({ data: application });
    }),

    listMyApplications: asyncHandler(async (req, res) => {
      const applications = await listMyLeadershipApplications({
        actor: req.user,
        database
      });

      res.status(200).json({ data: applications });
    }),

    listApplications: asyncHandler(async (req, res) => {
      const applications = await listLeadershipApplications({
        actor: req.user,
        filters: {
          club_id: req.query.club_id,
          requested_role: req.query.requested_role,
          status: req.query.status
        },
        database
      });

      res.status(200).json({ data: applications });
    }),

    decideApplication: asyncHandler(async (req, res) => {
      const result = await decideLeadershipApplication({
        actor: req.user,
        applicationId: req.params.applicationId,
        payload: req.body,
        database
      });

      res.status(200).json({ data: result });
    })
  };
}

module.exports = { createLeadershipApplicationsController };
