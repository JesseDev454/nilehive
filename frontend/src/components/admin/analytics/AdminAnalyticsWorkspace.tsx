import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { METRIC_DEFINITIONS, type MetricDefinition } from "@/data/adminAnalyticsData";
import { AdminAnalyticsHeader } from "./AdminAnalyticsHeader";
import { AdminAnalyticsMetricCard } from "./AdminAnalyticsMetricCard";
import { AdminAnalyticsMetricModal } from "./AdminAnalyticsMetricModal";
import { useAdminAnalyticsData } from "./useAdminAnalyticsData";
import { Button } from "@/components/ui/button";

export function AdminAnalyticsWorkspace() {
  const { reportAuthFailure } = useAuth();
  const analytics = useAdminAnalyticsData(reportAuthFailure);
  const [inspectingMetric, setInspectingMetric] = useState<MetricDefinition | null>(null);
  const cards = [
    { definition: METRIC_DEFINITIONS.active_users, value: analytics.data.activeUsers },
    { definition: METRIC_DEFINITIONS.join_requests, value: analytics.data.joinRequests },
    { definition: METRIC_DEFINITIONS.dues_proofs, value: analytics.data.duesProofs },
    { definition: METRIC_DEFINITIONS.event_attendance, value: analytics.data.eventAttendance },
  ];
  const showCards = analytics.status === "ready" || analytics.status === "refreshing";

  return (
    <section
      className="mx-auto w-full max-w-5xl space-y-6 pb-16"
      data-analytics-source={analytics.source}
    >
      <AdminAnalyticsHeader
        timeRange={analytics.range}
        onTimeRangeChange={analytics.changeRange}
        isFetching={analytics.isFetching}
      />

      {analytics.status === "loading" ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center" role="status" aria-live="polite">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          </div>
          <h2 className="mt-3 text-sm font-semibold text-foreground">Loading analytics</h2>
          <p className="mt-1 text-xs text-muted-foreground">Fetching aggregate Directorate counts.</p>
        </div>
      ) : null}

      {analytics.status === "forbidden" ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center" role="alert">
          <AlertCircle className="mx-auto h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <h2 className="mt-3 text-sm font-semibold text-foreground">No access to Analytics</h2>
          <p className="mt-1 text-xs text-muted-foreground">Only a Club Services Admin can open Directorate Analytics.</p>
        </div>
      ) : null}

      {analytics.status === "error" ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center" role="alert">
          <AlertCircle className="mx-auto h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <h2 className="mt-3 text-sm font-semibold text-foreground">Analytics could not be loaded</h2>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
            {analytics.error?.message || "OneClub could not complete this request."}
          </p>
          <Button type="button" variant="outline" size="sm" className="mt-4 h-11 text-xs" onClick={analytics.retry}>
            Retry
          </Button>
        </div>
      ) : null}

      {showCards ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {cards.map(({ definition, value }) => (
            <AdminAnalyticsMetricCard
              key={definition.id}
              definition={definition}
              value={value}
              timeRange={analytics.range}
              onInspect={setInspectingMetric}
            />
          ))}
        </div>
      ) : null}

      <AdminAnalyticsMetricModal
        definition={inspectingMetric}
        timeRange={analytics.range}
        summary={analytics.data}
        open={Boolean(inspectingMetric)}
        onOpenChange={(open) => !open && setInspectingMetric(null)}
      />
    </section>
  );
}
