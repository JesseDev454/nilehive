const ApiError = require("../../shared/ApiError");
const { assertPlainText } = require("../../shared/plainText");
const { readStudentId } = require("../../shared/studentId");

const SELF_SERVICE_REQUESTED_ROLES = new Set(["student"]);

function readString(payload, fieldName) {
  return typeof payload[fieldName] === "string"
    ? assertPlainText(payload[fieldName], fieldName, fieldName)
    : "";
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

function validateCompleteProfilePayload(payload = {}) {
  const requestedRole = readString(payload, "requested_role") || "student";

  if (!SELF_SERVICE_REQUESTED_ROLES.has(requestedRole)) {
    throw new ApiError(400, "requested_role is not allowed for self-service onboarding", "VALIDATION_ERROR", {
      field: "requested_role"
    });
  }

  return {
    full_name: readRequiredString(payload, "full_name", "Full name"),
    student_id: readStudentId(payload, "student_id", "Student ID"),
    club_id: readRequiredString(payload, "club_id", "Club"),
    requested_role: requestedRole
  };
}

module.exports = {
  SELF_SERVICE_REQUESTED_ROLES,
  validateCompleteProfilePayload
};
