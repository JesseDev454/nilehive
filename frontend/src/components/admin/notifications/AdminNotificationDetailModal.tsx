import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Info,
  ShieldCheck,
  X
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CATEGORY_CONFIG,
  type AdminNotificationRecord
} from "@/data/adminNotificationsData";

interface AdminNotificationDetailModalProps {
  notification: AdminNotificationRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (item: AdminNotificationRecord) => void;
}

export function AdminNotificationDetailModal({
  notification,
  open,
  onOpenChange,
  onNavigate
}: AdminNotificationDetailModalProps) {
  if (!notification) return null;

  const categoryConf = CATEGORY_CONFIG[notification.category];
  const formattedDateTime = new Date(notification.timestamp).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <span
              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${categoryConf.badgeClass}`}
            >
              {categoryConf.label}
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">
              ID: {notification.id}
            </span>
          </div>

          <DialogTitle className="text-lg font-bold text-foreground pt-1">
            {notification.title}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Received on {formattedDateTime} • Origin: {notification.source}
          </p>
        </DialogHeader>

        <div className="space-y-4 text-xs pt-1">
          {/* Notification Message */}
          <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-1">
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Notification Content</span>
            <p className="text-xs text-foreground leading-relaxed">
              {notification.message}
            </p>
          </div>

          {/* Related Record Metadata */}
          {notification.relatedRecordId && (
            <div className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-3">
              <span className="text-muted-foreground text-[11px]">Related Record:</span>
              <span className="font-mono font-semibold text-foreground text-[11px]">
                {notification.relatedRecordType.toUpperCase()} #{notification.relatedRecordId}
              </span>
            </div>
          )}

          {!notification.destinationUrl ? (
            <p className="text-xs text-muted-foreground">
              This notification does not have a safe destination in OneClub.
            </p>
          ) : null}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-9"
            >
              Dismiss
            </Button>
            {notification.destinationUrl ? (
            <Link
              to={notification.destinationUrl}
              onClick={() => {
                onNavigate(notification);
                onOpenChange(false);
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors h-11"
            >
              <span>{notification.destinationLabel}</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
