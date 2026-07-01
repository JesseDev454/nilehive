import { PanelLeftClose, PanelLeftOpen, School } from "lucide-react";
import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { getRoleNavItems, roleLabels } from "@/lib/appNavigation";

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
  const { setOpen, state } = useSidebar();
  const { pathname } = useLocation();
  const collapsed = state === "collapsed";
  const items = getRoleNavItems(role);
  const { displayName, identityLabel, initials } = useIdentity();

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
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/10 bg-sidebar/75 backdrop-blur-xl max-[920px]:hidden">
      <SidebarHeader className={collapsed ? "border-b border-sidebar-border/10 px-1 py-5" : "border-b-0 p-5 pb-4"}>
        {!collapsed && (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-primary text-primary-foreground shadow-soft-sm" aria-hidden="true">
                  <School className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold leading-none tracking-tight text-sidebar-foreground">Clubly</h2>
                  <p className="mt-2 text-sm font-medium leading-6 text-sidebar-foreground/60">Club Services workspace</p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Collapse sidebar"
                className="rounded-full border border-sidebar-border/10 bg-card/75 p-2 text-sidebar-foreground/65 shadow-soft-sm transition hover:-translate-y-0.5 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-[14px] bg-primary text-primary-foreground shadow-soft-sm transition hover:-translate-y-0.5"
            onClick={() => setOpen(true)}
          >
            <PanelLeftOpen className="h-5 w-5" />
          </button>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[11px] font-semibold tracking-wide text-sidebar-foreground/45">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {items.map((item) => (
                <SidebarMenuItem key={`${item.title}-${item.url}`}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      activeOverride={getActiveOverride(item.url)}
                      data-onboarding-target={item.onboardingTarget}
                      className="relative flex min-w-0 items-center rounded-[16px] px-3 py-3 text-sm font-semibold tracking-[-0.01em] text-sidebar-foreground/70 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground shadow-soft-sm"
                    >
                      <item.icon className="mr-3 h-5 w-5 shrink-0" />
                      {!collapsed && <span className="min-w-0 flex-1 truncate">{item.title}</span>}
                      {!collapsed && item.badge ? (
                        <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                          {item.badge}
                        </span>
                      ) : null}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={collapsed ? "border-t border-sidebar-border/10 px-1 py-4" : "border-t border-sidebar-border/10 p-4"}>
        {collapsed ? (
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground">
            <span className="text-xs font-semibold tracking-wide">{initials}</span>
          </div>
        ) : (
          <div className="rounded-[22px] border border-sidebar-border/10 bg-card/70 p-4 shadow-soft-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground">
                <span className="text-sm font-semibold tracking-wide">{initials}</span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-sidebar-foreground">{displayName}</h3>
                <p className="block truncate text-[11px] font-medium tracking-wide text-sidebar-foreground/60">{identityLabel}</p>
              </div>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
