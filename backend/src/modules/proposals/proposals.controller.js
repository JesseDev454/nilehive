const asyncHandler = require("../../shared/asyncHandler");
const {
  createProposal,
  getPendingAdvisorProposals
} = require("./proposals.service");

function createProposalsController(options = {}) {
  const { database } = options;

  return {
    createProposal: asyncHandler(async (req, res) => {
      const proposal = await createProposal({
        actor: req.user,
        payload: req.body,
        database
      });

      res.status(201).json({ data: proposal });
    }),

    listPendingAdvisorProposals: asyncHandler(async (req, res) => {
      const proposals = await getPendingAdvisorProposals({
        actor: req.user,
        database
      });

      res.status(200).json({ data: proposals });
    })
  };
}

module.exports = { createProposalsController };

