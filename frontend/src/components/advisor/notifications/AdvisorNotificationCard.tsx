import {
  FileText,
  Clock,
  School,
  ShieldCheck,
  AlertCircle,
  Building,
  ArrowRight,
  Eye,
  Check,
  RotateCcw,
  Sparkles,
  Calendar,
  Layers
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/shared/components/Button";
import { Card, CardContent } from "@/components/ui/card";
import { AdvisorNotificationRecord } from "./advisorNotificationData";
import { cn } from "@/lib/utils";

interface AdvisorNotificationCardProps {
  notification: AdvisorNotificationRecord;
  onSelect: (notification: AdvisorNotificationRecord) => void;
  onToggleRead: (id: string, e: React.MouseEvent) => void;
}

export function AdvisorNotificationCard({
  notification,
  onSelect,
  onToggleRead
}: AdvisorNotificationCardProps) {
  const getCategoryIcon = () => {
    switch (notification.category) {
      case "proposal":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "report":
        return <FileText className="h-4 w-4 text-emerald-500" />;
      case "club":
        return <School className="h-4 w-4 text-blue-500" />;
      case "directorate":
        return <ShieldCheck className="h-4 w-4 text-primary" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityBadge = () => {
    if (notification.priority === "urgent") {
      return (
        <Badge variant="destructive" className="text-[10px] uppercase font-bold tracking-wider py-0 px-1.5 h-4">
          Urgent Action
        </Badge>
      );
    }
    if (notification.priority === "high") {
      return (
        <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider py-0 px-1.5 h-4 bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20">
          High Priority
        </Badge>
      );
    }
    return null;
  };

  return (
    <Card
      onClick={() => onSelect(notification)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(notification);
        }
      }}
      className={cn(
        "cursor-pointer text-left transition-all duration-180 border select-none group",
        "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        !notification.isRead
          ? "bg-card border-primary/40 shadow-xs hover:border-primary hover:shadow-sm"
          : "bg-card/70 border-border/70 hover:bg-card hover:border-border"
      )}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          {/* Main info */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {/* Category Icon with Unread Pulse */}
            <div className="relative shrink-0 mt-0.5">
              <div
                className={cn(
                  "p-2.5 rounded-xl border flex items-center justify-center transition-colors",
                  !notification.isRead
                    ? "bg-primary/10 border-primary/20 text-primary"
                    : "bg-muted/60 border-border/80 text-muted-foreground"
                )}
              >
                {getCategoryIcon()}
              </div>

              {!notification.isRead && (
                <span
                  className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary border-2 border-background animate-pulse"
                  title="Unread notification"
                />
              )}
            </div>

            {/* Content Details */}
            <div className="space-y-1.5 min-w-0 flex-1">
              {/* Chips row */}
              <div className="flex flex-wrap items-center gap-1.5">
                {notification.clubCode && (
                  <Badge
                    variant="outline"
                    className="text-[10px] font-bold tracking-wider py-0 px-1.5 h-4 bg-muted/40"
                  >
                    {notification.clubCode}
                  </Badge>
                )}
                {getPriorityBadge()}
                {notification.isActionRequired && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-semibold py-0 px-1.5 h-4 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                  >
                    Action Needed
                  </Badge>
                )}
                <span className="text-[11px] text-muted-foreground ml-auto shrink-0 font-medium">
                  {notification.timeAgo}
                </span>
              </div>

              {/* Title */}
              <h3
                className={cn(
                  "text-sm sm:text-base leading-snug line-clamp-2 transition-colors",
                  !notification.isRead
                    ? "font-bold text-foreground group-hover:text-primary"
                    : "font-medium text-foreground/80"
                )}
              >
                {notification.title}
              </h3>

              {/* Summary */}
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {notification.summary}
              </p>

              {/* Sender & Metadata bar */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-muted-foreground/90">
                <span className="font-medium text-foreground/90">{notification.sender}</span>
                <span>&bull;</span>
                <span className="truncate">{notification.senderAffiliation}</span>
                {notification.metadata?.referenceId && (
                  <>
                    <span>&bull;</span>
                    <span className="font-mono text-[10px] bg-muted/60 px-1 py-0.2 rounded">
                      {notification.metadata.referenceId}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Button (Desktop/Tablet) */}
          <div className="hidden sm:flex flex-col items-end gap-2 shrink-0 self-center">
            <Button
              type="button"
              variant={!notification.isRead ? "default" : "outline"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(notification);
              }}
              className="text-xs h-8 gap-1"
            >
              <Eye className="h-3 w-3" />
              <span>Inspect</span>
            </Button>

            <button
              type="button"
              onClick={(e) => onToggleRead(notification.id, e)}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 py-0.5 px-1.5 rounded hover:bg-muted/60"
              title={notification.isRead ? "Mark as unread" : "Mark as read"}
            >
              {notification.isRead ? (
                <>
                  <RotateCcw className="h-2.5 w-2.5" />
                  <span>Unread</span>
                </>
              ) : (
                <>
                  <Check className="h-2.5 w-2.5 text-primary" />
                  <span>Mark read</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile bottom actions */}
        <div className="flex sm:hidden items-center justify-between gap-2 pt-3 mt-2 border-t border-border/50 text-xs">
          <button
            type="button"
            onClick={(e) => onToggleRead(notification.id, e)}
            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            {notification.isRead ? (
              <>
                <RotateCcw className="h-3 w-3" />
                <span>Mark as unread</span>
              </>
            ) : (
              <>
                <Check className="h-3 w-3 text-primary" />
                <span>Mark read</span>
              </>
            )}
          </button>

          <span className="text-[11px] text-primary font-semibold flex items-center gap-1 group-hover:underline">
            <span>View Details</span>
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
