export type AnalyticsTimeRange = 7 | 30 | 90;

export interface MetricDefinition {
  id: "active_users" | "join_requests" | "dues_proofs" | "event_attendance";
  label: string;
  shortLabel: string;
  description: string;
  source: string;
  methodology: string;
  relevance: string;
}

export const METRIC_DEFINITIONS: Record<MetricDefinition["id"], MetricDefinition> = {
  active_users: {
    id: "active_users",
    label: "Active Campus Users",
    shortLabel: "Active Accounts",
    description: "Unique students, club executives, presidents, and faculty advisors actively authenticating and engaging with OneClub services during the period.",
    source: "Campus One Identity Service & Auth Session Logs",
    methodology: "Count of distinct user IDs with at least one authenticated session or workflow event within the selected time window.",
    relevance: "Measures overall campus digital platform adoption and continuous student engagement."
  },
  join_requests: {
    id: "join_requests",
    label: "Club Join Requests",
    shortLabel: "Join Applications",
    description: "Formal membership applications submitted by students to join any of the 14 official Nile University student clubs and societies.",
    source: "Club Services Membership Registry",
    methodology: "Total count of membership application records created during the selected date window.",
    relevance: "Reflects student recruitment momentum and interest in co-curricular activities."
  },
  dues_proofs: {
    id: "dues_proofs",
    label: "Dues Payment Proofs",
    shortLabel: "Payment Receipts",
    description: "Bank-transfer proof uploaded by students for session dues review and active membership confirmation.",
    source: "Dues & Financial Compliance Ledger",
    methodology: "Total count of student bank payment receipts submitted for review within the time window.",
    relevance: "Tracks compliance with semester club dues requirements and financial clearance."
  },
  event_attendance: {
    id: "event_attendance",
    label: "Campus Event Attendance",
    shortLabel: "Event Check-Ins",
    description: "Verified student check-ins recorded at approved campus club events, workshops, general assemblies, and exhibitions.",
    source: "Event Attendance System (Organizer QR & Manual Check-In)",
    methodology: "Total number of verified check-in events logged by event organizers during the selected window.",
    relevance: "Measures real-world student participation in extracurricular campus programming."
  }
};

export interface AnalyticsPeriodData {
  activeUsers: number;
  joinRequests: number;
  duesProofs: number;
  eventAttendance: number;
}

export const DETERMINISTIC_ANALYTICS: Record<AnalyticsTimeRange, AnalyticsPeriodData> = {
  7: {
    activeUsers: 342,
    joinRequests: 38,
    duesProofs: 29,
    eventAttendance: 85
  },
  30: {
    activeUsers: 1184,
    joinRequests: 156,
    duesProofs: 124,
    eventAttendance: 340
  },
  90: {
    activeUsers: 2890,
    joinRequests: 412,
    duesProofs: 348,
    eventAttendance: 920
  }
};
