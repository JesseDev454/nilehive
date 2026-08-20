import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Megaphone, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRole } from "@/contexts/RoleContext";

interface AdminHomeHeaderProps {
  onOpenAnnouncementComposer: () => void;
  isRefreshing?: boolean;
}

export function AdminHomeHeader({
  onOpenAnnouncementComposer,
  isRefreshing
}: AdminHomeHeaderProps) {
  const { currentUser } = useRole();

  // Current date formatting for Nile University campus
  const todayFormatted = new Intl.DateTimeFormat("en-NG", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date());

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-border/70 pb-5">
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
            <Sparkles className="h-3 w-3" />
            Club Services
          </span>
          <span>•</span>
          <time dateTime={new Date().toISOString()}>{todayFormatted}</time>
          {isRefreshing && (
            <>
              <span>•</span>
              <span className="text-[11px] text-muted-foreground animate-pulse">Syncing...</span>
            </>
          )}
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Welcome, {currentUser.full_name.split(" ")[0]}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
          Campus-wide administration across Nile University's 14 official student clubs. Review waiting items or broadcast a directive.
        </p>
      </div>

      {/* Primary Dominant Action */}
      <div className="flex shrink-0 items-center gap-2">
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
