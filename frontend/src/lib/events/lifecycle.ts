const DEFAULT_EVENT_TIME_ZONE = "Africa/Lagos";

export type EventLifecycle = "happening_today" | "upcoming" | "past";

export function getDateStringInTimeZone(
  date = new Date(),
  timeZone = DEFAULT_EVENT_TIME_ZONE,
): string {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function normalizeEventDate(value: string | null | undefined): string | null {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, 10) : null;
}

export function getEventLifecycle(
  eventDate: string | null | undefined,
  now = new Date(),
  todayOverride?: string | null,
): EventLifecycle {
  const normalizedEventDate = normalizeEventDate(eventDate);
  if (!normalizedEventDate) return "upcoming";

  const today = todayOverride || getDateStringInTimeZone(now);
  if (normalizedEventDate < today) return "past";
  if (normalizedEventDate === today) return "happening_today";
  return "upcoming";
}

export function formatEventTime(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 5);
}

export function buildEventCheckInPath(proposalId: string): string {
  return `/check-in?proposal=${encodeURIComponent(proposalId)}`;
}
