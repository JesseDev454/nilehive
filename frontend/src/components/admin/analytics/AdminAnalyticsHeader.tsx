import { BarChart2, Calendar, ShieldCheck } from "lucide-react";
import { type AnalyticsTimeRange } from "@/data/adminAnalyticsData";

interface AdminAnalyticsHeaderProps {
  timeRange: AnalyticsTimeRange;
  onTimeRangeChange: (range: AnalyticsTimeRange) => void;
  isFetching?: boolean;
}

export function AdminAnalyticsHeader({
  timeRange,
  onTimeRangeChange,
  isFetching
}: AdminAnalyticsHeaderProps) {
  const ranges: Array<{ value: AnalyticsTimeRange; label: string }> = [
    { value: 7, label: "Last 7 Days" },
    { value: 30, label: "Last 30 Days" },
    { value: 90, label: "Last 90 Days" }
  ];

  return (
    <div className="space-y-4 border-b border-border/80 pb-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Title & Description */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <BarChart2 className="h-4 w-4 text-primary" />
            <span>Directorate Insights</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Directorate Analytics
            </h1>
            {isFetching && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary animate-pulse">
                Updating...
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Aggregate student adoption and administrative operational counts across Nile University.
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="inline-flex rounded-xl bg-muted/80 p-1 border border-border/60 shrink-0">
          {ranges.map((r) => {
            const isActive = timeRange === r.value;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => onTimeRangeChange(r.value)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-180 ${
                  isActive
                    ? "bg-background text-foreground shadow-2xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Privacy-Safe Disclosure Banner */}
      <div className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-foreground mt-2">
        <ShieldCheck className="h-4 w-4 shrink-0 text-primary mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-semibold text-foreground">Institutional Privacy Policy: </strong>
          <span className="text-muted-foreground">
            All analytics represent aggregate operational totals across Nile University's 14 official clubs. Individual browsing trails, search terms, and student personal logs are strictly excluded.
          </span>
        </div>
      </div>
    </div>
  );
}
