const ApiError = require("../../shared/ApiError");

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsedDate.getTime());
}

function validateCreateProposalPayload(payload = {}) {
  const title = normalizeString(payload.title);
  const description = normalizeString(payload.description);
  const eventDate = normalizeString(payload.event_date);
  const location = normalizeString(payload.location);
  const fieldErrors = [];

  if (!title) {
    fieldErrors.push({ field: "title", message: "title is required" });
  }

  if (!description) {
    fieldErrors.push({ field: "description", message: "description is required" });
  }

  if (!location) {
    fieldErrors.push({ field: "location", message: "location is required" });
  }

  if (!eventDate) {
    fieldErrors.push({ field: "event_date", message: "event_date is required" });
  } else if (!isValidIsoDate(eventDate)) {
    fieldErrors.push({ field: "event_date", message: "event_date must use YYYY-MM-DD format" });
  }

  if (fieldErrors.length) {
    throw new ApiError(400, "Invalid proposal payload", "VALIDATION_ERROR", {
      fields: fieldErrors
    });
  }

  return {
    title,
    description,
    event_date: eventDate,
    location
  };
}

module.exports = { validateCreateProposalPayload };

