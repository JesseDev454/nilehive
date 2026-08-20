import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  CreditCard,
  ZoomIn
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { displayValue, formatNaira, formatShortDate } from "@/lib/approvals/adapters";
import type { DuesProofApprovalView } from "@/lib/approvals/types";
import { duesStatusLabel, isActionableDuesStatus } from "@/lib/duesStatus";
import { ApprovalsQueueStatus } from "./ApprovalsQueueStatus";
import type { QueueState } from "./useAdminApprovalsData";

interface AdminPaymentProofListProps {
  queue: QueueState<DuesProofApprovalView>;
  proofs: DuesProofApprovalView[];
  busyId: string | null;
  filteredEmpty: boolean;
  onRetry: () => void;
  onVerify: (proof: DuesProofApprovalView) => void;
  onReject: (proof: DuesProofApprovalView) => void;
}

export function AdminPaymentProofList({
  queue,
  proofs,
  busyId,
  filteredEmpty,
  onRetry,
  onVerify,
  onReject
}: AdminPaymentProofListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(proofs[0]?.id ?? null);
  const [receiptZoomUrl, setReceiptZoomUrl] = useState<string | null>(null);
  const [brokenProofIds, setBrokenProofIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!proofs.some((item) => item.id === expandedId)) {
      setExpandedId(proofs[0]?.id ?? null);
    }
  }, [expandedId, proofs]);

  const statusView = (
    <ApprovalsQueueStatus
      status={queue.status}
      error={queue.error}
      filteredEmpty={filteredEmpty}
      emptyTitle="No payment proofs awaiting review"
      emptyDescription="All submitted dues transfer receipts have been reviewed against official bank records."
      loadingLabel="Loading dues proofs"
      onRetry={onRetry}
      icon={CreditCard}
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
            Dues Proofs Waiting Review ({proofs.length})
          </span>
        </div>

        {proofs.map((proof) => {
          const isSelected = expandedId === proof.id;
          return (
            <button
              key={proof.id}
              type="button"
              onClick={() => setExpandedId(proof.id)}
              aria-pressed={isSelected}
              aria-label={`Inspect dues proof for ${proof.student_name}`}
              className={`group flex w-full flex-col justify-between rounded-xl border p-4 text-left transition-all duration-180 min-h-11 ${
                isSelected
                  ? "border-emerald-500 bg-emerald-500/5 shadow-2xs ring-1 ring-emerald-500/30"
                  : "border-border bg-card hover:border-border/80 hover:bg-muted/30"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-bold text-foreground">
                    {proof.club_name}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {formatNaira(proof.amount)}
                  </span>
                </div>

                <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  {proof.student_name}
                </p>

                <p className="text-[11px] font-mono text-muted-foreground">
                  Ref: {displayValue(proof.reference_number)}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">{displayValue(proof.payment_channel, duesStatusLabel(proof.status))}</span>
                <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isSelected ? "text-emerald-600 translate-x-0.5" : "text-muted-foreground/60"}`} />
              </div>
            </button>
          );
        })}
      </div>

      <div className="lg:col-span-7">
        {(() => {
          const selected = proofs.find((p) => p.id === expandedId) || proofs[0];
          if (!selected) return null;
          const busy = busyId === selected.id;
          const canDecide = isActionableDuesStatus(selected.status);
          const proofBroken = brokenProofIds[selected.id];
          const proofUrl = selected.proof_document_url;

          return (
            <div className="sticky top-6 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-5">
              <div className="border-b border-border/70 pb-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    {selected.club_name} Dues
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    ID: {selected.id}
                  </Badge>
                </div>
                <h2 className="mt-2 text-lg font-bold text-foreground sm:text-xl">
                  {formatNaira(selected.amount)} Proof of Transfer
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Submitted by <strong className="text-foreground">{selected.student_name}</strong> ({displayValue(selected.student_id)})
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Payment Channel</span>
                  <span className="font-semibold text-foreground mt-0.5 block">{displayValue(selected.payment_channel, "Not provided")}</span>
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Bank Transaction Ref</span>
                  <span className="font-mono font-bold text-foreground mt-0.5 block truncate">{displayValue(selected.reference_number)}</span>
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Institutional Email</span>
                  <span className="font-medium text-foreground mt-0.5 block truncate">{displayValue(selected.student_email, "Not returned with this dues record")}</span>
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Submission Date</span>
                  <span className="font-medium text-foreground mt-0.5 block">{formatShortDate(selected.created_at)}</span>
                </div>
              </div>

              <div className="space-y-2 rounded-xl border border-border/80 bg-muted/10 p-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Uploaded Transfer Document / Stamped Teller</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={!proofUrl || proofBroken}
                    onClick={() => proofUrl && setReceiptZoomUrl(proofUrl)}
                    className="h-11 gap-1 text-[11px] text-primary"
                    aria-label={`Expand dues proof for ${selected.student_name}`}
                  >
                    <ZoomIn className="h-3 w-3" aria-hidden="true" />
                    <span>Expand view</span>
                  </Button>
                </div>

                {!selected.has_proof || !proofUrl ? (
                  <div className="relative aspect-video sm:aspect-2/1 w-full rounded-xl border border-dashed border-border bg-background flex items-center justify-center text-muted-foreground">
                    No authorized proof file was returned for this record.
                  </div>
                ) : proofBroken ? (
                  <div className="relative aspect-video sm:aspect-2/1 w-full rounded-xl border border-dashed border-border bg-background flex items-center justify-center text-muted-foreground">
                    This proof link is missing or no longer valid.
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setReceiptZoomUrl(proofUrl)}
                    className="relative aspect-video sm:aspect-2/1 w-full rounded-xl border border-border overflow-hidden bg-background flex items-center justify-center cursor-pointer group"
                    aria-label={`Inspect dues proof for ${selected.student_name}`}
                  >
                    <img
                      src={proofUrl}
                      alt={`Dues receipt for ${selected.student_name}`}
                      className="h-full w-full object-cover transition-transform duration-180 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                      onError={() => setBrokenProofIds((current) => ({ ...current, [selected.id]: true }))}
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                      <ZoomIn className="h-4 w-4" aria-hidden="true" />
                      <span>Click to inspect full document</span>
                    </div>
                  </button>
                )}
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={busy || !canDecide}
                  onClick={() => onReject(selected)}
                  className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10 min-h-11"
                  aria-label={`Reject dues payment for ${selected.student_name}`}
                >
                  Reject Proof with Reason
                </Button>

                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  disabled={busy || !canDecide}
                  onClick={() => onVerify(selected)}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 min-h-11"
                  aria-label={`Verify dues payment for ${selected.student_name}`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{busy ? "Saving..." : "Verify Payment Proof"}</span>
                </Button>
              </div>
            </div>
          );
        })()}
      </div>

      <Dialog open={!!receiptZoomUrl} onOpenChange={(open) => !open && setReceiptZoomUrl(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Transfer Proof Document Inspection</DialogTitle>
          </DialogHeader>
          <div className="overflow-hidden rounded-xl border border-border bg-black/5 flex items-center justify-center p-2">
            {receiptZoomUrl && (
              <img
                src={receiptZoomUrl}
                alt="Enlarged dues receipt"
                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-md"
                referrerPolicy="no-referrer"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
