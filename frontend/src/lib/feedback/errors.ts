import { ApiClientError } from "@/lib/api/client";

export type FeedbackUiErrorKind =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "validation"
  | "network"
  | "server"
  | "unknown";

export interface FeedbackUiError {
  kind: FeedbackUiErrorKind;
  status: number;
  code: string;
  message: string;
  retryAfter: number | null;
}

export function normalizeFeedbackError(error: unknown): FeedbackUiError {
  if (error instanceof ApiClientError) {
    const kind: FeedbackUiErrorKind =
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
      message = "Only a Club Services Admin can open the global feedback inbox.";
    } else if (kind === "not_found") {
      message = "This feedback record is no longer available.";
    } else if (kind === "rate_limited") {
      message = error.retryAfter
        ? `Too many feedback requests. Wait ${error.retryAfter} seconds, then retry.`
        : "Too many feedback requests. Wait a moment, then retry.";
    } else if (kind === "network") {
      message = "OneClub could not reach the campus service.";
    } else if (kind === "server") {
      message = "OneClub could not complete this request. Retry when you are ready.";
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
