import { useEffect, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  FileText,
  MessageSquareQuote,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { displayValue, formatNaira, formatShortDate } from "@/lib/approvals/adapters";
import type { ProposalApprovalView } from "@/lib/approvals/types";
import { proposalStatusLabel } from "@/lib/proposalStatus";
import { ApprovalsQueueStatus } from "./ApprovalsQueueStatus";
import type { QueueState } from "./useAdminApprovalsData";

interface AdminProposalListProps {
  queue: QueueState<ProposalApprovalView>;
  proposals: ProposalApprovalView[];
  busyId: string | null;
  filteredEmpty: boolean;
  onRetry: () => void;
  onInspect: (proposalId: string) => void;
  onApprove: (proposal: ProposalApprovalView) => void;
  onReject: (proposal: ProposalApprovalView) => void;
  onOverride: (proposal: ProposalApprovalView) => void;
}

export function AdminProposalList({
  queue,
  proposals,
  busyId,
  filteredEmpty,
  onRetry,
  onInspect,
  onApprove,
  onReject,
  onOverride
}: AdminProposalListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(proposals[0]?.id ?? null);

  useEffect(() => {
    if (!proposals.some((item) => item.id === expandedId)) {
      setExpandedId(proposals[0]?.id ?? null);
    }
  }, [expandedId, proposals]);

  const statusView = (
    <ApprovalsQueueStatus
      status={queue.status}
      error={queue.error}
      filteredEmpty={filteredEmpty}
      emptyTitle="No proposals waiting for authorization"
      emptyDescription="All event proposals submitted by club executives have been reviewed and decided."
      loadingLabel="Loading proposal approvals"
      onRetry={onRetry}
      icon={FileText}
    />
  );

  if (queue.status === "loading" || queue.status === "error" || queue.status === "forbidden" || queue.status === "empty" || filteredEmpty) {
    return statusView;
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="space-y-2.5 lg:col-span-5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Awaiting Final Decision ({proposals.length})
          </span>
        </div>

        {proposals.map((prop) => {
          const isSelected = expandedId === prop.id;
          return (
            <button
              key={prop.id}
              type="button"
              onClick={() => {
                setExpandedId(prop.id);
                onInspect(prop.id);
              }}
              aria-pressed={isSelected}
              aria-label={`Inspect proposal ${prop.title}`}
              className={`group flex w-full flex-col justify-between rounded-xl border p-4 text-left transition-all duration-180 min-h-11 ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-2xs ring-1 ring-primary/30"
                  : "border-border bg-card hover:border-border/80 hover:bg-muted/30"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-bold text-foreground">
                    {prop.club_name}
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {formatNaira(prop.budget)}
                  </Badge>
                </div>

                <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  {prop.title}
                </p>

                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" aria-hidden="true" />
                  <span>{formatShortDate(prop.proposed_date)}</span>
                  <span>•</span>
                  <span>{displayValue(prop.venue)}</span>
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px]">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {prop.advisor_remarks ? "Advisor review complete" : proposalStatusLabel(prop.status)}
                </span>
                <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isSelected ? "text-primary translate-x-0.5" : "text-muted-foreground/60"}`} />
              </div>
            </button>
          );
        })}
      </div>

      <div className="lg:col-span-7">
        {(() => {
          const selected = proposals.find((p) => p.id === expandedId) || proposals[0];
          if (!selected) return null;
          const busy = busyId === selected.id;

          return (
            <div className="sticky top-6 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-5">
              <div className="border-b border-border/70 pb-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                    {selected.club_name}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">ID: {selected.id}</span>
                </div>
                <h2 className="mt-2 text-lg font-bold text-foreground sm:text-xl">
                  {selected.title}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Submitted by{" "}
                  <strong className="text-foreground">
                    {selected.submitted_by_name || "the club President"}
                  </strong>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Event Date</span>
                  <span className="font-semibold text-foreground mt-0.5 block">{formatShortDate(selected.proposed_date)}</span>
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Campus Venue</span>
                  <span className="font-semibold text-foreground mt-0.5 block">{displayValue(selected.venue)}</span>
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3 col-span-2 sm:col-span-1">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Requested Budget</span>
                  <span className="font-mono font-bold text-foreground mt-0.5 block">{formatNaira(selected.budget)}</span>
                </div>
              </div>

              <div className="space-y-1.5 rounded-xl border border-border/70 bg-muted/10 p-3.5 text-xs">
                <span className="font-semibold text-foreground block text-xs">Proposal Description &amp; Objectives (Read-Only)</span>
                <p className="text-muted-foreground leading-relaxed">
                  {displayValue(selected.description || selected.aim_objectives || selected.proposed_activity, "No proposal body was returned for this record.")}
                </p>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold">
                  <MessageSquareQuote className="h-4 w-4" aria-hidden="true" />
                  <span>Advisor Review &amp; Recommendation</span>
                </div>
                <p className="text-muted-foreground leading-relaxed pt-1">
                  {selected.advisor_remarks
                    ? selected.advisor_remarks
                    : "No Advisor remarks were returned with this proposal."}
                </p>
                {selected.advisor_name ? (
                  <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 pt-1">
                    — {selected.advisor_name}, Faculty Advisor
                  </p>
                ) : (
                  <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 pt-1">
                    Faculty Advisor
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={busy || !selected.can_override}
                  onClick={() => onOverride(selected)}
                  className="text-xs text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10 gap-1.5 min-h-11"
                  title="Override a returned proposal with directorate remarks"
                  aria-label={`Override returned proposal: ${selected.title}`}
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Directorate Override</span>
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={busy || !selected.can_authorize}
                    onClick={() => onReject(selected)}
                    className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10 min-h-11"
                    aria-label={`Reject proposal: ${selected.title}`}
                  >
                    Return / Reject with Remarks
                  </Button>

                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    disabled={busy || !selected.can_authorize}
                    onClick={() => onApprove(selected)}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 min-h-11"
                    aria-label={`Approve proposal: ${selected.title}`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{busy ? "Saving..." : "Authorize Proposal"}</span>
                  </Button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
