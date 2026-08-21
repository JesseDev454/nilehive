import { ApiClientError } from "@/lib/api/client";

export type DashboardUiErrorKind =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "rate_limited"
  | "validation"
  | "network"
  | "server"
  | "unknown";

export interface DashboardUiError {
  kind: DashboardUiErrorKind;
  status: number;
  code: string;
  message: string;
  retryAfter: number | null;
}

export function normalizeDashboardError(error: unknown): DashboardUiError {
  if (error instanceof ApiClientError) {
    const kind: DashboardUiErrorKind =
      error.status === 401
        ? "unauthorized"
        : error.status === 403
          ? "forbidden"
          : error.status === 404
            ? "not_found"
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
      message = "You do not have access to the Admin operations dashboard.";
    } else if (kind === "rate_limited") {
      message = error.retryAfter
        ? `Too many dashboard requests. Wait ${error.retryAfter} seconds, then retry.`
        : "Too many dashboard requests. Wait a moment, then retry.";
    } else if (kind === "network") {
      message = "OneClub could not reach the campus service.";
    } else if (kind === "server") {
      message = "Campus operations could not be loaded. Retry when you are ready.";
    }

    return { kind, status: error.status, code: error.code, message, retryAfter: error.retryAfter };
  }

  return {
    kind: "unknown",
    status: 0,
    code: "UNEXPECTED",
    message: "OneClub could not complete this request.",
    retryAfter: null,
  };
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}
