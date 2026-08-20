import { useState, useMemo } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Eye,
  Filter,
  GraduationCap,
  Info,
  Layers,
  RotateCcw,
  Search,
  ShieldCheck,
  User,
  Users,
  X
} from "lucide-react";
import { Card, CardContent } from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";
import { StatusBadge } from "@/shared/components/StatusBadge";

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
  },
  {
    id: "mem-11",
    name: "Bello Musa",
    matricNumber: "2021/0912",
    department: "Information Technology",
    level: "400L",
    status: "Active",
    joinDate: "Oct 2022",
    attendanceRate: "80%"
  },
  {
    id: "mem-12",
    name: "Maryam Danjuma",
    matricNumber: "2023/0411",
    department: "Computer Science",
    level: "200L",
    status: "Active",
    joinDate: "Jan 2024",
    attendanceRate: "91%"
  }
];

interface ClubMemberDirectorySectionProps {
  onSelectMember: (member: ClubMember) => void;
  isLoading?: boolean;
}

export function ClubMemberDirectorySection({
  onSelectMember,
  isLoading = false
}: ClubMemberDirectorySectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("All");

  const filteredMembers = useMemo(() => {
    return OFFICIAL_CLUB_MEMBERS.filter((m) => {
      const matchesLevel = selectedLevelFilter === "All" ? true : m.level === selectedLevelFilter;
      const matchesStatus = selectedStatusFilter === "All" ? true : m.status === selectedStatusFilter;
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.matricNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.department.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesLevel && matchesStatus && matchesSearch;
    });
  }, [searchQuery, selectedLevelFilter, selectedStatusFilter]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedLevelFilter("All");
    setSelectedStatusFilter("All");
  };

  return (
    <section id="member-directory-section" aria-labelledby="member-directory-heading" className="space-y-4 animate-fade-in">
      {/* Controls Bar: Search & Level / Status Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card p-3.5 rounded-2xl border border-border/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground font-semibold">
            <Filter className="h-3.5 w-3.5 text-primary" />
            <span>Level:</span>
          </div>
          {["All", "100L", "200L", "300L", "400L"].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setSelectedLevelFilter(lvl)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                selectedLevelFilter === lvl
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground border-border/60 hover:bg-muted"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative md:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search name, matric no, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border border-border/80 bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-hidden placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="h-14 rounded-xl border border-border/60 bg-muted/20 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty Search State */}
      {!isLoading && filteredMembers.length === 0 && (
        <Card className="border-border/80 bg-card p-8 text-center space-y-3 shadow-xs">
          <div className="h-10 w-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
            <Search className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-foreground">No Members Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            No registered student matched "{searchQuery}" with the selected level filters.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={handleResetFilters}
            className="text-xs font-semibold gap-1.5 mx-auto"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Search Filters</span>
          </Button>
        </Card>
      )}

      {/* Members Directory Table */}
      {!isLoading && filteredMembers.length > 0 && (
        <Card className="border-border/80 bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Matriculation No</th>
                  <th className="py-3 px-4">Department &amp; Level</th>
                  <th className="py-3 px-4">Join Date</th>
                  <th className="py-3 px-4">Attendance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-foreground">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 font-bold">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-mono font-bold text-xs shrink-0 border border-primary/20">
                          {member.name.charAt(0)}
                        </div>
                        <span className="truncate max-w-[160px] sm:max-w-none">{member.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-muted-foreground text-[11px]">
                      {member.matricNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground">{member.department}</div>
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
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onSelectMember(member)}
                        className="text-xs font-semibold text-primary hover:text-primary/80 hover:bg-primary/10 h-7.5 px-2 gap-1"
                        aria-label={`View profile of ${member.name}`}
                      >
                        <Eye className="h-3 w-3" />
                        <span>View</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-muted/20 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-muted-foreground">
            <span>Showing <strong>{filteredMembers.length}</strong> of <strong>148</strong> accredited student members</span>
            <span className="italic">Read-only institutional directory</span>
          </div>
        </Card>
      )}
    </section>
  );
}
