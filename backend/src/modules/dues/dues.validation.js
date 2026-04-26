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

function readOptionalDate(payload, fieldName) {
  const value = readOptionalString(payload, fieldName);

  if (!value) {
    return null;
  }

  if (Number.isNaN(Date.parse(value))) {
    throw new ApiError(400, `${fieldName} must be a valid date`, "VALIDATION_ERROR", {
      field: fieldName
    });
  }

  return value;
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

function readDuesAmount(payload, fieldName = "dues_amount") {
  const amount = Number(payload[fieldName]);

  if (!Number.isFinite(amount) || amount < 0) {
    throw new ApiError(400, "Dues amount must be a non-negative number", "VALIDATION_ERROR", {
      field: fieldName
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

function validatePaymentConfirmationPayload(payload = {}) {
  return {
    payment_account_name: readRequiredString(payload, "payment_account_name", "Name on account"),
    payment_reference: readRequiredString(payload, "payment_reference", "Payment reference"),
    payment_paid_at: readOptionalDate(payload, "payment_paid_at"),
    proof_url: readOptionalString(payload, "proof_url"),
    payer_note: readOptionalString(payload, "payer_note")
  };
}

function validatePaymentSettingsPayload(payload = {}) {
  return {
    club_id: readOptionalString(payload, "club_id"),
    bank_name: readRequiredString(payload, "bank_name", "Bank name"),
    account_number: readRequiredString(payload, "account_number", "Account number"),
    account_name: readRequiredString(payload, "account_name", "Account name"),
    payment_instructions: readOptionalString(payload, "payment_instructions"),
    fresher_dues_amount: Object.prototype.hasOwnProperty.call(payload, "fresher_dues_amount")
      ? readDuesAmount(payload, "fresher_dues_amount")
      : 10000,
    returning_student_dues_amount: Object.prototype.hasOwnProperty.call(payload, "returning_student_dues_amount")
      ? readDuesAmount(payload, "returning_student_dues_amount")
      : 5000
  };
}

function validateBulkDuesAmountPayload(payload = {}) {
  return {
    dues_amount: readDuesAmount(payload)
  };
}

function validateBulkPaymentSettingsPayload(payload = {}) {
  return {
    bank_name: readRequiredString(payload, "bank_name", "Bank name"),
    account_number: readRequiredString(payload, "account_number", "Account number"),
    account_name: readRequiredString(payload, "account_name", "Account name"),
    payment_instructions: readOptionalString(payload, "payment_instructions"),
    fresher_dues_amount: Object.prototype.hasOwnProperty.call(payload, "fresher_dues_amount")
      ? readDuesAmount(payload, "fresher_dues_amount")
      : 10000,
    returning_student_dues_amount: Object.prototype.hasOwnProperty.call(payload, "returning_student_dues_amount")
      ? readDuesAmount(payload, "returning_student_dues_amount")
      : 5000
  };
}

function validateBulkClubPaymentProfilePayload(payload = {}) {
  return {
    bank_name: readRequiredString(payload, "bank_name", "Bank name"),
    account_number: readRequiredString(payload, "account_number", "Account number"),
    account_name: readRequiredString(payload, "account_name", "Account name"),
    payment_instructions: readOptionalString(payload, "payment_instructions"),
    fresher_dues_amount: readDuesAmount(payload, "fresher_dues_amount"),
    returning_student_dues_amount: readDuesAmount(payload, "returning_student_dues_amount")
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

  if (Object.prototype.hasOwnProperty.call(payload, "payment_account_name")) {
    update.payment_account_name = readOptionalString(payload, "payment_account_name");
  }

  if (Object.prototype.hasOwnProperty.call(payload, "payment_paid_at")) {
    update.payment_paid_at = readOptionalDate(payload, "payment_paid_at");
  }

  if (Object.prototype.hasOwnProperty.call(payload, "payer_note")) {
    update.payer_note = readOptionalString(payload, "payer_note");
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
  validateBulkClubPaymentProfilePayload,
  validateBulkPaymentSettingsPayload,
  validateBulkDuesAmountPayload,
  validateCreateDuePaymentPayload,
  validatePaymentConfirmationPayload,
  validatePaymentSettingsPayload,
  validateUpdateDuePaymentPayload
};
