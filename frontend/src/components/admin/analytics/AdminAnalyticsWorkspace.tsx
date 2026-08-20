import { useState } from "react";
import { DETERMINISTIC_ANALYTICS, METRIC_DEFINITIONS, type AnalyticsTimeRange, type MetricDefinition } from "@/data/adminAnalyticsData";
import { AdminAnalyticsHeader } from "./AdminAnalyticsHeader";
import { AdminAnalyticsMetricCard } from "./AdminAnalyticsMetricCard";
import { AdminAnalyticsMetricModal } from "./AdminAnalyticsMetricModal";

export function AdminAnalyticsWorkspace() {
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>(30);
  const [inspectingMetric, setInspectingMetric] = useState<MetricDefinition | null>(null);
  const data = DETERMINISTIC_ANALYTICS[timeRange];
  const cards = [
    { definition: METRIC_DEFINITIONS.active_users, value: data.activeUsers },
    { definition: METRIC_DEFINITIONS.join_requests, value: data.joinRequests },
    { definition: METRIC_DEFINITIONS.dues_proofs, value: data.duesProofs },
    { definition: METRIC_DEFINITIONS.event_attendance, value: data.eventAttendance },
  ];

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6 pb-16">
      <AdminAnalyticsHeader timeRange={timeRange} onTimeRangeChange={setTimeRange} isFetching={false} />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {cards.map(({ definition, value }) => (
          <AdminAnalyticsMetricCard key={definition.id} definition={definition} value={value} timeRange={timeRange} onInspect={setInspectingMetric} />
        ))}
      </div>
      <AdminAnalyticsMetricModal
        definition={inspectingMetric}
        timeRange={timeRange}
        open={Boolean(inspectingMetric)}
        onOpenChange={(open) => !open && setInspectingMetric(null)}
      />
    </section>
  );
}
