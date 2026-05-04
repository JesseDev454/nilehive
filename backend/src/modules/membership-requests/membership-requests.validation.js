const ApiError = require("../../shared/ApiError");
const { readStudentId } = require("../../shared/studentId");

const REQUESTED_MEMBER_ROLES = new Set(["member"]);
const REQUEST_STATUSES = new Set(["pending", "approved_pending_dues", "active", "rejected", "cancelled"]);

function readString(payload, fieldName) {
  return typeof payload[fieldName] === "string" ? payload[fieldName].trim() : "";
}

function readOptionalString(payload, fieldName) {
  return readString(payload, fieldName) || null;
}

function readRequiredString(payload, fieldName, label) {
  const value = readString(payload, fieldName);

  if (!value) {
    throw new ApiError(400, `${label} is required`, "VALIDATION_ERROR", {
      field: fieldName
    });
  }

  return value;
}

function readAmount(payload) {
  const amount = Number(payload.dues_amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ApiError(400, "Dues amount must be greater than 0", "VALIDATION_ERROR", {
      field: "dues_amount"
    });
  }

  return amount;
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

function readStudentType(payload, required = false) {
  const value = readOptionalString(payload, "student_type");

  if (!value) {
    if (required) {
      throw new ApiError(400, "Student type is required", "VALIDATION_ERROR", {
        field: "student_type"
      });
    }

    return null;
  }

  if (!["fresher", "returning"].includes(value)) {
    throw new ApiError(400, "Student type must be fresher or returning", "VALIDATION_ERROR", {
      field: "student_type"
    });
  }

  return value;
}

function validateCreateMembershipRequestPayload(payload = {}) {
  const requestedRole = readOptionalString(payload, "requested_role") || "member";

  if (!REQUESTED_MEMBER_ROLES.has(requestedRole)) {
    throw new ApiError(400, "Membership requests are only for ordinary club membership. Club Services assigns presidents, and presidents choose executives from active members.", "VALIDATION_ERROR", {
      field: "requested_role"
    });
  }

  return {
    club_id: readRequiredString(payload, "club_id", "Club"),
    requested_role: requestedRole,
    remarks: readOptionalString(payload, "remarks"),
    student_id: readStudentId(payload, "student_id", "Student ID"),
    phone_number: readOptionalString(payload, "phone_number"),
    department: readOptionalString(payload, "department"),
    student_type: readStudentType(payload, false),
    join_reason: readOptionalString(payload, "join_reason"),
    payment_account_name: readRequiredString(payload, "payment_account_name", "Name on account"),
    payment_reference: readRequiredString(payload, "payment_reference", "Payment reference"),
    payment_paid_at: readOptionalDate(payload, "payment_paid_at"),
    proof_url: readRequiredString(payload, "proof_url", "Receipt upload"),
    payer_note: readOptionalString(payload, "payer_note"),
    academic_session: readOptionalString(payload, "academic_session")
  };
}

function validateMembershipRequestDecisionPayload(payload = {}) {
  const decision = readRequiredString(payload, "decision", "Decision");

  if (!["approve", "reject"].includes(decision)) {
    throw new ApiError(400, 'decision must be "approve" or "reject"', "VALIDATION_ERROR", {
      field: "decision"
    });
  }

  if (decision === "reject") {
    return {
      decision,
      decision_remarks: readOptionalString(payload, "remarks"),
      dues_amount: null,
      academic_session: null
    };
  }

  return {
    decision,
    decision_remarks: readOptionalString(payload, "remarks"),
    dues_amount: null,
    academic_session: null
  };
}

module.exports = {
  REQUEST_STATUSES,
  REQUESTED_MEMBER_ROLES,
  validateCreateMembershipRequestPayload,
  validateMembershipRequestDecisionPayload
};
