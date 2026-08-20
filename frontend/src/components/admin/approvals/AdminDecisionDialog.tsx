import { useState } from "react";
import { AlertCircle, CheckCircle2, RotateCcw, ShieldAlert, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export type DecisionType =
  | "approve_proposal"
  | "reject_proposal"
  | "override_proposal"
  | "approve_join"
  | "reject_join"
  | "verify_proof"
  | "reject_proof";

interface AdminDecisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decisionType: DecisionType | null;
  itemTitle: string;
  itemSubtitle?: string;
  onConfirm: (remarks?: string) => void;
  isSubmitting?: boolean;
}

export function AdminDecisionDialog({
  open,
  onOpenChange,
  decisionType,
  itemTitle,
  itemSubtitle,
  onConfirm,
  isSubmitting = false
}: AdminDecisionDialogProps) {
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!decisionType) return null;

  const isRejectProposal = decisionType === "reject_proposal";
  const isOverride = decisionType === "override_proposal";
  const isRejectProof = decisionType === "reject_proof";
  const isRejectJoin = decisionType === "reject_join";

  const requiresRemarks = isRejectProposal || isOverride || isRejectProof || isRejectJoin;

  const getDialogConfig = () => {
    switch (decisionType) {
      case "approve_proposal":
        return {
          title: "Authorize Event Proposal",
          description: "This will approve the proposal, assign confirmed venue/date, and publish it to the Nile University campus calendar.",
          confirmLabel: "Confirm Authorization",
          confirmVariant: "default" as const,
          confirmClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
          remarksLabel: "Administrative Endorsement Notes (Optional)",
          remarksPlaceholder: "Add any specific directives regarding facility access, security, or AV setup..."
        };
      case "reject_proposal":
        return {
          title: "Return / Reject Proposal",
          description: "Explain why this proposal is being returned or rejected so the club president and advisor can address shortcomings.",
          confirmLabel: "Return Proposal with Remarks",
          confirmVariant: "destructive" as const,
          confirmClass: "",
          remarksLabel: "Required Return / Rejection Remarks",
          remarksPlaceholder: "Provide detailed feedback on venue conflict, budget issues, or policy non-compliance (Required)..."
        };
      case "override_proposal":
        return {
          title: "Directorate Override Approval",
          description: "You are overriding an earlier decision or non-endorsement. Formal override remarks are required for administrative audit logs.",
          confirmLabel: "Authorize via Directorate Override",
          confirmVariant: "default" as const,
          confirmClass: "bg-amber-600 hover:bg-amber-700 text-white",
          remarksLabel: "Mandatory Override Justification Remarks",
          remarksPlaceholder: "Explain the institutional rationale and directorate clearance for overriding this status (Required)..."
        };
      case "approve_join":
        return {
          title: "Admit Student to Club",
          description: "This admits the student into official club membership and updates the membership registry.",
          confirmLabel: "Confirm Admission",
          confirmVariant: "default" as const,
          confirmClass: "bg-primary text-primary-foreground",
          remarksLabel: "Internal Notes (Optional)",
          remarksPlaceholder: "Optional notes for the club executive registry..."
        };
      case "reject_join":
        return {
          title: "Decline Join Application",
          description: "Decline this student's application to join the club.",
          confirmLabel: "Decline Application",
          confirmVariant: "destructive" as const,
          confirmClass: "",
          remarksLabel: "Reason for Decline (Required)",
          remarksPlaceholder: "e.g. Club capacity reached for current semester, or prerequisites not met..."
        };
      case "verify_proof":
        return {
          title: "Verify Dues Payment Proof",
          description: "Confirm that the bank transfer receipt matches the verified university club account and reference number.",
          confirmLabel: "Confirm Payment Verification",
          confirmVariant: "default" as const,
          confirmClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
          remarksLabel: "Verification Notes (Optional)",
          remarksPlaceholder: "e.g., Confirmed with Zenith Bank portal statement ref..."
        };
      case "reject_proof":
        return {
          title: "Reject Payment Proof",
          description: "Reject this payment proof. The student will be notified to re-upload a valid bank transfer receipt.",
          confirmLabel: "Reject Proof",
          confirmVariant: "destructive" as const,
          confirmClass: "",
          remarksLabel: "Rejection Reason (Required)",
          remarksPlaceholder: "e.g. Illegible receipt, wrong bank account, or mismatched transfer amount (Required)..."
        };
    }
  };

  const config = getDialogConfig();

  const handleConfirm = () => {
    if (requiresRemarks && !remarks.trim()) {
      setError("Remarks are required to proceed with this decision.");
      return;
    }
    setError(null);
    onConfirm(remarks.trim() || undefined);
    setRemarks("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {decisionType.includes("reject") ? (
              <AlertCircle className="h-4 w-4 text-destructive" />
            ) : decisionType.includes("override") ? (
              <RotateCcw className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            )}
            <span>Administrative Decision</span>
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            {config.title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-border/80 bg-muted/40 p-3 text-xs space-y-1">
          <p className="font-semibold text-foreground">{itemTitle}</p>
          {itemSubtitle && <p className="text-muted-foreground">{itemSubtitle}</p>}
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="admin-decision-remarks" className="text-xs font-semibold">
              {config.remarksLabel} {requiresRemarks && <span className="text-destructive">*</span>}
            </Label>
            {error && (
              <span className="text-[11px] font-medium text-destructive">{error}</span>
            )}
          </div>
          <Textarea
            id="admin-decision-remarks"
            rows={3}
            value={remarks}
            onChange={(e) => {
              setRemarks(e.target.value);
              if (error) setError(null);
            }}
            placeholder={config.remarksPlaceholder}
            className={`text-xs leading-relaxed ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
          />
        </div>

        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-9"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={config.confirmVariant}
            size="sm"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className={`text-xs h-9 ${config.confirmClass}`}
          >
            {isSubmitting ? "Processing..." : config.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
