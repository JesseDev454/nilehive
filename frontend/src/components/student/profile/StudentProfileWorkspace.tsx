import { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  LogOut,
  Mail,
  Moon,
  Phone,
  School,
  ShieldCheck,
  Sparkles,
  Sun,
  User,
  UserCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/shared/theme";
import { Button } from "@/shared/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/Card";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/Dialog";
import { OFFICIAL_CLUBS } from "@/shared/mock/clubs";

export function StudentProfileWorkspace() {
  const { profile, user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);

  // Nile University Verified Student Profile
  const studentInfo = {
    fullName: profile?.full_name || "Amina Bello",
    studentId: profile?.student_id || "2021/0458",
    matricNo: "NUG/ENG/21/0458",
    email: user?.email || "a.bello@nileuniversity.edu.ng",
    phone: profile?.phone_number || "+234 803 123 4567",
    faculty: "Faculty of Engineering",
    department: profile?.department || "Computer Engineering",
    level: "400 Level (Final Year)",
    session: "2025/2026 Academic Session",
    status: "Active & In Good Standing",
    enrolledClubs: [
      {
        id: "ngd",
        name: "Nile Google Developers",
        code: "NGD",
        role: "Ordinary Member",
        joinedDate: "October 2024",
        duesStatus: "paid" as const,
      },
      {
        id: "nbc",
        name: "Nile Book Club",
        code: "NBC",
        role: "Ordinary Member",
        joinedDate: "November 2024",
        duesStatus: "paid" as const,
      }
    ]
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              Campus One Verified
            </span>
            <StatusBadge variant="success" dot label={studentInfo.status} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl mt-1.5">
            Student Profile
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Read-only institutional record linked to Nile University Single Sign-On.
          </p>
        </div>

        {/* Theme Toggle & Sign out */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="gap-2"
          >
            {theme === "dark" ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-slate-700" />}
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSignOutDialogOpen(true)}
            className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>

      {/* Identity Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-lg">
              {studentInfo.fullName.split(" ").map(n => n[0]).join("")}
            </div>
            <div>
              <CardTitle className="text-lg">{studentInfo.fullName}</CardTitle>
              <CardDescription>
                Matriculation: {studentInfo.matricNo} &bull; ID: {studentInfo.studentId}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2 border-t border-border/60">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Department
              </span>
              <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                {studentInfo.department}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Faculty
              </span>
              <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <School className="h-4 w-4 text-primary shrink-0" />
                {studentInfo.faculty}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Academic Level
              </span>
              <p className="text-sm font-medium text-foreground">
                {studentInfo.level}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                University Email
              </span>
              <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                {studentInfo.email}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Phone Number
              </span>
              <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                {studentInfo.phone}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Academic Session
              </span>
              <p className="text-sm font-medium text-foreground">
                {studentInfo.session}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrolled Clubs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Enrolled Club Memberships
              </CardTitle>
              <CardDescription>
                Official university clubs where you have active ordinary membership.
              </CardDescription>
            </div>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
              {studentInfo.enrolledClubs.length} Active
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border/60">
            {studentInfo.enrolledClubs.map((club) => (
              <div key={club.id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">{club.name}</span>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                      {club.code}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {club.role} &bull; Member since {club.joinedDate}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge variant="success" label="Membership Active" />
                  <StatusBadge variant="default" label="Dues Paid" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Institutional Read-Only Notice */}
      <div className="rounded-2xl border border-border bg-card/60 p-4 text-xs text-muted-foreground flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-foreground">
            Official Nile University Student Record
          </p>
          <p className="leading-relaxed">
            Personal identity, student matriculation numbers, and department details are centrally managed by Nile University Academic Records and Campus One SSO. To report any discrepancies, please visit the Student Affairs Office in Building A.
          </p>
        </div>
      </div>

      {/* Sign Out Confirmation Dialog */}
      <Dialog open={signOutDialogOpen} onOpenChange={setSignOutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign Out of OneClub</DialogTitle>
            <DialogDescription>
              Are you sure you want to end your current OneClub student session?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSignOutDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setSignOutDialogOpen(false);
                signOut();
              }}
            >
              Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
