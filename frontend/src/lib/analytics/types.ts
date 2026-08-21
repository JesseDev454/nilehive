export type AnalyticsTimeRange = 7 | 30 | 90;

export interface AnalyticsDailyActive {
  date: string;
  active_users: number;
}

export interface AnalyticsOperations {
  join_requests_started: number;
  join_requests_completed: number;
  dues_proofs_submitted: number;
  dues_proofs_verified: number;
  event_rsvps: number;
  event_check_ins: number;
  feedback_submissions: number;
}

export interface AnalyticsSummaryRecord {
  range_days: AnalyticsTimeRange;
  active_users: number;
  daily_active_users: AnalyticsDailyActive[];
  usage_by_role: Record<string, number>;
  features: Record<string, number>;
  operations: AnalyticsOperations;
}

export interface MetricDefinition {
  id: "active_users" | "join_requests" | "dues_proofs" | "event_attendance";
  label: string;
  shortLabel: string;
  description: string;
  source: string;
  methodology: string;
  relevance: string;
}

export interface AnalyticsPeriodView {
  rangeDays: AnalyticsTimeRange;
  activeUsers: number;
  joinRequests: number;
  duesProofs: number;
  eventAttendance: number;
  dailyActiveUsers: AnalyticsDailyActive[];
  usageByRole: Record<string, number>;
  operations: AnalyticsOperations;
}
