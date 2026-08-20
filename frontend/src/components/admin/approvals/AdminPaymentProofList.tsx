import { useState } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Eye,
  FileCheck2,
  Hash,
  ShieldCheck,
  ZoomIn
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { DuesProofMock } from "@/components/AdminHomeView";

interface AdminPaymentProofListProps {
  proofs: DuesProofMock[];
  onVerify: (proof: DuesProofMock) => void;
  onReject: (proof: DuesProofMock) => void;
}

export function AdminPaymentProofList({
  proofs,
  onVerify,
  onReject
}: AdminPaymentProofListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(proofs[0]?.id ?? null);
  const [receiptZoomUrl, setReceiptZoomUrl] = useState<string | null>(null);

  if (proofs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <CreditCard className="h-5 w-5" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-foreground">No payment proofs awaiting review</h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
          All submitted dues transfer receipts have been reviewed against official bank records.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left List (5 cols) */}
      <div className="space-y-2.5 lg:col-span-5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Dues Proofs Waiting Review ({proofs.length})
          </span>
        </div>

        {proofs.map((proof) => {
          const isSelected = expandedId === proof.id;
          return (
            <div
              key={proof.id}
              onClick={() => setExpandedId(proof.id)}
              className={`group flex flex-col justify-between rounded-xl border p-4 transition-all duration-180 cursor-pointer ${
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
                    ₦{proof.amount.toLocaleString()}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  {proof.student_name}
                </h3>

                <p className="text-[11px] font-mono text-muted-foreground">
                  Ref: {proof.reference_number}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">{proof.payment_method}</span>
                <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isSelected ? "text-emerald-600 translate-x-0.5" : "text-muted-foreground/60"}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Detailed Inspector (7 cols) */}
      <div className="lg:col-span-7">
        {(() => {
          const selected = proofs.find((p) => p.id === expandedId) || proofs[0];
          if (!selected) return null;

          return (
            <div className="sticky top-6 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-5">
              {/* Header */}
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
                  ₦{selected.amount.toLocaleString()} Proof of Transfer
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Submitted by <strong className="text-foreground">{selected.student_name}</strong> ({selected.student_id})
                </p>
              </div>

              {/* Transfer Details Card */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Payment Channel</span>
                  <span className="font-semibold text-foreground mt-0.5 block">{selected.payment_method}</span>
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Bank Transaction Ref</span>
                  <span className="font-mono font-bold text-foreground mt-0.5 block truncate">{selected.reference_number}</span>
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Institutional Email</span>
                  <span className="font-medium text-foreground mt-0.5 block truncate">{selected.student_email}</span>
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Submission Date</span>
                  <span className="font-medium text-foreground mt-0.5 block">{new Date(selected.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Receipt Image Inspection */}
              <div className="space-y-2 rounded-xl border border-border/80 bg-muted/10 p-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Uploaded Transfer Document / Stamped Teller</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setReceiptZoomUrl(selected.proof_document_url)}
                    className="h-6 gap-1 text-[11px] text-primary"
                  >
                    <ZoomIn className="h-3 w-3" />
                    <span>Expand view</span>
                  </Button>
                </div>

                <div
                  onClick={() => setReceiptZoomUrl(selected.proof_document_url)}
                  className="relative aspect-video sm:aspect-2/1 w-full rounded-xl border border-border overflow-hidden bg-background flex items-center justify-center cursor-pointer group"
                >
                  <img
                    src={selected.proof_document_url}
                    alt="Dues receipt document"
                    className="h-full w-full object-cover transition-transform duration-180 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                    <ZoomIn className="h-4 w-4" />
                    <span>Click to inspect full document</span>
                  </div>
                </div>
              </div>

              {/* Review Decision Actions Bar (Never preselected) */}
              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onReject(selected)}
                  className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10 h-9"
                >
                  Reject Proof with Reason
                </Button>

                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => onVerify(selected)}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-9"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Verify Payment Proof</span>
                </Button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Expanded Receipt Zoom Modal */}
      <Dialog open={!!receiptZoomUrl} onOpenChange={(open) => !open && setReceiptZoomUrl(null)}>
        <DialogContent className="max-w-3xl">
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
