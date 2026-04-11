const { db } = require("../../config/db");
const ApiError = require("../../shared/ApiError");

function isPendingStatus(status) {
  return status === "pending_advisor_review" || status === "pending_admin_review";
}

function isRejectedStatus(status) {
  return status === "advisor_rejected" || status === "admin_rejected";
}

function summarizeProposals(proposals) {
  const total = proposals.length;
  const approved = proposals.filter((proposal) => proposal.status === "approved").length;
  const pending = proposals.filter((proposal) => isPendingStatus(proposal.status)).length;
  const rejected = proposals.filter((proposal) => isRejectedStatus(proposal.status)).length;

  return {
    total_proposals: total,
    pending_proposals: pending,
    approved_proposals: approved,
    rejected_proposals: rejected,
    approval_rate: total > 0 ? Math.round((approved / total) * 100) : 0
  };
}

function formatProposalSummary(proposal) {
  return {
    id: proposal.id,
    title: proposal.title,
    club_id: proposal.club_id,
    event_date: proposal.event_date,
    event_time: proposal.event_time,
    location: proposal.location,
    status: proposal.status,
    created_at: proposal.created_at,
    updated_at: proposal.updated_at
  };
}

function formatEventSummary(proposal) {
  return {
    id: proposal.id,
    proposal_id: proposal.id,
    title: proposal.proposed_activity || proposal.title,
    proposal_title: proposal.title,
    club_id: proposal.club_id,
    event_date: proposal.event_date,
    event_time: proposal.event_time,
    location: proposal.location,
    status: proposal.status,
    approved_at: proposal.admin_decided_at
  };
}

function formatActivity(proposal) {
  return {
    id: proposal.id,
    proposal_id: proposal.id,
    title: proposal.title,
    status: proposal.status,
    message: `Proposal "${proposal.title}" is ${proposal.status.replace(/_/g, " ")}.`,
    created_at: proposal.updated_at || proposal.created_at
  };
}

function buildExecutiveActionItems(proposals, reminders) {
  const actionItems = [];
  const pendingCount = proposals.filter((proposal) => isPendingStatus(proposal.status)).length;
  const rejectedCount = proposals.filter((proposal) => isRejectedStatus(proposal.status)).length;

  if (pendingCount > 0) {
    actionItems.push({
      type: "proposal_follow_up",
      label: `${pendingCount} proposal(s) are still moving through approval.`
    });
  }

  if (rejectedCount > 0) {
    actionItems.push({
      type: "proposal_revision",
      label: `${rejectedCount} proposal(s) need review after rejection.`
    });
  }

  if (reminders.length > 0) {
    actionItems.push({
      type: "approved_event_reminder",
      label: `${reminders.length} approved event reminder(s) are available.`
    });
  }

  return actionItems;
}

async function getDashboardClub(actor, database) {
  if (!actor.clubId) {
    throw new ApiError(409, "This profile is not linked to a club", "PROFILE_NOT_LINKED_TO_CLUB");
  }

  return database.getClubById ? database.getClubById(actor.clubId) : null;
}

async function getExecutiveDashboard(options) {
  const { actor, database = db } = options;

  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  if (actor.role !== "executive") {
    throw new ApiError(403, "Only executives can view this dashboard", "FORBIDDEN");
  }

  await getDashboardClub(actor, database);

  const proposals = await database.listExecutiveProposals(actor.id);
  const approvedEvents = await database.listApprovedProposals({ clubIds: [actor.clubId] });
  const reminders = database.listEventRemindersByUserId
    ? await database.listEventRemindersByUserId(actor.id)
    : [];
  const notifications = database.listNotificationsByUserId
    ? await database.listNotificationsByUserId(actor.id)
    : [];

  return {
    role: "executive",
    club_id: actor.clubId,
    summary: {
      ...summarizeProposals(proposals),
      upcoming_events: approvedEvents.length,
      reminders: reminders.length
    },
    action_items: buildExecutiveActionItems(proposals, reminders),
    recent_proposals: proposals.slice(0, 5).map(formatProposalSummary),
    upcoming_events: approvedEvents.slice(0, 5).map(formatEventSummary),
    reminders: reminders.slice(0, 5),
    notifications: notifications.slice(0, 5)
  };
}

async function getPresidentDashboard(options) {
  const { actor, database = db } = options;

  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  if (actor.role !== "president") {
    throw new ApiError(403, "Only presidents can view this dashboard", "FORBIDDEN");
  }

  const club = await getDashboardClub(actor, database);
  const proposals = await database.listProposalsByClubId(actor.clubId);
  const approvedEvents = await database.listApprovedProposals({ clubIds: [actor.clubId] });
  const executiveTeam = database.listProfilesByClubId
    ? await database.listProfilesByClubId(actor.clubId, { role: "executive" })
    : [];
  const notifications = database.listNotificationsByUserId
    ? await database.listNotificationsByUserId(actor.id)
    : [];

  return {
    role: "president",
    club,
    club_id: actor.clubId,
    summary: {
      ...summarizeProposals(proposals),
      upcoming_events: approvedEvents.length,
      executive_count: executiveTeam.length
    },
    recent_activity: proposals.slice(0, 6).map(formatActivity),
    pending_proposals: proposals.filter((proposal) => isPendingStatus(proposal.status)).slice(0, 5).map(formatProposalSummary),
    upcoming_events: approvedEvents.slice(0, 5).map(formatEventSummary),
    executive_team: executiveTeam.map((profile) => ({
      id: profile.id,
      full_name: profile.full_name,
      role: profile.role,
      club_id: profile.club_id,
      created_at: profile.created_at
    })),
    notifications: notifications.slice(0, 5)
  };
}

module.exports = {
  getExecutiveDashboard,
  getPresidentDashboard,
  summarizeProposals
};
