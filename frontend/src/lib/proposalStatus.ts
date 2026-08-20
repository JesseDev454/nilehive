export const ONECLUB_PROPOSAL_STATUSES = [
  "draft",
  "pending_advisor_review",
  "pending_admin_review",
  "advisor_rejected",
  "admin_rejected",
  "approved",
] as const;

export type OneClubProposalStatus = (typeof ONECLUB_PROPOSAL_STATUSES)[number];

export const PROPOSAL_STATUS_LABELS: Record<OneClubProposalStatus, string> = {
  draft: "Draft",
  pending_advisor_review: "Waiting for Advisor",
  pending_admin_review: "Waiting for Admin",
  advisor_rejected: "Returned by Advisor",
  admin_rejected: "Returned by Admin",
  approved: "Approved",
};

const UNSUPPORTED_PROPOSAL_STATUSES = new Set([
  "pending_admin",
  "revisions_requested",
  "advisor_approved",
  "rejected",
]);

export function isOneClubProposalStatus(value: string | null | undefined): value is OneClubProposalStatus {
  return ONECLUB_PROPOSAL_STATUSES.includes(value as OneClubProposalStatus);
}

export function proposalStatusLabel(status: string | null | undefined): string {
  if (isOneClubProposalStatus(status)) {
    return PROPOSAL_STATUS_LABELS[status];
  }
  return "Unknown status";
}

export function isReturnedProposalStatus(status: string | null | undefined): boolean {
  return status === "advisor_rejected" || status === "admin_rejected";
}

export function isUnderReviewProposalStatus(status: string | null | undefined): boolean {
  return status === "pending_advisor_review" || status === "pending_admin_review";
}

export function isUnsupportedProposalStatus(status: string | null | undefined): boolean {
  return UNSUPPORTED_PROPOSAL_STATUSES.has(String(status || ""));
}

export function applyAdvisorMockDecision(
  status: string,
  decision: "approve" | "reject",
): OneClubProposalStatus {
  if (decision === "approve") return "pending_admin_review";
  return "advisor_rejected";
}
