import { safeReturnTo } from "@/lib/workspaceRoutes";
import {
  clearCsrfToken,
  getCachedCsrfToken,
  getCsrfInFlight,
  setCachedCsrfToken,
  setCsrfInFlight,
} from "./csrf";

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

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const CSRF_RETRY_CODES = new Set(["CSRF_TOKEN_REQUIRED", "CSRF_TOKEN_INVALID", "CSRF_TOKEN_EXPIRED"]);

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

export function isOwnApiUrl(url: string): boolean {
  const base = getApiBaseUrl();
  if (base.startsWith("/")) {
    if (/^https?:\/\//i.test(url)) {
      return false;
    }
    try {
      const parsed = new URL(url, "http://oneclub.local");
      return parsed.pathname.startsWith(base);
    } catch {
      return url.startsWith(base);
    }
  }
  return url.startsWith(base);
}

export function shouldAttachCsrf(method: string, url: string): boolean {
  return UNSAFE_METHODS.has(method.toUpperCase()) && isOwnApiUrl(url);
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
  body?: unknown;
  signal?: AbortSignal;
  json?: boolean;
  csrf?: boolean;
  csrfRetried?: boolean;
  headers?: HeadersInit;
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

export async function getCsrfToken(signal?: AbortSignal): Promise<string> {
  const cached = getCachedCsrfToken();
  if (cached) return cached;

  const existing = getCsrfInFlight();
  if (existing) return existing;

  const request = (async () => {
    const payload = await apiRequest<{ data: { csrf_token: string } }>("/auth/csrf", {
      signal,
      csrf: false,
    });
    const token = payload.data?.csrf_token;
    if (!token) {
      throw new ApiClientError(500, "CSRF_TOKEN_MISSING", "OneClub could not issue a security token.");
    }
    setCachedCsrfToken(token);
    return token;
  })();

  setCsrfInFlight(request);
  try {
    return await request;
  } finally {
    setCsrfInFlight(null);
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, signal, json = true, csrf, csrfRetried = false } = options;
  const url = joinApiPath(path);
  const headers = new Headers(options.headers);

  if (json && body !== undefined) {
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");
  } else if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const attachCsrf = csrf !== false && shouldAttachCsrf(method, url);
  if (attachCsrf) {
    headers.set("X-CSRF-Token", await getCsrfToken(signal));
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      credentials: "include",
      signal,
      body: json && body !== undefined ? JSON.stringify(body) : (body as BodyInit | undefined),
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

    if (response.status === 401) {
      clearCsrfToken();
    }

    if (attachCsrf && CSRF_RETRY_CODES.has(code) && !csrfRetried) {
      clearCsrfToken();
      return apiRequest<T>(path, { ...options, csrfRetried: true });
    }

    throw new ApiClientError(response.status, code, message, errorPayload?.error?.details);
  }

  return payload as T;
}

export function campusOneLoginUrl(returnTo: string): string {
  const params = new URLSearchParams({ return_to: safeReturnTo(returnTo) });
  return joinApiPath(`/auth/campus-one/login?${params.toString()}`);
}

export { clearCsrfToken };
