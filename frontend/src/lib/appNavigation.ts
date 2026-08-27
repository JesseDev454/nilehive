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
  { title: "Home", url: "/", icon: Home, onboardingTarget: "nav-dashboard" },
  { title: "Final Proposal Review", shortTitle: "Review", url: "/admin/proposals/review", icon: ClipboardList, onboardingTarget: "nav-approvals", badgeKey: "pending_approvals" },
  { title: "User Management", shortTitle: "Users", url: "/user-management", icon: UserPlus, onboardingTarget: "nav-users" },
  { title: "Clubs", url: "/clubs", icon: Users, onboardingTarget: "nav-clubs" },
  { title: "Events", url: "/events", icon: CalendarDays, onboardingTarget: "nav-events", badgeKey: "events" },
  { title: "Feedback", url: "/feedback", icon: MessageSquare, onboardingTarget: "nav-feedback" },
  { title: "Notifications", shortTitle: "Alerts", url: "/notifications", icon: Bell, onboardingTarget: "nav-notifications", badgeKey: "notifications" },
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

export function isNavItemActive(
  itemUrl: string,
  pathname: string,
  search: string = ""
): boolean {
  const rawPath = pathname.split("?")[0] || "/";
  const cleanPath = rawPath.length > 1 && rawPath.endsWith("/") ? rawPath.slice(0, -1) : rawPath;
  const rawSearch = search || (pathname.includes("?") ? `?${pathname.split("?")[1]}` : "");
  const searchParams = new URLSearchParams(rawSearch);

  // Exact root match
  if (itemUrl === "/") {
    return cleanPath === "/";
  }

  // Feedback special handling (tab=feedback query or /feedback path)
  if (itemUrl === "/feedback") {
    return cleanPath === "/feedback" || cleanPath.startsWith("/feedback/") || searchParams.get("tab") === "feedback";
  }

  // Communications / Updates special handling (when not tab=feedback)
  if (itemUrl === "/communications") {
    return (cleanPath === "/communications" || cleanPath.startsWith("/communications/")) && searchParams.get("tab") !== "feedback";
  }

  // Proposals: /proposals, /proposals/new, /proposals/:id
  if (itemUrl === "/proposals/new") {
    return cleanPath === "/proposals/new";
  }
  if (itemUrl === "/proposals") {
    return cleanPath === "/proposals" || (cleanPath.startsWith("/proposals/") && cleanPath !== "/proposals/new");
  }

  // Admin proposals review
  if (itemUrl === "/admin/proposals/review") {
    return cleanPath === "/admin/proposals/review" || cleanPath.startsWith("/admin/proposals/review/");
  }

  // Profile: /profile
  if (itemUrl === "/profile") {
    return cleanPath === "/profile" || cleanPath.startsWith("/profile/");
  }

  // Generic prefix/exact match for other items
  return cleanPath === itemUrl || cleanPath.startsWith(`${itemUrl}/`);
}

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
  };

  return itemsMap[role] ?? [];
}
