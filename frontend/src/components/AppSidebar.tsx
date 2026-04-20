import { CalendarDays, ClipboardList, CreditCard, FileText, Home, Plus, Clock, Bell, Users, MessageSquare, UserPlus, UserCog } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useRole } from "@/contexts/RoleContext";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { role } = useRole();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const roleLabels = {
    executive: "Executive",
    advisor: "Advisor",
    admin: "Club Services Admin",
    president: "Club President",
    student: "Student"
  };

  const execItems = [
    { title: "Dashboard", url: "/", icon: Home },
    { title: "My Tasks", url: "/tasks", icon: ClipboardList },
    { title: "Announcements", url: "/communications", icon: MessageSquare },
    { title: "Approved Events", url: "/events", icon: CalendarDays },
    { title: "Notifications", url: "/notifications", icon: Bell },
  ];

  const advisorItems = [
    { title: "Dashboard", url: "/", icon: Home },
    { title: "Pending Approvals", url: "/approvals", icon: Clock },
    { title: "Announcements", url: "/communications", icon: MessageSquare },
    { title: "Approved Events", url: "/events", icon: CalendarDays },
    { title: "Reports Archive", url: "/archive", icon: FileText },
    { title: "Notifications", url: "/notifications", icon: Bell },
  ];

  const adminItems = [
    { title: "Dashboard", url: "/", icon: Home },
    { title: "User Management", url: "/user-management", icon: UserCog },
    { title: "Final Review", url: "/proposals", icon: FileText },
    { title: "Membership", url: "/membership", icon: UserPlus },
    { title: "Members", url: "/members", icon: Users },
    { title: "Dues", url: "/dues", icon: CreditCard },
    { title: "Announcements", url: "/communications", icon: MessageSquare },
    { title: "Approved Events", url: "/events", icon: CalendarDays },
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
    { title: "Approved Events", url: "/events", icon: CalendarDays },
    { title: "Reports Archive", url: "/archive", icon: FileText },
    { title: "Notifications", url: "/notifications", icon: Bell },
  ];

  const studentItems = [
    { title: "Home", url: "/", icon: Home },
    { title: "Discover Clubs", url: "/membership", icon: UserPlus },
    { title: "Approved Events", url: "/events", icon: CalendarDays },
    { title: "Announcements", url: "/communications", icon: MessageSquare },
    { title: "Notifications", url: "/notifications", icon: Bell },
  ];

  const itemsMap = {
    executive: execItems,
    advisor: advisorItems,
    admin: adminItems,
    president: presidentItems,
    student: studentItems,
  };

  const items = role ? itemsMap[role] : [];

  return (
    <Sidebar collapsible="icon" className="border-r-2 border-foreground">
      <SidebarHeader className="border-b-2 border-sidebar-border p-4">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border-2 border-sidebar-primary bg-sidebar-accent shadow-[3px_3px_0_hsl(var(--sidebar-primary))]">
              <span className="text-sm font-black text-sidebar-accent-foreground">CS</span>
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.16em] text-sidebar-primary">Club Services</h2>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-sidebar-foreground/70">
                {role ? roleLabels[role] : "Loading"} View
              </p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto flex h-10 w-10 items-center justify-center border-2 border-sidebar-primary bg-sidebar-accent">
            <span className="text-xs font-black text-sidebar-accent-foreground">CS</span>
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
                      className="border-2 border-transparent font-bold uppercase tracking-[0.08em] transition-all duration-200 hover:border-sidebar-primary hover:bg-sidebar-accent/50"
                      activeClassName="translate-x-1 border-warning bg-sidebar-accent text-sidebar-accent-foreground shadow-[4px_4px_0_hsl(var(--sidebar-primary))]"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
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
