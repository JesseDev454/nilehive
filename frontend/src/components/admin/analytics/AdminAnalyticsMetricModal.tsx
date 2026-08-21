import { Database, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { AnalyticsPeriodView } from "@/lib/analytics/types";
import {
  type AnalyticsTimeRange,
  type MetricDefinition
} from "@/data/adminAnalyticsData";

interface AdminAnalyticsMetricModalProps {
  definition: MetricDefinition | null;
  timeRange: AnalyticsTimeRange;
  summary: AnalyticsPeriodView;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function metricValue(definition: MetricDefinition, summary: AnalyticsPeriodView): number {
  if (definition.id === "active_users") return summary.activeUsers;
  if (definition.id === "join_requests") return summary.joinRequests;
  if (definition.id === "dues_proofs") return summary.duesProofs;
  return summary.eventAttendance;
}

export function AdminAnalyticsMetricModal({
  definition,
  timeRange,
  summary,
  open,
  onOpenChange
}: AdminAnalyticsMetricModalProps) {
  if (!definition) return null;
  const value = metricValue(definition, summary);
  const roleEntries = Object.entries(summary.usageByRole);
  const daily = summary.dailyActiveUsers;
  const nonZeroDays = daily.filter((day) => day.active_users > 0).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              Metric Specification
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">
              Window: {timeRange} Days
            </span>
          </div>

          <DialogTitle className="text-xl font-bold text-foreground pt-1">
            {definition.label}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            {definition.description}
          </p>
        </DialogHeader>

        <div className="space-y-4 text-xs pt-1">
          <div className="rounded-xl border border-border/80 bg-card p-3.5">
            <span className="text-muted-foreground block text-[11px] uppercase font-semibold">Current window total</span>
            <p className="mt-1 text-2xl font-extrabold font-mono text-foreground">{value.toLocaleString()}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Aggregate count for the selected {timeRange}-day range. This is not a comparison trend.
            </p>
          </div>

          {definition.id === "active_users" ? (
            <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-2">
              <span className="font-semibold text-foreground">Daily active users</span>
              {daily.length === 0 ? (
                <p className="text-muted-foreground">No daily series was returned for this range.</p>
              ) : (
                <p className="text-muted-foreground">
                  {nonZeroDays} of {daily.length} days had at least one active account.
                  Peak day: {Math.max(0, ...daily.map((day) => day.active_users)).toLocaleString()} active users.
                </p>
              )}
              {roleEntries.length > 0 ? (
                <ul className="space-y-1">
                  {roleEntries.map(([role, count]) => (
                    <li key={role} className="flex items-center justify-between">
                      <span className="capitalize text-muted-foreground">{role}</span>
                      <span className="font-mono text-foreground">{count.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No role breakdown is available for this window.</p>
              )}
            </div>
          ) : null}

          {definition.id === "join_requests" ? (
            <p className="text-muted-foreground">
              Completed join requests in this window: {summary.operations.join_requests_completed.toLocaleString()}.
            </p>
          ) : null}
          {definition.id === "dues_proofs" ? (
            <p className="text-muted-foreground">
              Verified dues proofs in this window: {summary.operations.dues_proofs_verified.toLocaleString()}.
            </p>
          ) : null}
          {definition.id === "event_attendance" ? (
            <p className="text-muted-foreground">
              Going RSVPs in this window: {summary.operations.event_rsvps.toLocaleString()}.
            </p>
          ) : null}

          <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-foreground font-semibold text-xs">
              <Database className="h-3.5 w-3.5 text-primary" />
              <span>Data Source &amp; Extraction</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {definition.source}
            </p>
            <div className="pt-2 border-t border-border/60">
              <span className="text-muted-foreground font-medium block text-[11px]">Methodology:</span>
              <p className="text-xs text-foreground leading-relaxed">
                {definition.methodology}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border/80 bg-card p-3.5 space-y-1">
            <span className="text-foreground font-semibold text-xs block">
              Directorate Objective
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {definition.relevance}
            </p>
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-primary/5 border border-primary/15 p-3 text-[11px] text-foreground leading-relaxed">
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span>
              All metric values are computed strictly from verified database events without collecting personal device telemetry or private user browsing activity.
            </span>
          </div>

          <div className="flex items-center justify-end pt-2 border-t border-border">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-9"
            >
              Done Reading
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
