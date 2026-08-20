import { ApiClientError } from "@/lib/api/client";

export type ClubsUiErrorKind =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "validation"
  | "network"
  | "server"
  | "unknown";

export interface ClubsUiError {
  kind: ClubsUiErrorKind;
  status: number;
  code: string;
  message: string;
  field?: string;
  retryAfter: number | null;
}

function fieldFromDetails(details: unknown): string | undefined {
  if (!details || typeof details !== "object") return undefined;
  const record = details as Record<string, unknown>;
  if (typeof record.field === "string") return record.field;
  if (Array.isArray(record.fields) && typeof record.fields[0] === "string") return record.fields[0];
  return undefined;
}

export function normalizeClubsError(error: unknown): ClubsUiError {
  if (error instanceof ApiClientError) {
    const kind: ClubsUiErrorKind =
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
    if (error.code === "CLUB_ALREADY_EXISTS") {
      message = "A club with this name or code already exists.";
    } else if (error.code === "CLUB_NOT_FOUND") {
      message = "This club is no longer available.";
    } else if (kind === "conflict") {
      message = "This club was already changed. OneClub refreshed the latest record.";
    } else if (kind === "rate_limited") {
      message = error.retryAfter
        ? `Too many club updates. Wait ${error.retryAfter} seconds, then retry.`
        : "Too many club updates. Wait a moment, then retry.";
    } else if (kind === "forbidden") {
      message = "You do not have access to Admin club management.";
    } else if (kind === "not_found") {
      message = "This club is no longer available.";
    } else if (kind === "network") {
      message = "OneClub could not reach the campus service.";
    } else if (kind === "server") {
      message = "OneClub could not complete this request. Retry when you are ready.";
    }

    return {
      kind,
      status: error.status,
      code: error.code,
      message,
      field: fieldFromDetails(error.details),
      retryAfter: error.retryAfter,
    };
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
