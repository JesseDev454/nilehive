import { useState, useMemo } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Eye,
  GraduationCap,
  Info,
  Mail,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/shared/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/Card";
import { TextField } from "@/shared/components/TextField";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/Dialog";
import { Banner } from "@/shared/components/Banner";

export type ClubRole = "President" | "Executive" | "Member" | "Staff Advisor";
export type MembershipStatus = "Active" | "Alumni" | "Honorary";

export interface ClubMemberRecord {
  id: string;
  fullName: string;
  studentId: string;
  matricNo: string;
  email: string;
  phone: string;
  department: string;
  faculty: string;
  academicLevel: string;
  joinedDate: string;
  clubRole: ClubRole;
  membershipStatus: MembershipStatus;
  eventsAttendedCount: number;
}

const MEMBERS_ROSTER: ClubMemberRecord[] = [
  {
    id: "mem-01",
    fullName: "Farouk Al-Mansoor",
    studentId: "2021/0102",
    matricNo: "NUG/ENG/21/0102",
    email: "f.almansoor@nileuniversity.edu.ng",
    phone: "+234 803 555 0192",
    department: "Computer Engineering",
    faculty: "Faculty of Engineering",
    academicLevel: "400 Level",
    joinedDate: "Sept 2022",
    clubRole: "President",
    membershipStatus: "Active",
    eventsAttendedCount: 14
  },
  {
    id: "mem-02",
    fullName: "Zainab Mukhtar",
    studentId: "2021/0890",
    matricNo: "NUG/SCI/21/0890",
    email: "z.mukhtar@nileuniversity.edu.ng",
    phone: "+234 802 771 3340",
    department: "Computer Science",
    faculty: "Faculty of Natural & Applied Sciences",
    academicLevel: "400 Level",
    joinedDate: "Sept 2023",
    clubRole: "Executive",
    membershipStatus: "Active",
    eventsAttendedCount: 12
  },
  {
    id: "mem-03",
    fullName: "Tariq Ibrahim",
    studentId: "2022/0112",
    matricNo: "NUG/ENG/22/0112",
    email: "tariq.ibrahim@nileuniversity.edu.ng",
    phone: "+234 805 221 9901",
    department: "Software Engineering",
    faculty: "Faculty of Engineering",
    academicLevel: "300 Level",
    joinedDate: "Nov 2023",
    clubRole: "Executive",
    membershipStatus: "Active",
    eventsAttendedCount: 9
  },
  {
    id: "mem-04",
    fullName: "Oluwaseun Adeleke",
    studentId: "2021/0309",
    matricNo: "NUG/FMS/21/0309",
    email: "o.adeleke@nileuniversity.edu.ng",
    phone: "+234 806 882 1190",
    department: "Business Administration",
    faculty: "Faculty of Management Sciences",
    academicLevel: "400 Level",
    joinedDate: "Feb 2024",
    clubRole: "Executive",
    membershipStatus: "Active",
    eventsAttendedCount: 11
  },
  {
    id: "mem-05",
    fullName: "Amina Bello",
    studentId: "2021/0458",
    matricNo: "NUG/ENG/21/0458",
    email: "amina.bello@nileuniversity.edu.ng",
    phone: "+234 803 123 4567",
    department: "Computer Engineering",
    faculty: "Faculty of Engineering",
    academicLevel: "400 Level",
    joinedDate: "Oct 2024",
    clubRole: "Member",
    membershipStatus: "Active",
    eventsAttendedCount: 6
  },
  {
    id: "mem-06",
    fullName: "Chidubem Okafor",
    studentId: "2023/0541",
    matricNo: "NUG/ENG/23/0541",
    email: "c.okafor@nileuniversity.edu.ng",
    phone: "+234 810 443 1129",
    department: "Electrical Engineering",
    faculty: "Faculty of Engineering",
    academicLevel: "200 Level",
    joinedDate: "Oct 2024",
    clubRole: "Member",
    membershipStatus: "Active",
    eventsAttendedCount: 4
  },
  {
    id: "mem-07",
    fullName: "Fatima Aliyu",
    studentId: "2022/0774",
    matricNo: "NUG/SCI/22/0774",
    email: "f.aliyu@nileuniversity.edu.ng",
    phone: "+234 809 334 5512",
    department: "Information Technology",
    faculty: "Faculty of Natural & Applied Sciences",
    academicLevel: "300 Level",
    joinedDate: "Jan 2024",
    clubRole: "Member",
    membershipStatus: "Active",
    eventsAttendedCount: 7
  },
  {
    id: "mem-08",
    fullName: "Usman Danladi",
    studentId: "2023/0119",
    matricNo: "NUG/ENG/23/0119",
    email: "u.danladi@nileuniversity.edu.ng",
    phone: "+234 813 902 4410",
    department: "Software Engineering",
    faculty: "Faculty of Engineering",
    academicLevel: "200 Level",
    joinedDate: "Mar 2024",
    clubRole: "Member",
    membershipStatus: "Active",
    eventsAttendedCount: 3
  },
  {
    id: "mem-09",
    fullName: "Khadija Garba",
    studentId: "2022/0904",
    matricNo: "NUG/SCI/22/0904",
    email: "k.garba@nileuniversity.edu.ng",
    phone: "+234 807 114 8832",
    department: "Computer Science",
    faculty: "Faculty of Natural & Applied Sciences",
    academicLevel: "300 Level",
    joinedDate: "Nov 2023",
    clubRole: "Member",
    membershipStatus: "Active",
    eventsAttendedCount: 5
  },
  {
    id: "mem-10",
    fullName: "Dr. Aminu Galadima",
    studentId: "STAFF/088",
    matricNo: "STAFF/ENG/088",
    email: "a.galadima@nileuniversity.edu.ng",
    phone: "+234 803 700 8821",
    department: "Computer Engineering",
    faculty: "Faculty of Engineering",
    academicLevel: "Faculty Advisor",
    joinedDate: "Sept 2021",
    clubRole: "Staff Advisor",
    membershipStatus: "Honorary",
    eventsAttendedCount: 18
  },
  {
    id: "mem-11",
    fullName: "Ibrahim Shehu",
    studentId: "2019/0201",
    matricNo: "NUG/ENG/19/0201",
    email: "i.shehu@alumni.nileuniversity.edu.ng",
    phone: "+234 802 334 1122",
    department: "Software Engineering",
    faculty: "Faculty of Engineering",
    academicLevel: "Alumni (Class of 2023)",
    joinedDate: "Oct 2020",
    clubRole: "Member",
    membershipStatus: "Alumni",
    eventsAttendedCount: 22
  }
];

