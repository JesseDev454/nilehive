import { LucideIcon, FileText, CheckCircle2, Clock, School, ShieldAlert, ShieldCheck, AlertTriangle, Building, Calendar, Users, MessageSquare, Info } from "lucide-react";

export type AdvisorNotificationCategory =
  | "all"
  | "action"
  | "proposal"
  | "report"
  | "club"
  | "directorate";

export type AdvisorNotificationPriority = "urgent" | "high" | "normal" | "low";

export interface AdvisorNotificationRecord {
  id: string;
  category: "proposal" | "report" | "club" | "directorate";
  title: string;
  summary: string;
  fullMessage: string;
  sender: string;
  senderRole: string;
  senderAffiliation: string;
  clubCode?: "NGD" | "NCIC" | "NSC" | "DIR";
  clubName?: string;
  timestamp: string;
  timeAgo: string;
  isRead: boolean;
  isActionRequired: boolean;
  actionLabel?: string;
  actionUrl?: string;
  priority: AdvisorNotificationPriority;
  metadata?: {
    referenceId?: string;
    proposalId?: string;
    reportId?: string;
    clubId?: string;
    budgetEstimated?: string;
    eventDate?: string;
    venue?: string;
    governanceNote?: string;
  };
}

export const INITIAL_ADVISOR_NOTIFICATIONS: AdvisorNotificationRecord[] = [
  {
    id: "notif-adv-001",
    category: "proposal",
    title: "New Proposal Submitted: Google Cloud DevFest 2026",
    summary: "President Ibrahim Sani (NGD) submitted an event proposal for Advisor review.",
    fullMessage:
      "President Ibrahim Sani submitted the event proposal and itemized budget for Google Cloud DevFest 2026. Review the full proposal before approving it for Admin's final decision.",
    sender: "Ibrahim Sani",
    senderRole: "Club President",
    senderAffiliation: "Nile Google Developers (NGD)",
    clubCode: "NGD",
    clubName: "Nile Google Developers",
    timestamp: "2026-08-20T07:15:00Z",
    timeAgo: "45 mins ago",
    isRead: false,
    isActionRequired: true,
    actionLabel: "Review in Queue",
    actionUrl: "/advisor/reviews",
    priority: "urgent",
    metadata: {
      referenceId: "PROP-NGD-2026-08",
      proposalId: "prop-ngd-08",
      clubId: "club-8",
      budgetEstimated: "₦450,000",
      eventDate: "October 24, 2026",
      venue: "Multipurpose Hall A",
      governanceNote: "Advisors provide faculty oversight. Read-only proposal text; approve or return with remarks."
    }
  },
  {
    id: "notif-adv-002",
    category: "proposal",
    title: "Revised Proposal Resubmitted: Nile Startup Campus Pitch Day",
    summary: "President Zainab Aliyu updated venue logistics and safety plans per your prior advisory feedback.",
    fullMessage:
      "President Zainab Aliyu has resubmitted the proposal for 'Nile Startup Campus Pitch Day & Venture Showcase'. The itemized security and stage rigging details have been revised in accordance with your previous advisory guidance. It is now ready for your secondary evaluation.",
    sender: "Zainab Aliyu",
    senderRole: "Club President",
    senderAffiliation: "Nile Startup Campus (NSC)",
    clubCode: "NSC",
    clubName: "Nile Startup Campus",
    timestamp: "2026-08-20T06:00:00Z",
    timeAgo: "2 hours ago",
    isRead: false,
    isActionRequired: true,
    actionLabel: "Inspect Resubmission",
    actionUrl: "/advisor/reviews",
    priority: "high",
    metadata: {
      referenceId: "PROP-NSC-2026-04",
      proposalId: "prop-nsc-04",
      clubId: "club-11",
      budgetEstimated: "₦320,000",
      eventDate: "November 12, 2026",
      venue: "Faculty of Engineering Atrium",
      governanceNote: "Check if prior feedback points regarding safety clearances were addressed."
    }
  },
  {
    id: "notif-adv-003",
    category: "directorate",
    title: "Approved: Green Campus Tree Planting Drive",
    summary: "Admin approved the proposal you reviewed on August 15.",
    fullMessage:
      "Admin approved the Green Campus Tree Planting & Sustainability Drive submitted by Nile Climate Initiatives Club. The venue is confirmed and site preparation can begin.",
    sender: "Club Services Admin",
    senderRole: "Club Services Admin",
    senderAffiliation: "Campus One Central Administration",
    clubCode: "NCIC",
    clubName: "Nile Climate Initiatives Club",
    timestamp: "2026-08-19T14:30:00Z",
    timeAgo: "Yesterday at 2:30 PM",
    isRead: true,
    isActionRequired: false,
    actionLabel: "View Approved Event",
    actionUrl: "/advisor/clubs",
    priority: "normal",
    metadata: {
      referenceId: "DSA-AUTH-2026-119",
      proposalId: "prop-ncic-02",
      clubId: "club-4",
      budgetEstimated: "₦180,000",
      eventDate: "September 05, 2026",
      venue: "Campus Green Field North",
      governanceNote: "Admin status: Full Approval Granted. No further advisor action required."
    }
  },
  {
    id: "notif-adv-004",
    category: "report",
    title: "Post-Event Audit Report Uploaded: Clean Tech Innovation Hackathon",
    summary: "NCIC has finalized its post-event report with 186 verified attendees and itemized expense reconciliation.",
    fullMessage:
      "Nile Climate Initiatives Club submitted its post-event report for the Clean Tech Innovation Hackathon. You can read the event summary, attendance totals, outcomes, and recorded spending.",
    sender: "Fatima Garba",
    senderRole: "Club Secretary / President",
    senderAffiliation: "Nile Climate Initiatives Club (NCIC)",
    clubCode: "NCIC",
    clubName: "Nile Climate Initiatives Club",
    timestamp: "2026-08-18T10:15:00Z",
    timeAgo: "2 days ago",
    isRead: false,
    isActionRequired: false,
    actionLabel: "Read Post-Event Report",
    actionUrl: "/advisor/reports",
    priority: "normal",
    metadata: {
      referenceId: "REP-NCIC-2026-02",
      reportId: "rep-ncic-02",
      clubId: "club-4",
      budgetEstimated: "₦250,000 (Actual: ₦241,500)",
      eventDate: "August 12, 2026",
      venue: "Innovation Hub Lab 3",
      governanceNote: "Post-event audits are read-only records stored for faculty accreditation."
    }
  },
  {
    id: "notif-adv-005",
    category: "club",
    title: "Executive Roster Modification: Nile Google Developers",
    summary: "President Ibrahim Sani confirmed the appointment of Aisha Bello as new Technical Lead.",
    fullMessage:
      "The leadership roster for Nile Google Developers (NGD) has been updated for Semester 1, 2026/2027. Aisha Bello (Matric: 21/0456) has taken over as Technical Lead. All academic clearance requirements and minimum CGPA criteria have been verified by Campus One SSO.",
    sender: "Ibrahim Sani",
    senderRole: "Club President",
    senderAffiliation: "Nile Google Developers (NGD)",
    clubCode: "NGD",
    clubName: "Nile Google Developers",
    timestamp: "2026-08-16T09:00:00Z",
    timeAgo: "4 days ago",
    isRead: true,
    isActionRequired: false,
    actionLabel: "View Club Roster",
    actionUrl: "/advisor/clubs",
    priority: "low",
    metadata: {
      referenceId: "ROSTER-NGD-2026-01",
      clubId: "club-8",
      governanceNote: "Advisor scope: Portfolio oversight. Executive appointments are self-governed by student chapters."
    }
  },
  {
    id: "notif-adv-006",
    category: "directorate",
    title: "Club Services notice: submit proposals 14 days early",
    summary: "Institutional reminder regarding mandatory proposal lead times for all Q3/Q4 student club events.",
    fullMessage:
      "Event proposals requesting university facilities, security, or funding should reach Admin at least 14 days before the event date so they can be reviewed in time.",
    sender: "Club Services",
    senderRole: "Club Services Admin",
    senderAffiliation: "Club Services",
    clubCode: "DIR",
    clubName: "Club Services",
    timestamp: "2026-08-14T08:30:00Z",
    timeAgo: "6 days ago",
    isRead: true,
    isActionRequired: false,
    priority: "high",
    metadata: {
      referenceId: "DSA-CIRCULAR-2026-09",
      governanceNote: "Institutional statutory requirement for all Nile University of Nigeria student organizations."
    }
  }
];

export const ADVISOR_NOTIFICATION_FILTER_TABS: Array<{
  id: AdvisorNotificationCategory;
  label: string;
  description: string;
}> = [
  { id: "all", label: "All Alerts", description: "All notifications across your assigned portfolio" },
  { id: "action", label: "Action Needed", description: "Pending proposal reviews and returns" },
  { id: "proposal", label: "Proposals", description: "Event proposal submissions & resubmissions" },
  { id: "report", label: "Reports", description: "Post-event audit reports & expense reconciliations" },
  { id: "club", label: "Clubs & Rosters", description: "Executive leadership and chapter updates" },
  { id: "directorate", label: "Admin", description: "Club Services decisions and notices" }
];
