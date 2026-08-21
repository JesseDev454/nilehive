import { Link } from "react-router-dom";
import { Megaphone, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminHomeHeaderProps {
  greetingName: string;
  clubCount: number;
  lastUpdatedLabel?: string | null;
  onOpenAnnouncementComposer: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function AdminHomeHeader({
  greetingName,
  clubCount,
  lastUpdatedLabel,
  onOpenAnnouncementComposer,
  onRefresh,
  isRefreshing,
}: AdminHomeHeaderProps) {
  const todayFormatted = new Intl.DateTimeFormat("en-NG", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(new Date());

  const clubLabel = clubCount === 1 ? "1 official student club" : `${clubCount} official student clubs`;

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-border/70 pb-5">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
            <Sparkles className="h-3 w-3" />
            Club Services
          </span>
          <span>•</span>
          <time dateTime={new Date().toISOString()}>{todayFormatted}</time>
          {lastUpdatedLabel ? (
            <>
              <span>•</span>
              <span>Updated {lastUpdatedLabel}</span>
            </>
          ) : null}
          {isRefreshing ? (
            <>
              <span>•</span>
              <span className="text-[11px] text-muted-foreground">Refreshing…</span>
            </>
          ) : null}
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Welcome, {greetingName}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
          Campus-wide administration across Nile University&apos;s {clubLabel}. Review waiting items or broadcast a directive.
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {onRefresh ? (
          <Button
            type="button"
            variant="outline"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-10 gap-2 rounded-xl px-3 text-xs font-semibold"
            aria-label="Refresh campus operations"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        ) : null}
        <Button
          id="btn-admin-new-announcement"
          type="button"
          variant="default"
          onClick={onOpenAnnouncementComposer}
          className="h-10 gap-2 rounded-xl px-4 text-xs font-semibold shadow-xs transition-transform duration-180 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Megaphone className="h-4 w-4" />
          <span>New announcement</span>
        </Button>
      </div>
    </header>
  );
}
