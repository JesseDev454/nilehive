const { db } = require("../../config/db");
const ApiError = require("../../shared/ApiError");
const {
  validateCreateMembershipRequestPayload,
  validateMembershipRequestDecisionPayload
} = require("./membership-requests.validation");
const {
  updateMemberStatus
} = require("../members/member-status");

function requireActor(actor) {
  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }
}

function formatMembershipRequest(request) {
  return {
    id: request.id,
    profile_id: request.profile_id,
    club_id: request.club_id,
    requested_role: request.requested_role,
    status: request.status,
    remarks: request.remarks,
    decision_remarks: request.decision_remarks,
    reviewed_by: request.reviewed_by,
    reviewed_at: request.reviewed_at,
    member_id: request.member_id,
    due_payment_id: request.due_payment_id,
    dues_amount: request.dues_amount === null || request.dues_amount === undefined
      ? null
      : Number(request.dues_amount),
    academic_session: request.academic_session,
    profile: request.profile
      ? {
          id: request.profile.id,
          full_name: request.profile.full_name,
          student_id: request.profile.student_id,
          role: request.profile.role
        }
      : null,
    club: request.club
      ? {
          id: request.club.id,
          name: request.club.name,
          code: request.club.code
        }
      : null,
    created_at: request.created_at,
    updated_at: request.updated_at
  };
}

function assertCanReviewRequest(actor, request) {
  if (actor.role === "admin") {
    return;
  }

  if (actor.role !== "president") {
    throw new ApiError(403, "Only presidents or admins can review membership requests", "FORBIDDEN");
  }

  if (!actor.clubId || actor.clubId !== request.club_id) {
    throw new ApiError(403, "Presidents can only review requests for their own club", "FORBIDDEN");
  }

  if (["executive", "president"].includes(request.requested_role)) {
    throw new ApiError(403, "Only admins can approve executive or president requests", "FORBIDDEN");
  }
}

async function createMembershipRequest(options) {
  const { actor, payload, database = db } = options;
  requireActor(actor);

  if (actor.role !== "student") {
    throw new ApiError(403, "Only students can request club membership", "FORBIDDEN");
  }

  const validatedPayload = validateCreateMembershipRequestPayload(payload);
  const club = await database.getClubById(validatedPayload.club_id);

  if (!club) {
    throw new ApiError(400, "Selected club does not exist", "INVALID_CLUB", {
      field: "club_id"
    });
  }

  const existingMember = database.getClubMemberByProfileAndClub
    ? await database.getClubMemberByProfileAndClub(actor.id, validatedPayload.club_id)
    : null;

  if (existingMember?.membership_status === "active") {
    throw new ApiError(409, "You are already an active member of this club", "ALREADY_MEMBER");
  }

  const existingRequest = await database.getOpenMembershipRequest(actor.id, validatedPayload.club_id);

  if (existingRequest) {
    throw new ApiError(409, "You already have an open membership request for this club", "REQUEST_ALREADY_OPEN");
  }

  const request = await database.createMembershipRequest({
    profile_id: actor.id,
    club_id: validatedPayload.club_id,
    requested_role: validatedPayload.requested_role,
    status: "pending",
    remarks: validatedPayload.remarks
  });

  return formatMembershipRequest(request);
}

async function listMyMembershipRequests(options) {
  const { actor, database = db } = options;
  requireActor(actor);

  const requests = await database.listMembershipRequests({
    profileId: actor.id
  });

  return requests.map(formatMembershipRequest);
}

async function listMembershipRequests(options) {
  const { actor, filters = {}, database = db } = options;
  requireActor(actor);

  if (!["admin", "president"].includes(actor.role)) {
    throw new ApiError(403, "Only presidents or admins can view membership requests", "FORBIDDEN");
  }

  const clubId = actor.role === "admin" ? filters.club_id : actor.clubId;

  if (actor.role === "president" && !clubId) {
    throw new ApiError(409, "President profile is not linked to a club", "PROFILE_NOT_LINKED_TO_CLUB");
  }

  const requests = await database.listMembershipRequests({
    clubId,
    status: filters.status
  });

  return requests.map(formatMembershipRequest);
}

