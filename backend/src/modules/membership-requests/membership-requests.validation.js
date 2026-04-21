const ApiError = require("../../shared/ApiError");

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

function validateCreateMembershipRequestPayload(payload = {}) {
  const requestedRole = readOptionalString(payload, "requested_role") || "member";

  if (!REQUESTED_MEMBER_ROLES.has(requestedRole)) {
    throw new ApiError(400, "Membership requests are only for ordinary club membership. Use leadership applications for executive or president roles.", "VALIDATION_ERROR", {
      field: "requested_role"
    });
  }

  return {
    club_id: readRequiredString(payload, "club_id", "Club"),
    requested_role: requestedRole,
    remarks: readOptionalString(payload, "remarks")
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
    dues_amount: readAmount(payload),
    academic_session: readRequiredString(payload, "academic_session", "Academic session")
  };
}

module.exports = {
  REQUEST_STATUSES,
  REQUESTED_MEMBER_ROLES,
  validateCreateMembershipRequestPayload,
  validateMembershipRequestDecisionPayload
};
