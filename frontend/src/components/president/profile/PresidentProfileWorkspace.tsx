import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Building,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  CreditCard,
  ExternalLink,
  FileCheck,
  FileText,
  GraduationCap,
  HelpCircle,
  Info,
  Layers,
  LogOut,
  Mail,
  Moon,
  Phone,
  School,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  User,
  UserCheck,
  UserCircle,
  Users,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/shared/theme";
import { Button } from "@/shared/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/Card";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/Dialog";
import { Banner } from "@/shared/components/Banner";

export interface PresidentIdentityProfile {
  fullName: string;
  studentId: string;
  matricNo: string;
  email: string;
  phone: string;
  faculty: string;
  department: string;
  level: string;
  session: string;
  verificationStatus: string;
  ssoProvider: string;
  assignedClub: {
    name: string;
    code: string;
    category: string;
    tier: string;
    tenure: string;
    advisorName: string;
    advisorRole: string;
    roleTitle: string;
    registeredMembers: number;
    activeProposals: number;
  };
}

export const DETERMINISTIC_PRESIDENT_PROFILE: PresidentIdentityProfile = {
  fullName: "Farouk Al-Mansoor",
  studentId: "2021/0892",
  matricNo: "NUG/ENG/21/0892",
  email: "f.almansoor@nileuniversity.edu.ng",
  phone: "+234 802 884 9102",
  faculty: "Faculty of Engineering",
  department: "Computer Engineering (400L / Final Year)",
  level: "400 Level",
  session: "2025/2026 Academic Session",
  verificationStatus: "Active & In Good Standing",
  ssoProvider: "Nile Campus One Single Sign-On (Active Token)",
  assignedClub: {
    name: "Nile Google Developers",
    code: "NGD",
    category: "Academic & Technology",
    tier: "Tier 1 Accredited Society",
    tenure: "August 2025 – July 2026 (1-Year Presidential Mandate)",
    advisorName: "Dr. Aminu Galadima",
    advisorRole: "Senior Lecturer, Computer Science & Student Affairs Liaison",
    roleTitle: "Club President (Chief Executive Officer)",
    registeredMembers: 148,
    activeProposals: 3
  }
};

