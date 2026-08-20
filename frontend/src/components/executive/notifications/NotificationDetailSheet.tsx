import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck,
  Info,
  Layers,
  Mail,
  Megaphone,
  School,
  ShieldCheck,
  Tag,
  User,
  X
} from "lucide-react";
import { Sheet } from "@/shared/components/Sheet";
import { Button } from "@/shared/components/Button";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Link } from "react-router-dom";

export interface ExecutiveNotificationItem {
  id: string;
  category: "task" | "event" | "directive" | "institutional";
  priority: "Urgent" | "Normal" | "Info";
  title: string;
  summary: string;
  details: string;
  sender: {
    name: string;
    role: string;
    email: string;
  };
  timestamp: string;
  isRead: boolean;
  relatedRecord?: {
    type: "task" | "event" | "club";
    title: string;
    link: string;
    actionLabel: string;
  };
}

interface NotificationDetailSheetProps {
  notification: ExecutiveNotificationItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDetailSheet({
  notification,
  isOpen,
  onClose
}: NotificationDetailSheetProps) {
  if (!notification) return null;

  const getCategoryConfig = (category: ExecutiveNotificationItem["category"]) => {
    switch (category) {
      case "task":
        return {
          label: "Action Item Assignment",
          icon: CheckCircle2,
          colorClass: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20"
        };
      case "event":
        return {
          label: "Event & Logistics Alert",
          icon: Calendar,
          colorClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
        };
      case "directive":
        return {
          label: "Presidential Directive",
          icon: Megaphone,
          colorClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
        };
      case "institutional":
        return {
          label: "Institutional & Compliance",
          icon: School,
          colorClass: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20"
        };
    }
  };

  const config = getCategoryConfig(notification.category);
  const IconComponent = config.icon;

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Notification Details"
      description="Official Nile University Executive Bulletin & Dispatch"
    >
      <div className="space-y-5 text-left text-xs">
        {/* Status & Priority Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${config.colorClass}`}
            >
              <IconComponent className="h-3.5 w-3.5" />
              <span>{config.label}</span>
            </span>

            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                notification.priority === "Urgent"
                  ? "bg-destructive/15 text-destructive border border-destructive/20"
                  : "bg-muted text-muted-foreground border border-border/60"
              }`}
            >
              {notification.priority} Priority
            </span>
          </div>

          <div className="flex items-center gap-1 text-muted-foreground font-mono text-[11px]">
            <Clock className="h-3 w-3" />
            <span>{notification.timestamp}</span>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-foreground leading-snug">
            {notification.title}
          </h3>
          <p className="text-xs text-muted-foreground font-medium">
            {notification.summary}
          </p>
        </div>

        {/* Sender Information Card */}
        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/70 space-y-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Dispatched By
          </span>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20">
                {notification.sender.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-foreground text-xs">{notification.sender.name}</h4>
                <p className="text-[11px] text-muted-foreground">{notification.sender.role}</p>
              </div>
            </div>
          </div>
          <div className="pt-1.5 border-t border-border/40 text-[11px] text-muted-foreground flex items-center gap-1">
            <Mail className="h-3 w-3 text-primary shrink-0" />
            <span className="truncate">{notification.sender.email}</span>
          </div>
        </div>

        {/* Full Message / Directive Context */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Full Dispatch Briefing
          </span>
          <div className="p-3.5 rounded-xl bg-card border border-border/80 text-foreground text-xs leading-relaxed space-y-2 shadow-2xs">
            <p>{notification.details}</p>
          </div>
        </div>

        {/* Linked Record Action (If applicable) */}
        {notification.relatedRecord && (
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                Related Workspace Record
              </span>
              <span className="text-[10px] font-mono text-muted-foreground capitalize">
                {notification.relatedRecord.type}
              </span>
            </div>
            <p className="font-bold text-xs text-foreground">
              {notification.relatedRecord.title}
            </p>
            <Link
              to={notification.relatedRecord.link}
              className="inline-flex w-full items-center justify-center gap-2 py-2 px-3 rounded-lg bg-primary text-primary-foreground font-bold text-xs shadow-xs hover:bg-primary/90 transition-colors"
            >
              <span>{notification.relatedRecord.actionLabel}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {/* Read-Only Officer Access Policy */}
        <div className="p-3 rounded-xl bg-muted/30 border border-border/50 text-[11px] text-muted-foreground space-y-1">
          <div className="flex items-center gap-1 font-semibold text-foreground">
            <Info className="h-3.5 w-3.5 text-primary" />
            <span>Executive Privacy &amp; Records</span>
          </div>
          <p className="leading-relaxed">
            This notification was generated specifically for your executive role (Workshops Coordinator). Alerts remain logged in your institutional audit trail for the 2025/2026 academic tenure.
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-semibold">
            <Bell className="h-3.5 w-3.5" />
            <span>Notification details</span>
          </span>

          <Button
            size="sm"
            onClick={onClose}
            className="text-xs font-bold"
          >
            Close
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
