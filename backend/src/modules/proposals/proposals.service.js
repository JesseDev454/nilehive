const { db } = require("../../config/db");
const ApiError = require("../../shared/ApiError");
const {
  validateAdvisorDecisionPayload,
  validateCreateProposalPayload
} = require("./proposals.validation");

const ADVISOR_DECISION_TRANSITIONS = Object.freeze({
  pending_advisor_review: Object.freeze({
    approve: "pending_admin_review",
    reject: "advisor_rejected"
  })
});

function getNextProposalStatus(currentStatus, decision) {
  const allowedTransitions = ADVISOR_DECISION_TRANSITIONS[currentStatus];

  if (!allowedTransitions || !allowedTransitions[decision]) {
    throw new ApiError(
      409,
      "Proposal is not awaiting advisor review",
      "INVALID_PROPOSAL_STATE"
    );
  }

  return allowedTransitions[decision];
}

function getCurrentStage(status) {
  const stages = {
    pending_advisor_review: "advisor_review",
    pending_admin_review: "admin_review",
    advisor_rejected: "rejected"
  };

  return stages[status] ?? status;
}

function formatExecutiveProposal(proposal, latestApproval = null) {
  return {
    id: proposal.id,
    title: proposal.title,
    description: proposal.description,
    event_date: proposal.event_date,
    status: proposal.status,
    current_stage: getCurrentStage(proposal.status),
    submitted_at: proposal.created_at,
    created_at: proposal.created_at,
    updated_at: proposal.updated_at,
    advisor_remarks: proposal.advisor_remarks,
    advisor_decided_at: proposal.advisor_decided_at,
    latest_approval: latestApproval
      ? {
          reviewer_id: latestApproval.reviewer_id,
          reviewer_role: latestApproval.reviewer_role,
          decision: latestApproval.decision,
          remarks: latestApproval.remarks,
          decided_at: latestApproval.decided_at
        }
      : null
  };
}

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

async function listExecutiveProposals(options) {
  const { actor, database = db } = options;

  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  if (actor.role !== "executive") {
    throw new ApiError(403, "Only executives can view their proposals", "FORBIDDEN");
  }

  const proposals = await database.listExecutiveProposals(actor.id);
  const latestApprovalsByProposalId = await database.getLatestApprovalsByProposalIds(
    proposals.map((proposal) => proposal.id)
  );

  return proposals.map((proposal) =>
    formatExecutiveProposal(proposal, latestApprovalsByProposalId[proposal.id] ?? null)
  );
}

async function getExecutiveProposalDetail(options) {
  const { actor, proposalId, database = db } = options;

  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  if (actor.role !== "executive") {
    throw new ApiError(403, "Only executives can view their proposals", "FORBIDDEN");
  }

  const proposal = await database.getProposalById(proposalId);

  if (!proposal || proposal.submitted_by !== actor.id) {
    throw new ApiError(404, "Proposal not found", "PROPOSAL_NOT_FOUND");
  }

  const latestApproval = await database.getLatestApprovalByProposalId(proposalId);

  return formatExecutiveProposal(proposal, latestApproval);
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

  const decidedAt = new Date().toISOString();
  const nextStatus = getNextProposalStatus(proposal.status, validatedPayload.decision);

  const updatedProposal = await database.applyAdvisorDecision({
    proposalId,
    reviewerId: actor.id,
    reviewerRole: actor.role,
    decision: validatedPayload.decision,
    remarks: validatedPayload.remarks,
    decidedAt,
    nextStatus
  });

  if (!updatedProposal) {
    throw new ApiError(
      409,
      "Proposal is not awaiting advisor review",
      "INVALID_PROPOSAL_STATE"
    );
  }

  return updatedProposal;
}

module.exports = {
  createProposal,
  getPendingAdvisorProposals,
  listExecutiveProposals,
  getExecutiveProposalDetail,
  submitAdvisorDecision
};
