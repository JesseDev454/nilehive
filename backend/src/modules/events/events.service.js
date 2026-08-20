const { db } = require("../../config/db");
const ApiError = require("../../shared/ApiError");
const { paginateArray } = require("../../shared/pagination");
const {
  validateAttendancePayload,
  validateRsvpPayload
} = require("./events.validation");
const {
  canCheckInToEvent,
  canRsvpToEvent,
  getEventLifecycle
} = require("./event-lifecycle");

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
    return database.getActiveClubIdsByProfileId
      ? await database.getActiveClubIdsByProfileId(actor.id)
      : [];
  }

  return [];
}

function formatApprovedEvent(proposal) {
  const lifecycle = getEventLifecycle(proposal.event_date);
  const canRsvp = canRsvpToEvent(proposal.event_date);

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
    event_lifecycle: lifecycle,
    can_rsvp: canRsvp,
    approved_at: proposal.admin_decided_at,
    created_at: proposal.created_at,
    updated_at: proposal.updated_at
  };
}

function formatProfile(profile) {
  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    full_name: profile.full_name,
    student_id: profile.student_id,
    role: profile.role
  };
}

function formatRsvp(rsvp) {
  return {
    id: rsvp.id,
    proposal_id: rsvp.proposal_id,
    club_id: rsvp.club_id,
    user_id: rsvp.user_id,
    status: rsvp.status,
    profile: formatProfile(rsvp.profile),
    created_at: rsvp.created_at,
    updated_at: rsvp.updated_at
  };
}

function formatAttendance(attendance) {
  return {
    id: attendance.id,
    proposal_id: attendance.proposal_id,
    club_id: attendance.club_id,
    user_id: attendance.user_id,
    attended: attendance.attended,
    checked_in_by: attendance.checked_in_by,
    checked_in_at: attendance.checked_in_at,
    profile: formatProfile(attendance.profile),
    created_at: attendance.created_at,
    updated_at: attendance.updated_at
  };
}

function summarizeEngagement(rsvps, attendance) {
  const going = rsvps.filter((rsvp) => rsvp.status === "going").length;
  const interested = rsvps.filter((rsvp) => rsvp.status === "interested").length;
  const notGoing = rsvps.filter((rsvp) => rsvp.status === "not_going").length;
  const cancelled = rsvps.filter((rsvp) => rsvp.status === "cancelled").length;
  const attended = attendance.filter((record) => record.attended).length;

  return {
    total_rsvps: rsvps.length,
    going,
    interested,
    not_going: notGoing,
    cancelled,
    attended
  };
}

async function getApprovedEventOrThrow(proposalId, database) {
  const proposal = await database.getApprovedProposalById(proposalId);

  if (!proposal) {
    throw new ApiError(404, "Approved event not found", "APPROVED_EVENT_NOT_FOUND");
  }

  return proposal;
}

async function assertCanManageEvent(actor, proposal, database) {
  if (actor.role === "admin") {
    return;
  }

  if (actor.role === "president") {
    if (actor.clubId === proposal.club_id) {
      return;
    }

    throw new ApiError(403, "You can only manage events for your own club", "FORBIDDEN");
  }

  throw new ApiError(403, "You cannot manage this event", "FORBIDDEN");
}

async function assertCanAccessEvent(actor, proposal, database) {
  const visibleClubIds = await getVisibleClubIds(actor, database);

  if (visibleClubIds === null || visibleClubIds.includes(proposal.club_id)) {
    return;
  }

  throw new ApiError(403, "You do not have access to this event", "FORBIDDEN");
}

async function listApprovedEvents(options) {
  const { actor, filters = {}, pagination, database = db } = options;

  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  const lifecycleFilter = filters.lifecycle ? String(filters.lifecycle).toLowerCase() : null;

  if (lifecycleFilter && !["upcoming", "past"].includes(lifecycleFilter)) {
    throw new ApiError(400, "lifecycle must be either upcoming or past", "VALIDATION_ERROR", {
      field: "lifecycle"
    });
  }

  const clubIds = await getVisibleClubIds(actor, database);
  const proposals = await database.listApprovedProposals({ clubIds });

  let events = proposals.map(formatApprovedEvent);

  if (lifecycleFilter === "upcoming") {
    events = events.filter((event) => event.event_lifecycle !== "past");
  } else if (lifecycleFilter === "past") {
    events = events
      .filter((event) => event.event_lifecycle === "past")
      .sort((first, second) => new Date(second.event_date).getTime() - new Date(first.event_date).getTime());
  }

  if (pagination) {
    return paginateArray(events, pagination);
  }

  return events;
}

