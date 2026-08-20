import React from "react";
import { Shield, Sparkles } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export interface AppShellProps {
  children: React.ReactNode;
  brandTitle?: string;
  subtitle?: string;
  roleName?: string;
  userName?: string;
  userAvatarInitials?: string;
  navItems?: React.ReactNode;
  headerActions?: React.ReactNode;
}

export function AppShell({
  children,
  brandTitle = "OneClub",
  subtitle = "Nile University",
  roleName = "Administrator",
  userName = "Director Zainab Ahmed",
  userAvatarInitials = "ZA",
  navItems,
  headerActions
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary/20">
      {/* Institutional Top App Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo & Nile University Identity */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-2xs">
              <Shield className="h-5 w-5 fill-primary-foreground/20" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-foreground">
                  {brandTitle}
                </span>
                <span className="inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.2 text-[10px] font-bold text-primary uppercase tracking-wide">
                  {roleName}
                </span>
              </div>
              <span className="text-[10px] font-medium text-muted-foreground block -mt-0.5">
                {subtitle}
              </span>
            </div>
          </div>

          {/* Header Navigation Links (Desktop) */}
          {navItems && (
            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
              {navItems}
            </nav>
          )}

          {/* Right Header Actions & Theme Switcher */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            {headerActions}

            {/* User Monogram */}
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs border border-primary/20 select-none"
              title={`${userName} (${roleName})`}
              aria-label={`User account: ${userName}`}
            >
              {userAvatarInitials}
            </div>
          </div>
        </div>
      </header>

      {/* Main Responsive Canvas */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* Institutional Footer */}
      <footer className="border-t border-border/60 bg-muted/20 py-4 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>OneClub &bull; Nile University Club Services Directorate</span>
          <span>Campus One Single Sign-On Authenticated</span>
        </div>
      </footer>
    </div>
  );
}
