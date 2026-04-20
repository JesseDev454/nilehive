const ApiError = require("../../shared/ApiError");
const { isValidStudentId, STUDENT_ID_ERROR_MESSAGE } = require("../../shared/studentId");

const MAX_RESPONSIBLE_MEMBERS = 10;

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeNullableString(value) {
  const normalized = normalizeString(value);
  return normalized || null;
}

function normalizeNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : Number.NaN;
}

function isValidIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsedDate.getTime());
}

function isValidTime(value) {
  return /^\d{2}:\d{2}(:\d{2})?$/.test(value);
}

function normalizeBudgetLineItems(value, fieldErrors) {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    fieldErrors.push({ field: "budget_line_items", message: "budget_line_items must be an array" });
    return [];
  }

  return value
    .map((item, index) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        fieldErrors.push({
          field: `budget_line_items[${index}]`,
          message: "budget line item must be an object"
        });
        return null;
      }

      const itemName = normalizeString(item.item);
      const description = normalizeString(item.description);
      const quantity = normalizeNumber(item.quantity);
      const amount = normalizeNumber(item.amount);

      if (!itemName) {
        fieldErrors.push({
          field: `budget_line_items[${index}].item`,
          message: "budget item name is required"
        });
      }

      if (!description) {
        fieldErrors.push({
          field: `budget_line_items[${index}].description`,
          message: "budget item description is required"
        });
      }

      if (!Number.isFinite(quantity) || quantity <= 0) {
        fieldErrors.push({
          field: `budget_line_items[${index}].quantity`,
          message: "budget item quantity must be greater than 0"
        });
      }

      if (!Number.isFinite(amount) || amount < 0) {
        fieldErrors.push({
          field: `budget_line_items[${index}].amount`,
          message: "budget item amount must be 0 or greater"
        });
      }

      return {
        item: itemName,
        description,
        quantity,
        amount
      };
    })
    .filter(Boolean);
}

function normalizeResponsibleMembers(value, fieldErrors) {
  if (value === undefined || value === null) {
    fieldErrors.push({
      field: "responsible_members",
      message: "at least one responsible member is required"
    });
    return [];
  }

  if (!Array.isArray(value)) {
    fieldErrors.push({ field: "responsible_members", message: "responsible_members must be an array" });
    return [];
  }

  if (!value.length) {
    fieldErrors.push({
      field: "responsible_members",
      message: "at least one responsible member is required"
    });
    return [];
  }

  if (value.length > MAX_RESPONSIBLE_MEMBERS) {
    fieldErrors.push({
      field: "responsible_members",
      message: `a proposal can have at most ${MAX_RESPONSIBLE_MEMBERS} responsible members`
    });
  }

  return value
    .map((member, index) => {
      if (!member || typeof member !== "object" || Array.isArray(member)) {
        fieldErrors.push({
          field: `responsible_members[${index}]`,
          message: "responsible member must be an object"
        });
        return null;
      }

      const name = normalizeString(member.name);
      const studentId = normalizeString(member.student_id);
      const phoneNumber = normalizeString(member.phone_number);
      const position = normalizeString(member.position);

      if (!name) {
        fieldErrors.push({
          field: `responsible_members[${index}].name`,
          message: "responsible member name is required"
        });
      }

      if (!studentId) {
        fieldErrors.push({
          field: `responsible_members[${index}].student_id`,
          message: "responsible member student_id is required"
        });
      } else if (!isValidStudentId(studentId)) {
        fieldErrors.push({
          field: `responsible_members[${index}].student_id`,
          message: STUDENT_ID_ERROR_MESSAGE
        });
      }

      if (!phoneNumber) {
        fieldErrors.push({
          field: `responsible_members[${index}].phone_number`,
          message: "responsible member phone_number is required"
        });
      }

      if (!position) {
        fieldErrors.push({
          field: `responsible_members[${index}].position`,
          message: "responsible member position is required"
        });
      }

      return {
        name,
        student_id: studentId,
        phone_number: phoneNumber,
        position
      };
    })
    .filter(Boolean);
}

function normalizeDraftBudgetLineItems(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => item && typeof item === "object" && !Array.isArray(item))
    .filter((item) => item.item || item.description || item.quantity || item.amount)
    .map((item) => {
      const quantity = normalizeNumber(item.quantity);
      const amount = normalizeNumber(item.amount);

      return {
        item: normalizeString(item.item),
        description: normalizeString(item.description),
        quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 0,
        amount: Number.isFinite(amount) && amount >= 0 ? amount : 0
      };
    });
}

function normalizeDraftResponsibleMembers(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((member) => member && typeof member === "object" && !Array.isArray(member))
    .filter((member) => member.name || member.student_id || member.phone_number || member.position)
    .map((member) => ({
      name: normalizeString(member.name),
      student_id: normalizeString(member.student_id),
      phone_number: normalizeString(member.phone_number),
      position: normalizeString(member.position)
    }));
}

