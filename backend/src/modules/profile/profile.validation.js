const ApiError = require("../../shared/ApiError");
const { assertPlainText } = require("../../shared/plainText");
const { readStudentId } = require("../../shared/studentId");

const SELF_SERVICE_REQUESTED_ROLES = new Set(["student", "advisor"]);

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
    student_id: requestedRole === "student"
      ? readStudentId(payload, "student_id", "Student ID")
      : null,
    club_id: readRequiredString(payload, "club_id", "Club"),
    requested_role: requestedRole
  };
}

function validateSignupReceiptPayload(payload = {}) {
  const userId = readRequiredString(payload, "user_id", "User");
  const clubId = readRequiredString(payload, "club_id", "Club");
  const fileName = readRequiredString(payload, "file_name", "File name");
  const contentType = readRequiredString(payload, "content_type", "Content type");
  const fileDataUrl = typeof payload.file_data_url === "string" ? payload.file_data_url.trim() : "";

  if (!/^image\//i.test(contentType)) {
    throw new ApiError(400, "Only image receipts can be uploaded during signup", "VALIDATION_ERROR", {
      field: "content_type"
    });
  }

  if (!/^data:image\/[a-zA-Z0-9.+-]+;base64,/i.test(fileDataUrl)) {
    throw new ApiError(400, "Receipt upload data is invalid", "VALIDATION_ERROR", {
      field: "file_data_url"
    });
  }

  return {
    user_id: userId,
    club_id: clubId,
    file_name: fileName,
    content_type: contentType,
    file_data_url: fileDataUrl
  };
}

module.exports = {
  SELF_SERVICE_REQUESTED_ROLES,
  validateCompleteProfilePayload,
  validateSignupReceiptPayload
};
