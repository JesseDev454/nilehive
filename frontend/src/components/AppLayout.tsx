import { useCallback, useEffect, useRef } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { SiteFooter } from "@/components/SiteFooter";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
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
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppShellEffects />
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="flex h-16 items-center justify-between border-b-2 border-foreground bg-card/95 px-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="hidden items-center sm:flex">
                <BrandLogo
                  size="md"
                  variant="plain"
                  className="h-10 w-[13rem] shrink-0 lg:h-11 lg:w-[14rem]"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden border-2 border-warning bg-warning px-2 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-warning-foreground sm:inline">
                {profile?.role ?? "Loading"} Mode
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Logout
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
          <SiteFooter />
        </div>
      </div>
    </SidebarProvider>
  );
}
