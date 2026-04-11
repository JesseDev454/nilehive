const asyncHandler = require("../../shared/asyncHandler");
const {
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
    })
  };
}

module.exports = { createDashboardController };
