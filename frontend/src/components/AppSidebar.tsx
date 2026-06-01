import { CalendarDays, ClipboardList, CreditCard, FileText, Home, Plus, Clock, Bell, Users, MessageSquare, UserPlus, UserCog, School, type LucideIcon } from "lucide-react";
import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";

type SidebarItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  onboardingTarget: string;
};

export function AppSidebar() {
  const { role } = useRole();
  const { profile } = useAuth();
  const { state } = useSidebar();
  const { pathname } = useLocation();
  const collapsed = state === "collapsed";
  const roleLabels = {
    executive: "Executive",
    advisor: "Advisor",
    admin: "Campus One Admin",
    president: "Club President",
    student: "Student",
    feedback_manager: "Feedback Manager"
  };

  const execItems: SidebarItem[] = [
    { title: "Dashboard", url: "/", icon: Home, onboardingTarget: "nav-dashboard" },
    { title: "My Tasks", url: "/tasks", icon: ClipboardList, onboardingTarget: "nav-tasks" },
    { title: "Announcements", url: "/communications", icon: MessageSquare, onboardingTarget: "nav-communications" },
    { title: "Events", url: "/events", icon: CalendarDays, onboardingTarget: "nav-events" },
    { title: "Feedback", url: "/feedback", icon: MessageSquare, onboardingTarget: "nav-feedback" },
    { title: "Notifications", url: "/notifications", icon: Bell, onboardingTarget: "nav-notifications" },
  ];

  const advisorItems: SidebarItem[] = [
    { title: "Dashboard", url: "/", icon: Home, onboardingTarget: "nav-dashboard" },
    { title: "Pending Approvals", url: "/approvals", icon: Clock, onboardingTarget: "nav-approvals" },
    { title: "Announcements", url: "/communications", icon: MessageSquare, onboardingTarget: "nav-communications" },
    { title: "Events", url: "/events", icon: CalendarDays, onboardingTarget: "nav-events" },
    { title: "Reports Archive", url: "/archive", icon: FileText, onboardingTarget: "nav-archive" },
    { title: "Feedback", url: "/feedback", icon: MessageSquare, onboardingTarget: "nav-feedback" },
    { title: "Notifications", url: "/notifications", icon: Bell, onboardingTarget: "nav-notifications" },
  ];

  const adminItems: SidebarItem[] = [
    { title: "Dashboard", url: "/", icon: Home, onboardingTarget: "nav-dashboard" },
    { title: "User Management", url: "/user-management", icon: UserCog, onboardingTarget: "nav-user-management" },
    { title: "Clubs", url: "/clubs", icon: School, onboardingTarget: "nav-clubs" },
    { title: "Final Review", url: "/proposals", icon: FileText, onboardingTarget: "nav-proposals" },
    { title: "Membership", url: "/membership", icon: UserPlus, onboardingTarget: "nav-membership" },
    { title: "Members", url: "/members", icon: Users, onboardingTarget: "nav-members" },
    { title: "Tasks", url: "/tasks", icon: ClipboardList, onboardingTarget: "nav-tasks" },
    { title: "Dues", url: "/dues", icon: CreditCard, onboardingTarget: "nav-dues" },
    { title: "Announcements", url: "/communications", icon: MessageSquare, onboardingTarget: "nav-communications" },
    { title: "Events", url: "/events", icon: CalendarDays, onboardingTarget: "nav-events" },
    { title: "Reports Archive", url: "/archive", icon: FileText, onboardingTarget: "nav-archive" },
    { title: "Feedback", url: "/feedback", icon: MessageSquare, onboardingTarget: "nav-feedback" },
    { title: "Notifications", url: "/notifications", icon: Bell, onboardingTarget: "nav-notifications" },
  ];

  const presidentItems: SidebarItem[] = [
    { title: "Dashboard", url: "/", icon: Home, onboardingTarget: "nav-dashboard" },
    { title: "Create Proposal", url: "/proposals/new", icon: Plus, onboardingTarget: "nav-create-proposal" },
    { title: "Club Proposals", url: "/proposals", icon: FileText, onboardingTarget: "nav-proposals" },
    { title: "Task Delegation", url: "/tasks", icon: ClipboardList, onboardingTarget: "nav-tasks" },
    { title: "Members", url: "/members", icon: Users, onboardingTarget: "nav-members" },
    { title: "Announcements", url: "/communications", icon: MessageSquare, onboardingTarget: "nav-communications" },
    { title: "Events", url: "/events", icon: CalendarDays, onboardingTarget: "nav-events" },
    { title: "Reports Archive", url: "/archive", icon: FileText, onboardingTarget: "nav-archive" },
    { title: "Feedback", url: "/feedback", icon: MessageSquare, onboardingTarget: "nav-feedback" },
    { title: "Notifications", url: "/notifications", icon: Bell, onboardingTarget: "nav-notifications" },
  ];

  const studentItems: SidebarItem[] = [
    { title: "Home", url: "/", icon: Home, onboardingTarget: "nav-dashboard" },
    { title: "Discover Clubs", url: "/membership", icon: UserPlus, onboardingTarget: "nav-membership" },
    { title: "Events", url: "/events", icon: CalendarDays, onboardingTarget: "nav-events" },
    { title: "Announcements", url: "/communications", icon: MessageSquare, onboardingTarget: "nav-communications" },
    { title: "Feedback", url: "/feedback", icon: MessageSquare, onboardingTarget: "nav-feedback" },
  ];

  const feedbackManagerItems: SidebarItem[] = [
    { title: "App Feedback", url: "/feedback", icon: MessageSquare, onboardingTarget: "nav-feedback" },
  ];

  const itemsMap = {
    executive: execItems,
    advisor: advisorItems,
    admin: adminItems,
    president: presidentItems,
    student: studentItems,
    feedback_manager: feedbackManagerItems
  };

  const items = role ? itemsMap[role] : [];
  const rawDisplayName = profile?.full_name?.trim() || "";
  const displayName = (() => {
    const parts = rawDisplayName.split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
      return "Club Services User";
    }

    if (parts.length === 1) {
      return parts[0];
    }

    return `${parts[0]} ${parts[parts.length - 1]}`;
  })();
  const identityLabel = role ? roleLabels[role] : "Loading View";
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "CU";

  function getActiveOverride(url: string) {
    if (role !== "president") {
      return undefined;
    }

    if (url === "/proposals/new") {
      return pathname === "/proposals/new";
    }

    if (url === "/proposals") {
      return pathname.startsWith("/proposals") && pathname !== "/proposals/new";
    }

    return undefined;
  }

  return (
    <Sidebar collapsible="icon" className="border-r-3 border-foreground bg-sidebar">
      <SidebarHeader className={collapsed ? "border-b-3 border-sidebar-border px-1 py-5" : "border-b-0 p-6 pb-4"}>
        {!collapsed && (
          <div className="space-y-7">
            <div className="space-y-4">
              <div className="club-logo-orbit" aria-hidden="true">
                <span className="club-logo-orbit-ring club-logo-orbit-ring-primary">
                  <span className="club-logo-orbit-dot club-logo-orbit-dot-green" />
                </span>
                <span className="club-logo-orbit-ring club-logo-orbit-ring-secondary">
                  <span className="club-logo-orbit-dot club-logo-orbit-dot-blue" />
                </span>
                <span className="club-logo-orbit-ring club-logo-orbit-ring-tertiary">
                  <span className="club-logo-orbit-dot club-logo-orbit-dot-sky" />
                </span>
                <div className="club-logo-core">
                  <School className="h-8 w-8" />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-black leading-none tracking-[-0.05em] text-sidebar-foreground">
                  Club Services
                </h2>
                <p className="mt-2 text-lg font-medium text-sidebar-foreground/75">Academic Quest</p>
              </div>
            </div>
            <div className="rounded-[24px] border-3 border-sidebar-border bg-card p-4 shadow-neo-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground">
                  <span className="text-sm font-black uppercase tracking-[0.08em]">{initials}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-black uppercase tracking-[0.1em] text-sidebar-foreground">
                    {displayName}
                  </h3>
                  <p className="block truncate text-[11px] font-bold uppercase tracking-[0.12em] text-sidebar-foreground/65">
                    {identityLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-[14px] border-2 border-sidebar-border bg-primary text-primary-foreground shadow-none">
            <School className="h-5 w-5" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[11px] font-black uppercase tracking-[0.18em] text-sidebar-foreground/55">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      activeOverride={getActiveOverride(item.url)}
                      data-onboarding-target={item.onboardingTarget}
                      className="flex min-w-0 items-center rounded-[18px] border-2 border-transparent px-3 py-3 text-base font-bold tracking-[-0.01em] transition-all duration-200 hover:border-sidebar-border hover:bg-sidebar-accent/50"
                      activeClassName="translate-x-1 border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground shadow-[4px_4px_0_hsl(var(--neo-shadow))]"
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {!collapsed && <span className="min-w-0 flex-1 truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
