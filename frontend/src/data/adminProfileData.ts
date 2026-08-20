export interface AdminProfileDetails {
  id: string;
  name: string;
  email: string;
  staffId: string;
  portalRole: "admin";
  appRole: "Admin (Club Services)";
  department: string;
  authProvider: string;
  sessionStartedAt: string;
  governanceScope: string;
  authorities: string[];
}

export const DETERMINISTIC_ADMIN_PROFILE: AdminProfileDetails = {
  id: "usr-admin-1",
  name: "Director Zainab Ahmed",
  email: "zainab.ahmed@nileuniversity.edu.ng",
  staffId: "STAFF/1004",
  portalRole: "admin",
  appRole: "Admin (Club Services)",
  department: "Student Affairs & Club Services Directorate",
  authProvider: "Nile University Campus One Single Sign-On (OIDC)",
  sessionStartedAt: "2026-08-19T08:00:00Z",
  governanceScope: "All 14 Official Nile University Student Clubs & Societies",
  authorities: [
    "Final Event & Proposal Endorsement",
    "Club Charter & Executive Appointments",
    "Campus-Wide Announcement Broadcasting",
    "Dues Ledger & Financial Compliance Oversight",
    "Institutional Telemetry & Attendance Verification"
  ]
};
