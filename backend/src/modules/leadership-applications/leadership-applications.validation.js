const ApiError = require("../../shared/ApiError");

const LEADERSHIP_APPLICATION_STATUSES = new Set([
  "pending",
  "needs_more_info",
  "approved",
  "rejected",
  "cancelled"
]);
const REQUESTED_LEADERSHIP_ROLES = new Set(["executive", "president"]);
const DECISIONS = new Set(["approve", "reject", "needs_more_info"]);

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

function validateCreateLeadershipApplicationPayload(payload = {}) {
  const requestedRole = readRequiredString(payload, "requested_role", "Requested role");

  if (!REQUESTED_LEADERSHIP_ROLES.has(requestedRole)) {
    throw new ApiError(400, "requested_role must be executive or president", "VALIDATION_ERROR", {
      field: "requested_role"
    });
  }

  const reason = readRequiredString(payload, "reason", "Reason");

  if (reason.length < 20) {
    throw new ApiError(400, "Reason must be at least 20 characters", "VALIDATION_ERROR", {
      field: "reason"
    });
  }

  return {
    club_id: readRequiredString(payload, "club_id", "Club"),
    requested_role: requestedRole,
    reason,
    experience: readOptionalString(payload, "experience"),
    goals: readOptionalString(payload, "goals"),
    availability: readOptionalString(payload, "availability")
  };
}

function validateLeadershipApplicationDecisionPayload(payload = {}) {
  const decision = readRequiredString(payload, "decision", "Decision");

  if (!DECISIONS.has(decision)) {
    throw new ApiError(400, "decision must be approve, reject, or needs_more_info", "VALIDATION_ERROR", {
      field: "decision"
    });
  }

  return {
    decision,
    remarks: readOptionalString(payload, "remarks"),
    replace_existing_president: Boolean(payload.replace_existing_president)
  };
}

module.exports = {
  LEADERSHIP_APPLICATION_STATUSES,
  REQUESTED_LEADERSHIP_ROLES,
  validateCreateLeadershipApplicationPayload,
  validateLeadershipApplicationDecisionPayload
};
