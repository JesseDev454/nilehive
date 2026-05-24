import { createStorageSignedUrl, uploadStorageObject } from "@/lib/api";
import { usesCookieAuthProvider } from "@/lib/env";
import { supabase } from "@/lib/supabase";

export type StorageBucket = "club-logos" | "event-media" | "dues-receipts" | "reports";

export interface UploadStorageFileOptions {
  folder?: string;
  upsert?: boolean;
}

export interface UploadStorageFileResult {
  bucket: StorageBucket;
  path: string;
  url: string;
}

const PUBLIC_BUCKETS = new Set<StorageBucket>(["club-logos", "event-media"]);

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      resolve(result.includes(",") ? result.split(",").pop() || "" : result);
    };
    reader.onerror = () => reject(new Error("Could not read upload file"));
    reader.readAsDataURL(file);
  });
}

function sanitizeFileName(fileName: string) {
  return fileName
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .toLowerCase();
}

function toStoragePath(file: File, folder?: string) {
  const safeName = sanitizeFileName(file.name || "upload.bin") || "upload.bin";
  const suffix = Math.random().toString(36).slice(2, 10);
  const normalizedFolder = folder?.trim().replace(/^\/+|\/+$/g, "");
  const baseName = `${Date.now()}-${suffix}-${safeName}`;

  return normalizedFolder ? `${normalizedFolder}/${baseName}` : baseName;
}

export async function uploadStorageFile(
  file: File,
  bucket: StorageBucket,
  options: UploadStorageFileOptions = {}
): Promise<UploadStorageFileResult> {
  const normalizedFolder = options.folder?.trim().replace(/^\/+|\/+$/g, "") || "";

  if (!normalizedFolder) {
    throw new Error(`A folder path is required for uploads to ${bucket}`);
  }

  if (["dues-receipts", "reports"].includes(bucket) && normalizedFolder.split("/").length < 2) {
    throw new Error(`Uploads to ${bucket} require at least 2 folder segments`);
  }

  const storagePath = toStoragePath(file, options.folder);

  if (usesCookieAuthProvider()) {
    const upload = await uploadStorageObject({
      bucket,
      path: storagePath,
      content_type: file.type || "application/octet-stream",
      base64: await fileToBase64(file)
    });

    return {
      bucket,
      path: upload.path,
      url: upload.url || ""
    };
  }

  const { data, error } = await supabase.storage.from(bucket).upload(storagePath, file, {
    cacheControl: "3600",
    upsert: options.upsert ?? false,
    contentType: file.type || "application/octet-stream"
  });

  if (error) {
    throw new Error(error.message || "Upload failed");
  }

  if (PUBLIC_BUCKETS.has(bucket)) {
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

    return {
      bucket,
      path: data.path,
      url: publicUrlData.publicUrl
    };
  }

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(data.path, 60 * 60);

  if (signedUrlError) {
    throw new Error(signedUrlError.message || "Could not create signed URL");
  }

  return {
    bucket,
    path: data.path,
    url: signedUrlData.signedUrl
  };
}

export async function resolveStorageFileUrl(bucket: StorageBucket, value: string | null | undefined) {
  if (!value) {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (PUBLIC_BUCKETS.has(bucket)) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(value);
    return data.publicUrl;
  }

  if (usesCookieAuthProvider()) {
    return createStorageSignedUrl({ bucket, path: value });
  }

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(value, 60 * 60);

  if (error) {
    return null;
  }

  return data.signedUrl;
}
