const { db } = require("../../config/db");
const ApiError = require("../../shared/ApiError");

async function getVisibleClubIds(actor, database) {
  if (actor.role === "admin") {
    return null;
  }

  if (actor.role === "advisor") {
    return database.getAdvisorClubIds(actor.id);
  }

  if (actor.role === "executive" || actor.role === "president") {
    return actor.clubId ? [actor.clubId] : [];
  }

  if (actor.role === "student") {
    return null;
  }

  return [];
}

function formatApprovedEvent(proposal) {
  return {
    id: proposal.id,
    proposal_id: proposal.id,
    club_id: proposal.club_id,
    title: proposal.proposed_activity || proposal.title,
    proposal_title: proposal.title,
    description: proposal.description,
    event_date: proposal.event_date,
    event_time: proposal.event_time,
    location: proposal.location,
    number_of_participants: proposal.number_of_participants,
    budget_estimate: proposal.budget_estimate,
    status: proposal.status,
    current_stage: "approved",
    approved_at: proposal.admin_decided_at,
    created_at: proposal.created_at,
    updated_at: proposal.updated_at
  };
}

async function listApprovedEvents(options) {
  const { actor, database = db } = options;

  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  const clubIds = await getVisibleClubIds(actor, database);
  const proposals = await database.listApprovedProposals({ clubIds });

  return proposals.map(formatApprovedEvent);
}

module.exports = {
  formatApprovedEvent,
  listApprovedEvents
};
