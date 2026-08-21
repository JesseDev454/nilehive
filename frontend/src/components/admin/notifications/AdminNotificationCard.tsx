import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  ExternalLink,
  Eye,
  FileCheck2,
  Megaphone,
  Shield,
  UserPlus
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  CATEGORY_CONFIG,
  type AdminNotificationCategory,
  type AdminNotificationRecord
} from "@/data/adminNotificationsData";

interface AdminNotificationCardProps {
  notification: AdminNotificationRecord;
  onInspect: (item: AdminNotificationRecord) => void;
  onSelect: (item: AdminNotificationRecord) => void;
}

export function AdminNotificationCard({
  notification,
  onInspect,
  onSelect
}: AdminNotificationCardProps) {
  const categoryConf = CATEGORY_CONFIG[notification.category];

  const getCategoryIcon = (category: AdminNotificationCategory) => {
    switch (category) {
      case "proposal":
        return <FileCheck2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      case "join_request":
        return <UserPlus className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case "dues_proof":
        return <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case "event":
        return <CalendarDays className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      case "announcement":
        return <Megaphone className="h-4 w-4 text-sky-600 dark:text-sky-400" />;
      case "system":
        return <Shield className="h-4 w-4 text-slate-600 dark:text-slate-400" />;
    }
  };

  const formattedDate = new Date(notification.timestamp).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div
      id={`notification-${notification.id}`}
      aria-label={`${notification.title}, ${notification.isRead ? "read" : "unread"}`}
      className={`group flex flex-col justify-between rounded-2xl border p-4 shadow-2xs transition-all duration-180 ${
        !notification.isRead
          ? "border-primary/40 bg-card/90 ring-1 ring-primary/20"
          : "border-border bg-card hover:border-primary/30"
      }`}
    >
      <div className="space-y-3">
        {/* Header Badges & Timestamp */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted">
              {getCategoryIcon(notification.category)}
            </div>
            <span
              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${categoryConf.badgeClass}`}
            >
              {categoryConf.label}
            </span>
            {!notification.isRead && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary">
                <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                Unread
              </span>
            )}
          </div>

          <span className="text-[11px] text-muted-foreground font-mono">
            {formattedDate}
          </span>
        </div>

        {/* Title & Message */}
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
            {notification.title}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {notification.message}
          </p>
        </div>

        {/* Source metadata */}
        <div className="text-[11px] text-muted-foreground pt-1">
          <span>Source: </span>
          <span className="font-medium text-foreground">{notification.source}</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onInspect(notification)}
          className="h-8 text-xs text-muted-foreground hover:text-foreground"
        >
          <span>Details</span>
        </Button>

        {notification.destinationUrl ? (
          <Link
            to={notification.destinationUrl}
            onClick={() => onSelect(notification)}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
          >
            <span>{notification.destinationLabel}</span>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        ) : (
          <span className="text-[11px] text-muted-foreground">Destination unavailable</span>
        )}
      </div>
    </div>
  );
}
