export const PROPOSAL_STATUS_META: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  pending_advisor_review: { label: "Awaiting Advisor Review", className: "bg-warning/15 text-warning" },
  pending_admin_review: { label: "Awaiting Club Services Final Review", className: "bg-primary/15 text-primary" },
  approved: { label: "Approved Event", className: "bg-success/15 text-success" },
  advisor_rejected: { label: "Returned by Advisor", className: "bg-destructive/15 text-destructive" },
  admin_rejected: { label: "Returned by Club Services", className: "bg-destructive/15 text-destructive" }
};

export function getProposalStatusMeta(status: string) {
  return PROPOSAL_STATUS_META[status] ?? {
    label: status.replace(/_/g, " "),
    className: "bg-muted text-muted-foreground"
  };
}

export function getProposalOwnerLabel(owner?: string | null) {
  const labels: Record<string, string> = {
    president: "With President",
    advisor: "With Advisor",
    admin: "With Club Services Admin",
    completed: "Completed"
  };

  return owner ? labels[owner] ?? owner.replace(/_/g, " ") : "Not assigned";
}

export function getProposalNextAction(status: string) {
  const actions: Record<string, string> = {
    draft: "Complete the form and submit it for advisor review.",
    pending_advisor_review: "Waiting for the club advisor to review this proposal.",
    pending_admin_review: "Waiting for Club Services to give the final decision.",
    advisor_rejected: "Review the advisor remarks, edit the proposal, then resubmit.",
    admin_rejected: "Review the Club Services remarks, edit the proposal, then resubmit.",
    approved: "This proposal is now an approved event."
  };

  return actions[status] ?? "Check the proposal details for the next step.";
}

export function isProposalEditable(status: string) {
  return status === "draft" || status === "advisor_rejected" || status === "admin_rejected";
}

export function isProposalReturned(status: string) {
  return status === "advisor_rejected" || status === "admin_rejected";
}

export function getProposalPrimaryActionLabel(status: string) {
  if (status === "draft") {
    return "Continue Editing";
  }

  if (isProposalReturned(status)) {
    return "Edit and Resubmit";
  }

  if (status === "approved") {
    return "View Approved Event Details";
  }

  return "View Progress";
}
