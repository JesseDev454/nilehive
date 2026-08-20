import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Award,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  GraduationCap,
  HelpCircle,
  Info,
  Layers,
  Mail,
  MapPin,
  School,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  User,
  Users,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/shared/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/Card";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { TextField } from "@/shared/components/TextField";

export interface ClubMember {
  id: string;
  name: string;
  matricNumber: string;
  department: string;
  level: string;
  status: "Active" | "Probationary" | "Alumni";
  joinDate: string;
  attendanceRate: string;
}

export const OFFICIAL_CLUB_MEMBERS: ClubMember[] = [
  {
    id: "mem-01",
    name: "Tariq Ibrahim",
    matricNumber: "2020/0188",
    department: "Software Engineering",
    level: "400L",
    status: "Active",
    joinDate: "Oct 2021",
    attendanceRate: "95%"
  },
  {
    id: "mem-02",
    name: "Zainab Mukhtar",
    matricNumber: "2021/0492",
    department: "Computer Science",
    level: "400L",
    status: "Active",
    joinDate: "Oct 2021",
    attendanceRate: "92%"
  },
  {
    id: "mem-03",
    name: "Fatima Al-Hassan",
    matricNumber: "2021/0312",
    department: "Computer Science",
    level: "300L",
    status: "Active",
    joinDate: "Nov 2022",
    attendanceRate: "88%"
  },
  {
    id: "mem-04",
    name: "Oluwaseun Adeleke",
    matricNumber: "2020/0551",
    department: "Business Administration",
    level: "400L",
    status: "Active",
    joinDate: "Feb 2022",
    attendanceRate: "85%"
  },
  {
    id: "mem-05",
    name: "Emeka Obi",
    matricNumber: "2022/0114",
    department: "Electrical Engineering",
    level: "300L",
    status: "Active",
    joinDate: "Mar 2023",
    attendanceRate: "90%"
  },
  {
    id: "mem-06",
    name: "Amina Lawal",
    matricNumber: "2022/0839",
    department: "Cyber Security",
    level: "300L",
    status: "Active",
    joinDate: "Mar 2023",
    attendanceRate: "78%"
  },
  {
    id: "mem-07",
    name: "Khadija Usman",
    matricNumber: "2023/0204",
    department: "Software Engineering",
    level: "200L",
    status: "Active",
    joinDate: "Oct 2023",
    attendanceRate: "94%"
  },
  {
    id: "mem-08",
    name: "Ibrahim Shehu",
    matricNumber: "2023/0771",
    department: "Information Technology",
    level: "200L",
    status: "Active",
    joinDate: "Nov 2023",
    attendanceRate: "82%"
  },
  {
    id: "mem-09",
    name: "Chukwudi Nwosu",
    matricNumber: "2024/0019",
    department: "Computer Engineering",
    level: "100L",
    status: "Active",
    joinDate: "Feb 2024",
    attendanceRate: "100%"
  },
  {
    id: "mem-10",
    name: "Halima Sadiq",
    matricNumber: "2024/0442",
    department: "Software Engineering",
    level: "100L",
    status: "Active",
    joinDate: "Feb 2024",
    attendanceRate: "88%"
  }
];

