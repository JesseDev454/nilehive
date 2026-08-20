import { ApiClientError } from "@/lib/api/client";
import type { PresidentConflictDetails } from "./types";

export type PeopleUiErrorKind =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "validation"
  | "network"
  | "server"
  | "unknown";

export interface PeopleUiError {
  kind: PeopleUiErrorKind;
  status: number;
  code: string;
  message: string;
  field?: string;
  retryAfter: number | null;
  currentPresident?: PresidentConflictDetails | null;
}

function fieldFromDetails(details: unknown): string | undefined {
  if (!details || typeof details !== "object") return undefined;
  const record = details as Record<string, unknown>;
  if (typeof record.field === "string") return record.field;
  if (Array.isArray(record.fields) && typeof record.fields[0] === "string") return record.fields[0];
  return undefined;
}

function presidentFromDetails(details: unknown): PresidentConflictDetails | null {
  if (!details || typeof details !== "object") return null;
  const record = details as Record<string, unknown>;
  const current = record.current_president;
  if (!current || typeof current !== "object") return null;
  const president = current as Record<string, unknown>;
  if (typeof president.id !== "string" || !president.id) return null;
  return {
    id: president.id,
    full_name: typeof president.full_name === "string" ? president.full_name : null,
    student_id: typeof president.student_id === "string" ? president.student_id : null,
    club_id: typeof president.club_id === "string" ? president.club_id : null,
  };
}

export function normalizePeopleError(error: unknown): PeopleUiError {
  if (error instanceof ApiClientError) {
    const kind: PeopleUiErrorKind =
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
    if (error.code === "PRESIDENT_ALREADY_EXISTS") {
      message = "This club already has a president. Confirm replacement before continuing.";
    } else if (error.code === "ADVISOR_ALREADY_ASSIGNED") {
      message = "This advisor is already assigned to the selected club.";
    } else if (kind === "conflict") {
      message = "This profile or assignment was already changed. OneClub refreshed the latest record.";
    } else if (kind === "rate_limited") {
      message = error.retryAfter
        ? `Too many People updates. Wait ${error.retryAfter} seconds, then retry.`
        : "Too many People updates. Wait a moment, then retry.";
    } else if (kind === "forbidden") {
      message = "You do not have access to Admin People.";
    } else if (kind === "not_found") {
      message = "This person is no longer available.";
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
      currentPresident: presidentFromDetails(error.details),
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