export function PresidentMembersWorkspace() {
  const { profile } = useAuth();
  const clubName = profile?.club_name || "Nile Google Developers";
  const clubCode = "NGD";

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "Executive" | "Member" | "Staff Advisor" | "Alumni">("all");
  const [selectedMember, setSelectedMember] = useState<ClubMemberRecord | null>(null);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return MEMBERS_ROSTER.filter((member) => {
      const matchesSearch =
        member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.matricNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.department.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (roleFilter === "Executive") {
        return member.clubRole === "Executive" || member.clubRole === "President";
      }
      if (roleFilter === "Member") {
        return member.clubRole === "Member" && member.membershipStatus === "Active";
      }
      if (roleFilter === "Staff Advisor") {
        return member.clubRole === "Staff Advisor";
      }
      if (roleFilter === "Alumni") {
        return member.membershipStatus === "Alumni";
      }

      return true;
    });
  }, [searchQuery, roleFilter]);

  const activeCount = MEMBERS_ROSTER.filter((m) => m.membershipStatus === "Active").length;
  const execCount = MEMBERS_ROSTER.filter((m) => m.clubRole === "Executive" || m.clubRole === "President").length;

  return (
    <main className="space-y-6 max-w-6xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in" aria-labelledby="members-heading">
      {/* Header & Visual Cue */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              id="president-members-indicator"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-primary uppercase"
            >
              PRESIDENT/MEMBERS
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Directory &bull; {clubCode}
            </span>
          </div>
          <h1 id="members-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {clubName} Member Directory
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Verified, read-only membership directory for your assigned club. Inspect member contacts, academic departments, and verified standing.
          </p>
        </div>

        {/* Read-Only Scope Indicator Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-muted/40 border border-border/80 px-3 py-1.5 rounded-xl text-xs text-muted-foreground font-semibold">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>Read-Only Directory</span>
        </div>
      </header>

      {/* ROSTER STATS BANNER */}
      <section aria-labelledby="stats-heading" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border/80 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Enrolled</span>
          <div className="text-xl font-bold font-mono text-foreground">{MEMBERS_ROSTER.length}</div>
          <span className="text-[10px] text-muted-foreground">Verified Students &amp; Advisor</span>
        </Card>

        <Card className="p-3.5 border-border/80 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Members</span>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{activeCount}</div>
          <span className="text-[10px] text-muted-foreground">Current semester standing</span>
        </Card>

        <Card className="p-3.5 border-border/80 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Executive Board</span>
          <div className="text-xl font-bold font-mono text-primary">{execCount}</div>
          <span className="text-[10px] text-muted-foreground">Officers &amp; Leads</span>
        </Card>

        <Card className="p-3.5 border-border/80 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Staff Advisor</span>
          <div className="text-xl font-bold font-mono text-foreground">1</div>
          <span className="text-[10px] text-muted-foreground">Dr. Aminu Galadima</span>
        </Card>
      </section>

      {/* SEARCH AND ROLE FILTER BAR */}
      <section aria-labelledby="filter-heading" className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-80">
          <TextField
            id="member-search"
            placeholder="Search by name, student ID, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startAdornment={<Search className="h-4 w-4 text-muted-foreground" />}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Members" },
            { id: "Executive", label: "Executive Board" },
            { id: "Member", label: "General Members" },
            { id: "Staff Advisor", label: "Staff Advisor" },
            { id: "Alumni", label: "Alumni" }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setRoleFilter(tab.id as typeof roleFilter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
                roleFilter === tab.id
                  ? "border-primary bg-primary/10 text-primary shadow-xs font-bold"
                  : "border-border/80 bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* MEMBER DIRECTORY CARDS GRID */}
      <section aria-labelledby="directory-list-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="directory-list-heading" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Members Directory ({filteredMembers.length})
          </h2>
          <span className="text-[11px] text-muted-foreground font-mono">
            {clubName}
          </span>
        </div>

        {filteredMembers.length === 0 ? (
          <Card className="border-dashed border-border/80 p-8 text-center space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mx-auto">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-foreground">No members found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No club members match your search criteria. Try a different query or clear your filter.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredMembers.map((member) => {
              return (
                <Card
                  key={member.id}
                  hoverable
                  onClick={() => setSelectedMember(member)}
                  className="p-4 border-border/80 hover:border-primary/50 cursor-pointer transition-all duration-180 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-foreground">
                          {member.fullName}
                        </h3>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          {member.studentId}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <StatusBadge
                          status={
                            member.clubRole === "President"
                              ? "default"
                              : member.clubRole === "Executive"
                              ? "info"
                              : member.clubRole === "Staff Advisor"
                              ? "warning"
                              : "success"
                          }
                          label={member.clubRole}
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-muted-foreground pt-1 border-t border-border/60">
                      <p className="truncate">
                        <strong>Dept:</strong> {member.department}
                      </p>
                      <p className="truncate">
                        <strong>Level:</strong> {member.academicLevel}
                      </p>
                      <p className="truncate font-mono text-[11px]">
                        <strong>Email:</strong> {member.email}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">
                      Events attended: <strong>{member.eventsAttendedCount}</strong>
                    </span>

                    <span className="text-primary font-semibold flex items-center gap-0.5">
                      <span>Inspect</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* MEMBER DETAILS READ-ONLY INSPECTION DIALOG */}
      <Dialog open={Boolean(selectedMember)} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <DialogContent maxWidth="md">
          {selectedMember && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-muted-foreground">
                    {selectedMember.matricNo}
                  </span>
                  <StatusBadge
                    status={
                      selectedMember.membershipStatus === "Active"
                        ? "success"
                        : selectedMember.membershipStatus === "Alumni"
                        ? "default"
                        : "warning"
                    }
                    label={selectedMember.membershipStatus}
                  />
                </div>
                <DialogTitle className="text-foreground text-lg">
                  {selectedMember.fullName}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {selectedMember.clubRole} &bull; {clubName}
                </DialogDescription>
              </DialogHeader>

              {/* DETAILS GRID */}
              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 bg-muted/40 rounded-xl border border-border/60 space-y-2">
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">Student ID:</span>
                    <span className="font-mono font-semibold text-foreground">{selectedMember.studentId}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">Matriculation No:</span>
                    <span className="font-mono font-semibold text-foreground">{selectedMember.matricNo}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">Faculty:</span>
                    <span className="font-semibold text-foreground">{selectedMember.faculty}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">Department:</span>
                    <span className="font-semibold text-foreground">{selectedMember.department}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">Academic Standing:</span>
                    <span className="font-semibold text-foreground">{selectedMember.academicLevel}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">Enrolled Since:</span>
                    <span className="font-semibold text-foreground">{selectedMember.joinedDate}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Campus Events Attended:</span>
                    <span className="font-bold text-primary font-mono">{selectedMember.eventsAttendedCount} Events</span>
                  </div>
                </div>

                {/* CONTACT DETAILS */}
                <div className="p-3 rounded-xl bg-card border border-border/80 space-y-1.5">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="font-mono">{selectedMember.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="font-mono">{selectedMember.phone}</span>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedMember(null)}
                  className="w-full text-xs"
                >
                  Close Inspection
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
