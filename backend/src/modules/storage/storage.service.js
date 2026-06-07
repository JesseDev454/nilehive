const path = require("path");
const { db } = require("../../config/db");
const ApiError = require("../../shared/ApiError");

const ALLOWED_BUCKETS = new Set(["club-logos", "event-media", "dues-receipts", "reports"]);
const PUBLIC_BUCKETS = new Set(["club-logos", "event-media"]);
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

  const base64 = String(payload.base64 || "");

  if (!base64) {
    throw new ApiError(400, "Upload file is required", "VALIDATION_ERROR", {
      field: "base64"
    });
  }

  const fileBuffer = Buffer.from(base64, "base64");

  if (fileBuffer.length > 10 * 1024 * 1024) {
    throw new ApiError(400, "Upload file is too large", "VALIDATION_ERROR", {
      field: "base64"
    });
  }

  const uploaded = await database.uploadStorageFile({
    bucket,
    path: storagePath,
    fileBuffer,
    contentType: payload.content_type || "application/octet-stream"
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
