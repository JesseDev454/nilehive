export const ONECLUB_DUES_STATUSES = [
  "unpaid",
  "submitted",
  "paid",
  "rejected",
] as const;

export type OneClubDuesStatus = (typeof ONECLUB_DUES_STATUSES)[number];

export const DUES_STATUS_LABELS: Record<OneClubDuesStatus, string> = {
  unpaid: "Unpaid",
  submitted: "Proof submitted",
  paid: "Verified",
  rejected: "Rejected",
};

const UNSUPPORTED_DUES_STATUSES = new Set(["verified", "pending"]);

export function isOneClubDuesStatus(value: string | null | undefined): value is OneClubDuesStatus {
  return ONECLUB_DUES_STATUSES.includes(value as OneClubDuesStatus);
}

export function duesStatusLabel(status: string | null | undefined): string {
  if (isOneClubDuesStatus(status)) {
    return DUES_STATUS_LABELS[status];
  }
  return "Unknown status";
}

export function isActionableDuesStatus(status: string | null | undefined): boolean {
  return status === "submitted";
}

export function isDecidedDuesStatus(status: string | null | undefined): boolean {
  return status === "paid" || status === "rejected";
}

export function isUnsupportedDuesStatus(value: string | null | undefined): boolean {
  return UNSUPPORTED_DUES_STATUSES.has(String(value || ""));
}
