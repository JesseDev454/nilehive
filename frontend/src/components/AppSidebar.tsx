import { CalendarDays, ClipboardList, CreditCard, FileText, Home, Plus, Clock, Bell, Users } from "lucide-react";
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

  const execItems = [
    { title: "Dashboard", url: "/", icon: Home },
    { title: "New Proposal", url: "/proposals/new", icon: Plus },
    { title: "My Proposals", url: "/proposals", icon: FileText },
    { title: "My Tasks", url: "/tasks", icon: ClipboardList },
    { title: "Members", url: "/members", icon: Users },
    { title: "Dues", url: "/dues", icon: CreditCard },
    { title: "Approved Events", url: "/events", icon: CalendarDays },
    { title: "Notifications", url: "/notifications", icon: Bell },
  ];

  const advisorItems = [
    { title: "Dashboard", url: "/", icon: Home },
    { title: "Pending Approvals", url: "/approvals", icon: Clock },
    { title: "Approved Events", url: "/events", icon: CalendarDays },
    { title: "Notifications", url: "/notifications", icon: Bell },
  ];

  const adminItems = [
    { title: "Dashboard", url: "/", icon: Home },
    { title: "All Proposals", url: "/proposals", icon: FileText },
    { title: "Members", url: "/members", icon: Users },
    { title: "Dues", url: "/dues", icon: CreditCard },
    { title: "Approved Events", url: "/events", icon: CalendarDays },
    { title: "Notifications", url: "/notifications", icon: Bell },
  ];

  const presidentItems = [
    { title: "Dashboard", url: "/", icon: Home },
    { title: "Task Delegation", url: "/tasks", icon: ClipboardList },
    { title: "Members", url: "/members", icon: Users },
    { title: "Dues", url: "/dues", icon: CreditCard },
    { title: "Approved Events", url: "/events", icon: CalendarDays },
    { title: "Notifications", url: "/notifications", icon: Bell },
  ];

  const itemsMap = {
    executive: execItems,
    advisor: advisorItems,
    admin: adminItems,
    president: presidentItems,
  };

  const items = itemsMap[role];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-sidebar-accent flex items-center justify-center">
              <span className="text-sidebar-accent-foreground font-bold text-sm">NH</span>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-sidebar-primary">NileHive</h2>
              <p className="text-xs text-sidebar-foreground/60 capitalize">{role} View</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="h-8 w-8 rounded-lg bg-sidebar-accent flex items-center justify-center mx-auto">
            <span className="text-sidebar-accent-foreground font-bold text-xs">NH</span>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
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
