import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, LogOut, Palette, School, Settings2 } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { GuidedOnboarding } from "@/components/GuidedOnboarding";
import { NavLink } from "@/components/NavLink";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { getRoleNavItems, roleLabels } from "@/lib/appNavigation";
import { cn } from "@/lib/utils";

type AccentKey = "indigo" | "teal" | "slate";
type DensityKey = "comfortable" | "compact";

const accentPalettes: Record<AccentKey, { label: string; primary: string; accent: string; foreground: string; ring: string }> = {
  indigo: {
    label: "Indigo",
    primary: "239 84% 67%",
    accent: "232 100% 97%",
    foreground: "243 75% 59%",
    ring: "239 84% 67%",
  },
  teal: {
    label: "Soft teal",
    primary: "173 80% 32%",
    accent: "174 72% 94%",
    foreground: "173 80% 25%",
    ring: "173 80% 32%",
  },
  slate: {
    label: "Dusty blue",
    primary: "222 50% 48%",
    accent: "218 60% 95%",
    foreground: "222 50% 38%",
    ring: "222 50% 48%",
  },
};

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

function useClublyPreferences() {
  const [accent, setAccent] = useState<AccentKey>(() => {
    if (typeof window === "undefined") {
      return "indigo";
    }

    const saved = window.localStorage.getItem("clubly-accent");
    return saved === "teal" || saved === "slate" || saved === "indigo" ? saved : "indigo";
  });
  const [density, setDensity] = useState<DensityKey>(() => {
    if (typeof window === "undefined") {
      return "comfortable";
    }

    return window.localStorage.getItem("clubly-density") === "compact" ? "compact" : "comfortable";
  });

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const palette = accentPalettes[accent];
    const root = document.documentElement;
    root.style.setProperty("--primary", palette.primary);
    root.style.setProperty("--ring", palette.ring);
    root.style.setProperty("--sidebar-primary", palette.primary);
    root.style.setProperty("--sidebar-ring", palette.ring);
    root.style.setProperty("--accent", palette.accent);
    root.style.setProperty("--accent-foreground", palette.foreground);
    root.style.setProperty("--sidebar-accent", palette.accent);
    root.style.setProperty("--sidebar-accent-foreground", palette.foreground);
    root.style.setProperty("--clubly-accent", `hsl(${palette.primary})`);
    root.setAttribute("data-density", density);
    window.localStorage.setItem("clubly-accent", accent);
    window.localStorage.setItem("clubly-density", density);
  }, [accent, density]);

  return { accent, density, setAccent, setDensity };
}

function ClublyPreferences({
  accent,
  density,
  onAccentChange,
  onDensityChange,
}: {
  accent: AccentKey;
  density: DensityKey;
  onAccentChange: (accent: AccentKey) => void;
  onDensityChange: (density: DensityKey) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="icon" aria-label="Display preferences" className="rounded-full">
          <Settings2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Interface
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.entries(accentPalettes).map(([key, palette]) => (
          <DropdownMenuItem key={key} onSelect={() => onAccentChange(key as AccentKey)}>
            <span className="mr-2 h-3 w-3 rounded-full" style={{ backgroundColor: `hsl(${palette.primary})` }} />
            <span className="flex-1">{palette.label}</span>
            {accent === key ? <Check className="h-4 w-4" /> : null}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={density === "compact"}
          onCheckedChange={(checked) => onDensityChange(checked ? "compact" : "comfortable")}
        >
          Compact density
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileBottomNav() {
  const { role } = useAuth();
  const navItems = useMemo(() => getRoleNavItems(role).slice(0, 5), [role]);

  if (navItems.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Mobile primary navigation"
      className="fixed inset-x-3 bottom-3 z-40 rounded-[24px] border border-border/70 bg-card/90 px-2 py-2 shadow-soft-lg backdrop-blur-xl min-[921px]:hidden"
    >
      <div className="grid grid-cols-5 gap-1">
        {navItems.map((item) => (
          <NavLink
            key={`${item.title}-${item.url}`}
            to={item.url}
            end={item.url === "/"}
            data-onboarding-target={item.onboardingTarget}
            className="flex min-w-0 flex-col items-center gap-1 rounded-[18px] px-1 py-2 text-[10px] font-semibold text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            activeClassName="bg-accent text-accent-foreground"
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="max-w-full truncate">{item.shortTitle ?? item.title}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

function MobileTopBar({
  accent,
  density,
  onAccentChange,
  onDensityChange,
  onGuide,
  onSignOut,
}: {
  accent: AccentKey;
  density: DensityKey;
  onAccentChange: (accent: AccentKey) => void;
  onDensityChange: (density: DensityKey) => void;
  onGuide: () => void;
  onSignOut: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-border/70 bg-background/85 px-4 py-3 backdrop-blur-xl min-[921px]:hidden">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="rounded-full" />
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-[14px] bg-primary text-primary-foreground shadow-soft-sm" aria-hidden="true">
            <School className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold leading-none tracking-tight">Clubly</p>
            <p className="mt-1 text-[11px] font-medium text-muted-foreground">Club Services</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ClublyPreferences accent={accent} density={density} onAccentChange={onAccentChange} onDensityChange={onDensityChange} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="icon" aria-label="Account actions" className="rounded-full">
              <LogOut className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onSelect={onGuide}>Help / Guide</DropdownMenuItem>
            <DropdownMenuItem onSelect={onSignOut}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function AppLayout() {
  const { profile, role, signOut } = useAuth();
  const [guideRestartSignal, setGuideRestartSignal] = useState(0);
  const { accent, density, setAccent, setDensity } = useClublyPreferences();

  async function handleSignOut() {
    await signOut();
  }

  const roleLabel = role ? roleLabels[role] : profile?.role ?? "Loading";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppShellEffects />
        <AppSidebar />
        <GuidedOnboarding restartSignal={guideRestartSignal} />
        <div className="flex min-w-0 flex-1 flex-col">
          <MobileTopBar
            accent={accent}
            density={density}
            onAccentChange={setAccent}
            onDensityChange={setDensity}
            onGuide={() => setGuideRestartSignal((value) => value + 1)}
            onSignOut={handleSignOut}
          />
          <header className="absolute right-8 top-8 z-30 hidden items-center justify-between gap-3 rounded-[24px] border border-border/70 bg-card/75 p-2 shadow-soft-sm backdrop-blur-xl min-[921px]:flex">
            <span className="rounded-full border border-primary/10 bg-accent px-3 py-1.5 text-[11px] font-semibold tracking-wide text-accent-foreground">
              {role === "admin" ? "Admin Access" : `${roleLabel} Mode`}
            </span>
            <ClublyPreferences accent={accent} density={density} onAccentChange={setAccent} onDensityChange={setDensity} />
            <Button type="button" variant="outline" size="sm" onClick={() => setGuideRestartSignal((value) => value + 1)}>
              Help / Guide
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Logout
            </Button>
          </header>
          <main className={cn("clubly-main-pad flex-1 px-4 pb-28 pt-4 min-[921px]:px-8 min-[921px]:pb-10 min-[921px]:pt-28")}>
            <div className="mx-auto w-full max-w-[1180px]">
              <Outlet />
            </div>
          </main>
          <MobileBottomNav />
          <SiteFooter />
        </div>
      </div>
    </SidebarProvider>
  );
}
