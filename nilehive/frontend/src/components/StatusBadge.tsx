import { cn } from "@/lib/utils";
import { getProposalStatusMeta } from "@/lib/proposalWorkflow";

type Status = string;

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "border-muted-foreground bg-muted text-muted-foreground" },
  pending: { label: "Pending", className: "border-warning bg-warning text-warning-foreground" },
  pending_advisor_review: { label: "Awaiting Advisor Review", className: "border-warning bg-warning text-warning-foreground" },
  pending_admin_review: { label: "Awaiting Club Services Final Review", className: "border-primary bg-primary text-primary-foreground" },
  approved: { label: "Approved Event", className: "border-success bg-success text-success-foreground" },
  advisor_approved: { label: "Advisor Approved", className: "border-success bg-success text-success-foreground" },
  active: { label: "Active", className: "border-success bg-success text-success-foreground" },
  paid: { label: "Paid", className: "border-success bg-success text-success-foreground" },
  submitted: { label: "Submitted", className: "border-warning bg-warning text-warning-foreground" },
  in_progress: { label: "In Progress", className: "border-warning bg-warning text-warning-foreground" },
  completed: { label: "Completed", className: "border-success bg-success text-success-foreground" },
  blocked: { label: "Blocked", className: "border-destructive bg-destructive text-destructive-foreground" },
  rejected: { label: "Rejected", className: "border-destructive bg-destructive text-destructive-foreground" },
  advisor_rejected: { label: "Returned by Advisor", className: "border-destructive bg-destructive text-destructive-foreground" },
  admin_rejected: { label: "Returned by Club Services", className: "border-destructive bg-destructive text-destructive-foreground" },
};

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status] ?? getProposalStatusMeta(status) ?? {
    label: status.replace(/_/g, " "),
    className: "bg-muted text-muted-foreground"
  };

  return (
    <span className={cn("nh-status", config.className)}>
      {config.label}
    </span>
  );
}
