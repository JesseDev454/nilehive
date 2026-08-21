import { AlertCircle, Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NotificationsUiError } from "@/lib/notifications/errors";
import type { DirectoryStatus } from "./useAdminNotificationsData";

interface NotificationsDirectoryStatusProps {
  status: DirectoryStatus;
  error: NotificationsUiError | null;
  filteredEmpty: boolean;
  onRetry?: () => void;
  onResetFilters?: () => void;
}

export function NotificationsDirectoryStatus({
  status,
  error,
  filteredEmpty,
  onRetry,
  onResetFilters,
}: NotificationsDirectoryStatusProps) {
  if (status === "loading") {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center" role="status" aria-live="polite">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        </div>
        <h2 className="mt-3 text-sm font-semibold text-foreground">Loading notifications</h2>
        <p className="mt-1 text-xs text-muted-foreground">Fetching alerts for the signed-in Admin account.</p>
      </div>
    );
  }

  if (status === "forbidden") {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center" role="alert">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <AlertCircle className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="mt-3 text-sm font-semibold text-foreground">No access to Notifications</h2>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
          Notifications are limited to the signed-in Admin account.
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
        <h2 className="mt-3 text-sm font-semibold text-foreground">Notifications could not be loaded</h2>
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
          <Bell className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="mt-3 text-sm font-semibold text-foreground">
          {filteredEmpty ? "No notifications found" : "No notifications yet"}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
          {filteredEmpty
            ? "There are no notifications matching your current category filter or search query."
            : "Alerts for this Admin account will appear here when OneClub has records to show."}
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
