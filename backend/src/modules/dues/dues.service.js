const { db } = require("../../config/db");
const ApiError = require("../../shared/ApiError");
const { writeAuditLog } = require("../../shared/auditLog");
const {
  validateBulkClubPaymentProfilePayload,
  validateBulkPaymentSettingsPayload,
  validateBulkDuesAmountPayload,
  validatePaymentConfirmationPayload,
  validatePaymentSettingsPayload,
  validateUpdateDuePaymentPayload
} = require("./dues.validation");
const { activateMembershipAfterPaidDues } = require("../membership-requests/membership-requests.service");
const { syncMemberStatusFromDuePayment } = require("../members/member-status");
const { sendPushForNotifications } = require("../notifications/push.service");

function requireActor(actor) {
  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }
}

function requireSupportedRole(actor) {
  if (actor.role !== "admin") {
    throw new ApiError(403, "Only Club Services admins can view dues tracking", "FORBIDDEN");
  }
}

function requireManagerRole(actor) {
  if (actor.role !== "admin") {
    throw new ApiError(403, "Only Club Services admins can manage dues records", "FORBIDDEN");
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
    fresher_dues_amount:
      settings.fresher_dues_amount === null || settings.fresher_dues_amount === undefined
        ? 10000
        : Number(settings.fresher_dues_amount),
    returning_student_dues_amount:
      settings.returning_student_dues_amount === null || settings.returning_student_dues_amount === undefined
        ? 10000
        : Number(settings.returning_student_dues_amount),
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

function formatStudentDuePayment(payment) {
  return {
    id: payment.id,
    club_id: payment.club_id,
    member_id: payment.member_id,
    amount: Number(payment.amount),
    academic_session: payment.academic_session,
    status: payment.status,
    has_proof: Boolean(payment.proof_url),
    submitted_at: payment.submitted_at,
    verified_at: payment.verified_at,
    created_at: payment.created_at,
    updated_at: payment.updated_at
  };
}

async function listDuePayments(options) {
  const { actor, filters = {}, pagination, database = db } = options;
  requireActor(actor);
  requireSupportedRole(actor);

  const clubId = getScopedClubId(actor, filters.club_id);
  const summaryPayments = await database.listDuePayments({
    clubId,
    status: filters.status,
    memberId: filters.member_id
  });
  const paginatedPayments = pagination
    ? await database.listDuePayments({
        clubId,
        status: filters.status,
        memberId: filters.member_id,
        pagination
      })
    : summaryPayments;

  return {
    summary: summarizeDues(summaryPayments),
    payments: pagination
      ? {
          ...paginatedPayments,
          items: paginatedPayments.items.map(formatDuePayment)
        }
      : summaryPayments.map(formatDuePayment)
  };
}

async function listMyDuePayments(options) {
  const { actor, database = db } = options;
  requireActor(actor);

  if (actor.role !== "student") {
    throw new ApiError(403, "Only students can use the personal dues endpoint", "FORBIDDEN");
  }

  const payments = await database.listDuePaymentsForProfile(actor.id);
  const latestByClub = new Map();

  payments.forEach((payment) => {
    if (!latestByClub.has(payment.club_id)) {
      latestByClub.set(payment.club_id, payment);
    }
  });

  const currentPayments = Array.from(latestByClub.values());

  return {
    payments: currentPayments.map(formatStudentDuePayment)
  };
}

async function createDuePayment(options) {
  requireActor(options.actor);
  throw new ApiError(
    409,
    "Dues records are created automatically when a student signs up or joins a club.",
    "DUES_CREATED_AUTOMATICALLY"
  );
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

  await syncMemberStatusFromDuePayment({
    payment: updatedPayment,
    actor,
    database
  });

  if (updatedPayment.status === "paid") {
    await activateMembershipAfterPaidDues({
      payment: updatedPayment,
      actor,
      database
    });
  }

  if (["paid", "rejected"].includes(updatedPayment.status)) {
    await writeAuditLog(database, {
      actor_id: actor.id,
      entity_type: "due_payment",
      action: "dues_payment_reviewed",
      club_id: updatedPayment.club_id,
      due_payment_id: updatedPayment.id,
      remarks: null,
      metadata: {
        previous_status: payment.status,
        new_status: updatedPayment.status,
        member_id: updatedPayment.member_id
      }
    });
  }

  if (updatedPayment.status === "rejected" && payment.status !== "rejected") {
    await notifyRejectedDuePayment({
      payment: updatedPayment,
      database
    });
  }

  return formatDuePayment(updatedPayment);
}

async function notifyRejectedDuePayment({ payment, database }) {
  if (typeof database.createNotifications !== "function" || typeof database.getClubMemberById !== "function") {
    return;
  }

  const member = await database.getClubMemberById(payment.member_id);
  const userId = member?.profile_id;

  if (!userId) {
    return;
  }

  const notifications = await database.createNotifications([
    {
      user_id: userId,
      proposal_id: null,
      announcement_id: null,
      type: "dues_proof_rejected",
      message: "Your dues proof could not be verified. Please upload a clearer copy or the correct receipt.",
      delivery_status: "stored"
    }
  ]);

  try {
    await sendPushForNotifications({ database, notifications });
  } catch {
    // Dues review should not fail if optional browser push delivery is unavailable.
  }
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

  return formatStudentDuePayment(updatedPayment);
}

async function getPaymentSettings(options) {
  const { actor, clubId, database = db } = options;
  requireActor(actor);

  if (!["student", "admin"].includes(actor.role)) {
    throw new ApiError(403, "This role cannot view payment settings", "FORBIDDEN");
  }

  let scopedClubId = clubId;

  if (actor.role === "admin") {
    scopedClubId = clubId || null;
  }

  if (!scopedClubId) {
    const clubs = await database.listClubs();
    scopedClubId = clubs[0]?.id ?? null;
  }

  if (!scopedClubId) {
    return null;
  }

  const settings = await database.getClubPaymentSettings(scopedClubId);

  return formatPaymentSettings(settings);
}

async function upsertPaymentSettings(options) {
  const { actor, payload, database = db } = options;
  requireActor(actor);
  if (actor.role !== "admin") {
    throw new ApiError(403, "Only Club Services admins can update the shared payment profile", "FORBIDDEN");
  }

  const validatedPayload = validatePaymentSettingsPayload(payload);
  const settings = await database.upsertAllClubPaymentSettings({
    bank_name: validatedPayload.bank_name,
    account_number: validatedPayload.account_number,
    account_name: validatedPayload.account_name,
    payment_instructions: validatedPayload.payment_instructions,
    fresher_dues_amount: 10000,
    returning_student_dues_amount: 10000
  });

  return formatPaymentSettings(settings[0] || null);
}

async function applyDuesAmountToAllClubs(options) {
  const { actor, payload, database = db } = options;
  requireActor(actor);

  if (actor.role !== "admin") {
    throw new ApiError(403, "Only Club Services admins can set dues for every club at once", "FORBIDDEN");
  }

  const validatedPayload = validateBulkDuesAmountPayload(payload);

  if (typeof database.updateAllClubDuesAmounts !== "function") {
    throw new ApiError(500, "Bulk dues updates are not available", "DATABASE_UNAVAILABLE");
  }

  const clubs = await database.updateAllClubDuesAmounts(10000);

  return {
    dues_amount: 10000,
    clubs_updated: clubs.length
  };
}

async function applyPaymentSettingsToAllClubs(options) {
  const { actor, payload, database = db } = options;
  requireActor(actor);

  if (actor.role !== "admin") {
    throw new ApiError(403, "Only Club Services admins can apply one payment account to every club", "FORBIDDEN");
  }

  const validatedPayload = validateBulkPaymentSettingsPayload(payload);

  if (typeof database.upsertAllClubPaymentSettings !== "function") {
    throw new ApiError(500, "Bulk payment settings updates are not available", "DATABASE_UNAVAILABLE");
  }

  const settings = await database.upsertAllClubPaymentSettings(validatedPayload);

  return {
    bank_name: validatedPayload.bank_name,
    account_number: validatedPayload.account_number,
    account_name: validatedPayload.account_name,
    payment_instructions: validatedPayload.payment_instructions,
    fresher_dues_amount: validatedPayload.fresher_dues_amount,
    returning_student_dues_amount: validatedPayload.returning_student_dues_amount,
    clubs_updated: settings.length
  };
}

async function applyClubPaymentProfileToAllClubs(options) {
  const { actor, payload, database = db } = options;
  requireActor(actor);

  if (actor.role !== "admin") {
    throw new ApiError(403, "Only Club Services admins can apply one payment profile to every club", "FORBIDDEN");
  }

  const validatedPayload = validateBulkClubPaymentProfilePayload(payload);

  if (typeof database.upsertAllClubPaymentSettings !== "function") {
    throw new ApiError(500, "Bulk club payment profile updates are not available", "DATABASE_UNAVAILABLE");
  }

  const settings = await database.upsertAllClubPaymentSettings({
    bank_name: validatedPayload.bank_name,
    account_number: validatedPayload.account_number,
    account_name: validatedPayload.account_name,
    payment_instructions: validatedPayload.payment_instructions,
    fresher_dues_amount: 10000,
    returning_student_dues_amount: 10000
  });

  return {
    bank_name: validatedPayload.bank_name,
    account_number: validatedPayload.account_number,
    account_name: validatedPayload.account_name,
    payment_instructions: validatedPayload.payment_instructions,
    fresher_dues_amount: 10000,
    returning_student_dues_amount: 10000,
    clubs_updated: settings.length
  };
}

module.exports = {
  applyClubPaymentProfileToAllClubs,
  applyPaymentSettingsToAllClubs,
  applyDuesAmountToAllClubs,
  createDuePayment,
  getPaymentSettings,
  listDuePayments,
  listMyDuePayments,
  submitDuePaymentConfirmation,
  summarizeDues,
  upsertPaymentSettings,
  updateDuePayment
};
