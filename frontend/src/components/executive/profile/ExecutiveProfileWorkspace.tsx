import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Building,
  Check,
  CheckCircle2,
  GraduationCap,
  HelpCircle,
  Info,
  Layers,
  Lock,
  LogOut,
  Mail,
  Moon,
  School,
  ShieldCheck,
  Sparkles,
  Sun,
  User,
  UserCheck
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/shared/theme";
import { Button } from "@/shared/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/Card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/Dialog";
import { Banner } from "@/shared/components/Banner";

export function ExecutiveProfileWorkspace() {
  const { profile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  const executiveName = profile?.full_name || "Fatima Al-Hassan";
  const email = profile?.email || "fatima.alhassan@nileuniversity.edu.ng";
  const matricNumber = "NUG/NAS/21/0312";
  const studentId = "2021/0312";
  const department = "Computer Science (300L)";
  const faculty = "Faculty of Natural & Applied Sciences";
  const clubName = profile?.club_name || "Nile Google Developers";
  const clubCode = "NGD";
  const officerRole = "Workshops Coordinator & Technical Logistics";

  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleToggleTheme = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    setToastMessage(`Theme preference switched to ${newTheme} mode.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <main
      className="space-y-6 max-w-4xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in"
      aria-labelledby="executive-profile-heading"
    >
      {/* HEADER & ROLE BADGE */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              id="executive-profile-indicator"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-primary uppercase"
            >
              EXECUTIVE/PROFILE
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Campus One Verified
            </span>
          </div>

          <h1
            id="executive-profile-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight text-foreground"
          >
            {executiveName}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
            {officerRole} &bull; {clubName} ({clubCode})
          </p>
        </div>

        {/* Sign Out Button */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsSignOutModalOpen(true)}
          className="text-xs font-semibold gap-1.5 text-destructive hover:bg-destructive/10 self-start sm:self-auto"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </Button>
      </header>

      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <Banner
          variant="success"
          title="Preference Saved"
          description={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* READ-ONLY CAMPUS ONE IDENTITY NOTICE */}
      <div className="rounded-2xl border border-border/70 bg-card p-4 text-xs space-y-1.5 shadow-xs">
        <div className="flex items-center gap-2 font-bold text-foreground">
          <Lock className="h-4 w-4 text-primary" />
          <span>Institutional Single Sign-On Record (Campus One)</span>
        </div>
        <p className="text-muted-foreground text-[11px] leading-relaxed">
          Student registration details, matriculation number, faculty assignments, and executive appointments are managed directly by Nile University Student Affairs. Records cannot be edited locally.
        </p>
      </div>

      {/* PROFILE DETAILS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Academic Credentials Card */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              Academic Credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Full Student Name</span>
              <p className="font-bold text-foreground text-sm">{executiveName}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Matriculation Number</span>
              <p className="font-mono font-bold text-foreground text-xs">{matricNumber}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Campus One ID</span>
              <p className="font-mono font-bold text-foreground text-xs">{studentId}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Department &amp; Level</span>
              <p className="font-semibold text-foreground text-xs">{department}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Faculty</span>
              <p className="text-muted-foreground text-xs">{faculty}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Official Nile Email</span>
              <p className="font-mono text-muted-foreground text-xs">{email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Club Appointment & Preferences Card */}
        <div className="space-y-5">
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <School className="h-4 w-4 text-primary" />
                Assigned Club Appointment
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Club Organization</span>
                <p className="font-bold text-foreground text-sm">{clubName} ({clubCode})</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Executive Appointment</span>
                <p className="font-semibold text-primary text-xs">{officerRole}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Accreditation Status</span>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs">Tier 1 Accredited (Active)</p>
              </div>

              <div className="pt-2 border-t border-border/40">
                <Link to="/clubs" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                  <span>View Club Profile &amp; Roster</span>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Theme & Display Preferences */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sun className="h-4 w-4 text-primary" />
                Theme &amp; Display Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleTheme("light")}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    theme === "light"
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-muted/40 text-muted-foreground hover:text-foreground border-border/60"
                  }`}
                >
                  <Sun className="h-4 w-4" />
                  <span>Light Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleTheme("dark")}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    theme === "dark"
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-muted/40 text-muted-foreground hover:text-foreground border-border/60"
                  }`}
                >
                  <Moon className="h-4 w-4" />
                  <span>Dark Mode</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SIGN OUT CONFIRMATION MODAL */}
      <Dialog open={isSignOutModalOpen} onOpenChange={setIsSignOutModalOpen}>
        <DialogContent maxWidth="sm">
          <div className="space-y-4 text-xs">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <LogOut className="h-4 w-4 text-destructive" />
                Sign Out of OneClub Nile
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Are you sure you want to end your current session? You will need your Campus One credentials to log back in.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="pt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSignOutModalOpen(false)}
                className="w-1/2 text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setIsSignOutModalOpen(false);
                  signOut();
                }}
                className="w-1/2 text-xs font-bold"
              >
                Sign Out
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
