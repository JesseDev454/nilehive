const { db } = require("../../config/db");
const ApiError = require("../../shared/ApiError");
const {
  validateCreateAnnouncementPayload,
  validateCreateFeedbackPayload
} = require("./communications.validation");

function requireActor(actor) {
  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }
}

function requireClubLinkedActor(actor) {
  if (!actor.clubId) {
    throw new ApiError(409, "This profile is not linked to a club", "PROFILE_NOT_LINKED_TO_CLUB");
  }

  return actor.clubId;
}

function formatAnnouncement(announcement) {
  return {
    id: announcement.id,
    club_id: announcement.club_id,
    created_by: announcement.created_by,
    title: announcement.title,
    message: announcement.message,
    audience: announcement.audience,
    created_at: announcement.created_at,
    updated_at: announcement.updated_at
  };
}

function formatFeedback(feedback) {
  return {
    id: feedback.id,
    club_id: feedback.club_id,
    proposal_id: feedback.proposal_id,
    submitted_by: feedback.submitted_by,
    category: feedback.category,
    rating: feedback.rating,
    comment: feedback.comment,
    status: feedback.status,
    created_at: feedback.created_at,
    updated_at: feedback.updated_at
  };
}

async function getVisibleClubFilters(actor, requestedClubId, database) {
  if (actor.role === "admin") {
    return requestedClubId ? { clubId: requestedClubId } : {};
  }

  if (actor.role === "advisor") {
    const clubIds = await database.getAdvisorClubIds(actor.id);

    if (requestedClubId) {
      if (!clubIds.includes(requestedClubId)) {
        throw new ApiError(403, "You can only access communications for assigned clubs", "FORBIDDEN");
      }

      return { clubId: requestedClubId };
    }

    return { clubIds };
  }

  const clubId = requireClubLinkedActor(actor);

  if (requestedClubId && requestedClubId !== clubId) {
    throw new ApiError(403, "You can only access communications for your own club", "FORBIDDEN");
  }

  return { clubId };
}

async function createAnnouncement(options) {
  const { actor, payload, database = db } = options;
  requireActor(actor);

  if (!["admin", "president", "executive"].includes(actor.role)) {
    throw new ApiError(403, "This role cannot create announcements", "FORBIDDEN");
  }

  const validatedPayload = validateCreateAnnouncementPayload(payload);
  let clubId = validatedPayload.club_id;
  let audience = validatedPayload.audience;

  if (actor.role !== "admin") {
    audience = "club";
    clubId = requireClubLinkedActor(actor);
  } else if (audience === "club" && !clubId) {
    throw new ApiError(400, "Club announcements require a club_id", "VALIDATION_ERROR", {
      field: "club_id"
    });
  } else if (audience === "all") {
    clubId = null;
  }

  const announcement = await database.createAnnouncement({
    club_id: clubId,
    created_by: actor.id,
    title: validatedPayload.title,
    message: validatedPayload.message,
    audience
  });

  return formatAnnouncement(announcement);
}

async function listAnnouncements(options) {
  const { actor, filters = {}, database = db } = options;
  requireActor(actor);

  const clubFilters = await getVisibleClubFilters(actor, filters.club_id, database);
  const announcements = await database.listAnnouncements({
    ...clubFilters,
    audience: filters.audience
  });

  return announcements.map(formatAnnouncement);
}

async function createFeedback(options) {
  const { actor, payload, database = db } = options;
  requireActor(actor);

  if (actor.role === "advisor") {
    throw new ApiError(403, "Advisors can view feedback but should not submit club feedback", "FORBIDDEN");
  }

  const validatedPayload = validateCreateFeedbackPayload(payload);
  const clubId = actor.role === "admin"
    ? validatedPayload.club_id
    : requireClubLinkedActor(actor);

  if (!clubId) {
    throw new ApiError(400, "Feedback requires a club_id", "VALIDATION_ERROR", {
      field: "club_id"
    });
  }

  if (actor.role !== "admin" && validatedPayload.club_id && validatedPayload.club_id !== clubId) {
    throw new ApiError(403, "You can only submit feedback for your own club", "FORBIDDEN");
  }

  if (validatedPayload.proposal_id) {
    const proposal = await database.getProposalById(validatedPayload.proposal_id);

    if (!proposal || proposal.club_id !== clubId) {
      throw new ApiError(404, "Proposal not found for this club", "PROPOSAL_NOT_FOUND");
    }
  }

  const feedback = await database.createFeedback({
    club_id: clubId,
    proposal_id: validatedPayload.proposal_id,
    submitted_by: actor.id,
    category: validatedPayload.category,
    rating: validatedPayload.rating,
    comment: validatedPayload.comment,
    status: "open"
  });

  return formatFeedback(feedback);
}

async function listFeedback(options) {
  const { actor, filters = {}, database = db } = options;
  requireActor(actor);

  if (!["admin", "advisor", "president", "executive"].includes(actor.role)) {
    throw new ApiError(403, "This role cannot view feedback", "FORBIDDEN");
  }

  const clubFilters = await getVisibleClubFilters(actor, filters.club_id, database);
  const feedback = await database.listFeedback({
    ...clubFilters,
    proposalId: filters.proposal_id,
    status: filters.status
  });

  return feedback.map(formatFeedback);
}

module.exports = {
  createAnnouncement,
  createFeedback,
  listAnnouncements,
  listFeedback
};
