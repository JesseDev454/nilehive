function isPastProposalEventDate(eventDate?: string | null) {
  if (!eventDate) {
    return false;
  }

  const eventTime = new Date(`${eventDate}T23:59:59`).getTime();

  return Number.isFinite(eventTime) && Date.now() > eventTime;
}

export const PROPOSAL_STATUS_META: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "border-muted-foreground/25 bg-muted text-muted-foreground" },
  pending_advisor_review: { label: "Awaiting Advisor Review", className: "border-warning/25 bg-warning/15 text-warning" },
  pending_admin_review: { label: "Awaiting OneClub Final Review", className: "border-primary/20 bg-primary/10 text-primary" },
  approved: { label: "Proposal Approved", className: "border-success/25 bg-success/15 text-success" },
  advisor_rejected: { label: "Rejected by Advisor", className: "border-destructive/25 bg-destructive/10 text-destructive" },
  admin_rejected: { label: "Rejected by OneClub", className: "border-destructive/25 bg-destructive/10 text-destructive" }
};

export function getProposalStatusMeta(status: string, eventDate?: string | null) {
  if (status === "approved") {
    return {
      label: isPastProposalEventDate(eventDate) ? "Event Held" : "Proposal Approved",
      className: "border-success/25 bg-success/15 text-success"
    };
  }

  return PROPOSAL_STATUS_META[status] ?? {
    label: status.replace(/_/g, " "),
    className: "bg-muted text-muted-foreground"
  };
}

export function getProposalOwnerLabel(owner?: string | null) {
  const labels: Record<string, string> = {
    president: "With President",
    advisor: "With Advisor",
    admin: "With OneClub Admin",
    completed: "Completed"
  };

  return owner ? labels[owner] ?? owner.replace(/_/g, " ") : "Not assigned";
}

export function getProposalNextAction(status: string, eventDate?: string | null) {
  const actions: Record<string, string> = {
    draft: "Complete the form and submit it for advisor review.",
    pending_advisor_review: "Waiting for the club advisor to review this proposal.",
    pending_admin_review: "Waiting for OneClub to give the final decision.",
    advisor_rejected: "Review the advisor remarks, edit the proposal, then resubmit.",
    admin_rejected: "Review the OneClub remarks, edit the proposal, then resubmit.",
    approved: isPastProposalEventDate(eventDate)
      ? "This event has already been held."
      : "This proposal is approved and waiting for the event date."
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
    return "View Proposal Details";
  }

  return "View Progress";
}
