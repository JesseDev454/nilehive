import { ApiClientError } from "@/lib/api/client";

export type AnalyticsUiErrorKind =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "validation"
  | "network"
  | "server"
  | "malformed"
  | "unknown";

export interface AnalyticsUiError {
  kind: AnalyticsUiErrorKind;
  status: number;
  code: string;
  message: string;
  retryAfter: number | null;
}

export function normalizeAnalyticsError(error: unknown): AnalyticsUiError {
  if (error instanceof ApiClientError) {
    const kind: AnalyticsUiErrorKind =
      error.status === 401
        ? "unauthorized"
        : error.status === 403
          ? "forbidden"
          : error.status === 404
            ? "not_found"
            : error.status === 409
              ? "conflict"
              : error.status === 429
                ? "rate_limited"
                : error.status === 400 || error.status === 422
                  ? "validation"
                  : error.status === 0 || error.code === "NETWORK_ERROR"
                    ? "network"
                    : error.status >= 500
                      ? "server"
                      : "unknown";

    let message = error.message;
    if (kind === "forbidden") {
      message = "Only a Club Services Admin can open Directorate Analytics.";
    } else if (kind === "rate_limited") {
      message = error.retryAfter
        ? `Too many analytics requests. Wait ${error.retryAfter} seconds, then retry.`
        : "Too many analytics requests. Wait a moment, then retry.";
    } else if (kind === "network") {
      message = "OneClub could not reach the campus service.";
    } else if (kind === "server") {
      message = "OneClub could not complete this request. Retry when you are ready.";
    }

    return { kind, status: error.status, code: error.code, message, retryAfter: error.retryAfter };
  }

  return {
    kind: "malformed",
    status: 0,
    code: "UNEXPECTED",
    message: "Analytics data could not be displayed. Retry when you are ready.",
    retryAfter: null,
  };
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}
