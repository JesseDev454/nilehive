import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserCircle } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { GuidedOnboarding } from "@/components/GuidedOnboarding";
import { SiteFooter } from "@/components/SiteFooter";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useSidebar } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ClubDiscoveryOnboarding } from "@/components/ClubDiscoveryOnboarding";
import { getClubPreferences } from "@/lib/api";
import { formatRoleLabel } from "@/lib/roles";

function AppShellEffects() {
  const location = useLocation();
  const { openMobile, setOpenMobile } = useSidebar();
  const lastRouteKeyRef = useRef<string | null>(null);
  const routeKey = `${location.pathname}${location.search}${location.hash}`;

  const clearStaleScrollLock = useCallback(() => {
    if (typeof document === "undefined") {
      return;
    }

    const hasOpenDialog = Boolean(document.querySelector("[role='dialog'][data-state='open']"));

    if (hasOpenDialog) {
      return;
    }

    document.body.style.removeProperty("overflow");
    document.body.style.removeProperty("padding-right");
    document.body.style.removeProperty("pointer-events");
    document.body.removeAttribute("data-scroll-locked");
    document.documentElement.style.removeProperty("overflow");
  }, []);

  useEffect(() => {
    const previousRouteKey = lastRouteKeyRef.current;
    lastRouteKeyRef.current = routeKey;

    if (previousRouteKey && previousRouteKey !== routeKey && openMobile) {
      setOpenMobile(false);
    }

    const timer = window.setTimeout(() => {
      clearStaleScrollLock();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [clearStaleScrollLock, openMobile, routeKey, setOpenMobile]);

  useEffect(() => {
    clearStaleScrollLock();

    return () => {
      clearStaleScrollLock();
    };
  }, [clearStaleScrollLock]);

  return null;
}

export function AppLayout() {
  const { profile, role, signOut } = useAuth();
  const [guideRestartSignal, setGuideRestartSignal] = useState(0);
  const preferences = useQuery({ queryKey: ["club-preferences"], queryFn: getClubPreferences, enabled: role === "student", retry: false });
  const showDiscoveryOnboarding = role === "student" && !preferences.isLoading && !preferences.isError && !preferences.data;

  async function handleSignOut() {
    await signOut();
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppShellEffects />
        <AppSidebar />
        {showDiscoveryOnboarding ? <ClubDiscoveryOnboarding /> : <GuidedOnboarding restartSignal={guideRestartSignal} />}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-1 border-b border-border/70 bg-card/85 px-2 py-3 shadow-soft-sm backdrop-blur-xl sm:gap-3 sm:px-3 md:absolute md:right-8 md:top-8 md:min-h-0 md:rounded-[24px] md:border md:bg-card/80 md:p-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 md:hidden">
                <SidebarTrigger />
                <span className="text-sm font-semibold text-muted-foreground">Menu</span>
              </div>
              <div className="hidden items-center sm:flex">
                <BrandLogo
                  size="md"
                  variant="plain"
                  className="h-10 w-[13rem] shrink-0 md:hidden lg:h-11 lg:w-[14rem]"
                />
              </div>
            </div>
            <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">
              <span className="hidden rounded-full border border-primary/10 bg-accent/70 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-accent-foreground sm:inline">
                {role === "admin"
                  ? "Admin Access"
                  : role
                    ? `${formatRoleLabel(role)} Mode`
                    : profile?.role ?? "Loading"}
              </span>
              <ThemeToggle />
              <Button asChild type="button" variant="outline" size="icon" className="hidden min-[360px]:inline-flex">
                <Link to="/profile" aria-label="Open profile"><UserCircle className="h-4 w-4" aria-hidden="true" /></Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setGuideRestartSignal((value) => value + 1)}
              >
                <span className="sm:hidden">Guide</span>
                <span className="hidden sm:inline">Help / Guide</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Logout
              </Button>
            </div>
          </header>
          <main className="min-w-0 flex-1 p-4 md:p-8 md:pt-28">
            <Outlet />
          </main>
          <SiteFooter />
        </div>
      </div>
    </SidebarProvider>
  );
}
