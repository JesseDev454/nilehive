const ApiError = require("../../shared/ApiError");
const { assertPlainText } = require("../../shared/plainText");

const APP_ROLES = new Set(["student", "executive", "president", "advisor", "admin"]);

function readString(payload, fieldName) {
  return typeof payload[fieldName] === "string"
    ? assertPlainText(payload[fieldName], fieldName, fieldName)
    : "";
}

function readOptionalString(payload, fieldName) {
  return readString(payload, fieldName) || null;
}

function validateRoleUpdatePayload(payload = {}) {
  const role = readString(payload, "role");

  if (!APP_ROLES.has(role)) {
    throw new ApiError(400, "role is invalid", "VALIDATION_ERROR", {
      field: "role"
    });
  }

  return {
    role,
    club_id: Object.prototype.hasOwnProperty.call(payload, "club_id")
      ? readOptionalString(payload, "club_id")
      : undefined,
    remarks: readOptionalString(payload, "remarks")
  };
}

function validateAdvisorAssignmentPayload(payload = {}) {
  const clubId = readString(payload, "club_id");

  if (!clubId) {
    throw new ApiError(400, "Club is required", "VALIDATION_ERROR", {
      field: "club_id"
    });
  }

  return {
    club_id: clubId,
    replace_existing: payload.replace_existing === true,
    remarks: readOptionalString(payload, "remarks")
  };
}

module.exports = {
  APP_ROLES,
  validateAdvisorAssignmentPayload,
  validateRoleUpdatePayload
};
