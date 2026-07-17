import { useCallback, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, UserCircle } from "lucide-react";
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
import { MobileBottomNavigation } from "@/components/MobileBottomNavigation";
import { clubPreferencesQueryKey, getClubPreferences } from "@/lib/api";

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
  const { profile, role, session } = useAuth();
  const preferences = useQuery({
    queryKey: clubPreferencesQueryKey(profile?.id, session?.expires_at),
    queryFn: () => getClubPreferences(),
    enabled: role === "student" && Boolean(session?.user),
    retry: false
  });
  const showDiscoveryOnboarding = role === "student" && !preferences.isLoading && !preferences.isError && !preferences.data;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppShellEffects />
        <AppSidebar />
        {showDiscoveryOnboarding ? <ClubDiscoveryOnboarding /> : <GuidedOnboarding restartSignal={0} />}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-1 border-b border-border/80 bg-card/95 px-4 py-3 backdrop-blur-xl sm:gap-3 sm:px-6 md:static md:min-h-0 md:border-0 md:bg-transparent md:px-6 md:pb-0 md:pt-6 md:shadow-none">
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
              <ThemeToggle className="text-muted-foreground hover:bg-muted md:text-sidebar-foreground" />
              <Button asChild type="button" variant="ghost" size="icon" className="hidden min-[360px]:inline-flex">
                <Link to="/notifications" aria-label="Open notifications"><Bell className="h-5 w-5" aria-hidden="true" /></Link>
              </Button>
              <Button asChild type="button" variant="ghost" size="icon" className="hidden min-[360px]:inline-flex">
                <Link to="/profile" aria-label="Open profile"><UserCircle className="h-4 w-4" aria-hidden="true" /></Link>
              </Button>
            </div>
          </header>
          <main className="min-w-0 flex-1 p-4 pb-24 md:px-6 md:pb-8 md:pt-8">
            <Outlet />
          </main>
          <SiteFooter />
          <MobileBottomNavigation />
        </div>
      </div>
    </SidebarProvider>
  );
}