function validateDraftProposalPayload(payload = {}) {
  const proposedActivity = normalizeString(payload.proposed_activity);
  const title = normalizeString(payload.title) || proposedActivity || "Untitled draft";
  const eventDate = normalizeString(payload.event_date);
  const eventTime = normalizeString(payload.event_time);
  const numberOfParticipants = normalizeNumber(payload.number_of_participants);
  const budgetEstimate = normalizeNumber(payload.budget_estimate);

  return {
    title,
    club_id: normalizeNullableString(payload.club_id),
    description: normalizeNullableString(payload.description),
    event_date: isValidIsoDate(eventDate) ? eventDate : null,
    location: normalizeNullableString(payload.location) || normalizeNullableString(payload.venue),
    aim_objectives: normalizeNullableString(payload.aim_objectives),
    proposed_activity: proposedActivity || null,
    event_time: isValidTime(eventTime) ? eventTime : null,
    number_of_participants:
      Number.isFinite(numberOfParticipants) && numberOfParticipants > 0
        ? numberOfParticipants
        : null,
    budget_estimate:
      Number.isFinite(budgetEstimate) && budgetEstimate >= 0
        ? budgetEstimate
        : null,
    budget_line_items: normalizeDraftBudgetLineItems(payload.budget_line_items),
    responsible_members: normalizeDraftResponsibleMembers(payload.responsible_members)
  };
}
function validateCreateProposalPayload(payload = {}) {
  const proposedActivity = normalizeString(payload.proposed_activity);
  const title = normalizeString(payload.title) || proposedActivity;
  const description = normalizeString(payload.description);
  const eventDate = normalizeString(payload.event_date);
  const location = normalizeString(payload.location) || normalizeString(payload.venue);
  const clubId = normalizeNullableString(payload.club_id);
  const aimObjectives = normalizeString(payload.aim_objectives);
  const eventTime = normalizeString(payload.event_time);
  const numberOfParticipants = normalizeNumber(payload.number_of_participants);
  const budgetEstimate = normalizeNumber(payload.budget_estimate);
  const fieldErrors = [];
  const budgetLineItems = normalizeBudgetLineItems(payload.budget_line_items, fieldErrors);
  const responsibleMembers = normalizeResponsibleMembers(payload.responsible_members, fieldErrors);

  if (!title) {
    fieldErrors.push({ field: "title", message: "title is required" });
  }

  if (!proposedActivity) {
    fieldErrors.push({ field: "proposed_activity", message: "proposed_activity is required" });
  }

  if (!description) {
    fieldErrors.push({ field: "description", message: "description is required" });
  }

  if (!aimObjectives) {
    fieldErrors.push({ field: "aim_objectives", message: "aim_objectives is required" });
  }

  if (!location) {
    fieldErrors.push({ field: "location", message: "location or venue is required" });
  }

  if (!eventDate) {
    fieldErrors.push({ field: "event_date", message: "event_date is required" });
  } else if (!isValidIsoDate(eventDate)) {
    fieldErrors.push({ field: "event_date", message: "event_date must use YYYY-MM-DD format" });
  }

  if (eventTime && !isValidTime(eventTime)) {
    fieldErrors.push({ field: "event_time", message: "event_time must use HH:mm format" });
  }

  if (!Number.isFinite(numberOfParticipants) || numberOfParticipants <= 0) {
    fieldErrors.push({
      field: "number_of_participants",
      message: "number_of_participants must be greater than 0"
    });
  }

  if (budgetEstimate !== null && (!Number.isFinite(budgetEstimate) || budgetEstimate < 0)) {
    fieldErrors.push({
      field: "budget_estimate",
      message: "budget_estimate must be 0 or greater when provided"
    });
  }

  if (fieldErrors.length) {
    throw new ApiError(400, "Invalid proposal payload", "VALIDATION_ERROR", {
      fields: fieldErrors
    });
  }

  return {
    title,
    club_id: clubId,
    description,
    event_date: eventDate,
    location,
    aim_objectives: aimObjectives,
    proposed_activity: proposedActivity,
    event_time: eventTime || null,
    number_of_participants: numberOfParticipants,
    budget_estimate: budgetEstimate,
    budget_line_items: budgetLineItems,
    responsible_members: responsibleMembers
  };
}

function readSaveAsDraft(payload = {}) {
  return payload.save_as_draft === true || payload.status === "draft";
}

function validateAdvisorDecisionPayload(payload = {}) {
  const decision = normalizeString(payload.decision);
  const remarks = normalizeString(payload.remarks);
  const fieldErrors = [];

  if (!decision) {
    fieldErrors.push({ field: "decision", message: "decision is required" });
  } else if (!["approve", "reject"].includes(decision)) {
    fieldErrors.push({ field: "decision", message: 'decision must be "approve" or "reject"' });
  }

  if (payload.remarks !== undefined && typeof payload.remarks !== "string") {
    fieldErrors.push({ field: "remarks", message: "remarks must be a string when provided" });
  }

  if (fieldErrors.length) {
    throw new ApiError(400, "Invalid advisor decision payload", "VALIDATION_ERROR", {
      fields: fieldErrors
    });
  }

  return {
    decision,
    remarks: remarks || null
  };
}

module.exports = {
  validateCreateProposalPayload,
  validateDraftProposalPayload,
  readSaveAsDraft,
  validateAdvisorDecisionPayload
};
