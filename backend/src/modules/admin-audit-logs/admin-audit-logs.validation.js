const ApiError = require("../../shared/ApiError");

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_SEARCH_LENGTH = 80;

function readOptionalString(query, field) {
  if (query[field] === undefined || query[field] === null || query[field] === "") {
    return null;
  }

  if (typeof query[field] !== "string") {
    throw new ApiError(400, `${field} must be a string`, "VALIDATION_ERROR", { field });
  }

  const value = query[field].trim();
  return value || null;
}

function readOptionalUuid(query, field) {
  const value = readOptionalString(query, field);
  if (!value) {
    return null;
  }

  if (!UUID_PATTERN.test(value)) {
    throw new ApiError(400, `${field} must be a valid UUID`, "VALIDATION_ERROR", { field });
  }

  return value.toLowerCase();
}

function parseDateBoundary(value, field, endOfDay) {
  if (!DATE_PATTERN.test(value) && Number.isNaN(Date.parse(value))) {
    throw new ApiError(400, `${field} must be a valid date`, "VALIDATION_ERROR", { field });
  }

  const parsed = DATE_PATTERN.test(value)
    ? new Date(`${value}T${endOfDay ? "23:59:59.999Z" : "00:00:00.000Z"}`)
    : new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new ApiError(400, `${field} must be a valid date`, "VALIDATION_ERROR", { field });
  }

  return parsed.toISOString();
}

function sanitizeSearch(value) {
  return value.replace(/[%_,]/g, " ").replace(/\s+/g, " ").trim().slice(0, MAX_SEARCH_LENGTH);
}

function validateAuditLogListQuery(query = {}) {
  const actorId = readOptionalUuid(query, "actor_id");
  const clubId = readOptionalUuid(query, "club_id");
  const entityId = readOptionalUuid(query, "entity_id");
  const action = readOptionalString(query, "action");
  const entityType = readOptionalString(query, "entity_type");
  const rawSearch = readOptionalString(query, "q");
  const q = rawSearch ? sanitizeSearch(rawSearch) : null;
  const dateFromRaw = readOptionalString(query, "date_from");
  const dateToRaw = readOptionalString(query, "date_to");
  const dateFrom = dateFromRaw ? parseDateBoundary(dateFromRaw, "date_from", false) : null;
  const dateTo = dateToRaw ? parseDateBoundary(dateToRaw, "date_to", true) : null;

  if (dateFrom && dateTo && dateFrom > dateTo) {
    throw new ApiError(400, "date_from must be on or before date_to", "VALIDATION_ERROR", {
      field: "date_from"
    });
  }

  return {
    actor_id: actorId,
    club_id: clubId,
    entity_id: entityId,
    action,
    entity_type: entityType,
    q,
    date_from: dateFrom,
    date_to: dateTo
  };
}

module.exports = {
  UUID_PATTERN,
  validateAuditLogListQuery
};
