import { AlertCircle, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FeedbackUiError } from "@/lib/feedback/errors";
import type { DirectoryStatus } from "./useAdminFeedbackData";

interface FeedbackDirectoryStatusProps {
  status: DirectoryStatus;
  error: FeedbackUiError | null;
  filteredEmpty: boolean;
  onRetry?: () => void;
  onResetFilters?: () => void;
}

export function FeedbackDirectoryStatus({
  status,
  error,
  filteredEmpty,
  onRetry,
  onResetFilters,
}: FeedbackDirectoryStatusProps) {
  if (status === "loading") {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center" role="status" aria-live="polite">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        </div>
        <h2 className="mt-3 text-sm font-semibold text-foreground">Loading feedback</h2>
        <p className="mt-1 text-xs text-muted-foreground">Fetching the Admin feedback inbox.</p>
      </div>
    );
  }

  if (status === "forbidden") {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center" role="alert">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <AlertCircle className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="mt-3 text-sm font-semibold text-foreground">No access to Feedback</h2>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
          Only a Club Services Admin can open the institution-wide feedback inbox.
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
        <h2 className="mt-3 text-sm font-semibold text-foreground">Feedback could not be loaded</h2>
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
          <MessageSquare className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="mt-3 text-sm font-semibold text-foreground">
          {filteredEmpty ? "No feedback matching filters" : "No feedback yet"}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
          {filteredEmpty
            ? "Try adjusting your search keywords or switching category filters."
            : "Submitted campus feedback will appear here after OneClub records it."}
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
