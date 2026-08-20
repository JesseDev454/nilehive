import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, RotateCcw } from "lucide-react";
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
  itemId: string;
  itemTitle: string;
  itemSubtitle?: string;
  onConfirm: (remarks?: string) => Promise<void> | void;
  isSubmitting?: boolean;
  submitError?: string | null;
  remarksPersistKey?: string;
}

export function AdminDecisionDialog({
  open,
  onOpenChange,
  decisionType,
  itemId,
  itemTitle,
  itemSubtitle,
  onConfirm,
  isSubmitting = false,
  submitError = null,
  remarksPersistKey
}: AdminDecisionDialogProps) {
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRemarks("");
    setError(null);
  }, [remarksPersistKey, itemId, decisionType]);

  useEffect(() => {
    if (!open && !isSubmitting) {
      setRemarks("");
    }
  }, [open, isSubmitting]);

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
          description: "Admin approval is final. The proposal will be marked approved and the President will see that campus authorization is complete.",
          confirmLabel: "Confirm Authorization",
          confirmVariant: "default" as const,
          confirmClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
          remarksLabel: "Administrative Endorsement Notes (Optional)",
          remarksPlaceholder: "Add any specific directives regarding facility access, security, or AV setup...",
          helper: null as string | null
        };
      case "reject_proposal":
        return {
          title: "Return / Reject Proposal",
          description: "Rejection is final for this Admin review. The President will see the remarks and the proposal will be returned as admin rejected.",
          confirmLabel: "Return Proposal with Remarks",
          confirmVariant: "destructive" as const,
          confirmClass: "",
          remarksLabel: "Required Return / Rejection Remarks",
          remarksPlaceholder: "Provide detailed feedback on venue conflict, budget issues, or policy non-compliance (Required)...",
          helper: null
        };
      case "override_proposal":
        return {
          title: "Directorate Override Approval",
          description: "You are approving a proposal that was previously returned. Override remarks are required and this Admin approval is final.",
          confirmLabel: "Authorize via Directorate Override",
          confirmVariant: "default" as const,
          confirmClass: "bg-amber-600 hover:bg-amber-700 text-white",
          remarksLabel: "Mandatory Override Justification Remarks",
          remarksPlaceholder: "Explain the institutional rationale and directorate clearance for overriding this status (Required)...",
          helper: null
        };
      case "approve_join":
        return {
          title: "Admit Student to Club",
          description: "This admits the student and marks the linked dues proof as paid when the backend can complete both updates.",
          confirmLabel: "Confirm Admission",
          confirmVariant: "default" as const,
          confirmClass: "bg-primary text-primary-foreground",
          remarksLabel: "Internal Notes (Optional)",
          remarksPlaceholder: "Optional notes for the club executive registry...",
          helper: null
        };
      case "reject_join":
        return {
          title: "Decline Join Application",
          description: "Decline this student's application to join the club. Linked dues proof will be rejected if one exists.",
          confirmLabel: "Decline Application",
          confirmVariant: "destructive" as const,
          confirmClass: "",
          remarksLabel: "Reason for Decline (Required)",
          remarksPlaceholder: "e.g. Club capacity reached for current semester, or prerequisites not met...",
          helper: null
        };
      case "verify_proof":
        return {
          title: "Verify Dues Payment Proof",
          description: "Confirm that the submitted proof matches the club dues record. This marks the payment as paid.",
          confirmLabel: "Confirm Payment Verification",
          confirmVariant: "default" as const,
          confirmClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
          remarksLabel: "Verification Notes (Optional)",
          remarksPlaceholder: "e.g., Confirmed with Zenith Bank portal statement ref...",
          helper: "Verification notes stay in this session only. The dues API stores status, not remarks."
        };
      case "reject_proof":
        return {
          title: "Reject Payment Proof",
          description: "Reject this payment proof. The student will be notified to re-upload a valid receipt. The dues record will be marked rejected.",
          confirmLabel: "Reject Proof",
          confirmVariant: "destructive" as const,
          confirmClass: "",
          remarksLabel: "Rejection Reason (Required)",
          remarksPlaceholder: "e.g. Illegible receipt, wrong bank account, or mismatched transfer amount (Required)...",
          helper: "This reason is required in the workspace. The current dues API does not persist remarks with the rejected status."
        };
    }
  };

  const config = getDialogConfig();
  const fieldError = error || submitError;

  const handleConfirm = async () => {
    if (isSubmitting) return;
    if (requiresRemarks && !remarks.trim()) {
      setError("Remarks are required to proceed with this decision.");
      return;
    }
    setError(null);
    await onConfirm(remarks.trim() || undefined);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isSubmitting) return;
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto" aria-describedby="admin-decision-description">
        <DialogHeader>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {decisionType.includes("reject") ? (
              <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
            ) : decisionType.includes("override") ? (
              <RotateCcw className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            )}
            <span>Administrative Decision</span>
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            {config.title}
          </DialogTitle>
          <DialogDescription id="admin-decision-description" className="text-xs text-muted-foreground leading-relaxed">
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-border/80 bg-muted/40 p-3 text-xs space-y-1">
          <p className="font-semibold text-foreground">{itemTitle}</p>
          {itemSubtitle && <p className="text-muted-foreground">{itemSubtitle}</p>}
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="admin-decision-remarks" className="text-xs font-semibold">
              {config.remarksLabel} {requiresRemarks && <span className="text-destructive">*</span>}
            </Label>
            {fieldError && (
              <span id="admin-decision-remarks-error" className="text-[11px] font-medium text-destructive">
                {fieldError}
              </span>
            )}
          </div>
          <Textarea
            id="admin-decision-remarks"
            rows={3}
            value={remarks}
            aria-invalid={Boolean(fieldError)}
            aria-describedby={fieldError ? "admin-decision-remarks-error" : config.helper ? "admin-decision-remarks-help" : undefined}
            onChange={(e) => {
              setRemarks(e.target.value);
              if (error) setError(null);
            }}
            placeholder={config.remarksPlaceholder}
            className={`text-xs leading-relaxed ${fieldError ? "border-destructive focus-visible:ring-destructive" : ""}`}
          />
          {config.helper ? (
            <p id="admin-decision-remarks-help" className="text-[11px] text-muted-foreground">
              {config.helper}
            </p>
          ) : null}
        </div>

        <div className="sr-only" aria-live="assertive">
          {isSubmitting ? "Saving this decision." : submitError || ""}
        </div>

        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
            className="text-xs min-h-11"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={config.confirmVariant}
            size="sm"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            onClick={() => {
              void handleConfirm();
            }}
            className={`text-xs min-h-11 ${config.confirmClass}`}
          >
            {isSubmitting ? "Processing..." : config.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
