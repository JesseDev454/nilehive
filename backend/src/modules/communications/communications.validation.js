const ApiError = require("../../shared/ApiError");

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

function readOptionalNumber(payload, fieldName, label) {
  if (!Object.prototype.hasOwnProperty.call(payload, fieldName) || payload[fieldName] === null || payload[fieldName] === "") {
    return null;
  }

  const value = Number(payload[fieldName]);

  if (!Number.isInteger(value)) {
    throw new ApiError(400, `${label} must be a whole number`, "VALIDATION_ERROR", {
      field: fieldName
    });
  }

  return value;
}

function readChoice(payload, fieldName, label, allowedValues, fallback) {
  const value = typeof payload[fieldName] === "string" ? payload[fieldName].trim() : "";
  const normalizedValue = value || fallback;

  if (!allowedValues.includes(normalizedValue)) {
    throw new ApiError(400, `${label} must be one of: ${allowedValues.join(", ")}`, "VALIDATION_ERROR", {
      field: fieldName
    });
  }

  return normalizedValue;
}

function validateCreateAnnouncementPayload(payload = {}) {
  const rawAudience = readChoice(
    payload,
    "audience",
    "Audience",
    ["all", "all_users", "all_clubs", "club", "role"],
    "club"
  );
  const audience = rawAudience === "all" ? "all_users" : rawAudience;

  const targetRole = readOptionalString(payload, "target_role");

  if (targetRole && !["student", "executive", "president", "advisor", "admin"].includes(targetRole)) {
    throw new ApiError(400, "Target role must be one of: student, executive, president, advisor, admin", "VALIDATION_ERROR", {
      field: "target_role"
    });
  }

  return {
    title: readRequiredString(payload, "title", "Announcement title"),
    message: readRequiredString(payload, "message", "Announcement message"),
    audience,
    priority: readChoice(payload, "priority", "Priority", ["low", "normal", "high", "urgent"], "normal"),
    club_id: readOptionalString(payload, "club_id"),
    target_role: targetRole
  };
}

function validateCreateFeedbackPayload(payload = {}) {
  const rating = readOptionalNumber(payload, "rating", "Rating");

  if (rating !== null && (rating < 1 || rating > 5)) {
    throw new ApiError(400, "Rating must be between 1 and 5", "VALIDATION_ERROR", {
      field: "rating"
    });
  }

  return {
    club_id: readOptionalString(payload, "club_id"),
    proposal_id: readOptionalString(payload, "proposal_id"),
    category: readChoice(payload, "category", "Feedback category", ["general", "event", "club"], "general"),
    rating,
    comment: readRequiredString(payload, "comment", "Feedback comment")
  };
}

module.exports = {
  validateCreateAnnouncementPayload,
  validateCreateFeedbackPayload
};
