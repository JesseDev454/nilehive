const { db } = require("../../config/db");
const ApiError = require("../../shared/ApiError");
const { validateCreateProposalPayload } = require("./proposals.validation");

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

module.exports = {
  createProposal,
  getPendingAdvisorProposals
};

