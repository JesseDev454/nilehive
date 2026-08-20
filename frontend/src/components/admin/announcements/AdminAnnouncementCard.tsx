import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Eye,
  Megaphone,
  Radio,
  UserCheck,
  Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AUDIENCE_CONFIG,
  PRIORITY_CONFIG,
  ROLE_LABELS,
  type AdminAnnouncementItem
} from "@/data/adminAnnouncementsData";

interface AdminAnnouncementCardProps {
  announcement: AdminAnnouncementItem;
  onInspect: (item: AdminAnnouncementItem) => void;
}

export function AdminAnnouncementCard({
  announcement,
  onInspect
}: AdminAnnouncementCardProps) {
  const priorityConf = PRIORITY_CONFIG[announcement.priority];
  const audienceConf = AUDIENCE_CONFIG[announcement.audience];
  const readRatio = Math.round(
    (announcement.readCount / Math.max(announcement.totalRecipients, 1)) * 100
  );

  // Audience descriptive tag
  let audienceSpecificLabel = audienceConf.badgeLabel;
  if (announcement.audience === "one_club" && announcement.targetClubName) {
    audienceSpecificLabel = announcement.targetClubName;
  } else if (announcement.audience === "role" && announcement.targetRole) {
    audienceSpecificLabel = ROLE_LABELS[announcement.targetRole];
  }

  const publishedDate = new Date(announcement.publishedAt);
  const formattedDate = publishedDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
  const formattedTime = publishedDate.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div
      id={`announcement-${announcement.id}`}
      className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-2xs transition-all duration-180 hover:border-primary/40 hover:shadow-xs"
    >
      <div className="space-y-3">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${priorityConf.badgeClass}`}
            >
              {priorityConf.label}
            </span>
            <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
              {audienceSpecificLabel}
            </span>
          </div>

          <span className="text-[11px] text-muted-foreground font-mono">
            {formattedDate} • {formattedTime}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
          {announcement.title}
        </h2>

        {/* Content excerpt */}
        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
          {announcement.content}
        </p>

        {/* Sender & Delivery Metadata */}
        <div className="pt-2 border-t border-border/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-foreground">Sender:</span>
            <span>{announcement.publishedBy}</span>
          </div>

          {/* Read Receipts Indicator */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 font-mono text-[10px]">
              <Eye className="h-3 w-3 text-muted-foreground" />
              <span>
                {announcement.readCount} / {announcement.totalRecipients} read ({readRatio}%)
              </span>
            </div>
            <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${Math.min(readRatio, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer: Detail Inspector Trigger */}
      <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground italic">
          Recipients mark read individually
        </span>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onInspect(announcement)}
          className="h-8 gap-1 text-xs text-primary hover:text-primary hover:bg-primary/10"
        >
          <span>View Full Broadcast</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