async function approveMembershipRequest({ actor, request, decisionPayload, database }) {
  const profile = await database.getProfileById(request.profile_id);

  if (!profile) {
    throw new ApiError(404, "Request profile not found", "PROFILE_NOT_FOUND");
  }

  const existingMember = database.getClubMemberByProfileAndClub
    ? await database.getClubMemberByProfileAndClub(request.profile_id, request.club_id)
    : null;

  if (existingMember?.membership_status === "active") {
    throw new ApiError(409, "This profile is already an active member", "ALREADY_MEMBER");
  }

  const now = new Date().toISOString();
  const member = existingMember
    ? await database.updateClubMember(existingMember.id, {
        full_name: profile.full_name,
        student_id: profile.student_id,
        club_role: request.requested_role,
        membership_status: "inactive"
      })
    : await database.createClubMember({
        club_id: request.club_id,
        profile_id: request.profile_id,
        full_name: profile.full_name,
        student_id: profile.student_id,
        email: null,
        phone_number: null,
        club_role: request.requested_role,
        membership_status: "inactive"
      });

  const payment = await database.createDuePayment({
    club_id: request.club_id,
    member_id: member.id,
    amount: decisionPayload.dues_amount,
    academic_session: decisionPayload.academic_session,
    payment_reference: null,
    proof_url: null,
    status: "unpaid",
    verified_by: null,
    verified_at: null
  });

  const updatedRequest = await database.updateMembershipRequest(request.id, {
    status: "approved_pending_dues",
    decision_remarks: decisionPayload.decision_remarks,
    reviewed_by: actor.id,
    reviewed_at: now,
    member_id: member.id,
    due_payment_id: payment.id,
    dues_amount: decisionPayload.dues_amount,
    academic_session: decisionPayload.academic_session
  });

  return {
    request: formatMembershipRequest(updatedRequest),
    member,
    due_payment: payment
  };
}

async function decideMembershipRequest(options) {
  const { actor, requestId, payload, database = db } = options;
  requireActor(actor);

  const request = await database.getMembershipRequestById(requestId);

  if (!request) {
    throw new ApiError(404, "Membership request not found", "MEMBERSHIP_REQUEST_NOT_FOUND");
  }

  assertCanReviewRequest(actor, request);

  if (request.status !== "pending") {
    throw new ApiError(409, "Only pending membership requests can be reviewed", "INVALID_REQUEST_STATE");
  }

  const decisionPayload = validateMembershipRequestDecisionPayload(payload);

  if (decisionPayload.decision === "reject") {
    const updatedRequest = await database.updateMembershipRequest(request.id, {
      status: "rejected",
      decision_remarks: decisionPayload.decision_remarks,
      reviewed_by: actor.id,
      reviewed_at: new Date().toISOString()
    });

    return {
      request: formatMembershipRequest(updatedRequest),
      member: null,
      due_payment: null
    };
  }

  return approveMembershipRequest({
    actor,
    request,
    decisionPayload,
    database
  });
}

async function activateMembershipAfterPaidDues(options) {
  const { payment, actor, database = db } = options;

  if (!payment || payment.status !== "paid" || !database.getMembershipRequestByMemberId) {
    return null;
  }

  const request = await database.getMembershipRequestByMemberId(payment.member_id);

  if (!request) {
    return null;
  }

  const existingMember = database.getClubMemberById
    ? await database.getClubMemberById(payment.member_id)
    : null;

  if (existingMember?.membership_status === "alumni") {
    return null;
  }

  const member = existingMember
    ? await updateMemberStatus({
        database,
        member: existingMember,
        actor,
        nextStatus: "active",
        reason: `Dues verified for ${payment.academic_session}`
      })
    : await database.updateClubMember(payment.member_id, {
        membership_status: "active"
      });

  if (["executive", "president"].includes(request.requested_role)) {
    await database.updateProfile(request.profile_id, {
      role: request.requested_role,
      club_id: request.club_id
    });
  }

  const updatedRequest = await database.updateMembershipRequest(request.id, {
    status: "active"
  });

  return {
    request: formatMembershipRequest(updatedRequest),
    member
  };
}

module.exports = {
  activateMembershipAfterPaidDues,
  createMembershipRequest,
  decideMembershipRequest,
  formatMembershipRequest,
  listMembershipRequests,
  listMyMembershipRequests
};
