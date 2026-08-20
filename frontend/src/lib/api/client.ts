import { safeReturnTo } from "@/lib/workspaceRoutes";

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getApiBaseUrl(): string {
  const raw = String(import.meta.env.VITE_API_BASE_URL ?? "").trim();
  if (!raw) return "/api/v1";

  const origin = trimTrailingSlash(raw);
  return origin.endsWith("/api/v1") ? origin : `${origin}/api/v1`;
}

function joinApiPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalized}`;
}

interface RequestOptions {
  method?: "GET" | "POST";
  body?: unknown;
  signal?: AbortSignal;
  json?: boolean;
}

interface ErrorPayload {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, signal, json = true } = options;
  const headers = new Headers();

  if (json && body !== undefined) {
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");
  } else {
    headers.set("Accept", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(joinApiPath(path), {
      method,
      headers,
      credentials: "include",
      signal,
      body: json && body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new ApiClientError(0, "NETWORK_ERROR", "OneClub could not reach the campus service.");
  }

  const payload = await parseBody(response);

  if (!response.ok) {
    const errorPayload = payload as ErrorPayload | null;
    const code = errorPayload?.error?.code || `HTTP_${response.status}`;
    const message = errorPayload?.error?.message || "Request failed";
    throw new ApiClientError(response.status, code, message, errorPayload?.error?.details);
  }

  return payload as T;
}

export function campusOneLoginUrl(returnTo: string): string {
  const params = new URLSearchParams({ return_to: safeReturnTo(returnTo) });
  return joinApiPath(`/auth/campus-one/login?${params.toString()}`);
}
