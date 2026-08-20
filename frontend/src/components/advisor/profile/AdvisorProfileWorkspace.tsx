import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  School,
  Mail,
  Hash,
  Calendar,
  Building2,
  Lock,
  LogOut,
  Clock,
  FileText,
  Bell,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Award,
  BookOpen,
  Info
} from "lucide-react";
import { AdvisorRoleHeader } from "../header/AdvisorRoleHeader";
import { AdvisorSignOutDialog } from "../more/AdvisorSignOutDialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/shared/components/Button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const ADVISOR_PROFILE_DATA = {
  name: "Dr. Kalu Okonkwo",
  title: "Associate Professor & Faculty Advisor",
  staffId: "STAFF/7721",
  department: "Department of Computer Science & Engineering",
  faculty: "Faculty of Natural & Applied Sciences",
  email: "kalu.okonkwo@nileuniversity.edu.ng",
  phone: "+234 803 123 4567",
  office: "Block B, Room 204 (Faculty Wing)",
  appointmentDate: "October 14, 2024",
  status: "Verified Staff Advisor",
  ssoProvider: "Nile University Campus One SSO (Azure AD)",
  assignedClubs: [
    {
      id: "club-8",
      code: "NGD",
      name: "Nile Google Developers",
      term: "2024–Present",
      category: "Technology & Software",
      president: "Ibrahim Sani",
      status: "Active Chapter"
    },
    {
      id: "club-4",
      code: "NCIC",
      name: "Nile Climate Initiatives Club",
      term: "2025–Present",
      category: "Environment & Community",
      president: "Fatima Garba",
      status: "Active Chapter"
    },
    {
      id: "club-11",
      code: "NSC",
      name: "Nile Startup Campus",
      term: "2026–Present",
      category: "Entrepreneurship & Business",
      president: "Zainab Aliyu",
      status: "Active Chapter"
    }
  ]
};

