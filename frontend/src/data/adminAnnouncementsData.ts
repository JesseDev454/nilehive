export type AnnouncementAudienceType = "all_users" | "all_clubs" | "one_club" | "role";
export type AnnouncementPriorityLevel = "low" | "normal" | "high" | "urgent";
export type TargetRoleType = "student" | "executive" | "president" | "advisor";

export interface AdminAnnouncementItem {
  id: string;
  title: string;
  content: string;
  audience: AnnouncementAudienceType;
  targetClubId?: string;
  targetClubName?: string;
  targetRole?: TargetRoleType;
  priority: AnnouncementPriorityLevel;
  publishedAt: string; // ISO 8601
  publishedBy: string;
  readCount: number;
  totalRecipients: number;
  actionUrl?: string;
  actionLabel?: string;
}

export const INITIAL_ADMIN_ANNOUNCEMENTS: AdminAnnouncementItem[] = [
  {
    id: "ann-01",
    title: "2026/2027 Academic Session: Annual Club Budget & Activity Grant Guidelines",
    content: "The Directorate of Student Affairs has published the official grant allocation framework and financial compliance handbook for the 2026/2027 academic session. All recognized student club executives and faculty advisors are required to review the approved proposal submission calendar before seeking disbursement for Semester 1 events.",
    audience: "all_clubs",
    priority: "high",
    publishedAt: "2026-08-18T14:30:00Z",
    publishedBy: "Directorate of Student Affairs",
    readCount: 124,
    totalRecipients: 156,
    actionUrl: "/proposals",
    actionLabel: "View Proposal Guidelines"
  },
  {
    id: "ann-02",
    title: "Mandatory Digital Attendance Verification via OneClub QR Check-In",
    content: "Effective immediately, physical paper sign-in sheets will no longer be accepted for official event compliance or grant clearance. All club presidents and event organizers must project the OneClub Organizer QR code at entrance checkpoints. Students who experience camera or device issues can be recorded using the Manual Check-In fallback.",
    audience: "all_users",
    priority: "urgent",
    publishedAt: "2026-08-17T09:00:00Z",
    publishedBy: "OneClub Governance Board",
    readCount: 1420,
    totalRecipients: 1850,
    actionUrl: "/events",
    actionLabel: "Open Campus Events"
  },
  {
    id: "ann-03",
    title: "Presidential Briefing: Nile University Inter-Faculty Debate & Innovation Fair",
    content: "Club Presidents are invited to attend the bi-monthly coordination summit scheduled for next Friday at Senate Chambers Room 204. Agenda includes venue reservation protocol upgrades, audio-visual technical requests, and university sponsor branding guidelines.",
    audience: "role",
    targetRole: "president",
    priority: "normal",
    publishedAt: "2026-08-14T11:15:00Z",
    publishedBy: "Dean of Student Affairs",
    readCount: 14,
    totalRecipients: 14
  },
  {
    id: "ann-04",
    title: "Special Notice: Nile Google Developers Club Hub Access Schedule",
    content: "Please be advised that Tech Lab 4 access has been extended until 20:00 on weekdays to accommodate GDG Buildathon preparation and AI workshop prototyping. Ensure laboratory keycards are checked out through the Departmental Secretary.",
    audience: "one_club",
    targetClubId: "google-developers",
    targetClubName: "Nile Google Developers",
    priority: "low",
    publishedAt: "2026-08-11T16:45:00Z",
    publishedBy: "Directorate Admin",
    readCount: 88,
    totalRecipients: 95
  },
  {
    id: "ann-05",
    title: "Faculty Advisor Advisory: Semester 1 Proposal Review Protocol & Turnaround Timelines",
    content: "Staff Advisors are kindly requested to complete preliminary safety, risk, and budget checks on student event proposals within 3 working days of submission. Prompt advisor endorsement ensures timely approval by the University Directorate.",
    audience: "role",
    targetRole: "advisor",
    priority: "normal",
    publishedAt: "2026-08-08T10:00:00Z",
    publishedBy: "Directorate of Student Affairs",
    readCount: 12,
    totalRecipients: 14
  }
];

export const AUDIENCE_CONFIG: Record<
  AnnouncementAudienceType,
  { label: string; description: string; badgeLabel: string }
> = {
  all_users: {
    label: "All Campus Users",
    description: "Broadcasted campus-wide to all students, executives, presidents, and advisors.",
    badgeLabel: "All Campus Users"
  },
  all_clubs: {
    label: "All 14 Official Clubs",
    description: "Dispatched to executive committees and faculty advisors across all registered clubs.",
    badgeLabel: "All 14 Clubs"
  },
  one_club: {
    label: "Single Official Club",
    description: "Targeted specifically to the roster and executives of a selected club.",
    badgeLabel: "Club Specific"
  },
  role: {
    label: "Specific Governance Role",
    description: "Delivered strictly to users holding a designated institutional role.",
    badgeLabel: "Role Specific"
  }
};

export const PRIORITY_CONFIG: Record<
  AnnouncementPriorityLevel,
  { label: string; badgeClass: string; description: string }
> = {
  low: {
    label: "Low (Information)",
    badgeClass: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20",
    description: "General reference or non-urgent informational update."
  },
  normal: {
    label: "Normal (Standard)",
    badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
    description: "Standard operational notice or routine campus communication."
  },
  high: {
    label: "High (Important)",
    badgeClass: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
    description: "Important institutional policy, deadline, or compliance announcement."
  },
  urgent: {
    label: "Urgent (Critical)",
    badgeClass: "bg-red-500/15 text-red-800 dark:text-red-300 border-red-500/30 font-bold",
    description: "Immediate action required or critical campus procedure change."
  }
};

export const ROLE_LABELS: Record<TargetRoleType, string> = {
  student: "Students Only",
  executive: "Club Executives Only",
  president: "Club Presidents Only",
  advisor: "Staff Advisors Only"
};
