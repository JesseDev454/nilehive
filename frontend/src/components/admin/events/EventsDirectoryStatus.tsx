import { AlertCircle, CalendarDays, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EventsUiError } from "@/lib/events/errors";
import type { DirectoryStatus } from "./useAdminEventsData";

interface EventsDirectoryStatusProps {
  status: DirectoryStatus;
  error: EventsUiError | null;
  filteredEmpty: boolean;
  onRetry?: () => void;
  onResetFilters?: () => void;
}

export function EventsDirectoryStatus({
  status,
  error,
  filteredEmpty,
  onRetry,
  onResetFilters,
}: EventsDirectoryStatusProps) {
  if (status === "loading") {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center" role="status" aria-live="polite">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        </div>
        <h2 className="mt-3 text-sm font-semibold text-foreground">Loading approved events</h2>
        <p className="mt-1 text-xs text-muted-foreground">Fetching campus events from approved proposals.</p>
      </div>
    );
  }

  if (status === "forbidden") {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center" role="alert">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <AlertCircle className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="mt-3 text-sm font-semibold text-foreground">No access to Events</h2>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
          Only a Club Services Admin can open institution-wide event operations.
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center" role="alert">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <AlertCircle className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="mt-3 text-sm font-semibold text-foreground">The events directory could not be loaded</h2>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
          {error?.message || "OneClub could not complete this request."}
        </p>
        {onRetry ? (
          <Button type="button" variant="outline" size="sm" className="mt-4 h-11 text-xs" onClick={onRetry}>
            Retry
          </Button>
        ) : null}
      </div>
    );
  }

  if (status === "empty" || filteredEmpty) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <CalendarDays className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="mt-3 text-sm font-semibold text-foreground">
          {filteredEmpty ? "No events found" : "No approved events yet"}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
          {filteredEmpty
            ? "No approved events match your current filter settings or search query."
            : "When proposals are approved, they appear here as campus events."}
        </p>
        {filteredEmpty && onResetFilters ? (
          <Button type="button" variant="outline" size="sm" className="mt-4 text-xs" onClick={onResetFilters}>
            Reset Filters
          </Button>
        ) : null}
      </div>
    );
  }

  return null;
}
