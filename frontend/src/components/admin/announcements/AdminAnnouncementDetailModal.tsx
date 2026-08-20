import { Eye, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AUDIENCE_CONFIG,
  PRIORITY_CONFIG,
  ROLE_LABELS,
  type AdminAnnouncementItem,
} from "@/data/adminAnnouncementsData";

interface AdminAnnouncementDetailModalProps {
  announcement: AdminAnnouncementItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminAnnouncementDetailModal({
  announcement,
  open,
  onOpenChange,
}: AdminAnnouncementDetailModalProps) {
  if (!announcement) return null;

  const priorityConf = PRIORITY_CONFIG[announcement.priority];
  const audienceConf = AUDIENCE_CONFIG[announcement.audience];
  const hasReadTotals =
    announcement.readCount !== null && announcement.totalRecipients !== null;
  const readRatio = hasReadTotals
    ? Math.round((announcement.readCount! / Math.max(announcement.totalRecipients!, 1)) * 100)
    : null;

  let audienceDetailText = audienceConf.description;
  if (announcement.audience === "one_club" && announcement.targetClubName) {
    audienceDetailText = `Targeted exclusively to ${announcement.targetClubName} members, executives, and faculty advisors.`;
  } else if (announcement.audience === "role" && announcement.targetRole) {
    audienceDetailText = `Targeted exclusively to users with the ${ROLE_LABELS[announcement.targetRole]} role.`;
  }

  const publishedDate = new Date(announcement.publishedAt);
  const formattedDateTime = publishedDate.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${priorityConf.badgeClass}`}
              >
                {priorityConf.label}
              </span>
              <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                {audienceConf.badgeLabel}
              </span>
            </div>

            <span className="text-[11px] text-muted-foreground font-mono">Ref: {announcement.id}</span>
          </div>

          <DialogTitle className="text-xl font-bold text-foreground pt-1">
            {announcement.title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Dispatched on <strong className="text-foreground">{formattedDateTime}</strong> by{" "}
            <strong className="text-foreground">{announcement.publishedBy}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-xs pt-1">
          <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-1">
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Audience Scope</span>
            <p className="font-medium text-foreground">{audienceDetailText}</p>
          </div>

          <div className="rounded-xl border border-border/80 bg-card p-4 space-y-2">
            <span className="font-semibold text-foreground block">Broadcast Message</span>
            <div className="text-xs leading-relaxed text-foreground whitespace-pre-wrap">
              {announcement.content}
            </div>
          </div>

          <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                <span>Recipient Read Receipts</span>
              </span>
              <span className="font-mono font-bold text-foreground">
                {hasReadTotals
                  ? `${announcement.readCount} / ${announcement.totalRecipients} (${readRatio}%)`
                  : "Not stored"}
              </span>
            </div>

            {hasReadTotals ? (
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden" aria-hidden="true">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(readRatio || 0, 100)}%` }}
                />
              </div>
            ) : (
              <p className="text-[10px] text-muted-foreground pt-0.5">
                OneClub stores per-user read state, not a campus-wide read count.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-slate-500/5 border border-slate-500/15 p-3 text-[11px] text-muted-foreground">
            <Lock className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            <span>
              Published announcements cannot be edited, deleted, pinned, or scheduled. Edit, delete, pin, and schedule are not available.
            </span>
          </div>

          <div className="flex items-center justify-end pt-2 border-t border-border">
            <Button type="button" variant="default" size="sm" onClick={() => onOpenChange(false)} className="text-xs h-11">
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
