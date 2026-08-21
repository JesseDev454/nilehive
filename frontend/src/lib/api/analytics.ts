import { apiRequest } from "./client";
import { adaptAnalyticsSummary } from "@/lib/analytics/adapters";
import type { AnalyticsSummaryRecord, AnalyticsTimeRange } from "@/lib/analytics/types";

export async function getAdminAnalytics(
  days: AnalyticsTimeRange = 30,
  signal?: AbortSignal,
): Promise<AnalyticsSummaryRecord> {
  const payload = await apiRequest<{ data: unknown }>(`/analytics/admin?days=${days}`, { signal });
  const summary = adaptAnalyticsSummary(payload.data);
  if (!summary) {
    throw new Error("Analytics payload was missing required fields");
  }
  return summary;
}