export function ExecutiveClubWorkspace() {
  const { profile } = useAuth();
  const executiveName = profile?.full_name || "Fatima Al-Hassan";
  const clubName = profile?.club_name || "Nile Google Developers";
  const clubCode = "NGD";

  const [activeTab, setActiveTab] = useState<"overview" | "members" | "leadership">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>("All");

  const filteredMembers = useMemo(() => {
    return OFFICIAL_CLUB_MEMBERS.filter((m) => {
      const matchesLevel = selectedLevelFilter === "All" ? true : m.level === selectedLevelFilter;
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.matricNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.department.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesLevel && matchesSearch;
    });
  }, [searchQuery, selectedLevelFilter]);

  return (
    <main
      className="space-y-6 max-w-5xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in"
      aria-labelledby="executive-club-heading"
    >
      {/* HEADER & ROLE BADGE */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              id="executive-club-indicator"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-primary uppercase"
            >
              EXECUTIVE/CLUB DETAILS
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
              Tier 1 Accredited Society
            </span>
          </div>

          <h1
            id="executive-club-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight text-foreground"
          >
            {clubName} ({clubCode})
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Official club governance details, meeting schedules, leadership contacts, and read-only member directory.
          </p>
        </div>

        {/* Quick Link to My Work */}
        <Link to="/tasks">
          <Button size="sm" variant="outline" className="text-xs font-bold gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            <span>Assigned Club Actions</span>
          </Button>
        </Link>
      </header>

      {/* READ-ONLY BOUNDARY ADVISORY */}
      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 text-xs space-y-1">
        <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <span>Executive Member Directory Governance Note</span>
        </div>
        <p className="text-muted-foreground leading-relaxed text-[11px]">
          Member profiles and attendance records are provided in read-only format. Membership intake decisions, dues collections, and executive appointments are managed by the Club President, Faculty Advisor, and Student Affairs.
        </p>
      </div>

      {/* VIEW SELECTION TABS */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "overview"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          Club Overview &amp; Profile
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("members")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "members"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          Member Roster (148 Read-Only)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("leadership")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "leadership"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          Executive Committee
        </button>
      </div>

      {/* TAB CONTENT 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-5 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Primary Details Card */}
            <Card className="md:col-span-2 border-border/80 shadow-xs">
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <School className="h-4 w-4 text-primary" />
                  Society Profile &amp; Mission
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-xs">
                <div className="space-y-1.5">
                  <span className="font-bold text-foreground text-xs">Mission Statement</span>
                  <p className="text-muted-foreground leading-relaxed">
                    Nile Google Developers (NGD) is dedicated to fostering hands-on technical skills in modern software engineering, Google Cloud technologies, mobile development, machine learning, and developer open-source leadership across the Nile University campus.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/50">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase">Category</span>
                    <p className="font-bold text-foreground">Technology &amp; Innovation</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase">Faculty Affiliation</span>
                    <p className="font-bold text-foreground">Faculty of Natural &amp; Applied Sciences</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase">Weekly Meeting Schedule</span>
                    <p className="font-bold text-foreground">Every Tuesday, 4:00 PM – 5:30 PM</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase">Official Meeting Venue</span>
                    <p className="font-bold text-foreground">Innovation Complex, Lab 2</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Governance & Status Sidebar */}
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  Accreditation
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200">
                  <div className="font-bold">Active Accredited Standing</div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                    Renewed for 2025/2026 Academic Session by Student Affairs.
                  </div>
                </div>

                <div className="space-y-2 pt-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Club Code:</span>
                    <span className="font-mono font-bold text-foreground">NGD</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Total Members:</span>
                    <span className="font-bold text-foreground">148 Registered</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Accreditation Tier:</span>
                    <span className="font-bold text-foreground">Tier 1 Elite</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Dues Status:</span>
                    <span className="font-bold text-foreground">Active (Finance Led)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: READ-ONLY MEMBERS ROSTER */}
      {activeTab === "members" && (
        <div className="space-y-4 animate-fade-in">
          {/* Controls: Search & Level Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground font-semibold">Filter Level:</span>
              {["All", "100L", "200L", "300L", "400L"].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevelFilter(lvl)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors ${
                    selectedLevelFilter === lvl
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/40 text-muted-foreground hover:text-foreground border-border/60"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <div className="relative sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search member name or matric..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-border/80 bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-hidden"
              />
            </div>
          </div>

          {/* Members Table */}
          <Card className="border-border/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground font-semibold">
                    <th className="py-3 px-4">Member Name</th>
                    <th className="py-3 px-4">Matric No</th>
                    <th className="py-3 px-4">Department &amp; Level</th>
                    <th className="py-3 px-4">Join Date</th>
                    <th className="py-3 px-4">Attendance</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-foreground">
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-bold flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-mono font-bold text-xs shrink-0">
                          {member.name.charAt(0)}
                        </div>
                        <span>{member.name}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-muted-foreground text-[11px]">
                        {member.matricNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div>{member.department}</div>
                        <div className="text-[10px] text-muted-foreground">{member.level}</div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-[11px]">
                        {member.joinDate}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {member.attendanceRate}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                          {member.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB CONTENT 3: EXECUTIVE COMMITTEE */}
      {activeTab === "leadership" && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* President */}
            <Card className="border-border/80 shadow-xs">
              <CardContent className="p-4 space-y-2 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-primary font-mono">President</span>
                    <h3 className="font-bold text-sm text-foreground">Tariq Ibrahim</h3>
                    <p className="text-muted-foreground text-[11px]">Software Engineering &bull; 400L</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    TI
                  </div>
                </div>
                <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                  <span>tariq.ibrahim@nileuniversity.edu.ng</span>
                </div>
              </CardContent>
            </Card>

            {/* Vice President */}
            <Card className="border-border/80 shadow-xs">
              <CardContent className="p-4 space-y-2 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-primary font-mono">Vice President &amp; Tech Lead</span>
                    <h3 className="font-bold text-sm text-foreground">Zainab Mukhtar</h3>
                    <p className="text-muted-foreground text-[11px]">Computer Science &bull; 400L</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    ZM
                  </div>
                </div>
                <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                  <span>zainab.mukhtar@nileuniversity.edu.ng</span>
                </div>
              </CardContent>
            </Card>

            {/* Workshops Coordinator (Current User) */}
            <Card className="border-primary/40 bg-primary/5 shadow-xs">
              <CardContent className="p-4 space-y-2 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-primary font-mono">Workshops Coordinator (You)</span>
                    <h3 className="font-bold text-sm text-foreground">Fatima Al-Hassan</h3>
                    <p className="text-muted-foreground text-[11px]">Computer Science &bull; 300L</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    FA
                  </div>
                </div>
                <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                  <span>fatima.alhassan@nileuniversity.edu.ng</span>
                </div>
              </CardContent>
            </Card>

            {/* Logistics Officer */}
            <Card className="border-border/80 shadow-xs">
              <CardContent className="p-4 space-y-2 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-primary font-mono">Logistics &amp; Treasury Officer</span>
                    <h3 className="font-bold text-sm text-foreground">Oluwaseun Adeleke</h3>
                    <p className="text-muted-foreground text-[11px]">Business Administration &bull; 400L</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    OA
                  </div>
                </div>
                <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                  <span>oluwaseun.adeleke@nileuniversity.edu.ng</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </main>
  );
}
