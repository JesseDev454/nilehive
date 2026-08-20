export const ONECLUB_MEMBERSHIP_REQUEST_STATUSES = [
  "pending",
  "approved_pending_dues",
  "active",
  "rejected",
  "cancelled",
] as const;

export type OneClubMembershipRequestStatus = (typeof ONECLUB_MEMBERSHIP_REQUEST_STATUSES)[number];

export const MEMBERSHIP_REQUEST_STATUS_LABELS: Record<OneClubMembershipRequestStatus, string> = {
  pending: "Pending review",
  approved_pending_dues: "Admitted, waiting for dues",
  active: "Admitted",
  rejected: "Declined",
  cancelled: "Cancelled",
};

const UNSUPPORTED_MEMBERSHIP_STATUSES = new Set(["approved", "verified"]);

export function isOneClubMembershipRequestStatus(
  value: string | null | undefined,
): value is OneClubMembershipRequestStatus {
  return ONECLUB_MEMBERSHIP_REQUEST_STATUSES.includes(value as OneClubMembershipRequestStatus);
}

export function membershipRequestStatusLabel(status: string | null | undefined): string {
  if (isOneClubMembershipRequestStatus(status)) {
    return MEMBERSHIP_REQUEST_STATUS_LABELS[status];
  }
  return "Unknown status";
}

export function isPendingMembershipRequest(status: string | null | undefined): boolean {
  return status === "pending";
}

export function isWhatsAppOnboardingReady(
  status: string | null | undefined,
  duesStatus: string | null | undefined,
  onboardingStatus: string | null | undefined,
): boolean {
  return status === "active" && duesStatus === "paid" && onboardingStatus !== "added";
}

export function isUnsupportedMembershipStatus(value: string | null | undefined): boolean {
  return UNSUPPORTED_MEMBERSHIP_STATUSES.has(String(value || ""));
}
