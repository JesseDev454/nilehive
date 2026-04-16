const { db } = require("../../config/db");
const ApiError = require("../../shared/ApiError");
const {
  validateCreateDuePaymentPayload,
  validatePaymentConfirmationPayload,
  validatePaymentSettingsPayload,
  validateUpdateDuePaymentPayload
} = require("./dues.validation");
const {
  activateMembershipAfterPaidDues
} = require("../membership-requests/membership-requests.service");

function requireActor(actor) {
  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }
}

function requireSupportedRole(actor) {
  if (!["admin", "president"].includes(actor.role)) {
    throw new ApiError(403, "This role cannot view dues tracking", "FORBIDDEN");
  }
}

function requireManagerRole(actor) {
  if (!["admin", "president"].includes(actor.role)) {
    throw new ApiError(403, "Only presidents or admins can manage dues records", "FORBIDDEN");
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
    throw new ApiError(403, "You can only access dues for your own club", "FORBIDDEN");
  }

  return actor.clubId;
}

function formatDuePayment(payment) {
  return {
    id: payment.id,
    club_id: payment.club_id,
    member_id: payment.member_id,
    amount: Number(payment.amount),
    academic_session: payment.academic_session,
    payment_reference: payment.payment_reference,
    payment_account_name: payment.payment_account_name,
    payment_paid_at: payment.payment_paid_at,
    payer_note: payment.payer_note,
    proof_url: payment.proof_url,
    submitted_at: payment.submitted_at,
    status: payment.status,
    verified_by: payment.verified_by,
    verified_at: payment.verified_at,
    created_at: payment.created_at,
    updated_at: payment.updated_at
  };
}

function formatPaymentSettings(settings) {
  if (!settings) {
    return null;
  }

  return {
    id: settings.id,
    club_id: settings.club_id,
    bank_name: settings.bank_name,
    account_number: settings.account_number,
    account_name: settings.account_name,
    payment_instructions: settings.payment_instructions,
    created_at: settings.created_at,
    updated_at: settings.updated_at
  };
}

function summarizeDues(payments) {
  const total = payments.length;
  const paid = payments.filter((payment) => payment.status === "paid").length;
  const unpaid = payments.filter((payment) => payment.status === "unpaid").length;
  const submitted = payments.filter((payment) => payment.status === "submitted").length;
  const rejected = payments.filter((payment) => payment.status === "rejected").length;
  const expectedAmount = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const collectedAmount = payments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + Number(payment.amount), 0);

  return {
    total_records: total,
    paid,
    unpaid,
    submitted,
    rejected,
    expected_amount: expectedAmount,
    collected_amount: collectedAmount,
    collection_rate: total > 0 ? Math.round((paid / total) * 100) : 0
  };
}

async function listDuePayments(options) {
  const { actor, filters = {}, database = db } = options;
  requireActor(actor);
  requireSupportedRole(actor);

  const clubId = getScopedClubId(actor, filters.club_id);
  const payments = await database.listDuePayments({
    clubId,
    status: filters.status,
    memberId: filters.member_id
  });

  return {
    summary: summarizeDues(payments),
    payments: payments.map(formatDuePayment)
  };
}

async function listMyDuePayments(options) {
  const { actor, database = db } = options;
  requireActor(actor);

  if (actor.role !== "student") {
    throw new ApiError(403, "Only students can use the personal dues endpoint", "FORBIDDEN");
  }

  const payments = await database.listDuePaymentsForProfile(actor.id);

  return {
    summary: summarizeDues(payments),
    payments: payments.map(formatDuePayment)
  };
}

