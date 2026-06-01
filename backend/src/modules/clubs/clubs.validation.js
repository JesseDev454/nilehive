const ApiError = require("../../shared/ApiError");

function readString(payload, fieldName) {
  return typeof payload[fieldName] === "string" ? payload[fieldName].trim() : "";
}

function readOptionalString(payload, fieldName) {
  return readString(payload, fieldName) || null;
}

function validateClubPayload(payload = {}, { partial = false } = {}) {
  const update = {};
  const name = readString(payload, "name");
  const description = readString(payload, "description");
  const code = readString(payload, "code").toUpperCase();

  if (!partial || payload.name !== undefined) {
    if (!name) {
      throw new ApiError(400, "Club name is required", "VALIDATION_ERROR", { field: "name" });
    }
    update.name = name;
  }

  if (!partial || payload.description !== undefined) {
    if (!description) {
      throw new ApiError(400, "Club description is required", "VALIDATION_ERROR", { field: "description" });
    }
    update.description = description;
  }

  if (!partial || payload.code !== undefined) {
    update.code = code || null;
  }

  if (!partial || payload.is_public_signup !== undefined) {
    update.is_public_signup = payload.is_public_signup !== false;
  }

  if (!partial || payload.whatsapp_group_name !== undefined) {
    update.whatsapp_group_name = readOptionalString(payload, "whatsapp_group_name");
  }

  if (!partial || payload.whatsapp_onboarding_notes !== undefined) {
    update.whatsapp_onboarding_notes = readOptionalString(payload, "whatsapp_onboarding_notes");
  }

  return update;
}

module.exports = { validateClubPayload };
