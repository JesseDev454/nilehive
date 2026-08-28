import { CircleHelp, LogOut, PanelLeftClose, PanelLeftOpen, School } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { getRoleNavItems, isNavItemActive, roleLabels } from "@/lib/appNavigation";
import { getNavigationCounts } from "@/lib/api";

function useIdentity() {
  const { profile } = useAuth();
  const { role } = useRole();
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
  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "CU";
  const identityLabel = role ? roleLabels[role] : profile?.role ?? "Loading View";

  return { displayName, identityLabel, initials };
}

export function AppSidebar() {
  const { role } = useRole();
  const { signOut } = useAuth();
  const { setOpen, state } = useSidebar();
  const { pathname, search } = useLocation();
  const collapsed = state === "collapsed";
  const items = getRoleNavItems(role);
  const { displayName, identityLabel, initials } = useIdentity();
  const { data: navigationCounts } = useQuery({
    queryKey: ["navigation-counts", role],
    queryFn: () => getNavigationCounts(),
    enabled: Boolean(role),
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
    retry: false
  });

  function getBadgeCount(badgeKey: typeof items[number]["badgeKey"]) {
    if (!badgeKey) {
      return null;
    }

    const count = navigationCounts?.counts?.[badgeKey] ?? 0;
    return count > 0 ? count : null;
  }

  return (
    <Sidebar collapsible="icon" className="[--sidebar-width:17.5rem] border-r border-sidebar-border bg-sidebar max-[920px]:hidden">
      <SidebarHeader className={collapsed ? "border-b border-sidebar-border/10 px-1 py-5" : "border-b-0 px-6 pb-8 pt-6"}>
        {!collapsed && (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-2">
                <div>
                  <h2 className="text-xl font-bold leading-none tracking-tight text-primary">OneClub</h2>
                  <p className="mt-2 text-sm font-medium leading-6 text-sidebar-foreground/60">Nile University · Club Services</p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Collapse sidebar"
                className="rounded-md p-1 text-sidebar-foreground/45 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={() => setOpen(false)}
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        {collapsed && (
          <button
            type="button"
            aria-label="Expand sidebar"
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-[14px] bg-primary text-primary-foreground shadow-soft-sm transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => setOpen(true)}
          >
            <PanelLeftOpen className="h-5 w-5" />
          </button>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2">
        <nav aria-label="Primary">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {items.map((item) => {
                  const badgeCount = getBadgeCount(item.badgeKey);
                  const isActive = isNavItemActive(item.url, pathname, search);

                  return (
                    <SidebarMenuItem key={`${item.title}-${item.url}`}>
                      <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                        <NavLink
                          to={item.url}
                          end={item.url === "/"}
                          activeOverride={isActive}
                          data-onboarding-target={item.onboardingTarget}
                          className="relative flex min-w-0 items-center rounded-lg px-4 py-2.5 text-sm font-semibold text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          activeClassName="border-l-4 border-secondary bg-sidebar-accent text-sidebar-accent-foreground"
                        >
                          <item.icon className="mr-3 h-5 w-5 shrink-0" />
                          {!collapsed && <span className="min-w-0 flex-1 truncate">{item.title}</span>}
                          {!collapsed && badgeCount ? (
                            <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                              {badgeCount}
                            </span>
                          ) : null}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </nav>
      </SidebarContent>

      <SidebarFooter className={collapsed ? "border-t border-sidebar-border/10 px-1 py-4" : "border-t border-sidebar-border/10 p-4"}>
        {collapsed ? (
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground">
            <span className="text-xs font-semibold tracking-wide">{initials}</span>
          </div>
        ) : (
          <div className="grid gap-1">
            <div className="hidden items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground">
                <span className="text-sm font-semibold tracking-wide">{initials}</span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-sidebar-foreground">{displayName}</h3>
                <p className="block truncate text-[11px] font-medium tracking-wide text-sidebar-foreground/60">{identityLabel}</p>
              </div>
            </div>
            <div className="grid gap-1">
              <button type="button" onClick={() => void signOut()} className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-semibold text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <LogOut className="h-5 w-5" aria-hidden="true" /> Logout
              </button>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
