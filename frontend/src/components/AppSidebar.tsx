import { CalendarDays, ClipboardList, CreditCard, FileText, Home, Plus, Clock, Bell, Users, MessageSquare, UserPlus, UserCog } from "lucide-react";
import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";

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
    staff: "Staff Access Pending"
  };

  const execItems = [
    { title: "Dashboard", url: "/", icon: Home },
    { title: "My Tasks", url: "/tasks", icon: ClipboardList },
    { title: "Announcements", url: "/communications", icon: MessageSquare },
    { title: "Events", url: "/events", icon: CalendarDays },
    { title: "Notifications", url: "/notifications", icon: Bell },
  ];

  const advisorItems = [
    { title: "Dashboard", url: "/", icon: Home },
    { title: "Pending Approvals", url: "/approvals", icon: Clock },
    { title: "Announcements", url: "/communications", icon: MessageSquare },
    { title: "Events", url: "/events", icon: CalendarDays },
    { title: "Reports Archive", url: "/archive", icon: FileText },
    { title: "Notifications", url: "/notifications", icon: Bell },
  ];

  const adminItems = [
    { title: "Dashboard", url: "/", icon: Home },
    { title: "User Management", url: "/user-management", icon: UserCog },
    { title: "Final Review", url: "/proposals", icon: FileText },
    { title: "Membership", url: "/membership", icon: UserPlus },
    { title: "Members", url: "/members", icon: Users },
    { title: "Tasks", url: "/tasks", icon: ClipboardList },
    { title: "Dues", url: "/dues", icon: CreditCard },
    { title: "Announcements", url: "/communications", icon: MessageSquare },
    { title: "Events", url: "/events", icon: CalendarDays },
    { title: "Reports Archive", url: "/archive", icon: FileText },
    { title: "Notifications", url: "/notifications", icon: Bell },
  ];

  const presidentItems = [
    { title: "Dashboard", url: "/", icon: Home },
    { title: "Create Proposal", url: "/proposals/new", icon: Plus },
    { title: "Club Proposals", url: "/proposals", icon: FileText },
    { title: "Membership Requests", url: "/membership", icon: UserPlus },
    { title: "Task Delegation", url: "/tasks", icon: ClipboardList },
    { title: "Members", url: "/members", icon: Users },
    { title: "Dues", url: "/dues", icon: CreditCard },
    { title: "Announcements", url: "/communications", icon: MessageSquare },
    { title: "Events", url: "/events", icon: CalendarDays },
    { title: "Reports Archive", url: "/archive", icon: FileText },
    { title: "Notifications", url: "/notifications", icon: Bell },
  ];

  const studentItems = [
    { title: "Home", url: "/", icon: Home },
    { title: "Discover Clubs", url: "/membership", icon: UserPlus },
    { title: "Events", url: "/events", icon: CalendarDays },
    { title: "Announcements", url: "/communications", icon: MessageSquare },
  ];

  const itemsMap = {
    executive: execItems,
    advisor: advisorItems,
    admin: adminItems,
    president: presidentItems,
    student: studentItems,
    staff: [],
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
    <Sidebar collapsible="icon" className="border-r-2 border-foreground">
      <SidebarHeader className={collapsed ? "border-b-2 border-sidebar-border px-1 py-3" : "border-b-2 border-sidebar-border p-4"}>
        {!collapsed && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-sidebar-primary bg-sidebar-accent text-sidebar-accent-foreground shadow-[3px_3px_0_hsl(var(--sidebar-primary))]">
                <span className="text-sm font-black uppercase tracking-[0.08em]">{initials}</span>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-black uppercase tracking-[0.12em] text-sidebar-primary">
                  {displayName}
                </h2>
                <p className="block truncate text-[11px] font-bold uppercase tracking-[0.12em] text-sidebar-foreground/70">
                  {identityLabel}
                </p>
              </div>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md border-2 border-sidebar-primary bg-sidebar-accent text-sidebar-accent-foreground shadow-none">
            <span className="text-xs font-black uppercase tracking-[0.06em]">{initials}</span>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-black uppercase tracking-[0.18em] text-sidebar-foreground/60">
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
                      className="flex min-w-0 items-center border-2 border-transparent font-bold uppercase tracking-[0.08em] transition-all duration-200 hover:border-sidebar-primary hover:bg-sidebar-accent/50"
                      activeClassName="translate-x-1 border-sidebar-primary bg-sidebar-accent text-sidebar-accent-foreground shadow-[4px_4px_0_hsl(var(--sidebar-primary))]"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
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
