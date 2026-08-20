import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "@/shared/theme";
import {
  ArrowRight,
  Bell,
  Check,
  CheckSquare,
  ClipboardList,
  FileText,
  LogOut,
  Megaphone,
  Moon,
  School,
  ShieldCheck,
  Sparkles,
  Sun,
  User,
  UserCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/shared/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/Card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/Dialog";
import { presidentMoreDestinations } from "@/lib/appNavigation";

export function PresidentMoreWorkspace() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  const presidentName = profile?.full_name || "Farouk Al-Mansoor";
  const presidentId = profile?.student_id || "2021/0492";
  const clubName = profile?.club_name || "Nile Google Developers";
  const clubCode = "NGD";

  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleConfirmSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut?.();
    } catch {
      // Fallback
    } finally {
      setIsSigningOut(false);
      setSignOutDialogOpen(false);
      navigate("/login");
    }
  };

  const isDarkMode = theme === "dark";

  return (
    <main className="space-y-6 max-w-5xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in" aria-labelledby="president-more-heading">
      {/* Header & Visual Cue */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              id="president-more-indicator"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-primary uppercase"
            >
              PRESIDENT/MORE
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Hub &bull; {clubCode}
            </span>
          </div>
          <h1 id="president-more-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            President More Hub
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Secondary club management destinations, official reporting, appearance controls, and session authentication.
          </p>
        </div>

        {/* Verified President Tag */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-xl px-2.5 py-1.5 border border-emerald-500/20">
            <ShieldCheck className="h-3.5 w-3.5" />
            President SSO Verified
          </span>
        </div>
      </header>

      {/* PRESIDENT IDENTITY SUMMARY CARD */}
      <section aria-labelledby="profile-summary-heading">
        <Card className="border-border/80 bg-gradient-to-r from-primary/5 via-card to-card">
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-base shadow-xs">
                {presidentName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h2 id="profile-summary-heading" className="text-base font-bold text-foreground">
                    {presidentName}
                  </h2>
                  <span className="rounded bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold font-mono">
                    President: {clubName}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  ID: {presidentId} &bull; Nile University Club Leadership Credentials
                </p>
              </div>
            </div>

            <Button asChild variant="outline" size="sm" className="text-xs font-semibold self-start sm:self-auto">
              <Link to="/profile">
                <span>View Full Profile</span>
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        </Card>
      </section>

      {/* 6 MORE DESTINATIONS GRID */}
      <section aria-labelledby="destinations-heading" className="space-y-3">
        <h2 id="destinations-heading" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Presidential Destinations
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {presidentMoreDestinations.map((dest) => {
            const Icon = dest.icon;
            return (
              <Link
                key={dest.url}
                to={dest.url}
                className="group block focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
              >
                <Card
                  hoverable
                  className="h-full border-border/80 hover:border-primary/50 transition-all duration-180 p-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-180">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                          {dest.title}
                        </h3>
                        <ArrowRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {dest.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* THEME APPEARANCE & SESSION SETTINGS */}
      <section aria-labelledby="settings-heading" className="space-y-3">
        <h2 id="settings-heading" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Appearance &amp; Session
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* THEME (Light and Dark only) */}
          <Card className="border-border/80 p-4 space-y-3">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-foreground">Color Theme</h3>
              <p className="text-xs text-muted-foreground">
                Switch between high-contrast light and dark palettes.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  !isDarkMode
                    ? "border-primary bg-primary/10 text-primary shadow-xs"
                    : "border-border/80 bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sun className="h-4 w-4" />
                <span>Light Mode</span>
                {!isDarkMode && <Check className="h-3.5 w-3.5 ml-auto text-primary" />}
              </button>

              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  isDarkMode
                    ? "border-primary bg-primary/10 text-primary shadow-xs"
                    : "border-border/80 bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <Moon className="h-4 w-4" />
                <span>Dark Mode</span>
                {isDarkMode && <Check className="h-3.5 w-3.5 ml-auto text-primary" />}
              </button>
            </div>
          </Card>

          {/* SECURE SIGN OUT */}
          <Card className="border-border/80 p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-foreground">Sign Out</h3>
              <p className="text-xs text-muted-foreground">
                End your active authenticated session on this device.
              </p>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSignOutDialogOpen(true)}
                className="w-full text-xs font-bold text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30 gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out of OneClub</span>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* INSTITUTIONAL GOVERNANCE FOOTER */}
      <footer className="rounded-2xl border border-border bg-card/60 p-4 text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
          <span>
            Nile University Club Services &bull; Official President Workspace
          </span>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground">
          Assigned Club: {clubName} ({clubCode})
        </span>
      </footer>

      {/* SIGN OUT CONFIRMATION DIALOG */}
      <Dialog
        open={signOutDialogOpen}
        onOpenChange={(open) => !open && setSignOutDialogOpen(false)}
      >
        <DialogContent maxWidth="sm">
          <DialogHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive mx-auto mb-1">
              <LogOut className="h-5 w-5" />
            </div>
            <DialogTitle className="text-center text-foreground">
              Sign out of President Workspace?
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground">
              You will need to sign in again via Nile University Campus One SSO to access your club proposals, organizer QR codes, and communications.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSignOutDialogOpen(false)}
              disabled={isSigningOut}
              className="w-full sm:w-1/2 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmSignOut}
              disabled={isSigningOut}
              className="w-full sm:w-1/2 bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-bold"
            >
              {isSigningOut ? "Signing out..." : "Yes, Sign Out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
