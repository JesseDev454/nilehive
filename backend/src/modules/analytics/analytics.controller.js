const asyncHandler = require("../../shared/asyncHandler");
const { getAnalyticsSummary, recordActivity } = require("./analytics.service");

function createAnalyticsController({ database }) {
  return {
    recordActivity: asyncHandler(async (req, res) => {
      await recordActivity({ actor: req.user, feature: req.body.feature, database });
      res.status(204).end();
    }),
    getSummary: asyncHandler(async (req, res) => {
      const data = await getAnalyticsSummary({
        actor: req.user,
        days: Number(req.query.days || 30),
        database
      });
      res.status(200).json({ data });
    })
  };
}

module.exports = { createAnalyticsController };
