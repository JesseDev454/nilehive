export type {
  AdminAnnouncementView as AdminAnnouncementItem,
  AnnouncementAudienceType,
  AnnouncementPriorityLevel,
  TargetRoleType,
} from "@/lib/announcements/types";
export { mockAdminAnnouncements as INITIAL_ADMIN_ANNOUNCEMENTS } from "@/lib/announcements/mockAnnouncements";

import type { AnnouncementAudienceType, AnnouncementPriorityLevel, TargetRoleType } from "@/lib/announcements/types";

export const AUDIENCE_CONFIG: Record<
  AnnouncementAudienceType,
  { label: string; description: string; badgeLabel: string }
> = {
  all_users: {
    label: "All Campus Users",
    description: "Broadcasted campus-wide to all students, executives, presidents, and advisors.",
    badgeLabel: "All Campus Users",
  },
  all_clubs: {
    label: "All Official Clubs",
    description: "Dispatched to executive committees and faculty advisors across registered clubs.",
    badgeLabel: "All Clubs",
  },
  one_club: {
    label: "Single Official Club",
    description: "Targeted specifically to the roster and executives of a selected club.",
    badgeLabel: "Club Specific",
  },
  role: {
    label: "Specific Governance Role",
    description: "Delivered strictly to users holding a designated institutional role.",
    badgeLabel: "Role Specific",
  },
};

export const PRIORITY_CONFIG: Record<
  AnnouncementPriorityLevel,
  { label: string; badgeClass: string; description: string }
> = {
  low: {
    label: "Low (Information)",
    badgeClass: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20",
    description: "General reference or non-urgent informational update.",
  },
  normal: {
    label: "Normal (Standard)",
    badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
    description: "Standard operational notice or routine campus communication.",
  },
  high: {
    label: "High (Important)",
    badgeClass: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
    description: "Important institutional policy, deadline, or compliance announcement.",
  },
  urgent: {
    label: "Urgent (Critical)",
    badgeClass: "bg-red-500/15 text-red-800 dark:text-red-300 border-red-500/30 font-bold",
    description: "Immediate action required or critical campus procedure change.",
  },
};

export const ROLE_LABELS: Record<TargetRoleType, string> = {
  student: "Students Only",
  executive: "Club Executives Only",
  president: "Club Presidents Only",
  advisor: "Staff Advisors Only",
  admin: "Club Services Admins Only",
};
