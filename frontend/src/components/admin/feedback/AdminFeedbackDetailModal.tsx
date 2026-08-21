import {
  Calendar,
  MessageSquare,
  School,
  ShieldCheck,
  Star,
  User
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FEEDBACK_CATEGORIES,
  type AdminFeedbackItem
} from "@/data/adminFeedbackData";

interface AdminFeedbackDetailModalProps {
  feedback: AdminFeedbackItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminFeedbackDetailModal({
  feedback,
  open,
  onOpenChange
}: AdminFeedbackDetailModalProps) {
  if (!feedback) return null;

  const catConf = FEEDBACK_CATEGORIES[feedback.category];
  const formattedDateTime = new Date(feedback.submittedAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${catConf.badgeClass}`}
              >
                {catConf.label}
              </span>
              <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground capitalize">
                {feedback.authorRole} Submitter
              </span>
              <span className="inline-flex items-center rounded-md border border-border px-2 py-0.5 text-[10px] font-semibold capitalize text-foreground">
                {feedback.status}
              </span>
            </div>

            <span className="text-[11px] text-muted-foreground font-mono">
              Ref: {feedback.id}
            </span>
          </div>

          <DialogTitle className="text-xl font-bold text-foreground pt-1">
            {feedback.title}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Submitted on {formattedDateTime}
          </p>
        </DialogHeader>

        <div className="space-y-4 text-xs pt-1">
          {/* Submitter Details */}
          <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                Submitter Information
              </span>
              {feedback.rating && (
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-foreground">{feedback.rating} of 5 experience rating</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Full Name: </span>
                <strong className="text-foreground">{feedback.authorName}</strong>
              </div>
              {feedback.studentId && (
                <div>
                  <span className="text-muted-foreground">Student ID: </span>
                  <span className="font-mono text-foreground">{feedback.studentId}</span>
                </div>
              )}
              {feedback.clubName && (
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground">Club Affiliation: </span>
                  <strong className="text-foreground">{feedback.clubName}</strong>
                </div>
              )}
            </div>

            {/* Follow-up Permission */}
            <div className="pt-2 border-t border-border/60 text-muted-foreground">
              {feedback.identityAvailable ? (
                <span>Submitter identity is on record for Directorate review. OneClub does not store a follow-up email flag on this record.</span>
              ) : (
                <span>Submitter identity was not included with this record.</span>
              )}
            </div>
          </div>

          {/* Full Feedback Message */}
          <div className="rounded-xl border border-border/80 bg-card p-4 space-y-2">
            <span className="font-semibold text-foreground block">Feedback Message</span>
            <div className="text-xs leading-relaxed text-foreground whitespace-pre-wrap">
              {feedback.message}
            </div>
          </div>

          {/* Institutional Transparency & Read-Only Notice */}
          <div className="flex items-start gap-2.5 rounded-xl bg-slate-500/5 border border-slate-500/15 p-3 text-[11px] text-muted-foreground leading-relaxed">
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <span>
              Student feedback records are preserved in read-only format for quality assurance, institutional audits, and executive training.
            </span>
          </div>

          {/* Footer Close Button */}
          <div className="flex items-center justify-end pt-2 border-t border-border">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-9"
            >
              Done Reading
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
