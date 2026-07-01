const ApiError = require("../../shared/ApiError");
const { assertPlainText } = require("../../shared/plainText");
const MAX_REPORT_MEDIA_IMAGES = 10;

function readRequiredString(payload, fieldName, label) {
  const value = typeof payload[fieldName] === "string"
    ? assertPlainText(payload[fieldName], fieldName, label)
    : "";

  if (!value) {
    throw new ApiError(400, `${label} is required`, "VALIDATION_ERROR", {
      field: fieldName
    });
  }

  return value;
}

function readOptionalString(payload, fieldName) {
  const value = typeof payload[fieldName] === "string"
    ? assertPlainText(payload[fieldName], fieldName, fieldName)
    : "";
  return value || null;
}

function readNonNegativeInteger(payload, fieldName, label) {
  const value = Number(payload[fieldName]);

  if (!Number.isInteger(value) || value < 0) {
    throw new ApiError(400, `${label} must be a non-negative whole number`, "VALIDATION_ERROR", {
      field: fieldName
    });
  }

  return value;
}

function readOptionalAmount(payload, fieldName, label) {
  if (!Object.prototype.hasOwnProperty.call(payload, fieldName) || payload[fieldName] === "") {
    return null;
  }

  const value = Number(payload[fieldName]);

  if (!Number.isFinite(value) || value < 0) {
    throw new ApiError(400, `${label} must be a non-negative number`, "VALIDATION_ERROR", {
      field: fieldName
    });
  }

  return value;
}

function readMediaUrls(payload) {
  if (!Object.prototype.hasOwnProperty.call(payload, "media_urls")) {
    return [];
  }

  if (!Array.isArray(payload.media_urls)) {
    throw new ApiError(400, "media_urls must be an array", "VALIDATION_ERROR", {
      field: "media_urls"
    });
  }

  const urls = payload.media_urls
    .filter((value) => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);

  if (urls.length !== payload.media_urls.length) {
    throw new ApiError(400, "media_urls must contain only non-empty strings", "VALIDATION_ERROR", {
      field: "media_urls"
    });
  }

  if (urls.length > MAX_REPORT_MEDIA_IMAGES) {
    throw new ApiError(
      400,
      `You can upload up to ${MAX_REPORT_MEDIA_IMAGES} images for an event report`,
      "VALIDATION_ERROR",
      {
        field: "media_urls"
      }
    );
  }

  return urls;
}

function validateCreateEventReportPayload(payload = {}) {
  return {
    proposal_id: readRequiredString(payload, "proposal_id", "Proposal"),
    attendance_count: readNonNegativeInteger(payload, "attendance_count", "Attendance count"),
    summary: readRequiredString(payload, "summary", "Event summary"),
    challenges: readOptionalString(payload, "challenges"),
    outcomes: readOptionalString(payload, "outcomes"),
    budget_used: readOptionalAmount(payload, "budget_used", "Budget used"),
    media_urls: readMediaUrls(payload)
  };
}

module.exports = {
  validateCreateEventReportPayload
};