export function AdvisorProfileWorkspace() {
  const { signOut } = useAuth();
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);

  const handleConfirmSignOut = () => {
    setIsSignOutOpen(false);
    toast.info("Signing out of Campus One...");
    signOut();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in">
      {/* Advisor Role Header */}
      <AdvisorRoleHeader
        title="Staff Advisor Profile"
        subtitle="Institutional credentials, Single Sign-On faculty authentication, appointed student chapters portfolio, and advisory governance charter."
        pendingCount={2}
        assignedClubs={ADVISOR_PROFILE_DATA.assignedClubs}
      />

      {/* Main Credentials Banner Card */}
      <Card className="overflow-hidden border border-border/80 bg-card shadow-xs">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-bold text-2xl sm:text-3xl flex items-center justify-center font-display shrink-0">
                KO
              </div>
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground font-display">
                    {ADVISOR_PROFILE_DATA.name}
                  </h1>
                  <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                    <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                    {ADVISOR_PROFILE_DATA.status}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-muted-foreground">{ADVISOR_PROFILE_DATA.title}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    {ADVISOR_PROFILE_DATA.department}
                  </span>
                  <span>&bull;</span>
                  <span>{ADVISOR_PROFILE_DATA.faculty}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap md:flex-col items-center md:items-end gap-2 shrink-0">
              <Badge variant="outline" className="text-xs font-mono py-1 px-2.5">
                Staff ID: {ADVISOR_PROFILE_DATA.staffId}
              </Badge>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsSignOutOpen(true)}
                className="text-xs text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <LogOut className="h-3.5 w-3.5 mr-1.5" />
                Sign Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid: Institutional Identity & Advisory Charter */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Institutional Identity */}
        <Card className="border border-border/80 bg-card">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" />
              Institutional Identity & Authentication
            </CardTitle>
            <CardDescription className="text-xs">
              Verified SSO faculty credentials sourced from University Registry.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-0.5">
                <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1 font-semibold">
                  <Hash className="h-3 w-3 text-primary" /> Staff Number
                </span>
                <p className="font-mono font-bold text-foreground">{ADVISOR_PROFILE_DATA.staffId}</p>
              </div>

              <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-0.5">
                <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1 font-semibold">
                  <Calendar className="h-3 w-3 text-primary" /> Appointed Date
                </span>
                <p className="font-medium text-foreground">{ADVISOR_PROFILE_DATA.appointmentDate}</p>
              </div>

              <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-0.5 sm:col-span-2">
                <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1 font-semibold">
                  <Mail className="h-3 w-3 text-primary" /> Official University Email
                </span>
                <p className="font-mono text-foreground">{ADVISOR_PROFILE_DATA.email}</p>
              </div>

              <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-0.5">
                <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1 font-semibold">
                  <Building2 className="h-3 w-3 text-primary" /> Faculty Office
                </span>
                <p className="font-medium text-foreground">{ADVISOR_PROFILE_DATA.office}</p>
              </div>

              <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-0.5">
                <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1 font-semibold">
                  <ShieldCheck className="h-3 w-3 text-primary" /> SSO Provider
                </span>
                <p className="font-medium text-foreground truncate">Azure AD / Campus One</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advisory Quick Shortcuts & Actions */}
        <Card className="border border-border/80 bg-card">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Active Advisory Responsibilities
            </CardTitle>
            <CardDescription className="text-xs">
              Quick links to review workflows and post-event records.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-2.5">
            <Link
              to="/advisor/reviews"
              className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card hover:bg-muted/40 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-xs text-foreground">Review Proposal Queue</p>
                  <p className="text-[11px] text-muted-foreground">2 proposals waiting for review</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
            </Link>

            <Link
              to="/advisor/clubs"
              className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card hover:bg-muted/40 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <School className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-xs text-foreground">Assigned Student Chapters</p>
                  <p className="text-[11px] text-muted-foreground">3 student organizations in portfolio</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
            </Link>

            <Link
              to="/advisor/reports"
              className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card hover:bg-muted/40 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-xs text-foreground">Post-Event Reports & Audits</p>
                  <p className="text-[11px] text-muted-foreground">Read-only event summaries</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
            </Link>

            <Link
              to="/advisor/notifications"
              className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card hover:bg-muted/40 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-xs text-foreground">Notification Feed</p>
                  <p className="text-[11px] text-muted-foreground">Admin decisions and submissions</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Appointed Chapters Portfolio Detail */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <School className="h-4 w-4 text-primary" />
            Appointed Student Organizations Portfolio ({ADVISOR_PROFILE_DATA.assignedClubs.length})
          </h2>
          <Button asChild variant="ghost" size="sm" className="text-xs text-primary font-medium p-0 h-auto">
            <Link to="/advisor/clubs">View assigned club details &rarr;</Link>
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {ADVISOR_PROFILE_DATA.assignedClubs.map((club) => (
            <Card key={club.id} className="border border-border/80 bg-card">
              <CardContent className="p-4 space-y-3 text-left">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className="text-xs font-bold bg-primary/5 text-primary border-primary/20">
                    {club.code}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-mono">{club.term}</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground leading-snug">{club.name}</h3>
                  <p className="text-[11px] text-muted-foreground">{club.category}</p>
                </div>
                <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between">
                  <span>President: <strong className="text-foreground">{club.president}</strong></span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">&bull; Active</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Policy and Boundaries Remit */}
      <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 space-y-2 text-xs text-left">
        <div className="flex items-center gap-2 font-bold text-primary">
          <Lock className="h-4 w-4" />
          <span>Institutional Advisor Governance Charter</span>
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Staff Advisors guide assigned clubs and inspect proposal details without editing them. Advisors may <strong>Approve</strong> to send a proposal to Admin, or <strong>Return for changes</strong> with mandatory remarks.
        </p>
      </div>

      {/* Sign Out Confirmation Dialog */}
      <AdvisorSignOutDialog
        isOpen={isSignOutOpen}
        onOpenChange={setIsSignOutOpen}
        onConfirm={handleConfirmSignOut}
      />
    </div>
  );
}