async function createDuePayment(options) {
  const { actor, payload, database = db } = options;
  requireActor(actor);
  requireManagerRole(actor);

  const validatedPayload = validateCreateDuePaymentPayload(payload);
  const member = await database.getClubMemberById(validatedPayload.member_id);

  if (!member) {
    throw new ApiError(404, "Member not found", "MEMBER_NOT_FOUND");
  }

  const clubId = getScopedClubId(actor, validatedPayload.club_id || member.club_id);

  if (!clubId || clubId !== member.club_id) {
    throw new ApiError(403, "Payment member must belong to the selected club", "FORBIDDEN");
  }

  const payment = await database.createDuePayment({
    club_id: clubId,
    member_id: member.id,
    amount: validatedPayload.amount,
    academic_session: validatedPayload.academic_session,
    payment_reference: validatedPayload.payment_reference,
    proof_url: validatedPayload.proof_url,
    status: validatedPayload.status,
    verified_by: validatedPayload.status === "paid" ? actor.id : null,
    verified_at: validatedPayload.status === "paid" ? new Date().toISOString() : null
  });

  return formatDuePayment(payment);
}

async function updateDuePayment(options) {
  const { actor, paymentId, payload, database = db } = options;
  requireActor(actor);
  requireManagerRole(actor);

  const payment = await database.getDuePaymentById(paymentId);

  if (!payment) {
    throw new ApiError(404, "Due payment not found", "DUE_PAYMENT_NOT_FOUND");
  }

  getScopedClubId(actor, payment.club_id);

  const update = validateUpdateDuePaymentPayload(payload);

  if (["paid", "rejected"].includes(update.status)) {
    update.verified_by = actor.id;
    update.verified_at = new Date().toISOString();
  }

  if (update.status === "submitted" || update.status === "unpaid") {
    update.verified_by = null;
    update.verified_at = null;
  }

  const updatedPayment = await database.updateDuePayment(paymentId, update);

  if (updatedPayment.status === "paid") {
    await activateMembershipAfterPaidDues({
      payment: updatedPayment,
      actor,
      database
    });
  }

  return formatDuePayment(updatedPayment);
}

async function submitDuePaymentConfirmation(options) {
  const { actor, paymentId, payload, database = db } = options;
  requireActor(actor);

  if (actor.role !== "student") {
    throw new ApiError(403, "Only students can submit dues payment confirmation", "FORBIDDEN");
  }

  const payment = await database.getDuePaymentById(paymentId);

  if (!payment) {
    throw new ApiError(404, "Due payment not found", "DUE_PAYMENT_NOT_FOUND");
  }

  const member = await database.getClubMemberById(payment.member_id);

  if (!member || member.profile_id !== actor.id) {
    throw new ApiError(403, "You can only confirm your own dues payments", "FORBIDDEN");
  }

  if (!["unpaid", "rejected"].includes(payment.status)) {
    throw new ApiError(409, "Only unpaid or rejected dues can be submitted for review", "INVALID_DUE_STATUS");
  }

  const confirmation = validatePaymentConfirmationPayload(payload);
  const updatedPayment = await database.updateDuePayment(paymentId, {
    ...confirmation,
    status: "submitted",
    submitted_at: new Date().toISOString(),
    verified_by: null,
    verified_at: null
  });

  return formatDuePayment(updatedPayment);
}

async function getPaymentSettings(options) {
  const { actor, clubId, database = db } = options;
  requireActor(actor);

  let scopedClubId = clubId;

  if (actor.role !== "student") {
    scopedClubId = getScopedClubId(actor, clubId);
  }

  if (!scopedClubId) {
    throw new ApiError(400, "club_id is required for admin payment settings", "VALIDATION_ERROR", {
      field: "club_id"
    });
  }

  const settings = await database.getClubPaymentSettings(scopedClubId);

  return formatPaymentSettings(settings);
}

async function upsertPaymentSettings(options) {
  const { actor, payload, database = db } = options;
  requireActor(actor);
  requireManagerRole(actor);

  const validatedPayload = validatePaymentSettingsPayload(payload);
  const clubId = getScopedClubId(actor, validatedPayload.club_id);

  if (!clubId) {
    throw new ApiError(400, "club_id is required for admin payment settings", "VALIDATION_ERROR", {
      field: "club_id"
    });
  }

  const settings = await database.upsertClubPaymentSettings({
    ...validatedPayload,
    club_id: clubId
  });

  return formatPaymentSettings(settings);
}

module.exports = {
  createDuePayment,
  getPaymentSettings,
  listDuePayments,
  listMyDuePayments,
  submitDuePaymentConfirmation,
  summarizeDues,
  upsertPaymentSettings,
  updateDuePayment
};
