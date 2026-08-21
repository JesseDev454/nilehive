import { Clock, CheckCircle2, FileText, UserCheck, CreditCard, Eye, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DashboardRecentActivity } from "@/lib/dashboard/types";
import { formatLagosDateTime } from "@/lib/dashboard/adapters";

interface AdminRecentActivityProps {
  activities: DashboardRecentActivity[];
  onInspectActivity?: (activity: DashboardRecentActivity) => void;
}

function activityIcon(type: string) {
  switch (type) {
    case "proposal":
      return <FileText className="h-4 w-4 text-primary" />;
    case "dues":
      return <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
    case "membership_request":
      return <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    case "event_report":
      return <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
    case "feedback":
      return <MessageSquare className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

function activityTypeLabel(type: string) {
  switch (type) {
    case "proposal":
      return "Proposal";
    case "dues":
      return "Dues";
    case "membership_request":
      return "Membership";
    case "event_report":
      return "Event report";
    case "feedback":
      return "Feedback";
    default:
      return "Update";
  }
}

export function AdminRecentActivity({ activities, onInspectActivity }: AdminRecentActivityProps) {
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
          <div className="p-6 text-center text-xs text-muted-foreground">No recent activity recorded today.</div>
        ) : (
          activities.map((item) => (
            <div
              key={item.id}
              onClick={() => onInspectActivity?.(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onInspectActivity?.(item);
                }
              }}
              className="group flex items-start gap-3.5 rounded-xl p-3 text-left transition-colors duration-180 hover:bg-muted/40 cursor-pointer focus-visible:outline-hidden focus-visible:bg-muted/40"
              aria-label={`Inspect ${item.title}`}
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60 border border-border/50">
                {activityIcon(item.type)}
              </div>

              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-secondary/80 px-2 py-0.5 text-[10px] font-semibold text-foreground">
                    {item.club_name || "Campus club"}
                  </span>
                  <span className="text-[11px] font-medium text-muted-foreground">{activityTypeLabel(item.type)}</span>
                  <span className="text-[11px] text-muted-foreground/70">• {formatLagosDateTime(item.created_at)}</span>
                </div>

                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{item.title}</p>
                {item.message ? (
                  <p className="text-xs text-muted-foreground line-clamp-1">{item.message}</p>
                ) : null}
              </div>

              <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" tabIndex={-1}>
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
