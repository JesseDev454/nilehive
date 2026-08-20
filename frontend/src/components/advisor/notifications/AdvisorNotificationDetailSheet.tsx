import { Link } from "react-router-dom";
import {
  FileText,
  Clock,
  School,
  ShieldCheck,
  Building,
  Calendar,
  MapPin,
  Coins,
  ArrowRight,
  Check,
  RotateCcw,
  Info,
  Lock,
  ExternalLink,
  User,
  AlertCircle
} from "lucide-react";
import { Sheet } from "@/shared/components/Sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/shared/components/Button";
import { AdvisorNotificationRecord } from "./advisorNotificationData";

interface AdvisorNotificationDetailSheetProps {
  notification: AdvisorNotificationRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleRead: (id: string) => void;
}

export function AdvisorNotificationDetailSheet({
  notification,
  isOpen,
  onClose,
  onToggleRead
}: AdvisorNotificationDetailSheetProps) {
  if (!notification) return null;

  const getCategoryIcon = () => {
    switch (notification.category) {
      case "proposal":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "report":
        return <FileText className="h-5 w-5 text-emerald-500" />;
      case "club":
        return <School className="h-5 w-5 text-blue-500" />;
      case "directorate":
        return <ShieldCheck className="h-5 w-5 text-primary" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Advisor Notification Alert"
      description="Campus One notification details and related institutional records."
      footer={
        <div className="flex items-center justify-between gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onToggleRead(notification.id)}
            className="text-xs gap-1.5"
          >
            {notification.isRead ? (
              <>
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Mark as Unread</span>
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5 text-primary" />
                <span>Mark as Read</span>
              </>
            )}
          </Button>

          {notification.actionUrl && (
            <Button
              asChild
              variant="default"
              size="sm"
              className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold"
            >
              <Link to={notification.actionUrl}>
                <span>{notification.actionLabel || "Open Record"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6 text-left py-2">
        {/* Header summary block */}
        <div className="flex items-start gap-3 p-4 rounded-2xl border border-border/80 bg-muted/30">
          <div className="p-3 rounded-xl bg-background border border-border shrink-0">
            {getCategoryIcon()}
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {notification.clubCode && (
                <Badge variant="outline" className="font-bold text-xs">
                  {notification.clubCode}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">{notification.timeAgo}</span>
            </div>
            <h2 className="text-base font-bold text-foreground leading-snug">
              {notification.title}
            </h2>
          </div>
        </div>

        {/* Sender details */}
        <div className="space-y-1.5 p-3.5 rounded-xl border border-border/60 bg-card text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Originated By</span>
            <span className="font-mono text-[10px]">
              {notification.metadata?.referenceId || "REF-CAMPUS-ONE"}
            </span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <div className="h-7 w-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
              {notification.sender.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-foreground">{notification.sender}</p>
              <p className="text-muted-foreground">{notification.senderRole} &bull; {notification.senderAffiliation}</p>
            </div>
          </div>
        </div>

        {/* Full Message Body */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Official Transmission
          </h3>
          <div className="p-4 rounded-2xl border border-border/80 bg-card text-sm leading-relaxed text-foreground whitespace-pre-line">
            {notification.fullMessage}
          </div>
        </div>

        {/* Associated Record Metadata */}
        {notification.metadata && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Institutional Context
            </h3>
            <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-xl border border-border/60 bg-muted/20 text-xs">
              {notification.metadata.eventDate && (
                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-primary" /> Target Date
                  </span>
                  <p className="font-semibold text-foreground">{notification.metadata.eventDate}</p>
                </div>
              )}

              {notification.metadata.venue && (
                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-primary" /> Venue
                  </span>
                  <p className="font-semibold text-foreground">{notification.metadata.venue}</p>
                </div>
              )}

              {notification.metadata.budgetEstimated && (
                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                    <Coins className="h-3 w-3 text-primary" /> Estimated Budget
                  </span>
                  <p className="font-semibold text-foreground">{notification.metadata.budgetEstimated}</p>
                </div>
              )}

              {notification.clubName && (
                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                    <School className="h-3 w-3 text-primary" /> Assigned Chapter
                  </span>
                  <p className="font-semibold text-foreground truncate">{notification.clubName}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Read-Only Governance Scope Reminder */}
        <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 space-y-1.5 text-xs text-left">
          <div className="flex items-center gap-1.5 font-bold text-primary">
            <Lock className="h-3.5 w-3.5" />
            <span>Advisor Governance Boundary</span>
          </div>
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            Advisors review proposals from assigned clubs. Proposal editing and final decisions are not available in this workspace.
          </p>
        </div>
      </div>
    </Sheet>
  );
}
