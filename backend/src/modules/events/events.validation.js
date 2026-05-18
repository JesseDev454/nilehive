const ApiError = require("../../shared/ApiError");

const RSVP_STATUSES = new Set(["interested", "going", "not_going", "cancelled"]);

function readRequiredString(payload, fieldName, label) {
  const value = typeof payload[fieldName] === "string" ? payload[fieldName].trim() : "";

  if (!value) {
    throw new ApiError(400, `${label} is required`, "VALIDATION_ERROR", {
      field: fieldName
    });
  }

  return value;
}

function validateRsvpPayload(payload = {}) {
  const status = readRequiredString(payload, "status", "RSVP status");

  if (!RSVP_STATUSES.has(status)) {
    throw new ApiError(400, "RSVP status is invalid", "VALIDATION_ERROR", {
      field: "status"
    });
  }

  return { status };
}

function validateAttendancePayload(payload = {}) {
  return {
    user_id: readRequiredString(payload, "user_id", "Student"),
    attended: Object.prototype.hasOwnProperty.call(payload, "attended")
      ? Boolean(payload.attended)
      : true
  };
}

module.exports = {
  RSVP_STATUSES,
  validateAttendancePayload,
  validateRsvpPayload
};
