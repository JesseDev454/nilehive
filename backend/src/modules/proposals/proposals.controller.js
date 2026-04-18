const asyncHandler = require("../../shared/asyncHandler");
const {
  getAdminProposalDetail,
  getAdvisorProposalDetail,
  createProposal,
  getPresidentProposalDetail,
  getPendingAdvisorProposals,
  listAdminProposals,
  listPresidentProposals,
  submitAdminDecision,
  submitAdvisorDecision,
  submitPresidentProposalRevision,
  updatePresidentProposal
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

    listAdminProposals: asyncHandler(async (req, res) => {
      const proposals = await listAdminProposals({
        actor: req.user,
        filters: {
          status: req.query.status,
          current_stage: req.query.current_stage
        },
        database
      });

      res.status(200).json({ data: proposals });
    }),

    getAdminProposalDetail: asyncHandler(async (req, res) => {
      const proposal = await getAdminProposalDetail({
        actor: req.user,
        proposalId: req.params.proposalId,
        database
      });

      res.status(200).json({ data: proposal });
    }),

    submitAdminDecision: asyncHandler(async (req, res) => {
      const proposal = await submitAdminDecision({
        actor: req.user,
        proposalId: req.params.proposalId,
        payload: req.body,
        database
      });

      res.status(200).json({ data: proposal });
    }),

    getAdvisorProposalDetail: asyncHandler(async (req, res) => {
      const proposal = await getAdvisorProposalDetail({
        actor: req.user,
        proposalId: req.params.proposalId,
        database
      });

      res.status(200).json({ data: proposal });
    }),

    listPresidentProposals: asyncHandler(async (req, res) => {
      const proposals = await listPresidentProposals({
        actor: req.user,
        database
      });

      res.status(200).json({ data: proposals });
    }),

    getPresidentProposalDetail: asyncHandler(async (req, res) => {
      const proposal = await getPresidentProposalDetail({
        actor: req.user,
        proposalId: req.params.proposalId,
        database
      });

      res.status(200).json({ data: proposal });
    }),

    updatePresidentProposal: asyncHandler(async (req, res) => {
      const proposal = await updatePresidentProposal({
        actor: req.user,
        proposalId: req.params.proposalId,
        payload: req.body,
        database
      });

      res.status(200).json({ data: proposal });
    }),

    submitPresidentProposalRevision: asyncHandler(async (req, res) => {
      const proposal = await submitPresidentProposalRevision({
        actor: req.user,
        proposalId: req.params.proposalId,
        database
      });

      res.status(200).json({ data: proposal });
    }),

    listPendingAdvisorProposals: asyncHandler(async (req, res) => {
      const proposals = await getPendingAdvisorProposals({
        actor: req.user,
        database
      });

      res.status(200).json({ data: proposals });
    }),

    submitAdvisorDecision: asyncHandler(async (req, res) => {
      const proposal = await submitAdvisorDecision({
        actor: req.user,
        proposalId: req.params.proposalId,
        payload: req.body,
        database
      });

      res.status(200).json({ data: proposal });
    })
  };
}

module.exports = { createProposalsController };
