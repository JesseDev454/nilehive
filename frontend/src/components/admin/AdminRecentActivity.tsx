import { Clock, CheckCircle2, FileText, UserCheck, CreditCard, ChevronRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface RecentActivityItem {
  id: string;
  type: "proposal_approved" | "dues_verified" | "member_admitted" | "report_submitted" | "announcement_sent";
  clubName: string;
  title: string;
  actor: string;
  timestamp: string;
  detail?: string;
}

interface AdminRecentActivityProps {
  activities: RecentActivityItem[];
  onInspectActivity?: (activity: RecentActivityItem) => void;
}

export function AdminRecentActivity({ activities, onInspectActivity }: AdminRecentActivityProps) {
  const getActivityIcon = (type: RecentActivityItem["type"]) => {
    switch (type) {
      case "proposal_approved":
        return <FileText className="h-4 w-4 text-primary" />;
      case "dues_verified":
        return <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case "member_admitted":
        return <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case "report_submitted":
        return <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      case "announcement_sent":
        return <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActivityTypeLabel = (type: RecentActivityItem["type"]) => {
    switch (type) {
      case "proposal_approved":
        return "Proposal Authorized";
      case "dues_verified":
        return "Payment Verified";
      case "member_admitted":
        return "Member Admitted";
      case "report_submitted":
        return "Report Archived";
      case "announcement_sent":
        return "Announcement Published";
      default:
        return "Update";
    }
  };

  return (
    <section aria-labelledby="recent-activity-heading" className="rounded-2xl border border-border bg-card shadow-2xs">
      <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
        <div>
          <h2 id="recent-activity-heading" className="text-sm font-semibold text-foreground">
            Recent Campus Club Activity
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Chronological record of recent authorizations and submissions across clubs.
          </p>
        </div>
      </div>

      <div className="p-2 sm:p-3 divide-y divide-border/40">
        {activities.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No recent activity recorded today.
          </div>
        ) : (
          activities.map((item) => (
            <div
              key={item.id}
              onClick={() => onInspectActivity?.(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onInspectActivity?.(item);
                }
              }}
              className="group flex items-start gap-3.5 rounded-xl p-3 text-left transition-colors duration-180 hover:bg-muted/40 cursor-pointer focus-visible:outline-hidden focus-visible:bg-muted/40"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60 border border-border/50">
                {getActivityIcon(item.type)}
              </div>

              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-secondary/80 px-2 py-0.5 text-[10px] font-semibold text-foreground">
                    {item.clubName}
                  </span>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {getActivityTypeLabel(item.type)}
                  </span>
                  <span className="text-[11px] text-muted-foreground/70">• {item.timestamp}</span>
                </div>

                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                  {item.title}
                </p>

                {item.detail && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {item.detail}
                  </p>
                )}

                <p className="text-[11px] text-muted-foreground/80 pt-0.5">
                  Actioned by <span className="font-medium text-foreground">{item.actor}</span>
                </p>
              </div>

              <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
