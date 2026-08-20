export type AdminNotificationCategory =
  | "proposal"
  | "join_request"
  | "dues_proof"
  | "event"
  | "announcement"
  | "system";

export interface AdminNotificationRecord {
  id: string;
  category: AdminNotificationCategory;
  title: string;
  message: string;
  timestamp: string; // ISO 8601
  isRead: boolean;
  relatedRecordType: "proposal" | "membership" | "payment" | "event" | "announcement" | "general";
  relatedRecordId?: string;
  destinationUrl: string;
  destinationLabel: string;
  source: string;
}

export const INITIAL_ADMIN_NOTIFICATIONS: AdminNotificationRecord[] = [
  {
    id: "notif-01",
    category: "proposal",
    title: "New Proposal Awaiting Admin Approval",
    message: "Nile Robotics Society submitted 'Autonomous Drone Navigational Showcase' requesting ₦450,000 grant and Innovation Hall reservation.",
    timestamp: "2026-08-19T08:30:00Z",
    isRead: false,
    relatedRecordType: "proposal",
    relatedRecordId: "prop-01",
    destinationUrl: "/approvals",
    destinationLabel: "Review Proposal in Approvals",
    source: "Staff Advisor Dr. Farouk Bello"
  },
  {
    id: "notif-02",
    category: "dues_proof",
    title: "Payment Proof Submitted for Verification",
    message: "Student Ibrahim Suleiman (210103044) uploaded transfer receipt for ₦10,000 session dues for Nile Google Developers Club.",
    timestamp: "2026-08-19T07:45:00Z",
    isRead: false,
    relatedRecordType: "payment",
    relatedRecordId: "proof-01",
    destinationUrl: "/approvals",
    destinationLabel: "Verify Proof in Approvals",
    source: "Student Portal"
  },
  {
    id: "notif-03",
    category: "join_request",
    title: "New Club Membership Request",
    message: "Amina Yusuf submitted membership application with statement of interest to join Cyber Security Club.",
    timestamp: "2026-08-18T16:20:00Z",
    isRead: true,
    relatedRecordType: "membership",
    relatedRecordId: "req-01",
    destinationUrl: "/approvals",
    destinationLabel: "View Request in Approvals",
    source: "Membership Registry"
  },
  {
    id: "notif-04",
    category: "event",
    title: "Campus Event Happening Today",
    message: "'Google Cloud Architecture Bootcamp' by Nile Google Developers is scheduled today at 14:00 in Main Auditorium. Organizer QR is active.",
    timestamp: "2026-08-18T11:00:00Z",
    isRead: true,
    relatedRecordType: "event",
    relatedRecordId: "evt-01",
    destinationUrl: "/events",
    destinationLabel: "Open Event in Campus Events",
    source: "Events Coordinator"
  },
  {
    id: "notif-05",
    category: "announcement",
    title: "Broadcast Published to All Official Clubs",
    message: "Official broadcast 'Annual Club Budget & Activity Grant Guidelines' delivered to executive committees across 14 clubs.",
    timestamp: "2026-08-17T14:30:00Z",
    isRead: true,
    relatedRecordType: "announcement",
    relatedRecordId: "ann-01",
    destinationUrl: "/communications",
    destinationLabel: "View Broadcast in Communications",
    source: "Directorate Broadcast Engine"
  },
  {
    id: "notif-06",
    category: "system",
    title: "Semester 1 Club Governance Window Active",
    message: "System roster audits and presidential appointment confirmations are now open for the 2026/2027 academic session.",
    timestamp: "2026-08-15T09:00:00Z",
    isRead: true,
    relatedRecordType: "general",
    destinationUrl: "/user-management",
    destinationLabel: "Check Directory in People",
    source: "Campus One Identity System"
  }
];

export const CATEGORY_CONFIG: Record<
  AdminNotificationCategory,
  { label: string; badgeClass: string; iconName: string }
> = {
  proposal: {
    label: "Proposals",
    badgeClass: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
    iconName: "FileCheck"
  },
  join_request: {
    label: "Join Requests",
    badgeClass: "bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30",
    iconName: "UserPlus"
  },
  dues_proof: {
    label: "Dues Proofs",
    badgeClass: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
    iconName: "CreditCard"
  },
  event: {
    label: "Campus Events",
    badgeClass: "bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30",
    iconName: "CalendarDays"
  },
  announcement: {
    label: "Broadcasts",
    badgeClass: "bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-500/30",
    iconName: "Megaphone"
  },
  system: {
    label: "System Alerts",
    badgeClass: "bg-slate-500/15 text-slate-800 dark:text-slate-300 border-slate-500/30",
    iconName: "ShieldAlert"
  }
};
