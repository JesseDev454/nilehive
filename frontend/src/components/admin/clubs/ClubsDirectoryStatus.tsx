import { AlertCircle, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ClubsUiError } from "@/lib/clubs/errors";
import type { DirectoryStatus } from "./useAdminClubsData";

interface ClubsDirectoryStatusProps {
  status: DirectoryStatus;
  error: ClubsUiError | null;
  filteredEmpty: boolean;
  onRetry?: () => void;
}

export function ClubsDirectoryStatus({
  status,
  error,
  filteredEmpty,
  onRetry,
}: ClubsDirectoryStatusProps) {
  if (status === "loading") {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center" role="status" aria-live="polite">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-foreground">Loading official clubs</h3>
        <p className="mt-1 text-xs text-muted-foreground">Fetching the current Admin Clubs directory.</p>
      </div>
    );
  }

  if (status === "forbidden") {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center" role="alert">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <AlertCircle className="h-5 w-5" aria-hidden="true" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-foreground">No access to Clubs</h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
          Only a Club Services Admin can manage the official club registry.
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
        <h3 className="mt-3 text-sm font-semibold text-foreground">The club directory could not be loaded</h3>
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
          <Building2 className="h-5 w-5" aria-hidden="true" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-foreground">
          {filteredEmpty ? "No matching clubs" : "No official clubs yet"}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
          {filteredEmpty
            ? "Nothing in this registry matches the current search or category filter."
            : "When seeded official clubs are available, they will appear here."}
        </p>
      </div>
    );
  }

  return null;
}
