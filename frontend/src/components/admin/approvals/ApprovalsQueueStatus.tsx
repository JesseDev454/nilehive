import { AlertCircle, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ApprovalsUiError } from "@/lib/approvals/errors";
import type { QueueStatus } from "./useAdminApprovalsData";

interface ApprovalsQueueStatusProps {
  status: QueueStatus;
  error: ApprovalsUiError | null;
  filteredEmpty: boolean;
  emptyTitle: string;
  emptyDescription: string;
  loadingLabel: string;
  onRetry?: () => void;
  icon: typeof FileText;
}

export function ApprovalsQueueStatus({
  status,
  error,
  filteredEmpty,
  emptyTitle,
  emptyDescription,
  loadingLabel,
  onRetry,
  icon: Icon,
}: ApprovalsQueueStatusProps) {
  if (status === "loading") {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center" role="status" aria-live="polite">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-foreground">{loadingLabel}</h3>
        <p className="mt-1 text-xs text-muted-foreground">Fetching the current Admin queue.</p>
      </div>
    );
  }

  if (status === "forbidden") {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center" role="alert">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <AlertCircle className="h-5 w-5" aria-hidden="true" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-foreground">No access to this approvals queue</h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
          Only a Club Services Admin can review these records.
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
        <h3 className="mt-3 text-sm font-semibold text-foreground">This queue could not be loaded</h3>
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
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-foreground">
          {filteredEmpty ? "No matching records" : emptyTitle}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
          {filteredEmpty
            ? "Nothing in this queue matches the current search or club filter."
            : emptyDescription}
        </p>
      </div>
    );
  }

  return null;
}
