const { db } = require("../../config/db");
const ApiError = require("../../shared/ApiError");
const { ensurePaginatedResult, mapPaginatedResult } = require("../../shared/pagination");
const { validateCreateEventReportPayload } = require("./reports.validation");

function requireActor(actor) {
  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }
}

function getScopedClubId(actor, requestedClubId = null) {
  if (actor.role === "admin") {
    return requestedClubId;
  }

  if (!actor.clubId) {
    throw new ApiError(409, "This profile is not linked to a club", "PROFILE_NOT_LINKED_TO_CLUB");
  }

  if (requestedClubId && requestedClubId !== actor.clubId) {
    throw new ApiError(403, "You can only access reports for your own club", "FORBIDDEN");
  }

  return actor.clubId;
}

function formatLinkedProposal(proposal) {
  if (!proposal) {
    return null;
  }

  return {
    id: proposal.id,
    title: proposal.title,
    proposed_activity: proposal.proposed_activity,
    event_date: proposal.event_date,
    event_time: proposal.event_time,
    location: proposal.location,
    status: proposal.status
  };
}

function formatClubReference(club) {
  if (!club) {
    return null;
  }

  return {
    id: club.id,
    name: club.name,
    code: club.code ?? null
  };
}

function formatEventReport(report) {
  return {
    id: report.id,
    proposal_id: report.proposal_id,
    club_id: report.club_id,
    submitted_by: report.submitted_by,
    attendance_count: report.attendance_count,
    summary: report.summary,
    challenges: report.challenges,
    outcomes: report.outcomes,
    budget_used: report.budget_used === null ? null : Number(report.budget_used),
    media_urls: report.media_urls ?? [],
    status: report.status,
    submitted_at: report.submitted_at,
    created_at: report.created_at,
    updated_at: report.updated_at,
    club: formatClubReference(report.club ?? null),
    proposal: formatLinkedProposal(report.proposals ?? report.proposal ?? null)
  };
}

async function createEventReport(options) {
  const { actor, payload, database = db } = options;
  requireActor(actor);

  if (actor.role !== "president") {
    throw new ApiError(403, "Only presidents can submit post-event reports", "FORBIDDEN");
  }

  if (!actor.clubId) {
    throw new ApiError(409, "President profile is not linked to a club", "PROFILE_NOT_LINKED_TO_CLUB");
  }

  const validatedPayload = validateCreateEventReportPayload(payload);
  const proposal = await database.getProposalById(validatedPayload.proposal_id);

  if (!proposal || proposal.club_id !== actor.clubId) {
    throw new ApiError(404, "Approved proposal not found", "PROPOSAL_NOT_FOUND");
  }

  if (proposal.status !== "approved") {
    throw new ApiError(
      409,
      "Post-event reports can only be submitted for approved events",
      "INVALID_PROPOSAL_STATE"
    );
  }

  const existingReport = await database.getEventReportByProposalId(proposal.id);

  if (existingReport) {
    throw new ApiError(409, "This event already has a report", "REPORT_ALREADY_EXISTS");
  }

  const report = await database.createEventReport({
    proposal_id: proposal.id,
    club_id: actor.clubId,
    submitted_by: actor.id,
    attendance_count: validatedPayload.attendance_count,
    summary: validatedPayload.summary,
    challenges: validatedPayload.challenges,
    outcomes: validatedPayload.outcomes,
    budget_used: validatedPayload.budget_used,
    media_urls: validatedPayload.media_urls,
    status: "submitted"
  });

  return formatEventReport({
    ...report,
    proposals: proposal
  });
}

async function listEventReports(options) {
  const { actor, filters = {}, pagination, database = db } = options;
  requireActor(actor);

  const supportedRoles = ["admin", "advisor", "president"];

  if (!supportedRoles.includes(actor.role)) {
    throw new ApiError(403, "This role cannot view event reports", "FORBIDDEN");
  }

  let clubId = null;
  let clubIds = null;

  if (actor.role === "advisor") {
    clubIds = await database.getAdvisorClubIds(actor.id);
  } else {
    clubId = getScopedClubId(actor, filters.club_id);
  }

  const reports = ensurePaginatedResult(await database.listEventReports({
    clubId,
    clubIds,
    proposalId: filters.proposal_id,
    ...(pagination
      ? {
          pagination,
          sort: pagination.sort,
          order: pagination.order
        }
      : {})
  }), pagination);

  return pagination ? mapPaginatedResult(reports, formatEventReport) : reports.map(formatEventReport);
}

async function getEventReportDetail(options) {
  const { actor, reportId, database = db } = options;
  requireActor(actor);

  const report = await database.getEventReportById(reportId);

  if (!report) {
    throw new ApiError(404, "Event report not found", "EVENT_REPORT_NOT_FOUND");
  }

  if (actor.role === "admin") {
    return formatEventReport(report);
  }

  if (actor.role === "advisor") {
    const clubIds = await database.getAdvisorClubIds(actor.id);

    if (!clubIds.includes(report.club_id)) {
      throw new ApiError(404, "Event report not found", "EVENT_REPORT_NOT_FOUND");
    }

    return formatEventReport(report);
  }

  if (actor.role === "president" && actor.clubId === report.club_id) {
    return formatEventReport(report);
  }

  throw new ApiError(404, "Event report not found", "EVENT_REPORT_NOT_FOUND");
}

module.exports = {
  createEventReport,
  getEventReportDetail,
  listEventReports
};
