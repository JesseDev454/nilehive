const ApiError = require("../../shared/ApiError");

const CLUB_CATEGORIES = new Set([
  "Tech",
  "Gaming",
  "Music",
  "Entrepreneurship",
  "Sports",
  "Volunteering",
  "Academics",
  "Media",
  "Faith",
  "Arts",
  "Leadership",
  "Wellness",
  "Culture",
  "Other"
]);
const SOCIAL_LINK_KEYS = new Set(["instagram", "linkedin", "x", "facebook", "youtube", "tiktok"]);

function readString(payload, fieldName) {
  return typeof payload[fieldName] === "string" ? payload[fieldName].trim() : "";
}

function readOptionalString(payload, fieldName) {
  return readString(payload, fieldName) || null;
}

function validateUrl(value, fieldName) {
  if (!value) {
    return null;
  }

  let parsed;

  try {
    parsed = new URL(value);
  } catch {
    throw new ApiError(400, "Enter a valid web address", "VALIDATION_ERROR", { field: fieldName });
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new ApiError(400, "Web addresses must use http or https", "VALIDATION_ERROR", { field: fieldName });
  }

  return parsed.toString();
}

function readCategories(payload) {
  if (!Array.isArray(payload.categories)) {
    throw new ApiError(400, "Categories must be a list", "VALIDATION_ERROR", { field: "categories" });
  }

  const categories = Array.from(new Set(payload.categories.map((value) => String(value).trim()).filter(Boolean)));
  const invalidCategory = categories.find((category) => !CLUB_CATEGORIES.has(category));

  if (invalidCategory) {
    throw new ApiError(400, `Unsupported club category: ${invalidCategory}`, "VALIDATION_ERROR", {
      field: "categories"
    });
  }

  if (categories.length > 5) {
    throw new ApiError(400, "Choose no more than 5 categories", "VALIDATION_ERROR", { field: "categories" });
  }

  return categories;
}

function readSocialLinks(payload) {
  if (!payload.social_links || typeof payload.social_links !== "object" || Array.isArray(payload.social_links)) {
    throw new ApiError(400, "Social links must be an object", "VALIDATION_ERROR", { field: "social_links" });
  }

  return Object.entries(payload.social_links).reduce((links, [key, value]) => {
    if (!SOCIAL_LINK_KEYS.has(key)) {
      throw new ApiError(400, `Unsupported social link: ${key}`, "VALIDATION_ERROR", {
        field: "social_links"
      });
    }

    const normalizedValue = typeof value === "string" ? value.trim() : "";

    if (normalizedValue) {
      links[key] = validateUrl(normalizedValue, `social_links.${key}`);
    }

    return links;
  }, {});
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

  if (!partial || payload.categories !== undefined) {
    update.categories = payload.categories === undefined ? [] : readCategories(payload);
  }

  if (!partial || payload.logo_path !== undefined) {
    update.logo_path = readOptionalString(payload, "logo_path");
  }

  if (!partial || payload.website_url !== undefined) {
    update.website_url = validateUrl(readOptionalString(payload, "website_url"), "website_url");
  }

  if (!partial || payload.social_links !== undefined) {
    update.social_links = payload.social_links === undefined ? {} : readSocialLinks(payload);
  }

  return update;
}

function validateClubProfilePayload(payload = {}) {
  const allowedFields = new Set([
    "description",
    "categories",
    "logo_path",
    "website_url",
    "social_links",
    "whatsapp_group_name",
    "whatsapp_onboarding_notes"
  ]);
  const unsupportedField = Object.keys(payload).find((field) => !allowedFields.has(field));

  if (unsupportedField) {
    throw new ApiError(400, `Club profile updates cannot change ${unsupportedField}`, "VALIDATION_ERROR", {
      field: unsupportedField
    });
  }

  const update = validateClubPayload(payload, { partial: true });

  if (Object.keys(update).length === 0) {
    throw new ApiError(400, "Provide at least one club profile field", "VALIDATION_ERROR");
  }

  return update;
}

function validateClubMediaPayload(payload = {}, { partial = false } = {}) {
  const update = {};

  if (!partial || payload.storage_path !== undefined) {
    const storagePath = readString(payload, "storage_path");

    if (!storagePath || storagePath.includes("..") || storagePath.startsWith("/")) {
      throw new ApiError(400, "A valid gallery image path is required", "VALIDATION_ERROR", {
        field: "storage_path"
      });
    }

    update.storage_path = storagePath;
  }

  if (!partial || payload.caption !== undefined) {
    const caption = readOptionalString(payload, "caption");

    if (caption && caption.length > 180) {
      throw new ApiError(400, "Gallery captions must be 180 characters or fewer", "VALIDATION_ERROR", {
        field: "caption"
      });
    }

    update.caption = caption;
  }

  if (!partial || payload.display_order !== undefined) {
    const displayOrder = Number(payload.display_order ?? 0);

    if (!Number.isInteger(displayOrder) || displayOrder < 0 || displayOrder > 999) {
      throw new ApiError(400, "Display order must be between 0 and 999", "VALIDATION_ERROR", {
        field: "display_order"
      });
    }

    update.display_order = displayOrder;
  }

  return update;
}

module.exports = {
  CLUB_CATEGORIES,
  validateClubMediaPayload,
  validateClubPayload,
  validateClubProfilePayload
};
