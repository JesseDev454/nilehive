import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Calendar,
  Check,
  CreditCard,
  FileCheck2,
  FileText,
  MapPin,
  ShieldCheck,
  UserCheck,
  X
} from "lucide-react";
import type { ProposalMock, JoinRequestMock, DuesProofMock, EventReportMock } from "@/components/AdminHomeView";

type InspectionRecord =
  | { type: "proposal"; data: ProposalMock }
  | { type: "join_request"; data: JoinRequestMock }
  | { type: "proof"; data: DuesProofMock }
  | { type: "report"; data: EventReportMock }
  | { type: "activity"; data: { title: string; clubName: string; actor: string; timestamp: string; detail?: string } }
  | null;

interface AdminRecordDetailModalProps {
  record: InspectionRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction?: (action: string, id: string) => void;
}

export function AdminRecordDetailModal({
  record,
  open,
  onOpenChange,
  onAction
}: AdminRecordDetailModalProps) {
  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        {record.type === "proposal" && (
          <div className="space-y-4">
            <DialogHeader>
              <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider">
                <FileText className="h-4 w-4" />
                <span>Event Authorization</span>
              </div>
              <DialogTitle className="text-lg font-bold">{record.data.title}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Submitted by {record.data.club_name} • Requested by {record.data.submitted_by_name}
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Proposed Date:</span>
                  <span className="font-semibold">{record.data.proposed_date}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Venue / Location:</span>
                  <span className="font-semibold">{record.data.venue}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Requested Budget:</span>
                  <span className="font-semibold">₦{record.data.budget.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Advisor Endorsement:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Recommended by {record.data.advisor_name}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-border/50">
                <span className="text-muted-foreground block text-[10px]">Description &amp; Objective:</span>
                <p className="mt-0.5 text-muted-foreground leading-relaxed">{record.data.description}</p>
              </div>
            </div>

            <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => {
                  onAction?.("reject", record.data.id);
                  onOpenChange(false);
                }}
              >
                Decline
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  onAction?.("revisions", record.data.id);
                  onOpenChange(false);
                }}
              >
                Request Revisions
              </Button>
              <Button
                variant="default"
                size="sm"
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => {
                  onAction?.("approve", record.data.id);
                  onOpenChange(false);
                }}
              >
                Authorize &amp; Publish
              </Button>
            </DialogFooter>
          </div>
        )}

        {record.type === "join_request" && (
          <div className="space-y-4">
            <DialogHeader>
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider">
                <UserCheck className="h-4 w-4" />
                <span>Club Admission Application</span>
              </div>
              <DialogTitle className="text-lg font-bold">{record.data.student_name}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Applying to {record.data.club_name}
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Campus One Student ID:</span>
                  <span className="font-mono font-semibold">{record.data.student_id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Institutional Email:</span>
                  <span className="font-semibold truncate block">{record.data.student_email}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-border/50">
                <span className="text-muted-foreground block text-[10px]">Student Statement / Motivation:</span>
                <p className="mt-0.5 text-muted-foreground leading-relaxed italic">"{record.data.statement}"</p>
              </div>
            </div>

            <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  onAction?.("reject_join", record.data.id);
                  onOpenChange(false);
                }}
              >
                Decline
              </Button>
              <Button
                variant="default"
                size="sm"
                className="text-xs bg-primary text-primary-foreground"
                onClick={() => {
                  onAction?.("approve_join", record.data.id);
                  onOpenChange(false);
                }}
              >
                Admit Student
              </Button>
            </DialogFooter>
          </div>
        )}

        {record.type === "proof" && (
          <div className="space-y-4">
            <DialogHeader>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <CreditCard className="h-4 w-4" />
                <span>Bank Transfer Verification</span>
              </div>
              <DialogTitle className="text-lg font-bold">₦{record.data.amount.toLocaleString()} Dues Receipt</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {record.data.student_name} • {record.data.club_name}
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Payment Method:</span>
                  <span className="font-semibold">{record.data.payment_method}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Bank Reference:</span>
                  <span className="font-mono font-semibold">{record.data.reference_number}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-border/50">
                <span className="text-muted-foreground block text-[10px] mb-1.5">Submitted Receipt Image:</span>
                <div className="relative aspect-video w-full rounded-lg border border-border overflow-hidden bg-background flex items-center justify-center">
                  <img
                    src={record.data.proof_document_url}
                    alt="Receipt verification document"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => {
                  onAction?.("reject_proof", record.data.id);
                  onOpenChange(false);
                }}
              >
                Reject Proof
              </Button>
              <Button
                variant="default"
                size="sm"
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => {
                  onAction?.("verify_proof", record.data.id);
                  onOpenChange(false);
                }}
              >
                Verify &amp; Confirm Payment
              </Button>
            </DialogFooter>
          </div>
        )}

        {record.type === "report" && (
          <div className="space-y-4">
            <DialogHeader>
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-semibold uppercase tracking-wider">
                <FileCheck2 className="h-4 w-4" />
                <span>Post-Event Compliance Report</span>
              </div>
              <DialogTitle className="text-lg font-bold">{record.data.event_title}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Submitted by {record.data.club_name}
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Event Date:</span>
                  <span className="font-semibold">{record.data.event_date}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Verified Attendees:</span>
                  <span className="font-semibold">{record.data.verified_attendees} students</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Reconciled Budget:</span>
                  <span className="font-semibold">₦{record.data.budget_spent.toLocaleString()}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-border/50">
                <span className="text-muted-foreground block text-[10px]">Outcome Summary:</span>
                <p className="mt-0.5 text-muted-foreground leading-relaxed">{record.data.summary}</p>
              </div>
            </div>

            <DialogFooter className="flex items-center justify-end pt-2">
              <Button
                variant="default"
                size="sm"
                className="text-xs"
                onClick={() => {
                  onAction?.("archive_report", record.data.id);
                  onOpenChange(false);
                }}
              >
                Acknowledge &amp; Archive
              </Button>
            </DialogFooter>
          </div>
        )}

        {record.type === "activity" && (
          <div className="space-y-4">
            <DialogHeader>
              <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4" />
                <span>Campus Record Audit</span>
              </div>
              <DialogTitle className="text-lg font-bold">{record.data.title}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {record.data.clubName} • {record.data.timestamp}
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                {record.data.detail || "This administrative operation was authorized in accordance with Nile University student organization bylaws."}
              </p>
              <p className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
                Actioned by: <strong className="text-foreground">{record.data.actor}</strong>
              </p>
            </div>

            <DialogFooter className="flex items-center justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
