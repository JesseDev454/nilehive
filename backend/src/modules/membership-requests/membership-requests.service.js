const { db } = require("../../config/db");
const ApiError = require("../../shared/ApiError");
const { writeAuditLog } = require("../../shared/auditLog");
const { ensurePaginatedResult, mapPaginatedResult } = require("../../shared/pagination");
const {
  validateCreateMembershipRequestPayload,
  validateMembershipRequestDecisionPayload
} = require("./membership-requests.validation");
const {
  getCurrentAcademicSession,
  updateMemberStatus
} = require("../members/member-status");

function requireActor(actor) {
  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }
}

function normalizeStudentType(value) {
  return value === "fresher" ? "fresher" : "returning";
}

function resolveJoinDuesAmount(studentType, paymentSettings) {
  return 10000;
}

function formatStudentDuePayment(payment) {
  return {
    id: payment.id,
    club_id: payment.club_id,
    member_id: payment.member_id,
    amount: payment.amount === null || payment.amount === undefined ? null : Number(payment.amount),
    academic_session: payment.academic_session,
    status: payment.status,
    has_proof: Boolean(payment.proof_url),
    submitted_at: payment.submitted_at,
    verified_at: payment.verified_at,
    created_at: payment.created_at,
    updated_at: payment.updated_at
  };
}

function normalizeWhatsAppPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");

  if (!digits) {
    return null;
  }

  if (digits.startsWith("234")) {
    return digits;
  }

  if (digits.startsWith("0")) {
    return `234${digits.slice(1)}`;
  }

  return digits;
}

