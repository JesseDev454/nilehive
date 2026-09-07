import { cn } from "@/lib/utils";
import { getProposalStatusMeta } from "@/lib/proposalWorkflow";

type Status = string;

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "border-muted-foreground/25 bg-muted text-muted-foreground" },
  pending: { label: "Pending", className: "border-warning/25 bg-warning/15 text-warning" },
  pending_advisor_review: { label: "Awaiting Advisor Review", className: "border-warning/25 bg-warning/15 text-warning" },
  pending_admin_review: { label: "Awaiting OneClub Final Review", className: "border-primary/20 bg-primary/10 text-primary" },
  approved: { label: "Proposal Approved", className: "border-success/25 bg-success/15 text-success" },
  advisor_approved: { label: "Advisor Approved", className: "border-success/25 bg-success/15 text-success" },
  active: { label: "Active", className: "border-success/25 bg-success/15 text-success" },
  paid: { label: "Paid", className: "border-success/25 bg-success/15 text-success" },
  submitted: { label: "Submitted", className: "border-warning/25 bg-warning/15 text-warning" },
  in_progress: { label: "In Progress", className: "border-warning/25 bg-warning/15 text-warning" },
  completed: { label: "Completed", className: "border-success/25 bg-success/15 text-success" },
  blocked: { label: "Blocked", className: "border-destructive/25 bg-destructive/10 text-destructive" },
  rejected: { label: "Rejected", className: "border-destructive/25 bg-destructive/10 text-destructive" },
  advisor_rejected: { label: "Rejected by Advisor", className: "border-destructive/25 bg-destructive/10 text-destructive" },
  admin_rejected: { label: "Rejected by OneClub", className: "border-destructive/25 bg-destructive/10 text-destructive" },
};

export function StatusBadge({ status, eventDate }: { status: Status; eventDate?: string | null }) {
  const config = getProposalStatusMeta(status, eventDate) ?? statusConfig[status] ?? {
    label: status.replace(/_/g, " "),
    className: "bg-muted text-muted-foreground"
  };

  return (
    <span className={cn("clb-status", config.className)}>
      {config.label}
    </span>
  );
}
