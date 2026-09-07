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

export function isNavItemActive(itemUrl: string, pathname: string, search = ""): boolean {
  const [pathOnly, inlineSearch = ""] = pathname.split("?", 2);
  const cleanPath = pathOnly.length > 1 && pathOnly.endsWith("/") ? pathOnly.slice(0, -1) : pathOnly || "/";
  const searchParams = new URLSearchParams(search || (inlineSearch ? `?${inlineSearch}` : ""));

  if (itemUrl === "/") {
    return cleanPath === "/";
  }

  if (itemUrl === "/feedback") {
    return cleanPath === "/feedback" || cleanPath.startsWith("/feedback/") || searchParams.get("tab") === "feedback";
  }

  if (itemUrl === "/communications") {
    return (cleanPath === "/communications" || cleanPath.startsWith("/communications/"))
      && searchParams.get("tab") !== "feedback";
  }

  if (itemUrl === "/proposals/new") {
    return cleanPath === "/proposals/new";
  }

  if (itemUrl === "/proposals") {
    return cleanPath === "/proposals"
      || (cleanPath.startsWith("/proposals/") && cleanPath !== "/proposals/new");
  }

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
