const path = require("path");
const { db } = require("../../config/db");
const ApiError = require("../../shared/ApiError");

const ALLOWED_BUCKETS = new Set(["club-logos", "club-media", "event-media", "dues-receipts", "reports"]);
const PUBLIC_BUCKETS = new Set(["club-logos", "club-media", "event-media"]);
const PRIVATE_BUCKETS_REQUIRING_SCOPED_FOLDER = new Set(["dues-receipts", "reports"]);

function sanitizePath(value) {
  const normalized = String(value || "").trim().replace(/^\/+|\/+$/g, "");

  if (!normalized || normalized.includes("..") || path.isAbsolute(normalized)) {
    throw new ApiError(400, "Invalid upload path", "INVALID_STORAGE_PATH", {
      field: "path"
    });
  }

  return normalized;
}

function validateBucket(bucket) {
  const normalizedBucket = String(bucket || "").trim();

  if (!ALLOWED_BUCKETS.has(normalizedBucket)) {
    throw new ApiError(400, "Unsupported storage bucket", "INVALID_STORAGE_BUCKET", {
      field: "bucket"
    });
  }

  return normalizedBucket;
}

function validateScopedPath(bucket, storagePath) {
  if (PRIVATE_BUCKETS_REQUIRING_SCOPED_FOLDER.has(bucket) && storagePath.split("/").length < 3) {
    throw new ApiError(400, "This upload needs a club and user folder", "INVALID_STORAGE_PATH", {
      field: "path"
    });
  }
}

function getPublicStorageUrl(bucket, storagePath) {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, "");

  if (!supabaseUrl) {
    return null;
  }

  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${storagePath}`;
}

async function uploadStorageObject(options) {
  const { actor, payload, database = db } = options;

  if (!actor) {
    throw new ApiError(401, "Please sign in to continue", "AUTH_REQUIRED");
  }

  const bucket = validateBucket(payload.bucket);
  const storagePath = sanitizePath(payload.path);
  validateScopedPath(bucket, storagePath);
  const contentType = payload.content_type || "application/octet-stream";

  if (bucket === "club-logos" || bucket === "club-media") {
    const clubId = storagePath.split("/")[0];
    const canManageClub = actor.role === "admin" || (actor.role === "president" && actor.clubId === clubId);

    if (!canManageClub) {
      throw new ApiError(403, "You can only upload media for your assigned club", "FORBIDDEN");
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(contentType)) {
      throw new ApiError(400, "Club media must be a JPEG, PNG, or WebP image", "VALIDATION_ERROR", {
        field: "content_type"
      });
    }
  }

  const base64 = String(payload.base64 || "");

  if (!base64) {
    throw new ApiError(400, "Upload file is required", "VALIDATION_ERROR", {
      field: "base64"
    });
  }

  const fileBuffer = Buffer.from(base64, "base64");

  const maxFileSize = bucket === "club-logos" || bucket === "club-media"
    ? 5 * 1024 * 1024
    : 10 * 1024 * 1024;

  if (fileBuffer.length > maxFileSize) {
    throw new ApiError(400, "Upload file is too large", "VALIDATION_ERROR", {
      field: "base64"
    });
  }

  const uploaded = await database.uploadStorageFile({
    bucket,
    path: storagePath,
    fileBuffer,
    contentType
  });

  const uploadedPath = uploaded.path || storagePath;
  const signedUrl = PUBLIC_BUCKETS.has(bucket)
    ? getPublicStorageUrl(bucket, uploadedPath)
    : await database.createStorageSignedUrl({ bucket, path: uploadedPath });

  return {
    bucket,
    path: uploadedPath,
    url: signedUrl
  };
}

async function createSignedStorageUrl(options) {
  const { actor, payload, database = db } = options;

  if (!actor) {
    throw new ApiError(401, "Please sign in to continue", "AUTH_REQUIRED");
  }

  const bucket = validateBucket(payload.bucket);
  const storagePath = sanitizePath(payload.path);

  if (PUBLIC_BUCKETS.has(bucket)) {
    return {
      url: getPublicStorageUrl(bucket, storagePath)
    };
  }

  return {
    url: await database.createStorageSignedUrl({ bucket, path: storagePath })
  };
}

module.exports = {
  createSignedStorageUrl,
  uploadStorageObject
};
