import { useCallback, useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { GuidedOnboarding } from "@/components/GuidedOnboarding";
import { SiteFooter } from "@/components/SiteFooter";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Outlet, useLocation } from "react-router-dom";
import { useSidebar } from "@/components/ui/sidebar";

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

  async function handleSignOut() {
    await signOut();
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppShellEffects />
        <AppSidebar />
        <GuidedOnboarding restartSignal={guideRestartSignal} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-border bg-card/80 px-3 py-3 shadow-soft-sm backdrop-blur-xl md:absolute md:right-8 md:top-8 md:min-h-0 md:rounded-[24px] md:border md:bg-card/75 md:p-2">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="md:hidden" />
              <div className="hidden items-center sm:flex">
                <BrandLogo
                  size="md"
                  variant="plain"
                  className="h-10 w-[13rem] shrink-0 md:hidden lg:h-11 lg:w-[14rem]"
                />
              </div>
            </div>
            <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">
              <span className="hidden rounded-full border border-primary/10 bg-accent px-3 py-1.5 text-[11px] font-semibold tracking-wide text-accent-foreground sm:inline">
                {role === "admin"
                  ? "Admin Access"
                  : role
                    ? `${role} Mode`
                    : profile?.role ?? "Loading"}
              </span>
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
          <main className="flex-1 p-4 md:p-8 md:pt-28">
            <Outlet />
          </main>
          <SiteFooter />
        </div>
      </div>
    </SidebarProvider>
  );
}
