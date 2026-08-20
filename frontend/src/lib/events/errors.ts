import { ApiClientError } from "@/lib/api/client";

export type EventsUiErrorKind =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "validation"
  | "network"
  | "server"
  | "unsupported"
  | "unknown";

export interface EventsUiError {
  kind: EventsUiErrorKind;
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

export function normalizeEventsError(error: unknown): EventsUiError {
  if (error instanceof ApiClientError) {
    const kind: EventsUiErrorKind =
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
    if (error.code === "APPROVED_EVENT_NOT_FOUND") {
      message = "This approved event is no longer available.";
    } else if (error.code === "EVENT_CHECK_IN_CLOSED") {
      message = "Event check-in is only available on the event date.";
    } else if (error.code === "EVENT_RSVP_CLOSED") {
      message = "RSVPs are closed for this event.";
    } else if (kind === "conflict") {
      message = "This event record already changed. OneClub refreshed the latest attendance.";
    } else if (kind === "rate_limited") {
      message = error.retryAfter
        ? `Too many event updates. Wait ${error.retryAfter} seconds, then retry.`
        : "Too many event updates. Wait a moment, then retry.";
    } else if (kind === "forbidden") {
      message = "You do not have access to Admin event operations.";
    } else if (kind === "not_found") {
      message = "This approved event is no longer available.";
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
