const ApiError = require("../../shared/ApiError");

const DUE_PAYMENT_STATUSES = new Set(["unpaid", "submitted", "paid", "rejected"]);

function readRequiredString(payload, fieldName, label) {
  const value = typeof payload[fieldName] === "string" ? payload[fieldName].trim() : "";

  if (!value) {
    throw new ApiError(400, `${label} is required`, "VALIDATION_ERROR", {
      field: fieldName
    });
  }

  return value;
}

function readOptionalString(payload, fieldName) {
  const value = typeof payload[fieldName] === "string" ? payload[fieldName].trim() : "";
  return value || null;
}

function readAmount(payload) {
  const amount = Number(payload.amount);

  if (!Number.isFinite(amount) || amount < 0) {
    throw new ApiError(400, "Amount must be a non-negative number", "VALIDATION_ERROR", {
      field: "amount"
    });
  }

  return amount;
}

function readStatus(payload, fallback) {
  const status = readOptionalString(payload, "status") || fallback;

  if (!DUE_PAYMENT_STATUSES.has(status)) {
    throw new ApiError(400, "Payment status is invalid", "VALIDATION_ERROR", {
      field: "status"
    });
  }

  return status;
}

function validateCreateDuePaymentPayload(payload = {}) {
  return {
    club_id: readOptionalString(payload, "club_id"),
    member_id: readRequiredString(payload, "member_id", "Member"),
    amount: readAmount(payload),
    academic_session: readRequiredString(payload, "academic_session", "Academic session"),
    payment_reference: readOptionalString(payload, "payment_reference"),
    proof_url: readOptionalString(payload, "proof_url"),
    status: readStatus(payload, "unpaid")
  };
}

function validateUpdateDuePaymentPayload(payload = {}) {
  const update = {};

  if (Object.prototype.hasOwnProperty.call(payload, "amount")) {
    update.amount = readAmount(payload);
  }

  if (Object.prototype.hasOwnProperty.call(payload, "academic_session")) {
    update.academic_session = readRequiredString(payload, "academic_session", "Academic session");
  }

  if (Object.prototype.hasOwnProperty.call(payload, "payment_reference")) {
    update.payment_reference = readOptionalString(payload, "payment_reference");
  }

  if (Object.prototype.hasOwnProperty.call(payload, "proof_url")) {
    update.proof_url = readOptionalString(payload, "proof_url");
  }

  if (Object.prototype.hasOwnProperty.call(payload, "status")) {
    update.status = readStatus(payload);
  }

  if (!Object.keys(update).length) {
    throw new ApiError(400, "At least one dues field must be provided", "VALIDATION_ERROR");
  }

  return update;
}

module.exports = {
  DUE_PAYMENT_STATUSES,
  validateCreateDuePaymentPayload,
  validateUpdateDuePaymentPayload
};
