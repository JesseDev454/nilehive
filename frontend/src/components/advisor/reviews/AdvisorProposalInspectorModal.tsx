import { useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Coins,
  FileText,
  Lock,
  MapPin,
  Send,
  ShieldAlert,
  ShieldCheck,
  User,
  Users,
  X,
  XCircle
} from "lucide-react";
import { Button } from "@/shared/components/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/shared/components/Dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/shared/components/StatusBadge";
import type { Proposal } from "@/data/advisorMockData";

interface AdvisorProposalInspectorModalProps {
  proposal: Proposal | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (proposalId: string, remarks?: string) => Promise<void> | void;
  onReturnForChanges: (proposalId: string, mandatoryRemarks: string) => Promise<void> | void;
}

export function AdvisorProposalInspectorModal({
  proposal,
  isOpen,
  onClose,
  onApprove,
  onReturnForChanges
}: AdvisorProposalInspectorModalProps) {
  const [remarks, setRemarks] = useState("");
  const [remarksError, setRemarksError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "budget" | "leadership" | "governance">("overview");

  if (!proposal) return null;

  const isPendingAdvisor = proposal.status === "pending_advisor_review";
  const formattedBudget = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(proposal.budgetEstimate || 0);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onApprove(proposal.id, remarks.trim() || undefined);
      setRemarks("");
      setRemarksError(null);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturn = async () => {
    if (!remarks.trim()) {
      setRemarksError("Mandatory remarks required: Please explain the changes needed before returning this proposal to the president.");
      return;
    }
    setRemarksError(null);
    setIsSubmitting(true);
    try {
      await onReturnForChanges(proposal.id, remarks.trim());
      setRemarks("");
      setRemarksError(null);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden text-left">
        {/* Header with Title & Read-Only Banner */}
        <div className="p-5 border-b border-border/80 bg-muted/30">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[11px] font-bold uppercase tracking-wider text-primary border-primary/30">
                  {proposal.clubName}
                </Badge>
                <StatusBadge status={proposal.status} />
              </div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground font-display">
                {proposal.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground flex items-center gap-2">
                <span>Submitted by: <strong>{proposal.submittedBy}</strong></span>
                <span>&bull;</span>
                <span>Date: {proposal.submittedAt}</span>
              </DialogDescription>
            </div>
          </div>

          {/* Read-Only Notice */}
          <div className="mt-3.5 flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs text-amber-800 dark:text-amber-300">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            <span>
              <strong>Read-only proposal:</strong> The Club President's text cannot be edited here. Approve it or return it with remarks.
            </span>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 mt-4 border-b border-border/40 pb-1">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === "overview"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Event Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("budget")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === "budget"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Budget Breakdown ({formattedBudget})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("leadership")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === "leadership"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Responsible Officers ({proposal.responsibleMembers?.length || 1})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("governance")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === "governance"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Remarks &amp; Audit
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs sm:text-sm">
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Event Quick Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-border/80 bg-card p-3 space-y-1">
                  <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-primary" /> Proposed Date
                  </span>
                  <p className="font-semibold text-foreground">{proposal.eventDate}</p>
                </div>
                <div className="rounded-xl border border-border/80 bg-card p-3 space-y-1">
                  <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-primary" /> Proposed Time
                  </span>
                  <p className="font-semibold text-foreground">{proposal.eventTime || "TBD"}</p>
                </div>
                <div className="rounded-xl border border-border/80 bg-card p-3 space-y-1">
                  <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-primary" /> Venue
                  </span>
                  <p className="font-semibold text-foreground truncate">{proposal.location}</p>
                </div>
                <div className="rounded-xl border border-border/80 bg-card p-3 space-y-1">
                  <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-primary" /> Expected RSVPs
                  </span>
                  <p className="font-semibold text-foreground">{proposal.expectedParticipants} attendees</p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5 rounded-xl border border-border/80 bg-card p-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Event Description
                </h3>
                <p className="text-foreground leading-relaxed">
                  {proposal.description}
                </p>
              </div>

              {/* Aims & Objectives */}
              <div className="space-y-1.5 rounded-xl border border-border/80 bg-card p-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Aims &amp; Educational Objectives
                </h3>
                <p className="text-foreground leading-relaxed whitespace-pre-line">
                  {proposal.aimObjectives || "Fostering leadership, technical literacy, and university community engagement."}
                </p>
              </div>

              {/* Proposed Activity Breakdown */}
              <div className="space-y-1.5 rounded-xl border border-border/80 bg-card p-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Detailed Proposed Activities
                </h3>
                <p className="text-foreground leading-relaxed whitespace-pre-line">
                  {proposal.proposedActivity || "Structured schedule with speaker keynotes, live collaborative workshops, student breakouts, and closing network sessions."}
                </p>
              </div>
            </div>
          )}

          {activeTab === "budget" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5">
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Total Budget Requested</span>
                  <p className="text-2xl font-black text-primary font-display">{formattedBudget}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-muted-foreground">Club Funding Source</span>
                  <p className="text-xs font-semibold text-foreground">Club budget recorded in OneClub</p>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="overflow-hidden rounded-xl border border-border/80 bg-card">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/60 text-muted-foreground font-semibold uppercase text-[10px] tracking-wider border-b border-border/60">
                    <tr>
                      <th className="p-3">Line Item</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Estimated Amount</th>
                      <th className="p-3">Description / Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-foreground">
                    {proposal.budgetItems && proposal.budgetItems.length > 0 ? (
                      proposal.budgetItems.map((item, i) => (
                        <tr key={i} className="hover:bg-muted/20">
                          <td className="p-3 font-semibold">{item.item}</td>
                          <td className="p-3 text-center">{item.quantity}</td>
                          <td className="p-3 text-right font-medium">
                            {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(item.amount)}
                          </td>
                          <td className="p-3 text-muted-foreground">{item.description}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-muted-foreground">
                          General operational budget: {formattedBudget} (Itemized breakdown in charter notes)
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "leadership" && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Officers named in this proposal assume official logistical responsibility for safety, event conduct, and post-event reporting.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {proposal.responsibleMembers && proposal.responsibleMembers.length > 0 ? (
                  proposal.responsibleMembers.map((member, i) => (
                    <div key={i} className="rounded-xl border border-border/80 bg-card p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-xs sm:text-sm">{member.name}</p>
                          <Badge variant="secondary" className="text-[10px] font-medium py-0 px-1.5">
                            {member.position}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-[11px] text-muted-foreground space-y-0.5 pt-1 border-t border-border/40">
                        <p>Student ID: <strong>{member.studentId}</strong></p>
                        <p>Phone: <strong>{member.phone}</strong></p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 rounded-xl border border-border/80 bg-card p-4 space-y-1">
                    <p className="font-bold text-foreground">{proposal.submittedBy}</p>
                    <p className="text-xs text-muted-foreground">Club President &bull; Primary Organizer</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "governance" && (
            <div className="space-y-4">
              {proposal.advisorRemarks && (
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-1">
                  <p className="font-bold text-xs text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" />
                    Recorded Advisor Remarks
                  </p>
                  <p className="text-xs text-foreground leading-relaxed">{proposal.advisorRemarks}</p>
                </div>
              )}

              {proposal.adminRemarks && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-1">
                  <p className="font-bold text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4" />
                    Admin remarks
                  </p>
                  <p className="text-xs text-foreground leading-relaxed">{proposal.adminRemarks}</p>
                </div>
              )}

              {!proposal.advisorRemarks && !proposal.adminRemarks && (
                <div className="p-8 text-center text-muted-foreground rounded-xl border border-dashed border-border/80">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs">No prior review remarks on this proposal record.</p>
                </div>
              )}
            </div>
          )}

          {/* Advisor Decision Box for Pending Proposals */}
          {isPendingAdvisor && (
            <div className="rounded-2xl border border-primary/20 bg-card p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <label htmlFor="advisor-decision-remarks" className="font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Advisor Review Remarks
                </label>
                <span className="text-[11px] text-muted-foreground">
                  {remarks ? `${remarks.length} characters` : "Mandatory for returns"}
                </span>
              </div>

              <Textarea
                id="advisor-decision-remarks"
                placeholder="Add optional approval notes, or explain the required changes for the Club President..."
                value={remarks}
                onChange={(e) => {
                  setRemarks(e.target.value);
                  if (remarksError) setRemarksError(null);
                }}
                className="text-xs min-h-[90px] resize-none"
              />

              {remarksError && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{remarksError}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-border/80 bg-muted/20 flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs"
          >
            Close Inspector
          </Button>

          {isPendingAdvisor ? (
            <div className="flex flex-wrap items-center gap-2">
              {/* Return for Changes (backend decision=reject with mandatory remarks) */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReturn}
                disabled={isSubmitting}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-300 border-rose-300 dark:border-rose-800"
              >
                <XCircle className="h-3.5 w-3.5 mr-1" />
                Return for Changes (Mandatory Remarks)
              </Button>

              {/* Approve (sends to Admin) */}
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleApprove}
                disabled={isSubmitting}
                className="text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Send className="h-3.5 w-3.5 mr-1" />
                Approve (Sends to Admin)
              </Button>

            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Decision recorded: {proposal.status.replace(/_/g, " ")}
              </Badge>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
