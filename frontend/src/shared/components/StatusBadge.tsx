import React from "react";
import { CheckCircle2, Clock, XCircle, AlertTriangle, ShieldCheck, FileEdit } from "lucide-react";

export type BadgeStatusType =
  | "approved"
  | "pending"
  | "rejected"
  | "verified"
  | "unpaid"
  | "active"
  | "draft";

export interface StatusBadgeProps {
  status?: BadgeStatusType | string;
  variant?: string;
  dot?: boolean;
  label?: string;
  className?: string;
  showIcon?: boolean;
}

export function StatusBadge({
  status,
  variant,
  dot = false,
  label,
  className = "",
  showIcon = true
}: StatusBadgeProps) {
  const normalized = (status || variant || "default").toLowerCase();

  const getStatusConfig = () => {
    switch (normalized) {
      case "approved":
      case "verified":
      case "active":
        return {
          bg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
          icon: CheckCircle2,
          defaultLabel: normalized === "verified" ? "Verified" : normalized === "active" ? "Active" : "Approved"
        };
      case "pending":
      case "pending_advisor_review":
      case "pending_admin_review":
      case "proof_awaiting_review":
        return {
          bg: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
          icon: Clock,
          defaultLabel: "Pending Review"
        };
      case "rejected":
      case "proof_rejected":
        return {
          bg: "bg-destructive/10 text-destructive border-destructive/20",
          icon: XCircle,
          defaultLabel: "Rejected"
        };
      case "unpaid":
        return {
          bg: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
          icon: AlertTriangle,
          defaultLabel: "Unpaid"
        };
      case "draft":
        return {
          bg: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20",
          icon: FileEdit,
          defaultLabel: "Draft"
        };
      default:
        return {
          bg: "bg-muted text-muted-foreground border-border",
          icon: ShieldCheck,
          defaultLabel: status || variant || "Status"
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors ${config.bg} ${className}`}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" /> : showIcon && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
      <span>{label || config.defaultLabel}</span>
    </span>
  );
}
