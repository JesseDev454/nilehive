import {
  BarChart3,
  Bell,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  Clock,
  CreditCard,
  FileText,
  Home,
  Layers,
  MessageSquare,
  MoreHorizontal,
  School,
  ShieldCheck,
  UserCircle,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { OneClubRole } from "@/data/mockData";

export type Role = OneClubRole;

export type AppNavItem = {
  title: string;
  shortTitle?: string;
  url: string;
  icon: LucideIcon;
  onboardingTarget: string;
  badge?: string | number;
  badgeKey?: string;
  isMore?: boolean;
};

export const roleLabels: Record<NonNullable<Role>, string> = {
  student: "Student",
  president: "Club President",
  executive: "Executive",
  advisor: "Staff Advisor",
  admin: "Admin (Club Services)",
};

const profileItem: AppNavItem = {
  title: "My Profile",
  shortTitle: "Profile",
  url: "/profile",
  icon: UserCircle,
  onboardingTarget: "nav-profile"
};

/**
 * Student Navigation
 * 5 top-level destinations: Home, Discover, Events, My clubs, More
 */
export const studentItems: AppNavItem[] = [
  { title: "Home", shortTitle: "Home", url: "/", icon: Home, onboardingTarget: "nav-dashboard" },
  { title: "Discover", shortTitle: "Discover", url: "/membership?tab=discover", icon: School, onboardingTarget: "nav-discover" },
  { title: "Events", shortTitle: "Events", url: "/events", icon: CalendarDays, onboardingTarget: "nav-events" },
  { title: "My clubs", shortTitle: "My clubs", url: "/membership?tab=my-clubs", icon: Users, onboardingTarget: "nav-my-clubs" },
  { title: "More", shortTitle: "More", url: "/student/more", icon: MoreHorizontal, onboardingTarget: "nav-more", isMore: true },
];

/**
 * More destinations for Student:
 * Announcements, Notifications, Dues, Feedback, Profile
 */
export const studentMoreDestinations = [
  {
    title: "Announcements",
    shortTitle: "Announcements",
    url: "/communications",
    icon: MessageSquare,
    description: "Read official Nile University and club broadcasts."
  },
  {
    title: "Notifications",
    shortTitle: "Notifications",
    url: "/notifications",
    icon: Bell,
    description: "System updates, membership approval alerts, and event reminders."
  },
  {
    title: "Dues & Proofs",
    shortTitle: "Dues",
    url: "/dues",
    icon: CreditCard,
    description: "Review semester dues for your clubs and upload payment receipts."
  },
  {
    title: "Submit Feedback",
    shortTitle: "Feedback",
    url: "/feedback",
    icon: FileText,
    description: "Send constructive suggestions to Student Affairs & Club Services."
  },
  {
    title: "Student Profile",
    shortTitle: "Profile",
    url: "/profile",
    icon: UserCircle,
    description: "Verified Campus One student identity, department, and preferences."
  }
];

export const presidentItems: AppNavItem[] = [
  { title: "Home", shortTitle: "Home", url: "/", icon: Home, onboardingTarget: "nav-dashboard" },
  { title: "Proposals", shortTitle: "Proposals", url: "/proposals", icon: FileText, onboardingTarget: "nav-proposals", badge: "1 Action" },
  { title: "Events", shortTitle: "Events", url: "/events", icon: CalendarDays, onboardingTarget: "nav-events", badge: "1 Live" },
  { title: "Members", shortTitle: "Members", url: "/members", icon: Users, onboardingTarget: "nav-members" },
  { title: "More", shortTitle: "More", url: "/president/more", icon: MoreHorizontal, onboardingTarget: "nav-more", isMore: true },
];

export const presidentMoreDestinations = [
  {
    title: "Announcements",
    shortTitle: "Announcements",
    url: "/communications",
    icon: MessageSquare,
    description: "Broadcast club updates to members, students, or executive committee."
  },
  {
    title: "Post-Event Reports",
    shortTitle: "Reports",
    url: "/archive",
    icon: ClipboardList,
    description: "Submit attendance records and event closure summaries to Student Affairs."
  },
  {
    title: "Club Details & Media",
    shortTitle: "Club Details",
    url: "/clubs",
    icon: School,
    description: "Manage assigned club overview, meeting schedules, and photo archive."
  },
  {
    title: "Executive Club Work",
    shortTitle: "Club Work",
    url: "/tasks",
    icon: CheckSquare,
    description: "Assign operational deliverables and track progress across executive team."
  },
  {
    title: "Notifications",
    shortTitle: "Notifications",
    url: "/notifications",
    icon: Bell,
    description: "Advisor feedback, proposal approval alerts, and system notices."
  },
  {
    title: "President Profile",
    shortTitle: "Profile",
    url: "/profile",
    icon: UserCircle,
    description: "Campus One authenticated student president credentials and assigned club."
  }
];

export const executiveItems: AppNavItem[] = [
  { title: "Home", shortTitle: "Home", url: "/", icon: Home, onboardingTarget: "nav-dashboard" },
  { title: "Club", shortTitle: "Club", url: "/clubs", icon: School, onboardingTarget: "nav-club" },
  { title: "Events", shortTitle: "Events", url: "/events", icon: CalendarDays, onboardingTarget: "nav-events" },
  { title: "My work", shortTitle: "My work", url: "/tasks", icon: CheckSquare, onboardingTarget: "nav-work", badge: "2 Pending" },
  { title: "More", shortTitle: "More", url: "/executive/more", icon: MoreHorizontal, onboardingTarget: "nav-more", isMore: true },
];

export const executiveMoreDestinations = [
  {
    title: "Notifications",
    shortTitle: "Notifications",
    url: "/notifications",
    icon: Bell,
    description: "Task delegations, club alerts, and presidential notifications."
  },
  {
    title: "Executive Profile",
    shortTitle: "Profile",
    url: "/profile",
    icon: UserCircle,
    description: "Read-only Campus One executive officer credentials and preferences."
  }
];

const advisorItems: AppNavItem[] = [
  { title: "Home", shortTitle: "Home", url: "/", icon: Home, onboardingTarget: "nav-dashboard" },
  { title: "Review Queue", shortTitle: "Approvals", url: "/approvals", icon: Clock, onboardingTarget: "nav-approvals", badge: "1 Pending" },
  { title: "Campus Events", shortTitle: "Events", url: "/events", icon: CalendarDays, onboardingTarget: "nav-events" },
  { title: "Club Reports", shortTitle: "Reports", url: "/archive", icon: FileText, onboardingTarget: "nav-reports" },
  profileItem,
];

export const adminItems: AppNavItem[] = [
  { title: "Home", shortTitle: "Home", url: "/", icon: Home, onboardingTarget: "nav-dashboard" },
  { title: "Approvals", shortTitle: "Approvals", url: "/approvals", icon: Clock, onboardingTarget: "nav-approvals", badge: "4 Waiting" },
  { title: "Clubs", shortTitle: "Clubs", url: "/clubs", icon: School, onboardingTarget: "nav-clubs" },
  { title: "People", shortTitle: "People", url: "/user-management", icon: Users, onboardingTarget: "nav-people" },
  { title: "More", shortTitle: "More", url: "/admin/more", icon: MoreHorizontal, onboardingTarget: "nav-more", isMore: true },
];

export const adminMoreDestinations = [
  { title: "Campus Events & Attendance", shortTitle: "Events", url: "/events", icon: CalendarDays, description: "Check verified QR attendance and campus schedule." },
  { title: "Announcements", shortTitle: "Announcements", url: "/communications", icon: MessageSquare, description: "Broadcast official updates to all student clubs." },
  { title: "Notifications", shortTitle: "Notifications", url: "/notifications", icon: Bell, description: "System alerts and submission status notices." },
  { title: "Student Feedback", shortTitle: "Feedback", url: "/feedback", icon: FileText, description: "Read student and executive suggestions." },
  { title: "Analytics Summary", shortTitle: "Analytics", url: "/analytics", icon: BarChart3, description: "Verified active members, club health, and dues metrics." },
  { title: "My Profile", shortTitle: "Profile", url: "/profile", icon: UserCircle, description: "Campus One institutional admin account details." },
];

export function getRoleNavItems(role: Role | null): AppNavItem[] {
  if (!role) {
    return studentItems;
  }

  const itemsMap: Record<NonNullable<Role>, AppNavItem[]> = {
    student: studentItems,
    president: presidentItems,
    executive: executiveItems,
    advisor: advisorItems,
    admin: adminItems,
  };

  return itemsMap[role] ?? studentItems;
}
