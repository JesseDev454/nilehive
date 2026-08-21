import type {
  AnalyticsDailyActive,
  AnalyticsOperations,
  AnalyticsPeriodView,
  AnalyticsSummaryRecord,
  AnalyticsTimeRange,
} from "./types";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function asNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  }
  return 0;
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function asRange(value: unknown): AnalyticsTimeRange {
  const parsed = Number(value);
  return parsed === 7 || parsed === 90 ? parsed : 30;
}

function asCountMap(value: unknown): Record<string, number> {
  const record = asRecord(value);
  if (!record) return {};
  return Object.fromEntries(
    Object.entries(record).map(([key, count]) => [key, asNumber(count)]),
  );
}

function asDaily(value: unknown): AnalyticsDailyActive[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const record = asRecord(item);
      const date = asString(record?.date);
      if (!date) return null;
      return { date, active_users: asNumber(record?.active_users) };
    })
    .filter((item): item is AnalyticsDailyActive => Boolean(item));
}

function asOperations(value: unknown): AnalyticsOperations {
  const record = asRecord(value) ?? {};
  return {
    join_requests_started: asNumber(record.join_requests_started),
    join_requests_completed: asNumber(record.join_requests_completed),
    dues_proofs_submitted: asNumber(record.dues_proofs_submitted),
    dues_proofs_verified: asNumber(record.dues_proofs_verified),
    event_rsvps: asNumber(record.event_rsvps),
    event_check_ins: asNumber(record.event_check_ins),
    feedback_submissions: asNumber(record.feedback_submissions),
  };
}

export function adaptAnalyticsSummary(value: unknown): AnalyticsSummaryRecord | null {
  const record = asRecord(value);
  if (!record) return null;
  const operations = asOperations(record.operations);
  return {
    range_days: asRange(record.range_days),
    active_users: asNumber(record.active_users),
    daily_active_users: asDaily(record.daily_active_users),
    usage_by_role: asCountMap(record.usage_by_role),
    features: asCountMap(record.features),
    operations,
  };
}

export function toAnalyticsPeriodView(summary: AnalyticsSummaryRecord): AnalyticsPeriodView {
  return {
    rangeDays: summary.range_days,
    activeUsers: summary.active_users,
    joinRequests: summary.operations.join_requests_started,
    duesProofs: summary.operations.dues_proofs_submitted,
    eventAttendance: summary.operations.event_check_ins,
    dailyActiveUsers: summary.daily_active_users,
    usageByRole: summary.usage_by_role,
    operations: summary.operations,
  };
}

export function emptyAnalyticsView(range: AnalyticsTimeRange): AnalyticsPeriodView {
  return {
    rangeDays: range,
    activeUsers: 0,
    joinRequests: 0,
    duesProofs: 0,
    eventAttendance: 0,
    dailyActiveUsers: [],
    usageByRole: {},
    operations: {
      join_requests_started: 0,
      join_requests_completed: 0,
      dues_proofs_submitted: 0,
      dues_proofs_verified: 0,
      event_rsvps: 0,
      event_check_ins: 0,
      feedback_submissions: 0,
    },
  };
}
