import { AlertCircle, Loader2, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AuditUiError } from "@/lib/audit/errors";
import type { ActivityStatus } from "@/lib/audit/useAdminActivityData";

interface ActivityDirectoryStatusProps {
  status: ActivityStatus;
  error: AuditUiError | null;
  filteredEmpty: boolean;
  onRetry?: () => void;
  onResetFilters?: () => void;
}

export function ActivityDirectoryStatus({
  status,
  error,
  filteredEmpty,
  onRetry,
  onResetFilters,
}: ActivityDirectoryStatusProps) {
  if (status === "loading") {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center" role="status" aria-live="polite">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        </div>
        <h2 className="mt-3 text-sm font-semibold text-foreground">Loading audit records</h2>
        <p className="mt-1 text-xs text-muted-foreground">Fetching Admin audit records.</p>
      </div>
    );
  }

  if (status === "forbidden") {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center" role="alert">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <AlertCircle className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="mt-3 text-sm font-semibold text-foreground">No access to Activity Log</h2>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
          Only a Club Services Admin can read the immutable campus audit history.
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
        <h2 className="mt-3 text-sm font-semibold text-foreground">Activity log could not be loaded</h2>
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

  if (status === "empty") {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <ScrollText className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="mt-3 text-sm font-semibold text-foreground">
          {filteredEmpty ? "No matching audit records" : "No audit records yet"}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
          {filteredEmpty
            ? "No records match the current search or filters."
            : "Audit entries appear after Club Services mutations such as approvals, role changes, and announcements."}
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
