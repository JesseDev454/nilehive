import {
  CalendarCheck,
  CreditCard,
  Info,
  UserCheck,
  UserPlus,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type AnalyticsTimeRange,
  type MetricDefinition
} from "@/data/adminAnalyticsData";

interface AdminAnalyticsMetricCardProps {
  definition: MetricDefinition;
  value: number;
  timeRange: AnalyticsTimeRange;
  onInspect: (def: MetricDefinition) => void;
}

export function AdminAnalyticsMetricCard({
  definition,
  value,
  timeRange,
  onInspect
}: AdminAnalyticsMetricCardProps) {
  const getMetricIcon = (id: MetricDefinition["id"]) => {
    switch (id) {
      case "active_users":
        return <Users className="h-5 w-5 text-primary" />;
      case "join_requests":
        return <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case "dues_proofs":
        return <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
      case "event_attendance":
        return <CalendarCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
    }
  };

  const getMetricAccentClass = (id: MetricDefinition["id"]) => {
    switch (id) {
      case "active_users":
        return "bg-primary/10 border-primary/20";
      case "join_requests":
        return "bg-blue-500/10 border-blue-500/20";
      case "dues_proofs":
        return "bg-emerald-500/10 border-emerald-500/20";
      case "event_attendance":
        return "bg-purple-500/10 border-purple-500/20";
    }
  };

  return (
    <div
      id={`analytics-card-${definition.id}`}
      className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-2xs transition-all duration-180 hover:border-primary/40 hover:shadow-xs"
    >
      <div className="space-y-3">
        {/* Metric Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${getMetricAccentClass(
                definition.id
              )}`}
            >
              {getMetricIcon(definition.id)}
            </div>
            <div>
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {definition.shortLabel}
              </span>
              <h2 className="text-sm font-bold text-foreground">
                {definition.label}
              </h2>
            </div>
          </div>
        </div>

        {/* Count Value & Period Context */}
        <div className="pt-2">
          <div className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl font-mono">
            {value.toLocaleString()}
          </div>
          <p className="mt-1 text-xs font-medium text-primary">
            Past {timeRange} Days Period Context
          </p>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed pt-1 border-t border-border/60">
          {definition.description}
        </p>
      </div>

      {/* Footer Info Trigger */}
      <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          Scope: All 14 Official Clubs
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onInspect(definition)}
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Info className="h-3.5 w-3.5" />
          <span>Metric Details</span>
        </Button>
      </div>
    </div>
  );
}
