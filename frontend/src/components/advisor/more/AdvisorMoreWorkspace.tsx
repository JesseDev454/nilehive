import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, ChevronRight, LogOut, Moon, ShieldCheck, Sun, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { AdvisorRoleHeader } from "../header/AdvisorRoleHeader";
import { AdvisorSignOutDialog } from "./AdvisorSignOutDialog";
import { Button } from "@/shared/components/Button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/shared/theme";

const ASSIGNED_CLUBS = [
  { id: "nile-google-developers", code: "NGD", name: "Nile Google Developers" },
  { id: "nile-climate-initiatives-club", code: "NCIC", name: "Nile Climate Initiatives Club" },
  { id: "nile-startup-campus", code: "NSC", name: "Nile Startup Campus" },
];

export function AdvisorMoreWorkspace() {
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);

  const changeTheme = (nextTheme: "light" | "dark") => {
    setTheme(nextTheme);
    toast.success(`${nextTheme === "light" ? "Light" : "Dark"} mode selected.`);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-1 py-2 text-left sm:px-0 animate-fade-in">
      <AdvisorRoleHeader title="More" subtitle="Open notifications, view your profile, change the theme, or sign out." pendingCount={2} assignedClubs={ASSIGNED_CLUBS} />

      <Card className="overflow-hidden border border-border/80 bg-card shadow-xs">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-xl font-bold text-primary">KO</div>
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">Dr. Kalu Okonkwo</h2>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300"><ShieldCheck className="h-3 w-3" /> Campus One verified</span>
              </div>
              <p className="text-xs text-muted-foreground">Staff Advisor · Three assigned clubs</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <section aria-labelledby="advisor-more-destinations" className="space-y-3">
        <h2 id="advisor-more-destinations" className="text-sm font-bold text-foreground">Account</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link to="/advisor/notifications" className="group flex min-h-24 items-center justify-between rounded-2xl border border-border/80 bg-card p-4 transition-colors hover:border-primary/50 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Bell className="h-5 w-5" /></span><div><h3 className="text-sm font-bold text-foreground">Notifications</h3><p className="text-xs text-muted-foreground">Proposal and report updates</p></div></div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link to="/advisor/profile" className="group flex min-h-24 items-center justify-between rounded-2xl border border-border/80 bg-card p-4 transition-colors hover:border-primary/50 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><UserCircle className="h-5 w-5" /></span><div><h3 className="text-sm font-bold text-foreground">Profile</h3><p className="text-xs text-muted-foreground">Identity and assigned clubs</p></div></div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </div>
      </section>

      <Card className="border border-border/80 bg-card">
        <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
          <div><h2 className="text-sm font-bold text-foreground">Theme</h2><p className="text-xs text-muted-foreground">Choose light or dark mode.</p></div>
          <div className="flex rounded-xl border border-border/60 bg-muted/60 p-1">
            <button type="button" onClick={() => changeTheme("light")} aria-pressed={theme === "light"} className={`flex min-h-11 items-center gap-2 rounded-lg px-4 text-xs font-semibold ${theme === "light" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`}><Sun className="h-4 w-4" /> Light</button>
            <button type="button" onClick={() => changeTheme("dark")} aria-pressed={theme === "dark"} className={`flex min-h-11 items-center gap-2 rounded-lg px-4 text-xs font-semibold ${theme === "dark" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`}><Moon className="h-4 w-4" /> Dark</button>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/80 bg-card"><CardContent className="flex items-center justify-between gap-4 p-5"><div><h2 className="text-sm font-bold text-foreground">Sign out</h2><p className="text-xs text-muted-foreground">End this OneClub session.</p></div><Button variant="outline" size="sm" onClick={() => setIsSignOutOpen(true)} className="gap-1.5 text-xs text-destructive"><LogOut className="h-4 w-4" /> Sign out</Button></CardContent></Card>

      <AdvisorSignOutDialog
        isOpen={isSignOutOpen}
        onOpenChange={setIsSignOutOpen}
        onConfirm={() => {
          setIsSignOutOpen(false);
          void signOut();
        }}
      />
    </div>
  );
}

export default AdvisorMoreWorkspace;
