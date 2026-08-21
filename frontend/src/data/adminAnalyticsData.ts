export type { AnalyticsTimeRange, MetricDefinition } from "@/lib/analytics/types";
export { mockAnalyticsSummary } from "@/lib/analytics/mockAnalytics";

import type { AnalyticsTimeRange, MetricDefinition } from "@/lib/analytics/types";
import { mockAnalyticsSummary } from "@/lib/analytics/mockAnalytics";

export const METRIC_DEFINITIONS: Record<MetricDefinition["id"], MetricDefinition> = {
  active_users: {
    id: "active_users",
    label: "Active Campus Users",
    shortLabel: "Active Accounts",
    description: "Unique OneClub accounts with recorded daily activity during the selected window.",
    source: "usage_daily_active_users",
    methodology: "Count of distinct user IDs in the analytics activity window. This is not a browsing history and does not include personal device telemetry.",
    relevance: "Measures overall campus digital platform adoption and continuous student engagement."
  },
  join_requests: {
    id: "join_requests",
    label: "Club Join Requests",
    shortLabel: "Join Applications",
    description: "Membership applications created during the selected window.",
    source: "membership_requests.created_at",
    methodology: "Total count of membership request records whose created timestamp falls in the selected range.",
    relevance: "Reflects student recruitment momentum and interest in co-curricular activities."
  },
  dues_proofs: {
    id: "dues_proofs",
    label: "Dues Payment Proofs",
    shortLabel: "Payment Receipts",
    description: "Dues proofs submitted during the selected window.",
    source: "due_payments.submitted_at",
    methodology: "Total count of dues payment records with a submitted or created timestamp in the selected range.",
    relevance: "Tracks compliance with semester club dues requirements and financial clearance."
  },
  event_attendance: {
    id: "event_attendance",
    label: "Campus Event Attendance",
    shortLabel: "Event Check-Ins",
    description: "Verified check-ins recorded at approved campus events during the selected window.",
    source: "event_attendance.checked_in_at",
    methodology: "Total number of attendance rows with attended = true and a check-in timestamp in the selected range.",
    relevance: "Measures real-world student participation in extracurricular campus programming."
  }
};

export interface AnalyticsPeriodData {
  activeUsers: number;
  joinRequests: number;
  duesProofs: number;
  eventAttendance: number;
}

export const DETERMINISTIC_ANALYTICS: Record<AnalyticsTimeRange, AnalyticsPeriodData> = {
  7: {
    activeUsers: mockAnalyticsSummary(7).activeUsers,
    joinRequests: mockAnalyticsSummary(7).joinRequests,
    duesProofs: mockAnalyticsSummary(7).duesProofs,
    eventAttendance: mockAnalyticsSummary(7).eventAttendance
  },
  30: {
    activeUsers: mockAnalyticsSummary(30).activeUsers,
    joinRequests: mockAnalyticsSummary(30).joinRequests,
    duesProofs: mockAnalyticsSummary(30).duesProofs,
    eventAttendance: mockAnalyticsSummary(30).eventAttendance
  },
  90: {
    activeUsers: mockAnalyticsSummary(90).activeUsers,
    joinRequests: mockAnalyticsSummary(90).joinRequests,
    duesProofs: mockAnalyticsSummary(90).duesProofs,
    eventAttendance: mockAnalyticsSummary(90).eventAttendance
  }
};
