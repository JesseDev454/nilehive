const { db } = require("../../config/db");
const ApiError = require("../../shared/ApiError");
const {
  validateAdvisorDecisionPayload,
  validateCreateProposalPayload
} = require("./proposals.validation");

async function createProposal(options) {
  const { actor, payload, database = db } = options;

  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  if (actor.role !== "executive") {
    throw new ApiError(403, "Only executives can submit proposals", "FORBIDDEN");
  }

  if (!actor.clubId) {
    throw new ApiError(409, "Executive profile is not linked to a club", "PROFILE_NOT_LINKED_TO_CLUB");
  }

  const validatedPayload = validateCreateProposalPayload(payload);

  return database.createProposal({
    club_id: actor.clubId,
    submitted_by: actor.id,
    title: validatedPayload.title,
    description: validatedPayload.description,
    event_date: validatedPayload.event_date,
    location: validatedPayload.location,
    status: "pending_advisor_review"
  });
}

async function getPendingAdvisorProposals(options) {
  const { actor, database = db } = options;

  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  if (actor.role !== "advisor") {
    throw new ApiError(403, "Only advisors can view advisor queues", "FORBIDDEN");
  }

  const clubIds = await database.getAdvisorClubIds(actor.id);

  if (!clubIds.length) {
    return [];
  }

  return database.listPendingProposalsByClubIds(clubIds);
}

async function submitAdvisorDecision(options) {
  const { actor, proposalId, payload, database = db } = options;

  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  if (actor.role !== "advisor") {
    throw new ApiError(403, "Only advisors can review proposals", "FORBIDDEN");
  }

  const validatedPayload = validateAdvisorDecisionPayload(payload);
  const proposal = await database.getProposalById(proposalId);

  if (!proposal) {
    throw new ApiError(404, "Proposal not found", "PROPOSAL_NOT_FOUND");
  }

  const clubIds = await database.getAdvisorClubIds(actor.id);

  if (!clubIds.includes(proposal.club_id)) {
    throw new ApiError(403, "You do not have access to this proposal", "FORBIDDEN");
  }

  if (proposal.status !== "pending_advisor_review") {
    throw new ApiError(
      409,
      "Proposal is not awaiting advisor review",
      "INVALID_PROPOSAL_STATE"
    );
  }

  return database.updateProposalAdvisorDecision(proposalId, {
    status: validatedPayload.decision === "approve" ? "advisor_approved" : "advisor_rejected",
    advisor_remarks: validatedPayload.remarks,
    advisor_decided_at: new Date().toISOString(),
    advisor_decided_by: actor.id
  });
}

module.exports = {
  createProposal,
  getPendingAdvisorProposals,
  submitAdvisorDecision
};