export function PresidentProfileWorkspace() {
  const { profile, user, signOut } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();

  // Local storage check for first-run welcome banner
  const [welcomeDismissed, setWelcomeDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("oneclub-president-welcome-dismissed") === "true";
    } catch {
      return false;
    }
  });

  // Orientation walkthrough dialog (skippable, does NOT claim a club)
  const [isOrientationOpen, setIsOrientationOpen] = useState(false);

  // Sign out confirmation dialog
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);

  // Copy feedback state
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Combine auth profile context with deterministic values
  const presidentData: PresidentIdentityProfile = {
    ...DETERMINISTIC_PRESIDENT_PROFILE,
    fullName: profile?.full_name || DETERMINISTIC_PRESIDENT_PROFILE.fullName,
    email: user?.email || DETERMINISTIC_PRESIDENT_PROFILE.email,
    department: profile?.department || DETERMINISTIC_PRESIDENT_PROFILE.department,
    studentId: profile?.student_id || DETERMINISTIC_PRESIDENT_PROFILE.studentId,
    assignedClub: {
      ...DETERMINISTIC_PRESIDENT_PROFILE.assignedClub,
      name: profile?.club_name || DETERMINISTIC_PRESIDENT_PROFILE.assignedClub.name
    }
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleDismissWelcome = () => {
    setWelcomeDismissed(true);
    try {
      localStorage.setItem("oneclub-president-welcome-dismissed", "true");
    } catch {
      // Storage fallback
    }
  };

  return (
    <main
      className="space-y-6 max-w-5xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in"
      aria-labelledby="president-profile-heading"
    >
      {/* HEADER & ROLE BADGE */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              id="president-profile-indicator"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-primary uppercase"
            >
              PRESIDENT/PROFILE
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Campus One Verified
            </span>
          </div>

          <h1
            id="president-profile-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight text-foreground"
          >
            President Credentials &amp; Preferences
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Authoritative institutional record from Nile University Single Sign-On (SSO) and governance credentials for {presidentData.assignedClub.name}.
          </p>
        </div>

        {/* Header Actions: Quick Tour & Sign Out */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOrientationOpen(true)}
            className="text-xs font-semibold gap-1.5 border-border/80 text-foreground"
          >
            <HelpCircle className="h-3.5 w-3.5 text-primary" />
            <span>Orientation Guide</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSignOutOpen(true)}
            className="text-xs font-semibold gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </header>

      {/* FIRST-RUN WELCOME BANNER (OPTIONAL & SKIPPABLE, DOES NOT CLAIM A CLUB) */}
      {!welcomeDismissed && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5 relative transition-all animate-fade-in space-y-3">
          <button
            type="button"
            onClick={handleDismissWelcome}
            className="absolute top-3.5 right-3.5 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            title="Dismiss welcome guide"
            aria-label="Dismiss welcome banner"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-3.5 pr-6">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-foreground">
                  Welcome to OneClub, President {presidentData.fullName.split(" ")[0]}!
                </h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.2 rounded-full bg-primary/15 text-primary font-mono">
                  Orientation
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
                Your account is pre-linked to <strong>{presidentData.assignedClub.name}</strong> ({presidentData.assignedClub.code}) through the Nile Student Affairs accreditation registry. You can submit event proposals, delegate tasks to officers, sign off on member applications, and submit post-event reports.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-primary/10">
            <Button
              size="sm"
              onClick={() => setIsOrientationOpen(true)}
              className="text-xs font-bold gap-1 bg-primary text-primary-foreground"
            >
              <span>View 2-Minute Orientation</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismissWelcome}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Skip and Don't Show Again
            </Button>
          </div>
        </div>
      )}

      {/* COPIED TOAST / ALERT */}
      {copiedField && (
        <Banner
          variant="success"
          title="Copied to Clipboard"
          description={`Copied ${copiedField} successfully.`}
          onClose={() => setCopiedField(null)}
        />
      )}

      {/* GRID STACK: IDENTITY & ASSIGNED CLUB */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* LEFT 2 COLUMNS: CAMPUS ONE IDENTITY */}
        <div className="lg:col-span-2 space-y-5">
          {/* CAMPUS ONE AUTHENTICATED RECORD (READ-ONLY) */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <UserCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground">
                      Campus One Institutional Identity
                    </CardTitle>
                    <CardDescription className="text-[11px] text-muted-foreground">
                      Authoritative student registry records (Read-Only)
                    </CardDescription>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground">
                  SSO &bull; VERIFIED
                </span>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3 bg-muted/30 rounded-xl border border-border/50 space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    Full Legal Name
                  </span>
                  <p className="font-bold text-foreground text-sm">{presidentData.fullName}</p>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    ID: {presidentData.studentId}
                  </p>
                </div>

                <div className="p-3 bg-muted/30 rounded-xl border border-border/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                      Matriculation Number
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(presidentData.matricNo, "Matriculation Number")}
                      className="text-muted-foreground hover:text-primary transition-colors p-0.5"
                      title="Copy matriculation number"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="font-mono font-bold text-foreground text-sm">{presidentData.matricNo}</p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {presidentData.verificationStatus}
                  </p>
                </div>

                <div className="p-3 bg-muted/30 rounded-xl border border-border/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                      Nile Institutional Email
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(presidentData.email, "University Email")}
                      className="text-muted-foreground hover:text-primary transition-colors p-0.5"
                      title="Copy email address"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="font-mono text-foreground font-semibold truncate">{presidentData.email}</p>
                  <p className="text-[11px] text-muted-foreground">Official communication channel</p>
                </div>

                <div className="p-3 bg-muted/30 rounded-xl border border-border/50 space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    Phone / SMS Contact
                  </span>
                  <p className="font-mono text-foreground font-semibold">{presidentData.phone}</p>
                  <p className="text-[11px] text-muted-foreground">Emergency officer contact</p>
                </div>
              </div>

              {/* Academic Hierarchy */}
              <div className="p-3.5 bg-muted/20 rounded-xl border border-border/50 space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  Faculty &amp; Departmental Placement
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground text-[11px]">Faculty:</span>
                    <p className="font-semibold text-foreground">{presidentData.faculty}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px]">Department:</span>
                    <p className="font-semibold text-foreground">{presidentData.department}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px]">Academic Session:</span>
                    <p className="font-semibold text-foreground font-mono">{presidentData.session}</p>
                  </div>
                </div>
              </div>

              {/* Read-Only Security Boundary Notice */}
              <div className="p-3 bg-primary/5 rounded-xl border border-primary/15 flex items-start gap-2.5 text-[11px] text-muted-foreground">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Student demographic records and matriculation credentials are authoritative and synchronized directly from the Nile University Registrar &amp; Single Sign-On service. For corrections to name spelling or department changes, contact the Nile Student Affairs ICT Helpdesk.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ASSIGNED CLUB GOVERNANCE SCOPE */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Building className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground">
                      Assigned Club &amp; Governance Mandate
                    </CardTitle>
                    <CardDescription className="text-[11px] text-muted-foreground">
                      Accredited presidential appointment &amp; supervisory scope
                    </CardDescription>
                  </div>
                </div>

                <StatusBadge variant="info" label={presidentData.assignedClub.tier} />
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-4 text-xs">
              <div className="p-4 bg-muted/30 rounded-xl border border-border/60 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-foreground">
                        {presidentData.assignedClub.name}
                      </h3>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {presidentData.assignedClub.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {presidentData.assignedClub.roleTitle} &bull; {presidentData.assignedClub.category}
                    </p>
                  </div>

                  <Link to="/clubs">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs font-bold gap-1 text-primary border-primary/30 hover:bg-primary/10"
                    >
                      <span>Manage Club Details</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Presidential Tenure</span>
                    <p className="font-semibold text-foreground">{presidentData.assignedClub.tenure}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Faculty Staff Advisor</span>
                    <p className="font-semibold text-foreground">{presidentData.assignedClub.advisorName}</p>
                    <p className="text-[10px] text-muted-foreground">{presidentData.assignedClub.advisorRole}</p>
                  </div>
                </div>
              </div>

              {/* Supported Presidential Authorities */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  Authorized Presidential Privileges &amp; Actions
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/20 border border-border/40">
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Event proposal creation &amp; budget requests</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/20 border border-border/40">
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Executive delegation &amp; task assignment</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/20 border border-border/40">
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Membership roster sign-offs &amp; reviews</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/20 border border-border/40">
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Post-event attendance &amp; closure reports</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT 1 COLUMN: PREFERENCES & SECURITY */}
        <div className="space-y-5">
          {/* THEME PREFERENCES CARD */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Sun className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">
                    Display Appearance
                  </CardTitle>
                  <CardDescription className="text-[11px] text-muted-foreground">
                    Color theme for OneClub interface
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
                    theme === "light"
                      ? "border-primary bg-primary/10 text-foreground font-bold shadow-xs"
                      : "border-border/60 bg-card text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <Sun className="h-5 w-5 text-amber-500" />
                  <span className="text-xs">Light Theme</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
                    theme === "dark"
                      ? "border-primary bg-primary/10 text-foreground font-bold shadow-xs"
                      : "border-border/60 bg-card text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <Moon className="h-5 w-5 text-indigo-400" />
                  <span className="text-xs">Dark Theme</span>
                </button>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                Preference is stored locally across browser sessions on your current device.
              </p>
            </CardContent>
          </Card>

          {/* QUICK LINKS CARD */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold text-foreground">
                Governance Shortcuts
              </CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground">
                Jump to active club management workspaces
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-3 space-y-1.5 text-xs">
              <Link
                to="/proposals"
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 text-foreground transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="font-semibold">Proposals &amp; Budgets</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                to="/members"
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 text-foreground transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-semibold">Membership Roster</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                to="/tasks"
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 text-foreground transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="h-4 w-4 text-primary" />
                  <span className="font-semibold">Executive Delegation</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                to="/archive"
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 text-foreground transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <FileCheck className="h-4 w-4 text-primary" />
                  <span className="font-semibold">Post-Event Reports</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </Link>
            </CardContent>
          </Card>

          {/* SESSION SECURITY & SIGN OUT */}
          <Card className="border-destructive/20 bg-destructive/5 shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-destructive flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4" />
                Session Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Sign out of your active Nile Campus One Single Sign-On session on this device.
              </p>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsSignOutOpen(true)}
                className="w-full text-xs font-bold gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out from OneClub</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ORIENTATION WALKTHROUGH DIALOG (SKIPPABLE, DOES NOT CLAIM A CLUB) */}
      <Dialog open={isOrientationOpen} onOpenChange={setIsOrientationOpen}>
        <DialogContent maxWidth="md">
          <div className="space-y-4 text-xs">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                  PRESIDENTIAL ORIENTATION
                </span>
                <span className="text-[11px] text-muted-foreground">OneClub Governance</span>
              </div>
              <DialogTitle className="text-foreground text-base sm:text-lg">
                President Role &amp; Governance Workflow
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Overview of your administrative mandates and institutional reporting flows at Nile University.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="p-3 bg-muted/40 rounded-xl border border-border/60 flex items-start gap-3">
                <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold font-mono shrink-0 text-xs">
                  1
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-foreground">Proposals &amp; Venue Booking</h4>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Submit event proposals at least 14 days before execution. Your Faculty Staff Advisor reviews first, followed by Student Affairs budget clearance.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-muted/40 rounded-xl border border-border/60 flex items-start gap-3">
                <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold font-mono shrink-0 text-xs">
                  2
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-foreground">Executive Delegation (Club Work)</h4>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Assign operational deliverables to your Vice President, Workshops Coordinator, or Treasurer with due dates and milestone tracking.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-muted/40 rounded-xl border border-border/60 flex items-start gap-3">
                <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold font-mono shrink-0 text-xs">
                  3
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-foreground">Membership Roster Reviews</h4>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Approve or review joining applications submitted by students. Verify departmental standing and semester participation.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-muted/40 rounded-xl border border-border/60 flex items-start gap-3">
                <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold font-mono shrink-0 text-xs">
                  4
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-foreground">Post-Event Closure Reports</h4>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Within 7 days of event completion, file attendance headcounts and expense receipts for official compliance sign-off.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2 flex justify-between items-center">
              <span className="text-[11px] text-muted-foreground">
                Assigned Club: <strong>{presidentData.assignedClub.name}</strong>
              </span>

              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setIsOrientationOpen(false);
                  handleDismissWelcome();
                }}
                className="text-xs font-bold"
              >
                Got It, Thanks!
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* SIGN OUT CONFIRMATION DIALOG */}
      <Dialog open={isSignOutOpen} onOpenChange={setIsSignOutOpen}>
        <DialogContent maxWidth="sm">
          <div className="space-y-3 text-xs">
            <DialogHeader>
              <DialogTitle className="text-destructive text-base flex items-center gap-1.5">
                <LogOut className="h-4 w-4" />
                Sign Out of Nile OneClub?
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                You will be signed out of your active presidential session for <strong>{presidentData.fullName}</strong>. You can re-authenticate anytime via Nile Single Sign-On.
              </DialogDescription>
            </DialogHeader>

            <div className="p-3 bg-muted/40 rounded-xl border border-border/60 text-muted-foreground text-[11px] leading-relaxed">
              Active token: <span className="font-mono text-foreground font-semibold">{presidentData.email}</span>
            </div>

            <DialogFooter className="pt-2 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsSignOutOpen(false)}
                className="w-1/2 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={async () => {
                  setIsSignOutOpen(false);
                  await signOut();
                }}
                className="w-1/2 text-xs font-bold"
              >
                Confirm Sign Out
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
