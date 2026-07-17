import {
  BarChart3,
  Bell,
  CalendarDays,
  ClipboardList,
  Clock,
  FileText,
  Home,
  MessageSquare,
  School,
  UserCircle,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/contexts/RoleContext";
import type { NavigationCountsRecord } from "@/lib/api";

export type AppNavItem = {
  title: string;
  shortTitle?: string;
  url: string;
  icon: LucideIcon;
  onboardingTarget: string;
  badgeKey?: keyof NavigationCountsRecord["counts"];
};

export const roleLabels: Record<NonNullable<Role>, string> = {
  executive: "Executive",
  advisor: "Advisor",
  admin: "Campus One Admin",
  president: "Club President",
  student: "Student",
  feedback_manager: "Feedback Manager",
};

const profileItem: AppNavItem = { title: "Profile", shortTitle: "Profile", url: "/profile", icon: UserCircle, onboardingTarget: "nav-profile" };

const executiveItems: AppNavItem[] = [
  { title: "Home", url: "/", icon: Home, onboardingTarget: "nav-dashboard" },
  { title: "My Tasks", shortTitle: "Tasks", url: "/tasks", icon: ClipboardList, onboardingTarget: "nav-tasks", badgeKey: "tasks" },
  { title: "My Club", shortTitle: "Club", url: "/clubs", icon: School, onboardingTarget: "nav-clubs" },
  { title: "Events", url: "/events", icon: CalendarDays, onboardingTarget: "nav-events" },
  { title: "Updates", url: "/communications", icon: MessageSquare, onboardingTarget: "nav-communications" },
  profileItem,
];

const advisorItems: AppNavItem[] = [
  { title: "Home", url: "/", icon: Home, onboardingTarget: "nav-dashboard" },
  { title: "Review Queue", shortTitle: "Review", url: "/approvals", icon: Clock, onboardingTarget: "nav-approvals", badgeKey: "pending_approvals" },
  { title: "Events", url: "/events", icon: CalendarDays, onboardingTarget: "nav-events" },
  { title: "Updates", url: "/communications", icon: MessageSquare, onboardingTarget: "nav-communications" },
  profileItem,
];

const adminItems: AppNavItem[] = [
  { title: "Operations Queue", shortTitle: "Queue", url: "/", icon: ClipboardList, onboardingTarget: "nav-dashboard" },
  { title: "Clubs & People", shortTitle: "Clubs", url: "/clubs", icon: Users, onboardingTarget: "nav-clubs" },
  { title: "Events", url: "/events", icon: CalendarDays, onboardingTarget: "nav-events", badgeKey: "events" },
  { title: "Analytics", url: "/analytics", icon: BarChart3, onboardingTarget: "nav-analytics" },
  { title: "Updates", url: "/communications", icon: MessageSquare, onboardingTarget: "nav-communications" },
  profileItem,
];

const presidentItems: AppNavItem[] = [
  { title: "Home", url: "/", icon: Home, onboardingTarget: "nav-dashboard" },
  { title: "My Club", shortTitle: "Club", url: "/clubs", icon: School, onboardingTarget: "nav-clubs" },
  { title: "Proposals", url: "/proposals", icon: FileText, onboardingTarget: "nav-proposals" },
  { title: "Events", url: "/events", icon: CalendarDays, onboardingTarget: "nav-events" },
  { title: "Updates", url: "/communications", icon: MessageSquare, onboardingTarget: "nav-communications" },
  profileItem,
];

const studentItems: AppNavItem[] = [
  { title: "Home", url: "/", icon: Home, onboardingTarget: "nav-dashboard" },
  { title: "Discover Clubs", shortTitle: "Clubs", url: "/membership", icon: UserPlus, onboardingTarget: "nav-membership" },
  { title: "Events", url: "/events", icon: CalendarDays, onboardingTarget: "nav-events" },
  { title: "Updates", url: "/communications", icon: MessageSquare, onboardingTarget: "nav-communications" },
  profileItem,
];

const feedbackManagerItems: AppNavItem[] = [
  { title: "App Feedback", shortTitle: "Feedback", url: "/feedback", icon: MessageSquare, onboardingTarget: "nav-feedback" },
  { title: "Notifications", shortTitle: "Alerts", url: "/notifications", icon: Bell, onboardingTarget: "nav-notifications", badgeKey: "notifications" },
  profileItem,
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
