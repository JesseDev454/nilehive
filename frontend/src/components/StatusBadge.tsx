import { cn } from "@/lib/utils";
import { getProposalStatusMeta } from "@/lib/proposalWorkflow";

type Status = string;

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  pending: { label: "Pending", className: "bg-warning/15 text-warning" },
  pending_advisor_review: { label: "Awaiting Advisor Review", className: "bg-warning/15 text-warning" },
  pending_admin_review: { label: "Awaiting Club Services Final Review", className: "bg-primary/15 text-primary" },
  approved: { label: "Approved Event", className: "bg-success/15 text-success" },
  advisor_approved: { label: "Advisor Approved", className: "bg-success/15 text-success" },
  rejected: { label: "Rejected", className: "bg-destructive/15 text-destructive" },
  advisor_rejected: { label: "Returned by Advisor", className: "bg-destructive/15 text-destructive" },
  admin_rejected: { label: "Returned by Club Services", className: "bg-destructive/15 text-destructive" },
};

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status] ?? getProposalStatusMeta(status) ?? {
    label: status.replace(/_/g, " "),
    className: "bg-muted text-muted-foreground"
  };

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", config.className)}>
      {config.label}
    </span>
  );
}
