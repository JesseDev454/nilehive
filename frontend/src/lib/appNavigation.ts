import {
  BarChart3,
  Bell,
  CalendarDays,
  ClipboardList,
  Clock,
  CreditCard,
  FileText,
  Home,
  MessageSquare,
  Plus,
  School,
  UserCog,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/contexts/RoleContext";

export type AppNavItem = {
  title: string;
  shortTitle?: string;
  url: string;
  icon: LucideIcon;
  onboardingTarget: string;
  badge?: number;
};

export const roleLabels: Record<NonNullable<Role>, string> = {
  executive: "Executive",
  advisor: "Advisor",
  admin: "Campus One Admin",
  president: "Club President",
  student: "Student",
  feedback_manager: "Feedback Manager",
};

const executiveItems: AppNavItem[] = [
  { title: "Dashboard", shortTitle: "Home", url: "/", icon: Home, onboardingTarget: "nav-dashboard" },
  { title: "My Tasks", shortTitle: "Tasks", url: "/tasks", icon: ClipboardList, onboardingTarget: "nav-tasks" },
  { title: "Announcements", shortTitle: "Updates", url: "/communications", icon: MessageSquare, onboardingTarget: "nav-communications" },
  { title: "Events", url: "/events", icon: CalendarDays, onboardingTarget: "nav-events" },
  { title: "Feedback", url: "/feedback", icon: MessageSquare, onboardingTarget: "nav-feedback" },
  { title: "Notifications", shortTitle: "Alerts", url: "/notifications", icon: Bell, onboardingTarget: "nav-notifications" },
];

const advisorItems: AppNavItem[] = [
  { title: "Dashboard", shortTitle: "Home", url: "/", icon: Home, onboardingTarget: "nav-dashboard" },
  { title: "Pending Approvals", shortTitle: "Approvals", url: "/approvals", icon: Clock, onboardingTarget: "nav-approvals", badge: 4 },
  { title: "Announcements", shortTitle: "Updates", url: "/communications", icon: MessageSquare, onboardingTarget: "nav-communications" },
  { title: "Events", url: "/events", icon: CalendarDays, onboardingTarget: "nav-events" },
  { title: "Reports Archive", shortTitle: "Reports", url: "/archive", icon: FileText, onboardingTarget: "nav-archive" },
  { title: "Feedback", url: "/feedback", icon: MessageSquare, onboardingTarget: "nav-feedback" },
  { title: "Notifications", shortTitle: "Alerts", url: "/notifications", icon: Bell, onboardingTarget: "nav-notifications" },
];

const adminItems: AppNavItem[] = [
  { title: "Dashboard", shortTitle: "Home", url: "/", icon: Home, onboardingTarget: "nav-dashboard" },
  { title: "Analytics", url: "/analytics", icon: BarChart3, onboardingTarget: "nav-analytics" },
  { title: "User Management", shortTitle: "Users", url: "/user-management", icon: UserCog, onboardingTarget: "nav-user-management" },
  { title: "Clubs", url: "/clubs", icon: School, onboardingTarget: "nav-clubs" },
  { title: "Final Review", shortTitle: "Review", url: "/proposals", icon: FileText, onboardingTarget: "nav-proposals", badge: 6 },
  { title: "Membership", shortTitle: "Members", url: "/membership", icon: UserPlus, onboardingTarget: "nav-membership" },
  { title: "Members", url: "/members", icon: Users, onboardingTarget: "nav-members" },
  { title: "Tasks", url: "/tasks", icon: ClipboardList, onboardingTarget: "nav-tasks" },
  { title: "Dues", url: "/dues", icon: CreditCard, onboardingTarget: "nav-dues" },
  { title: "Announcements", shortTitle: "Updates", url: "/communications", icon: MessageSquare, onboardingTarget: "nav-communications" },
  { title: "Events", url: "/events", icon: CalendarDays, onboardingTarget: "nav-events" },
  { title: "Reports Archive", shortTitle: "Reports", url: "/archive", icon: FileText, onboardingTarget: "nav-archive" },
  { title: "Feedback", url: "/feedback", icon: MessageSquare, onboardingTarget: "nav-feedback" },
  { title: "Notifications", shortTitle: "Alerts", url: "/notifications", icon: Bell, onboardingTarget: "nav-notifications" },
];

const presidentItems: AppNavItem[] = [
  { title: "Dashboard", shortTitle: "Home", url: "/", icon: Home, onboardingTarget: "nav-dashboard" },
  { title: "Club Profile", shortTitle: "Profile", url: "/clubs", icon: School, onboardingTarget: "nav-clubs" },
  { title: "Create Proposal", shortTitle: "Create", url: "/proposals/new", icon: Plus, onboardingTarget: "nav-create-proposal" },
  { title: "Club Proposals", shortTitle: "Proposals", url: "/proposals", icon: FileText, onboardingTarget: "nav-proposals" },
  { title: "Task Delegation", shortTitle: "Tasks", url: "/tasks", icon: ClipboardList, onboardingTarget: "nav-tasks" },
  { title: "Members", url: "/members", icon: Users, onboardingTarget: "nav-members" },
  { title: "Announcements", shortTitle: "Updates", url: "/communications", icon: MessageSquare, onboardingTarget: "nav-communications" },
  { title: "Events", url: "/events", icon: CalendarDays, onboardingTarget: "nav-events" },
  { title: "Reports Archive", shortTitle: "Reports", url: "/archive", icon: FileText, onboardingTarget: "nav-archive" },
  { title: "Feedback", url: "/feedback", icon: MessageSquare, onboardingTarget: "nav-feedback" },
  { title: "Notifications", shortTitle: "Alerts", url: "/notifications", icon: Bell, onboardingTarget: "nav-notifications" },
];

const studentItems: AppNavItem[] = [
  { title: "Home", url: "/", icon: Home, onboardingTarget: "nav-dashboard" },
  { title: "Discover Clubs", shortTitle: "Clubs", url: "/membership", icon: UserPlus, onboardingTarget: "nav-membership" },
  { title: "Events", url: "/events", icon: CalendarDays, onboardingTarget: "nav-events" },
  { title: "Announcements", shortTitle: "Updates", url: "/communications", icon: MessageSquare, onboardingTarget: "nav-communications" },
  { title: "Feedback", url: "/feedback", icon: MessageSquare, onboardingTarget: "nav-feedback" },
];

const feedbackManagerItems: AppNavItem[] = [
  { title: "App Feedback", shortTitle: "Feedback", url: "/feedback", icon: MessageSquare, onboardingTarget: "nav-feedback" },
  { title: "Notifications", shortTitle: "Alerts", url: "/notifications", icon: Bell, onboardingTarget: "nav-notifications" },
];

export function getRoleNavItems(role: Role | null): AppNavItem[] {
  if (!role) {
    return [];
  }

  const itemsMap: Record<NonNullable<Role>, AppNavItem[]> = {
    executive: executiveItems,
    advisor: advisorItems,
    admin: adminItems,
    president: presidentItems,
    student: studentItems,
    feedback_manager: feedbackManagerItems,
  };

  return itemsMap[role] ?? [];
}
