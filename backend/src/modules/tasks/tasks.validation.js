const ApiError = require("../../shared/ApiError");

const TASK_PRIORITIES = new Set(["low", "medium", "high"]);
const TASK_STATUSES = new Set(["pending", "in_progress", "completed", "blocked"]);

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

function readOptionalDate(payload, fieldName) {
  const value = readOptionalString(payload, fieldName);

  if (!value) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new ApiError(400, `${fieldName} must use YYYY-MM-DD format`, "VALIDATION_ERROR", {
      field: fieldName
    });
  }

  return value;
}

function validateCreateTaskPayload(payload = {}) {
  const title = readRequiredString(payload, "title", "Task title");
  const assignedTo = readRequiredString(payload, "assigned_to", "Assigned executive");
  const priority = readOptionalString(payload, "priority") || "medium";

  if (!TASK_PRIORITIES.has(priority)) {
    throw new ApiError(400, "Task priority must be low, medium, or high", "VALIDATION_ERROR", {
      field: "priority"
    });
  }

  return {
    title,
    assigned_to: assignedTo,
    description: readOptionalString(payload, "description"),
    priority,
    due_date: readOptionalDate(payload, "due_date")
  };
}

function validateUpdateTaskStatusPayload(payload = {}) {
  const status = readRequiredString(payload, "status", "Task status");

  if (!TASK_STATUSES.has(status)) {
    throw new ApiError(
      400,
      "Task status must be pending, in_progress, completed, or blocked",
      "VALIDATION_ERROR",
      { field: "status" }
    );
  }

  return {
    status,
    remarks: readOptionalString(payload, "remarks")
  };
}

module.exports = {
  TASK_PRIORITIES,
  TASK_STATUSES,
  validateCreateTaskPayload,
  validateUpdateTaskStatusPayload
};
