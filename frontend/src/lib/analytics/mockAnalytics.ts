import type { AnalyticsPeriodView, AnalyticsTimeRange } from "./types";
import { emptyAnalyticsView } from "./adapters";

const MOCK_VALUES: Record<AnalyticsTimeRange, Omit<AnalyticsPeriodView, "rangeDays" | "dailyActiveUsers" | "usageByRole" | "operations">> = {
  7: { activeUsers: 342, joinRequests: 38, duesProofs: 29, eventAttendance: 85 },
  30: { activeUsers: 1184, joinRequests: 156, duesProofs: 124, eventAttendance: 340 },
  90: { activeUsers: 2890, joinRequests: 412, duesProofs: 348, eventAttendance: 920 },
};

export function mockAnalyticsSummary(range: AnalyticsTimeRange): AnalyticsPeriodView {
  const empty = emptyAnalyticsView(range);
  const values = MOCK_VALUES[range];
  return {
    ...empty,
    ...values,
    operations: {
      ...empty.operations,
      join_requests_started: values.joinRequests,
      dues_proofs_submitted: values.duesProofs,
      event_check_ins: values.eventAttendance,
    },
  };
}
