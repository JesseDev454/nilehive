const ApiError = require("./ApiError");

function assertPlainText(value, fieldName, label) {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return trimmed;
  }

  if (/[<>]/.test(trimmed) || /javascript:/i.test(trimmed)) {
    throw new ApiError(400, `${label} must be plain text`, "VALIDATION_ERROR", {
      field: fieldName
    });
  }

  return trimmed;
}

module.exports = {
  assertPlainText
};
