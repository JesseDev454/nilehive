export interface AdminProfileDetails {
  id: string;
  name: string;
  email: string;
  staffId: string;
  portalUserId: string;
  portalRole: string;
  appRole: string;
  effectiveRole: string;
  customRoles: string[];
  accountStatus: string;
  department: string;
  authProvider: string;
  governanceScope: string;
  authorities: string[];
}

export const ADMIN_ROLE_CAPABILITIES = [
  "Final Event & Proposal Endorsement",
  "Club Charter & Executive Appointments",
  "Campus-Wide Announcement Broadcasting",
  "Dues Ledger & Financial Compliance Oversight",
  "Institutional Telemetry & Attendance Verification",
];

export const DETERMINISTIC_ADMIN_PROFILE: AdminProfileDetails = {
  id: "usr-admin-1",
  name: "Director Zainab Ahmed",
  email: "zainab.ahmed@nileuniversity.edu.ng",
  staffId: "STAFF/1004",
  portalUserId: "portal-admin-1",
  portalRole: "admin",
  appRole: "admin",
  effectiveRole: "admin",
  customRoles: ["club_services_admin"],
  accountStatus: "active",
  department: "Student Affairs & Club Services Directorate",
  authProvider: "Nile University Campus One Single Sign-On (OIDC)",
  governanceScope: "All official Nile University student clubs",
  authorities: ADMIN_ROLE_CAPABILITIES,
};

export function displayOrNotProvided(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "Not provided.";
}
