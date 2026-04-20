const ApiError = require("../../shared/ApiError");
const { readStudentId } = require("../../shared/studentId");

const CLUB_MEMBER_ROLES = new Set(["member", "executive", "president"]);
const MEMBERSHIP_STATUSES = new Set(["active", "inactive", "alumni"]);

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

function readEnum(payload, fieldName, allowedValues, fallback) {
  const value = readOptionalString(payload, fieldName) || fallback;

  if (!allowedValues.has(value)) {
    throw new ApiError(400, `${fieldName} has an invalid value`, "VALIDATION_ERROR", {
      field: fieldName
    });
  }

  return value;
}

function validateCreateMemberPayload(payload = {}) {
  return {
    club_id: readOptionalString(payload, "club_id"),
    profile_id: readOptionalString(payload, "profile_id"),
    full_name: readRequiredString(payload, "full_name", "Full name"),
    student_id: readStudentId(payload, "student_id", "Student ID"),
    email: readOptionalString(payload, "email"),
    phone_number: readOptionalString(payload, "phone_number"),
    club_role: readEnum(payload, "club_role", CLUB_MEMBER_ROLES, "member"),
    membership_status: readEnum(payload, "membership_status", MEMBERSHIP_STATUSES, "active")
  };
}

function validateUpdateMemberPayload(payload = {}) {
  const update = {};

  if (Object.prototype.hasOwnProperty.call(payload, "full_name")) {
    update.full_name = readRequiredString(payload, "full_name", "Full name");
  }

  if (Object.prototype.hasOwnProperty.call(payload, "student_id")) {
    update.student_id = readStudentId(payload, "student_id", "Student ID");
  }

  if (Object.prototype.hasOwnProperty.call(payload, "email")) {
    update.email = readOptionalString(payload, "email");
  }

  if (Object.prototype.hasOwnProperty.call(payload, "phone_number")) {
    update.phone_number = readOptionalString(payload, "phone_number");
  }

  if (Object.prototype.hasOwnProperty.call(payload, "club_role")) {
    update.club_role = readEnum(payload, "club_role", CLUB_MEMBER_ROLES, "member");
  }

  if (Object.prototype.hasOwnProperty.call(payload, "membership_status")) {
    update.membership_status = readEnum(payload, "membership_status", MEMBERSHIP_STATUSES, "active");
  }

  if (!Object.keys(update).length) {
    throw new ApiError(400, "At least one member field must be provided", "VALIDATION_ERROR");
  }

  return update;
}

module.exports = {
  CLUB_MEMBER_ROLES,
  MEMBERSHIP_STATUSES,
  validateCreateMemberPayload,
  validateUpdateMemberPayload
};