function formatMembershipRequest(request, { includeFinancialDetails = false, includeWhatsAppAdminDetails = false } = {}) {
  const phoneNumber = request.profile?.phone_number ?? null;
  const whatsappPhone = normalizeWhatsAppPhone(phoneNumber);
  const message = `Hello ${request.profile?.full_name || "student"}, your payment for ${request.club?.name || "your club"} has been verified. Club Services is ready to add you to the official WhatsApp group.`;

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
          ...(includeWhatsAppAdminDetails ? { phone_number: phoneNumber } : {}),
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
    due_payment: request.due_payment
      ? includeFinancialDetails
        ? {
          id: request.due_payment.id,
          club_id: request.due_payment.club_id,
          member_id: request.due_payment.member_id,
          amount: request.due_payment.amount === null || request.due_payment.amount === undefined
            ? null
            : Number(request.due_payment.amount),
          academic_session: request.due_payment.academic_session,
          payment_reference: request.due_payment.payment_reference,
          payment_account_name: request.due_payment.payment_account_name,
          payment_paid_at: request.due_payment.payment_paid_at,
          payer_note: request.due_payment.payer_note,
          proof_url: request.due_payment.proof_url,
          submitted_at: request.due_payment.submitted_at,
          status: request.due_payment.status,
          verified_by: request.due_payment.verified_by,
          verified_at: request.due_payment.verified_at,
          created_at: request.due_payment.created_at,
          updated_at: request.due_payment.updated_at
        }
        : formatStudentDuePayment(request.due_payment)
      : null,
    whatsapp_onboarding_status: request.whatsapp_onboarding_status ?? "not_ready",
    whatsapp_added_by: request.whatsapp_added_by ?? null,
    whatsapp_added_at: request.whatsapp_added_at ?? null,
    ...(includeWhatsAppAdminDetails
      ? {
          whatsapp_onboarding_notes: request.whatsapp_onboarding_notes ?? null,
          whatsapp_phone_number: whatsappPhone,
          whatsapp_chat_url: whatsappPhone
            ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`
            : null
        }
      : {}),
    student_type: request.student_type ?? null,
    join_reason: request.join_reason ?? null,
    created_at: request.created_at,
    updated_at: request.updated_at
  };
}

function assertCanReviewRequest(actor, request) {
  if (actor.role !== "admin") {
    throw new ApiError(403, "Only Club Services admins can review membership requests", "FORBIDDEN");
  }
}

async function createMembershipRequest(options) {
  const { actor, payload, database = db } = options;
  requireActor(actor);

  if (!["student", "executive", "president"].includes(actor.role)) {
    throw new ApiError(403, "Only students and club leaders can request ordinary club membership", "FORBIDDEN");
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

  const profile = await database.getProfileById(actor.id);

  if (!profile) {
    throw new ApiError(404, "Profile not found", "PROFILE_NOT_FOUND");
  }

  const studentType = normalizeStudentType(validatedPayload.student_type || profile.student_type);
  const paymentSettings = database.getClubPaymentSettings
    ? await database.getClubPaymentSettings(validatedPayload.club_id)
    : null;
  const duesAmount = resolveJoinDuesAmount(studentType, paymentSettings);
  const academicSession = validatedPayload.academic_session || getCurrentAcademicSession();

  // Upsert reusable profile fields provided through the join form so they
  // are pre-filled on the next club join instead of being retyped each time.
  if (database.updateProfile) {
    const profileUpdates = {};

    if (validatedPayload.student_id) {
      profileUpdates.student_id = validatedPayload.student_id;
    }

    if (validatedPayload.phone_number) {
      profileUpdates.phone_number = validatedPayload.phone_number;
    }

    if (validatedPayload.department) {
      profileUpdates.department = validatedPayload.department;
    }

    if (validatedPayload.student_type) {
      profileUpdates.student_type = studentType;
    }

    if (Object.keys(profileUpdates).length > 0) {
      await database.updateProfile(actor.id, profileUpdates);
    }
  }

  const member = existingMember
    ? await database.updateClubMember(existingMember.id, {
        full_name: profile.full_name,
        student_id: validatedPayload.student_id,
        email: existingMember.email,
        phone_number: validatedPayload.phone_number || profile.phone_number || existingMember.phone_number,
        club_role: validatedPayload.requested_role,
        membership_status: "inactive"
      })
    : await database.createClubMember({
      club_id: validatedPayload.club_id,
      profile_id: actor.id,
      full_name: profile.full_name,
      student_id: validatedPayload.student_id,
      email: null,
      phone_number: validatedPayload.phone_number || profile.phone_number || null,
      club_role: validatedPayload.requested_role,
        membership_status: "inactive"
      });

  const payment = await database.createDuePayment({
    club_id: validatedPayload.club_id,
    member_id: member.id,
    amount: duesAmount,
    academic_session: academicSession,
    payment_reference: validatedPayload.payment_reference,
    payment_account_name: validatedPayload.payment_account_name,
    payment_paid_at: validatedPayload.payment_paid_at,
    payer_note: validatedPayload.payer_note,
    proof_url: validatedPayload.proof_url,
    submitted_at: new Date().toISOString(),
    status: "submitted",
    verified_by: null,
    verified_at: null
  });

  const request = await database.createMembershipRequest({
    profile_id: actor.id,
    club_id: validatedPayload.club_id,
    requested_role: validatedPayload.requested_role,
    status: "pending",
    remarks: validatedPayload.remarks,
    member_id: member.id,
    due_payment_id: payment.id,
    dues_amount: duesAmount,
    academic_session: academicSession,
    student_type: studentType,
    join_reason: validatedPayload.join_reason
  });

  return formatMembershipRequest(request);
}

async function listMyMembershipRequests(options) {
  const { actor, database = db } = options;
  requireActor(actor);

  const requests = await database.listMembershipRequests({
    profileId: actor.id
  });

  return requests.map((request) => formatMembershipRequest(request));
}

async function listMembershipRequests(options) {
  const { actor, filters = {}, pagination, database = db } = options;
  requireActor(actor);

  if (actor.role !== "admin") {
    throw new ApiError(403, "Only Club Services admins can view membership requests", "FORBIDDEN");
  }

  const clubId = filters.club_id;

  const requests = ensurePaginatedResult(await database.listMembershipRequests({
    clubId,
    status: filters.status,
    requestedRole: filters.requested_role,
    pagination,
    sort: pagination?.sort,
    order: pagination?.order
  }), pagination);

  const formatter = (request) => formatMembershipRequest(request, {
    includeFinancialDetails: true,
    includeWhatsAppAdminDetails: true
  });
  return pagination ? mapPaginatedResult(requests, formatter) : requests.map(formatter);
}

async function approveMembershipRequest({ actor, request, decisionPayload, database }) {
  const now = new Date().toISOString();
  const member = request.member_id && database.getClubMemberById
    ? await database.getClubMemberById(request.member_id)
    : null;

  if (!member) {
    throw new ApiError(409, "This request is missing its pending member record", "MEMBERSHIP_MEMBER_MISSING");
  }

  if (!request.due_payment_id) {
    throw new ApiError(409, "This request has no submitted dues payment to review yet", "DUES_PAYMENT_REQUIRED");
  }

  const payment = await database.updateDuePayment(request.due_payment_id, {
    status: "paid",
    verified_by: actor.id,
    verified_at: now
  });

  const activeMember = await updateMemberStatus({
    database,
    member,
    actor,
    nextStatus: "active",
    reason: `Membership request approved for ${request.academic_session || getCurrentAcademicSession()}`
  });

  const updatedRequest = await database.updateMembershipRequest(request.id, {
    status: "active",
    decision_remarks: decisionPayload.decision_remarks,
    reviewed_by: actor.id,
      reviewed_at: now,
      member_id: activeMember.id,
      due_payment_id: payment?.id || request.due_payment_id,
      whatsapp_onboarding_status: "ready"
  });

  // Assign the approved club to the user's profile if they are not yet
  // linked to any club (i.e. they signed up after the slim-signup change).
  if (database.updateProfile && request.profile_id) {
    const profileToLink = await database.getProfileById(request.profile_id);

    if (profileToLink && !profileToLink.club_id) {
      await database.updateProfile(request.profile_id, { club_id: request.club_id });
    }
  }

  return {
    request: formatMembershipRequest(updatedRequest, { includeFinancialDetails: true, includeWhatsAppAdminDetails: true }),
    member: activeMember,
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
    const payment = request.due_payment_id
      ? await database.updateDuePayment(request.due_payment_id, {
          status: "rejected",
          verified_by: actor.id,
          verified_at: new Date().toISOString()
        })
      : null;
    const updatedRequest = await database.updateMembershipRequest(request.id, {
      status: "rejected",
      decision_remarks: decisionPayload.decision_remarks,
      reviewed_by: actor.id,
      reviewed_at: new Date().toISOString()
    });

    return {
      request: formatMembershipRequest(updatedRequest),
      member: null,
      due_payment: payment
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

  const request = await database.getMembershipRequestByMemberId(payment.member_id, ["pending", "approved_pending_dues", "active"]);

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

  const updatedRequest = typeof database.updateMembershipRequest === "function"
    ? await database.updateMembershipRequest(request.id, {
        status: "active",
        whatsapp_onboarding_status: "ready"
      })
    : request;

  return {
    request: formatMembershipRequest(updatedRequest, { includeFinancialDetails: true, includeWhatsAppAdminDetails: true }),
    member
  };
}

async function markWhatsAppOnboardingAdded(options) {
  const { actor, requestId, payload = {}, database = db } = options;
  requireActor(actor);

  if (actor.role !== "admin") {
    throw new ApiError(403, "Only Club Services admins can complete WhatsApp onboarding", "FORBIDDEN");
  }

  const request = await database.getMembershipRequestById(requestId);

  if (!request) {
    throw new ApiError(404, "Membership request not found", "MEMBERSHIP_REQUEST_NOT_FOUND");
  }

  if (request.status !== "active" || request.due_payment?.status !== "paid") {
    throw new ApiError(409, "Verify the student's payment before WhatsApp onboarding", "WHATSAPP_ONBOARDING_NOT_READY");
  }

  const notes = typeof payload.notes === "string" ? payload.notes.trim() || null : null;
  const now = new Date().toISOString();
  const updatedRequest = await database.markMembershipRequestWhatsAppAdded(requestId, {
    whatsapp_onboarding_status: "added",
    whatsapp_added_by: actor.id,
    whatsapp_added_at: now,
    whatsapp_onboarding_notes: notes
  });

  await writeAuditLog(database, {
    actor_id: actor.id,
    entity_type: "membership_request",
    action: "whatsapp_group_member_marked_added",
    club_id: request.club_id,
    remarks: notes,
    metadata: {
      membership_request_id: request.id,
      profile_id: request.profile_id
    }
  });

  return formatMembershipRequest(updatedRequest, {
    includeFinancialDetails: true,
    includeWhatsAppAdminDetails: true
  });
}

module.exports = {
  activateMembershipAfterPaidDues,
  createMembershipRequest,
  decideMembershipRequest,
  formatMembershipRequest,
  listMembershipRequests,
  listMyMembershipRequests,
  markWhatsAppOnboardingAdded
};
