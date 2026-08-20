import { useState, useEffect } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  HelpCircle,
  Info,
  Loader2,
  Sparkles,
  User,
  X
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/Dialog";
import { Button } from "@/shared/components/Button";
import { StatusBadge } from "@/shared/components/StatusBadge";
import type { ExecutiveActionItem, ExecutiveTaskStatus } from "./ExecutiveHomeWorkspace";

interface UpdateActionModalProps {
  action: ExecutiveActionItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    actionId: string,
    newStatus: ExecutiveTaskStatus,
    progressNote: string,
    blockerReason?: string
  ) => Promise<void> | void;
}

export function UpdateActionModal({
  action,
  isOpen,
  onClose,
  onSave
}: UpdateActionModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<ExecutiveTaskStatus>("In Progress");
  const [progressNote, setProgressNote] = useState("");
  const [blockerReason, setBlockerReason] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form state when an action is selected
  useEffect(() => {
    if (action) {
      setSelectedStatus(action.status === "Pending" ? "In Progress" : action.status);
      setProgressNote(action.progressNote || "");
      setBlockerReason(action.blockerReason || "");
      setErrorMessage(null);
    }
  }, [action]);

  if (!action) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation: If Blocked, require a blocker explanation
    if (selectedStatus === "Blocked" && !blockerReason.trim()) {
      setErrorMessage("Please specify what is blocking this task so the President can unblock it.");
      return;
    }

    // Validation: If Completed, require or recommend a progress note
    if (selectedStatus === "Completed" && !progressNote.trim()) {
      setErrorMessage("Please add a brief note on what was completed (e.g., 'Tested all 4 mics with Nile ICT team').");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(
        action.id,
        selectedStatus,
        progressNote.trim(),
        selectedStatus === "Blocked" ? blockerReason.trim() : undefined
      );
      setIsSubmitting(false);
      onClose();
    } catch (err: unknown) {
      setIsSubmitting(false);
      setErrorMessage(err instanceof Error ? err.message : "Failed to update action status. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent maxWidth="md" className="p-0 overflow-hidden border-border/80 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-0 text-left text-xs">
          {/* Header */}
          <div className="p-5 bg-card border-b border-border/70 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded bg-primary/10 text-primary">
                  Assigned Action Update
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                  action.priority === "Urgent"
                    ? "bg-destructive/15 text-destructive"
                    : action.priority === "High"
                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {action.priority} Priority
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="text-muted-foreground hover:text-foreground rounded-lg p-1 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <DialogTitle className="text-base font-bold text-foreground leading-snug">
              {action.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground line-clamp-2">
              {action.description}
            </DialogDescription>
          </div>

          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Context Notice: Directive from President */}
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Assigned by: <strong className="text-foreground">{action.assignedBy}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Due Date: <strong className="text-foreground">{action.dueDate}</strong></span>
              </div>
            </div>

            {/* Error Notification banner */}
            {errorMessage && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2 animate-shake"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Status Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                Update Status <span className="text-destructive">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { value: "Pending" as const, label: "Pending", color: "hover:border-slate-400" },
                  { value: "In Progress" as const, label: "In Progress", color: "hover:border-blue-500" },
                  { value: "Blocked" as const, label: "Flag Blocked", color: "hover:border-amber-500" },
                  { value: "Completed" as const, label: "Completed", color: "hover:border-emerald-500" }
                ].map((st) => {
                  const isSelected = selectedStatus === st.value;
                  return (
                    <button
                      key={st.value}
                      type="button"
                      onClick={() => {
                        setSelectedStatus(st.value);
                        setErrorMessage(null);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        isSelected
                          ? st.value === "Completed"
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                            : st.value === "Blocked"
                            ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                            : st.value === "In Progress"
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                            : "bg-primary text-primary-foreground border-primary shadow-xs"
                          : `bg-muted/30 text-muted-foreground border-border/70 hover:text-foreground ${st.color}`
                      }`}
                    >
                      <span>{st.label}</span>
                      {isSelected && <Check className="h-3 w-3" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Conditional Blocker Reason Input (if Blocked selected) */}
            {selectedStatus === "Blocked" && (
              <div className="space-y-1.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                <label
                  htmlFor="blocker-reason-input"
                  className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5"
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                  <span>Blocker Explanation for President <span className="text-destructive">*</span></span>
                </label>
                <textarea
                  id="blocker-reason-input"
                  rows={2}
                  value={blockerReason}
                  onChange={(e) => {
                    setBlockerReason(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="e.g. Waiting on key access from Nile Security, or awaiting slide deck from guest speaker..."
                  className="w-full p-2.5 rounded-lg border border-amber-500/30 bg-background text-foreground text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden leading-relaxed"
                />
                <p className="text-[10px] text-amber-800 dark:text-amber-300">
                  This blocker reason will appear directly on the President's executive unblocking queue.
                </p>
              </div>
            )}

            {/* Progress Note / Work Log */}
            <div className="space-y-1.5">
              <label htmlFor="progress-note-input" className="text-xs font-bold text-foreground block">
                Progress Note &bull; Activity Log {selectedStatus === "Completed" && <span className="text-destructive">*</span>}
              </label>
              <textarea
                id="progress-note-input"
                rows={3}
                value={progressNote}
                onChange={(e) => {
                  setProgressNote(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder={
                  selectedStatus === "Completed"
                    ? "Document the result of this action (e.g. 'Coordinated with Mr. Bello at ICT Lab and tested all 4 microphones')."
                    : "Add status updates, contact details, or notes for the executive committee..."
                }
                className="w-full p-2.5 rounded-xl border border-border/80 bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-hidden leading-relaxed"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-muted/20 border-t border-border/70 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={onClose}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className={`text-xs font-bold min-w-[120px] gap-1.5 ${
                selectedStatus === "Completed"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : selectedStatus === "Blocked"
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Save Status Update</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