async function submitEventRsvp(options) {
  const { actor, proposalId, payload, database = db } = options;

  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  if (actor.role !== "student") {
    throw new ApiError(403, "Only students can RSVP to events", "FORBIDDEN");
  }

  const proposal = await getApprovedEventOrThrow(proposalId, database);
  await assertCanAccessEvent(actor, proposal, database);

  if (!canRsvpToEvent(proposal.event_date)) {
    throw new ApiError(409, "RSVPs are closed for this event.", "EVENT_RSVP_CLOSED");
  }

  const validatedPayload = validateRsvpPayload(payload);
  const rsvp = await database.upsertEventRsvp({
    proposal_id: proposal.id,
    club_id: proposal.club_id,
    user_id: actor.id,
    status: validatedPayload.status
  });

  return formatRsvp(rsvp);
}

async function getEventEngagement(options) {
  const { actor, proposalId, database = db } = options;

  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  const proposal = await getApprovedEventOrThrow(proposalId, database);
  await assertCanAccessEvent(actor, proposal, database);
  const [rsvps, attendance] = await Promise.all([
    database.listEventRsvps({ proposalId: proposal.id }),
    database.listEventAttendance({ proposalId: proposal.id })
  ]);
  const formattedRsvps = rsvps.map(formatRsvp);
  const formattedAttendance = attendance.map(formatAttendance);
  const canManage = ["admin", "president"].includes(actor.role);

  if (canManage) {
    await assertCanManageEvent(actor, proposal, database);
  }

  return {
    event: formatApprovedEvent(proposal),
    summary: summarizeEngagement(formattedRsvps, formattedAttendance),
    current_user_rsvp: formattedRsvps.find((rsvp) => rsvp.user_id === actor.id) || null,
    current_user_attendance: formattedAttendance.find((record) => record.user_id === actor.id) || null,
    rsvps: canManage ? formattedRsvps : [],
    attendance: canManage ? formattedAttendance : []
  };
}

async function submitEventAttendance(options) {
  const { actor, proposalId, payload, database = db } = options;

  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  const proposal = await getApprovedEventOrThrow(proposalId, database);
  await assertCanManageEvent(actor, proposal, database);
  const validatedPayload = validateAttendancePayload(payload);

  if (validatedPayload.attended) {
    const existingAttendance = await database.listEventAttendance({
      proposalId: proposal.id,
      userId: validatedPayload.user_id
    });
    const currentAttendance = existingAttendance.find((record) => record.attended);

    if (currentAttendance) {
      return formatAttendance(currentAttendance);
    }
  }

  const attendance = await database.upsertEventAttendance({
    proposal_id: proposal.id,
    club_id: proposal.club_id,
    user_id: validatedPayload.user_id,
    attended: validatedPayload.attended,
    checked_in_by: actor.id,
    checked_in_at: new Date().toISOString()
  });

  return formatAttendance(attendance);
}

async function submitEventSelfCheckIn(options) {
  const { actor, proposalId, database = db } = options;

  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  if (actor.role !== "student") {
    throw new ApiError(403, "This QR code is for students only", "FORBIDDEN");
  }

  const proposal = await getApprovedEventOrThrow(proposalId, database);
  await assertCanAccessEvent(actor, proposal, database);

  if (!canCheckInToEvent(proposal.event_date)) {
    throw new ApiError(409, "Event check-in is only available on the event date.", "EVENT_CHECK_IN_CLOSED");
  }

  const existingAttendance = await database.listEventAttendance({
    proposalId: proposal.id,
    userId: actor.id
  });
  const currentAttendance = existingAttendance.find((record) => record.attended);

  if (currentAttendance) {
    return formatAttendance(currentAttendance);
  }

  const attendance = await database.upsertEventAttendance({
    proposal_id: proposal.id,
    club_id: proposal.club_id,
    user_id: actor.id,
    attended: true,
    checked_in_by: actor.id,
    checked_in_at: new Date().toISOString()
  });

  return formatAttendance(attendance);
}

module.exports = {
  formatApprovedEvent,
  getEventEngagement,
  listApprovedEvents,
  submitEventAttendance,
  submitEventSelfCheckIn,
  submitEventRsvp
};
