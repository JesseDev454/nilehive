const asyncHandler = require("../../shared/asyncHandler");
const {
  getAdminClubDashboard,
  getAdminOperationsDashboard,
  getExecutiveDashboard,
  getPresidentDashboard
} = require("./dashboard.service");

function createDashboardController(options = {}) {
  const { database } = options;

  return {
    getExecutiveDashboard: asyncHandler(async (req, res) => {
      const dashboard = await getExecutiveDashboard({
        actor: req.user,
        database
      });

      res.status(200).json({ data: dashboard });
    }),

    getPresidentDashboard: asyncHandler(async (req, res) => {
      const dashboard = await getPresidentDashboard({
        actor: req.user,
        database
      });

      res.status(200).json({ data: dashboard });
    }),

    getAdminOperationsDashboard: asyncHandler(async (req, res) => {
      const dashboard = await getAdminOperationsDashboard({
        actor: req.user,
        database
      });

      res.status(200).json({ data: dashboard });
    }),

    getAdminClubDashboard: asyncHandler(async (req, res) => {
      const dashboard = await getAdminClubDashboard({
        actor: req.user,
        clubId: req.params.clubId,
        database
      });

      res.status(200).json({ data: dashboard });
    })
  };
}

module.exports = { createDashboardController };
