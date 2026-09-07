const ApiError = require("./ApiError");

const STUDENT_ID_PATTERN = /^\d{9}$/;
const STUDENT_ID_ERROR_MESSAGE = "Student ID must be exactly 9 digits";

function normalizeStudentId(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidStudentId(value) {
  return STUDENT_ID_PATTERN.test(normalizeStudentId(value));
}

function readStudentId(payload, fieldName = "student_id", label = "Student ID") {
  const value = normalizeStudentId(payload?.[fieldName]);

  if (!value) {
    throw new ApiError(400, `${label} is required`, "VALIDATION_ERROR", {
      field: fieldName
    });
  }

  if (!isValidStudentId(value)) {
    throw new ApiError(400, STUDENT_ID_ERROR_MESSAGE, "VALIDATION_ERROR", {
      field: fieldName
    });
  }

  return value;
}

module.exports = {
  STUDENT_ID_ERROR_MESSAGE,
  STUDENT_ID_PATTERN,
  isValidStudentId,
  normalizeStudentId,
  readStudentId
};
