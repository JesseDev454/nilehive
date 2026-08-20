import { AlertCircle, Loader2, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AnnouncementsUiError } from "@/lib/announcements/errors";
import type { DirectoryStatus } from "./useAdminAnnouncementsData";

interface AnnouncementsDirectoryStatusProps {
  status: DirectoryStatus;
  error: AnnouncementsUiError | null;
  filteredEmpty: boolean;
  onRetry?: () => void;
  onResetFilters?: () => void;
}

export function AnnouncementsDirectoryStatus({
  status,
  error,
  filteredEmpty,
  onRetry,
  onResetFilters,
}: AnnouncementsDirectoryStatusProps) {
  if (status === "loading") {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center" role="status" aria-live="polite">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        </div>
        <h2 className="mt-3 text-sm font-semibold text-foreground">Loading announcements</h2>
        <p className="mt-1 text-xs text-muted-foreground">Fetching official OneClub broadcasts.</p>
      </div>
    );
  }

  if (status === "forbidden") {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center" role="alert">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <AlertCircle className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="mt-3 text-sm font-semibold text-foreground">No access to Announcements</h2>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
          Only a Club Services Admin can publish institution-wide announcements from this workspace.
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
        <h2 className="mt-3 text-sm font-semibold text-foreground">Announcements could not be loaded</h2>
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
          <Megaphone className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="mt-3 text-sm font-semibold text-foreground">
          {filteredEmpty ? "No announcements found" : "No official announcements yet"}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
          {filteredEmpty
            ? "No official broadcasts match your current audience or priority filters."
            : "Published announcements will appear here after they are saved by OneClub."}
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
