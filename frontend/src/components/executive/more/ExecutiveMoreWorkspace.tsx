import { useState } from "react";
import {
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/shared/components/Button";
import { ExecutiveProfileHeaderCard } from "./ExecutiveProfileHeaderCard";
import { ExecutiveMoreNavGrid } from "./ExecutiveMoreNavGrid";
import { ExecutiveThemeSelector } from "./ExecutiveThemeSelector";
import { ExecutiveSignOutDialog } from "./ExecutiveSignOutDialog";

export function ExecutiveMoreWorkspace() {
  const { signOut } = useAuth();
  const executiveName = "Fatima Al-Hassan";
  const email = "fatima.alhassan@nileuniversity.edu.ng";
  const matricNumber = "NUG/NAS/21/0312";
  const department = "Computer Science (300L)";
  const clubName = "Nile Google Developers";
  const clubCode = "NGD";
  const officerRole = "Workshops Coordinator & Technical Logistics";

  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const handleConfirmSignOut = () => {
    setIsSignOutModalOpen(false);
    signOut();
  };

  return (
    <main
      className="space-y-6 max-w-4xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in"
      aria-labelledby="executive-more-heading"
    >
      {/* HEADER & ROLE BADGE */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              id="executive-more-indicator"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-primary uppercase"
            >
              EXECUTIVE/MORE
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Campus One Verified Officer
            </span>
          </div>

          <h1
            id="executive-more-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight text-foreground"
          >
            More
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
            Open notifications, view your profile, change the theme, or sign out.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsSignOutModalOpen(true)}
            className="text-xs font-bold gap-1.5 h-8.5 text-destructive hover:bg-destructive/10 border-destructive/30"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </header>

      {/* SECTION 1: VERIFIED EXECUTIVE IDENTITY SUMMARY */}
      <ExecutiveProfileHeaderCard
        name={executiveName}
        role={officerRole}
        clubName={clubName}
        clubCode={clubCode}
        matricNumber={matricNumber}
        email={email}
        department={department}
      />

      {/* SECTION 2: EXECUTIVE DESTINATIONS NAVIGATION GRID */}
      <ExecutiveMoreNavGrid unreadNotificationCount={2} />

      {/* SECTION 3: THEME & DISPLAY APPEARANCE */}
      <ExecutiveThemeSelector />

      {/* MODAL: SIGN OUT CONFIRMATION */}
      <ExecutiveSignOutDialog
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirmSignOut={handleConfirmSignOut}
      />
    </main>
  );
}

export default ExecutiveMoreWorkspace;
