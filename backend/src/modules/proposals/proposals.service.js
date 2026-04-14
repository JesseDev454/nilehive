const { db } = require("../../config/db");
const ApiError = require("../../shared/ApiError");
const {
  validateAdvisorDecisionPayload,
  validateCreateProposalPayload,
  validateDraftProposalPayload,
  readSaveAsDraft
} = require("./proposals.validation");

const ADVISOR_DECISION_TRANSITIONS = Object.freeze({
  pending_advisor_review: Object.freeze({
    approve: "pending_admin_review",
    reject: "advisor_rejected"
  })
});

const ADMIN_DECISION_TRANSITIONS = Object.freeze({
  pending_admin_review: Object.freeze({
    approve: "approved",
    reject: "admin_rejected"
  })
});

const NOTIFICATION_TYPES = Object.freeze({
  proposalSubmitted: "proposal_submitted",
  advisorApproved: "advisor_approved",
  advisorRejected: "advisor_rejected",
  pendingAdminReview: "pending_admin_review",
  adminApproved: "admin_approved",
  adminRejected: "admin_rejected",
  proposalResubmitted: "proposal_resubmitted"
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

function getNextAdminProposalStatus(currentStatus, decision) {
  const allowedTransitions = ADMIN_DECISION_TRANSITIONS[currentStatus];

  if (!allowedTransitions || !allowedTransitions[decision]) {
    throw new ApiError(
      409,
      "Proposal is not awaiting admin review",
      "INVALID_PROPOSAL_STATE"
    );
  }

  return allowedTransitions[decision];
}

function getCurrentStage(status) {
  const stages = {
    draft: "draft",
    pending_advisor_review: "advisor_review",
    pending_admin_review: "admin_review",
    advisor_rejected: "rejected",
    admin_rejected: "rejected",
    approved: "approved"
  };

  return stages[status] ?? status;
}

function getCurrentOwnerRole(status) {
  const owners = {
    draft: "executive",
    pending_advisor_review: "advisor",
    pending_admin_review: "admin",
    advisor_rejected: "executive",
    admin_rejected: "executive",
    approved: "completed"
  };

  return owners[status] ?? "unknown";
}

function getStatusesForStage(stage) {
  const stageStatuses = {
    draft: ["draft"],
    advisor_review: ["pending_advisor_review"],
    admin_review: ["pending_admin_review"],
    rejected: ["advisor_rejected", "admin_rejected"],
    approved: ["approved"]
  };

  return stageStatuses[stage] ?? null;
}

function buildNotificationMessage(type, proposal, remarks = null) {
  const remarksSuffix = remarks ? ` Remarks: ${remarks}` : "";

  const messages = {
    [NOTIFICATION_TYPES.proposalSubmitted]: `New proposal "${proposal.title}" was submitted and is awaiting your review.`,
    [NOTIFICATION_TYPES.advisorApproved]: `Your proposal "${proposal.title}" was approved by the advisor.${remarksSuffix}`,
    [NOTIFICATION_TYPES.advisorRejected]: `Your proposal "${proposal.title}" was rejected by the advisor.${remarksSuffix}`,
    [NOTIFICATION_TYPES.pendingAdminReview]: `Proposal "${proposal.title}" is now awaiting admin review.`,
    [NOTIFICATION_TYPES.adminApproved]: `Proposal "${proposal.title}" received final admin approval.${remarksSuffix}`,
    [NOTIFICATION_TYPES.adminRejected]: `Proposal "${proposal.title}" was rejected during admin verification.${remarksSuffix}`,
    [NOTIFICATION_TYPES.proposalResubmitted]: `Proposal "${proposal.title}" was updated and resubmitted for advisor review.`
  };

  return messages[type];
}

function buildApprovedEventReminderMessage(proposal) {
  return `Approved event "${proposal.proposed_activity || proposal.title}" is scheduled for ${proposal.event_date}.`;
}

function getApprovedEventReminderAt(proposal) {
  return `${proposal.event_date}T09:00:00.000Z`;
}

async function createNotificationBatch(database, notifications) {
  const uniqueNotifications = notifications.filter(
    (notification, index, allNotifications) =>
      notification.user_id &&
      allNotifications.findIndex(
        (candidate) =>
          candidate.user_id === notification.user_id &&
          candidate.proposal_id === notification.proposal_id &&
          candidate.type === notification.type
      ) === index
  );

  if (!uniqueNotifications.length) {
    return [];
  }

  return database.createNotifications(uniqueNotifications);
}

async function createApprovedEventReminders(database, proposal, recipientIds) {
  if (!database.createEventReminders || proposal.status !== "approved") {
    return [];
  }

  const uniqueRecipientIds = [...new Set(recipientIds.filter(Boolean))];

  if (!uniqueRecipientIds.length) {
    return [];
  }

  return database.createEventReminders(
    uniqueRecipientIds.map((recipientId) => ({
      user_id: recipientId,
      proposal_id: proposal.id,
      message: buildApprovedEventReminderMessage(proposal),
      remind_at: getApprovedEventReminderAt(proposal),
      delivery_status: "stored"
    }))
  );
}

function formatExecutiveProposal(proposal, latestApproval = null) {
  return {
    id: proposal.id,
    club_id: proposal.club_id,
    title: proposal.title,
    description: proposal.description,
    event_date: proposal.event_date,
    location: proposal.location,
    aim_objectives: proposal.aim_objectives,
    proposed_activity: proposal.proposed_activity,
    event_time: proposal.event_time,
    number_of_participants: proposal.number_of_participants,
    budget_estimate: proposal.budget_estimate,
    budget_line_items: proposal.budget_line_items ?? [],
    responsible_members: proposal.responsible_members ?? [],
    status: proposal.status,
    current_stage: getCurrentStage(proposal.status),
    current_owner_role: getCurrentOwnerRole(proposal.status),
    submitted_at: proposal.submitted_at ?? proposal.created_at,
    resubmitted_at: proposal.resubmitted_at,
    revision_count: proposal.revision_count ?? 0,
    last_edited_at: proposal.last_edited_at,
    last_edited_by: proposal.last_edited_by,
    created_at: proposal.created_at,
    updated_at: proposal.updated_at,
    advisor_remarks: proposal.advisor_remarks,
    advisor_decided_at: proposal.advisor_decided_at,
    admin_remarks: proposal.admin_remarks,
    admin_decided_at: proposal.admin_decided_at,
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

function formatAdminProposal(proposal, latestApproval = null) {
  return {
    id: proposal.id,
    title: proposal.title,
    description: proposal.description,
    club_id: proposal.club_id,
    submitted_by: proposal.submitted_by,
    event_date: proposal.event_date,
    location: proposal.location,
    aim_objectives: proposal.aim_objectives,
    proposed_activity: proposal.proposed_activity,
    event_time: proposal.event_time,
    number_of_participants: proposal.number_of_participants,
    budget_estimate: proposal.budget_estimate,
    budget_line_items: proposal.budget_line_items ?? [],
    responsible_members: proposal.responsible_members ?? [],
    status: proposal.status,
    current_stage: getCurrentStage(proposal.status),
    current_owner_role: getCurrentOwnerRole(proposal.status),
    submitted_at: proposal.submitted_at ?? proposal.created_at,
    resubmitted_at: proposal.resubmitted_at,
    revision_count: proposal.revision_count ?? 0,
    last_edited_at: proposal.last_edited_at,
    last_edited_by: proposal.last_edited_by,
    created_at: proposal.created_at,
    updated_at: proposal.updated_at,
    advisor_remarks: proposal.advisor_remarks,
    advisor_decided_at: proposal.advisor_decided_at,
    admin_remarks: proposal.admin_remarks,
    admin_decided_at: proposal.admin_decided_at,
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

function formatAdvisorProposal(proposal, latestApproval = null) {
  return formatAdminProposal(proposal, latestApproval);
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

  const saveAsDraft = readSaveAsDraft(payload);
  const validatedPayload = saveAsDraft
    ? validateDraftProposalPayload(payload)
    : validateCreateProposalPayload(payload);
  const clubId = validatedPayload.club_id || actor.clubId;
  const submittedAt = saveAsDraft ? null : new Date().toISOString();

  if (clubId !== actor.clubId) {
    throw new ApiError(403, "Executives can only submit proposals for their assigned club", "FORBIDDEN");
  }

  const proposal = await database.createProposal({
    club_id: clubId,
    submitted_by: actor.id,
    title: validatedPayload.title,
    description: validatedPayload.description,
    event_date: validatedPayload.event_date,
    location: validatedPayload.location,
    aim_objectives: validatedPayload.aim_objectives,
    proposed_activity: validatedPayload.proposed_activity,
    event_time: validatedPayload.event_time,
    number_of_participants: validatedPayload.number_of_participants,
    budget_estimate: validatedPayload.budget_estimate,
    budget_line_items: validatedPayload.budget_line_items,
    responsible_members: validatedPayload.responsible_members,
    status: saveAsDraft ? "draft" : "pending_advisor_review",
    submitted_at: submittedAt,
    last_edited_at: new Date().toISOString(),
    last_edited_by: actor.id
  });

  if (saveAsDraft) {
    return proposal;
  }

  const advisorIds = await database.getAdvisorProfileIdsByClubId(clubId);

  await createNotificationBatch(
    database,
    advisorIds.map((advisorId) => ({
      user_id: advisorId,
      proposal_id: proposal.id,
      type: NOTIFICATION_TYPES.proposalSubmitted,
      message: buildNotificationMessage(NOTIFICATION_TYPES.proposalSubmitted, proposal),
      delivery_status: "stored"
    }))
  );

  return proposal;
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

function ensureExecutiveEditableProposal(actor, proposal) {
  if (!proposal || proposal.submitted_by !== actor.id) {
    throw new ApiError(404, "Proposal not found", "PROPOSAL_NOT_FOUND");
  }

  const editableStatuses = ["draft", "advisor_rejected", "admin_rejected"];

  if (!editableStatuses.includes(proposal.status)) {
    throw new ApiError(
      409,
      "Only draft or rejected proposals can be edited by executives",
      "INVALID_PROPOSAL_STATE"
    );
  }
}

async function updateExecutiveProposal(options) {
  const { actor, proposalId, payload, database = db } = options;

  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  if (actor.role !== "executive") {
    throw new ApiError(403, "Only executives can edit proposals", "FORBIDDEN");
  }

  const proposal = await database.getProposalById(proposalId);
  ensureExecutiveEditableProposal(actor, proposal);

  const saveAsDraft = proposal.status === "draft" || readSaveAsDraft(payload);
  const validatedPayload = saveAsDraft
    ? validateDraftProposalPayload(payload)
    : validateCreateProposalPayload(payload);
  const clubId = validatedPayload.club_id || actor.clubId;

  if (clubId !== proposal.club_id || clubId !== actor.clubId) {
    throw new ApiError(403, "Executives can only edit proposals for their assigned club", "FORBIDDEN");
  }

  const updatedProposal = await database.updateProposal(proposalId, {
    club_id: clubId,
    title: validatedPayload.title,
    description: validatedPayload.description,
    event_date: validatedPayload.event_date,
    location: validatedPayload.location,
    aim_objectives: validatedPayload.aim_objectives,
    proposed_activity: validatedPayload.proposed_activity,
    event_time: validatedPayload.event_time,
    number_of_participants: validatedPayload.number_of_participants,
    budget_estimate: validatedPayload.budget_estimate,
    budget_line_items: validatedPayload.budget_line_items,
    responsible_members: validatedPayload.responsible_members,
    last_edited_at: new Date().toISOString(),
    last_edited_by: actor.id
  });

  return formatExecutiveProposal(updatedProposal);
}

async function submitExecutiveProposalRevision(options) {
  const { actor, proposalId, database = db } = options;

  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  if (actor.role !== "executive") {
    throw new ApiError(403, "Only executives can submit proposal revisions", "FORBIDDEN");
  }

  const proposal = await database.getProposalById(proposalId);
  ensureExecutiveEditableProposal(actor, proposal);
  validateCreateProposalPayload(proposal);

  const now = new Date().toISOString();
  const isDraft = proposal.status === "draft";
  const updatedProposal = await database.updateProposal(proposalId, {
    status: "pending_advisor_review",
    submitted_at: proposal.submitted_at ?? now,
    resubmitted_at: isDraft ? proposal.resubmitted_at : now,
    revision_count: isDraft ? proposal.revision_count ?? 0 : (proposal.revision_count ?? 0) + 1,
    last_edited_at: now,
    last_edited_by: actor.id
  });

  const advisorIds = await database.getAdvisorProfileIdsByClubId(updatedProposal.club_id);

  await createNotificationBatch(
    database,
    advisorIds.map((advisorId) => ({
      user_id: advisorId,
      proposal_id: updatedProposal.id,
      type: isDraft ? NOTIFICATION_TYPES.proposalSubmitted : NOTIFICATION_TYPES.proposalResubmitted,
      message: buildNotificationMessage(
        isDraft ? NOTIFICATION_TYPES.proposalSubmitted : NOTIFICATION_TYPES.proposalResubmitted,
        updatedProposal
      ),
      delivery_status: "stored"
    }))
  );

  return formatExecutiveProposal(updatedProposal);
}

async function getAdvisorProposalDetail(options) {
  const { actor, proposalId, database = db } = options;

  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  if (actor.role !== "advisor") {
    throw new ApiError(403, "Only advisors can view advisor proposal details", "FORBIDDEN");
  }

  const proposal = await database.getProposalById(proposalId);

  if (!proposal) {
    throw new ApiError(404, "Proposal not found", "PROPOSAL_NOT_FOUND");
  }

  const clubIds = await database.getAdvisorClubIds(actor.id);

  if (!clubIds.includes(proposal.club_id)) {
    throw new ApiError(404, "Proposal not found", "PROPOSAL_NOT_FOUND");
  }

  const latestApproval = await database.getLatestApprovalByProposalId(proposalId);

  return formatAdvisorProposal(proposal, latestApproval);
}

async function listAdminProposals(options) {
  const { actor, filters = {}, database = db } = options;

  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  if (actor.role !== "admin") {
    throw new ApiError(403, "Only admins can view dashboard proposals", "FORBIDDEN");
  }

  const proposals = await database.listAdminProposals({
    status: filters.status
  });

  const stageStatuses = filters.current_stage ? getStatusesForStage(filters.current_stage) : null;
  const filteredProposals = stageStatuses
    ? proposals.filter((proposal) => stageStatuses.includes(proposal.status))
    : proposals;

  const latestApprovalsByProposalId = await database.getLatestApprovalsByProposalIds(
    filteredProposals.map((proposal) => proposal.id)
  );

  return filteredProposals.map((proposal) =>
    formatAdminProposal(proposal, latestApprovalsByProposalId[proposal.id] ?? null)
  );
}

async function getAdminProposalDetail(options) {
  const { actor, proposalId, database = db } = options;

  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  if (actor.role !== "admin") {
    throw new ApiError(403, "Only admins can view dashboard proposals", "FORBIDDEN");
  }

  const proposal = await database.getProposalById(proposalId);

  if (!proposal) {
    throw new ApiError(404, "Proposal not found", "PROPOSAL_NOT_FOUND");
  }

  const latestApproval = await database.getLatestApprovalByProposalId(proposalId);

  return formatAdminProposal(proposal, latestApproval);
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

  const notifications = [
    {
      user_id: updatedProposal.submitted_by,
      proposal_id: updatedProposal.id,
      type:
        validatedPayload.decision === "approve"
          ? NOTIFICATION_TYPES.advisorApproved
          : NOTIFICATION_TYPES.advisorRejected,
      message: buildNotificationMessage(
        validatedPayload.decision === "approve"
          ? NOTIFICATION_TYPES.advisorApproved
          : NOTIFICATION_TYPES.advisorRejected,
        updatedProposal,
        validatedPayload.remarks
      ),
      delivery_status: "stored"
    }
  ];

  if (nextStatus === "pending_admin_review") {
    const adminIds = await database.getAdminProfileIds();

    notifications.push(
      ...adminIds.map((adminId) => ({
        user_id: adminId,
        proposal_id: updatedProposal.id,
        type: NOTIFICATION_TYPES.pendingAdminReview,
        message: buildNotificationMessage(
          NOTIFICATION_TYPES.pendingAdminReview,
          updatedProposal
        ),
        delivery_status: "stored"
      }))
    );
  }

  await createNotificationBatch(database, notifications);

  return updatedProposal;
}

async function submitAdminDecision(options) {
  const { actor, proposalId, payload, database = db } = options;

  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }

  if (actor.role !== "admin") {
    throw new ApiError(403, "Only admins can verify proposals", "FORBIDDEN");
  }

  const validatedPayload = validateAdvisorDecisionPayload(payload);
  const proposal = await database.getProposalById(proposalId);

  if (!proposal) {
    throw new ApiError(404, "Proposal not found", "PROPOSAL_NOT_FOUND");
  }

  const decidedAt = new Date().toISOString();
  const nextStatus = getNextAdminProposalStatus(proposal.status, validatedPayload.decision);

  const updatedProposal = await database.applyAdminDecision({
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
      "Proposal is not awaiting admin review",
      "INVALID_PROPOSAL_STATE"
    );
  }

  const notificationType =
    validatedPayload.decision === "approve"
      ? NOTIFICATION_TYPES.adminApproved
      : NOTIFICATION_TYPES.adminRejected;

  const advisorIds = await database.getAdvisorProfileIdsByClubId(updatedProposal.club_id);
  const presidentIds = database.getPresidentProfileIdsByClubId
    ? await database.getPresidentProfileIdsByClubId(updatedProposal.club_id)
    : [];
  const recipientIds = [updatedProposal.submitted_by, ...advisorIds, ...presidentIds];

  await createNotificationBatch(
    database,
    recipientIds.map((recipientId) => ({
      user_id: recipientId,
      proposal_id: updatedProposal.id,
      type: notificationType,
      message: buildNotificationMessage(notificationType, updatedProposal, validatedPayload.remarks),
      delivery_status: "stored"
    }))
  );

  if (validatedPayload.decision === "approve") {
    await createApprovedEventReminders(database, updatedProposal, recipientIds);
  }

  return updatedProposal;
}

module.exports = {
  createProposal,
  listAdminProposals,
  getAdminProposalDetail,
  getAdvisorProposalDetail,
  getPendingAdvisorProposals,
  listExecutiveProposals,
  getExecutiveProposalDetail,
  updateExecutiveProposal,
  submitExecutiveProposalRevision,
  submitAdvisorDecision,
  submitAdminDecision
};
