import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  GraduationCap,
  Info,
  Lock,
  LogOut,
  Moon,
  RefreshCw,
  School,
  ShieldCheck,
  Sun,
  User,
  WifiOff
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/shared/components/Button";
import { Banner } from "@/shared/components/Banner";
import { ExecutiveIdentityCard } from "./ExecutiveIdentityCard";
import { ExecutiveAppointmentCard } from "./ExecutiveAppointmentCard";
import { ExecutiveThemeCard } from "./ExecutiveThemeCard";
import { ExecutiveSessionCard } from "./ExecutiveSessionCard";

export function ExecutiveProfileWorkspace() {
  const { signOut } = useAuth();

  const executiveName = "Fatima Al-Hassan";
  const email = "fatima.alhassan@nileuniversity.edu.ng";
  const matricNumber = "NUG/NAS/21/0312";
  const campusOneId = "STU-2021-0312";
  const department = "Computer Science";
  const level = "300 Level";
  const faculty = "Faculty of Natural & Applied Sciences";
  const clubName = "Nile Google Developers";
  const clubCode = "NGD";
  const officerRole = "Workshops Coordinator & Technical Logistics";
  const term = "2026 / 2027 Academic Session";
  const accreditation = "Tier 1 Accredited";
  const memberCount = 148;

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline] = useState(!navigator.onLine);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setToastMessage("Campus One student identity & appointment status synchronized.");
      setTimeout(() => setToastMessage(null), 3000);
    }, 450);
  };

  const handleThemeChanged = (newTheme: "light" | "dark") => {
    setToastMessage(`Theme switched to ${newTheme} mode.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <main
      className="space-y-6 max-w-4xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in"
      aria-labelledby="executive-profile-heading"
    >
      {/* HEADER & ROLE BADGE */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              id="executive-profile-indicator"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-primary uppercase"
            >
              EXECUTIVE/PROFILE
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified Campus One Officer
            </span>
          </div>

          <h1
            id="executive-profile-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight text-foreground"
          >
            {executiveName}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
            {officerRole} &bull; {clubName} ({clubCode})
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-xs font-semibold gap-1.5 h-8.5 px-3"
            aria-label="Refresh profile data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
            <span>Sync</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => signOut()}
            className="text-xs font-bold gap-1.5 h-8.5 text-destructive hover:bg-destructive/10 border-destructive/30"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </header>

      {/* OFFLINE STATUS NOTIFICATION */}
      {isOffline && (
        <Banner
          variant="warning"
          title="Offline Mode"
          description="Showing locally cached student credentials and appointment records."
        />
      )}

      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <Banner
          variant="success"
          title="Notice"
          description={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* SECTION 1: READ-ONLY CAMPUS ONE IDENTITY */}
      <ExecutiveIdentityCard
        name={executiveName}
        matricNumber={matricNumber}
        campusOneId={campusOneId}
        department={department}
        faculty={faculty}
        email={email}
        level={level}
      />

      {/* SECTION 2: EXECUTIVE ROLE & ASSIGNED CLUB */}
      <ExecutiveAppointmentCard
        clubName={clubName}
        clubCode={clubCode}
        role={officerRole}
        term={term}
        accreditation={accreditation}
        memberCount={memberCount}
      />

      {/* SECTION 3: THEME PREFERENCE */}
      <ExecutiveThemeCard onThemeChanged={handleThemeChanged} />

      {/* SECTION 4: SSO SESSION & SIGN OUT */}
      <ExecutiveSessionCard onSignOut={signOut} />
    </main>
  );
}

export default ExecutiveProfileWorkspace;
