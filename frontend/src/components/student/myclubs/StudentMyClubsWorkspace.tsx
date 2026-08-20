import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  CreditCard,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Filter,
  GraduationCap,
  HelpCircle,
  Info,
  MapPin,
  Megaphone,
  Plus,
  RefreshCw,
  School,
  Search,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
  Users,
  X,
  XCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/shared/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/Card";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/Dialog";
import { Banner } from "@/shared/components/Banner";

export interface MemberClub {
  id: string;
  code: string;
  name: string;
  category: string;
  joinedDate: string;
  role: "Ordinary Member";
  status: "active" | "good_standing";
  duesStatus: "paid" | "pending_clearance";
  meetingSchedule: string;
  regularVenue: string;
  president: string;
  advisor: string;
  announcements: {
    id: string;
    title: string;
    date: string;
    author: string;
    content: string;
    pinned?: boolean;
  }[];
  upcomingEventTitle?: string;
  upcomingEventDate?: string;
}

export interface StudentRequestRecord {
  id: string;
  clubCode: string;
  clubName: string;
  category: string;
  duesAmount: number;
  status: "pending" | "proof_awaiting_review" | "verified" | "rejected";
  submittedAt: string;
  proofRef: string;
  rejectionReason?: string;
  reviewNotes?: string;
}

const ENROLLED_CLUBS: MemberClub[] = [
  {
    id: "club-ngd",
    code: "NGD",
    name: "Nile Google Developers",
    category: "Technology",
    joinedDate: "September 15, 2024",
    role: "Ordinary Member",
    status: "good_standing",
    duesStatus: "paid",
    meetingSchedule: "Every Wednesday & Alternate Saturdays, 2:00 PM – 5:00 PM",
    regularVenue: "Engineering Complex, Computer Lab 4",
    president: "Mustapha Mohammed (Computer Engineering)",
    advisor: "Dr. Aisha Bello (Department of Software Eng.)",
    upcomingEventTitle: "Google Cloud & Flutter Hands-on Bootcamp",
    upcomingEventDate: "Today at 2:00 PM",
    announcements: [
      {
        id: "ann-ngd-1",
        title: "DevFest 2025 Student Speaker Call & Hackathon Registration",
        date: "2 days ago",
        author: "Mustapha Mohammed (President)",
        content: "Proposals are now open for student lightning talks on Web3, AI in healthcare, and Flutter architecture. Mentorship will be provided by GDG Abuja leads.",
        pinned: true
      },
      {
        id: "ann-ngd-2",
        title: "Access to Google Cloud Skills Boost Lab Credits",
        date: "Nov 10, 2025",
        author: "Club Executive Team",
        content: "All active members in good standing have received 200 free Qwiklabs credits. Please check your Nile student email for activation vouchers."
      }
    ]
  },
  {
    id: "club-nbc",
    code: "NBC",
    name: "Nile Book Club",
    category: "Arts & Culture",
    joinedDate: "October 02, 2024",
    role: "Ordinary Member",
    status: "good_standing",
    duesStatus: "paid",
    meetingSchedule: "Saturdays (Bi-weekly), 11:00 AM – 1:30 PM",
    regularVenue: "Main Library, Conference Hall B",
    president: "Zainab Mukhtar (Mass Communication)",
    advisor: "Prof. Halima Yusuf (Department of English)",
    upcomingEventTitle: "Contemporary African Speculative Fiction Seminar",
    upcomingEventDate: "Saturday, Nov 22 at 11:00 AM",
    announcements: [
      {
        id: "ann-nbc-1",
        title: "Selected Reading for November: African Sci-Fi Anthologies",
        date: "Nov 08, 2025",
        author: "Zainab Mukhtar (President)",
        content: "Copies of the short-story collection are available for loan in the Library Annex. Discussion questions will be posted in the member study portal.",
        pinned: true
      }
    ]
  }
];

const OWN_REQUESTS: StudentRequestRecord[] = [
  {
    id: "req-wit-01",
    clubCode: "WIT",
    clubName: "Women in Tech Club",
    category: "Technology",
    duesAmount: 10000,
    status: "proof_awaiting_review",
    submittedAt: "Yesterday at 3:45 PM",
    proofRef: "TXN-WIT-2025-9941",
    reviewNotes: "Bank transfer receipt uploaded. Under verification by Nile Club Services accounting desk."
  },
  {
    id: "req-ndc-02",
    clubCode: "NDC",
    clubName: "Nile Debate Club",
    category: "Leadership & Speaking",
    duesAmount: 10000,
    status: "rejected",
    submittedAt: "October 14, 2025",
    proofRef: "TXN-NDC-77210",
    rejectionReason: "Uploaded bank receipt was unreadable/blurred. Please re-apply in Discover with a clear Providus Bank transaction receipt."
  }
];

export function StudentMyClubsWorkspace() {
  const { profile } = useAuth();
  const studentIdentity = {
    fullName: profile?.full_name || "Amina Bello",
    studentId: profile?.student_id || "2021/0458",
    matricNo: "NUG/ENG/21/0458",
    department: profile?.department || "Computer Engineering",
    level: "400 Level"
  };

  const [activeTab, setActiveTab] = useState<"all" | "enrolled" | "requests">("all");
  const [selectedClubForModal, setSelectedClubForModal] = useState<MemberClub | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filtered lists
  const filteredEnrolled = useMemo(() => {
    return ENROLLED_CLUBS.filter((c) => {
      const q = searchQuery.toLowerCase();
      return (
        q === "" ||
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    });
  }, [searchQuery]);

  const filteredRequests = useMemo(() => {
    return OWN_REQUESTS.filter((r) => {
      const q = searchQuery.toLowerCase();
      return (
        q === "" ||
        r.clubName.toLowerCase().includes(q) ||
        r.clubCode.toLowerCase().includes(q) ||
        r.proofRef.toLowerCase().includes(q)
      );
    });
  }, [searchQuery]);

  return (
    <main className="space-y-6 max-w-5xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in" aria-labelledby="myclubs-heading">
      {/* Header & Visual Cue (Strictly NO leave-club) */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              id="student-myclubs-indicator"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-primary uppercase"
            >
              STUDENT/MYCLUBS
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Enrolled Memberships &bull; {studentIdentity.studentId}
            </span>
          </div>
          <h1 id="myclubs-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            My Club Memberships
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Review your active student memberships, club-specific announcements, meeting venues, and the status of your join applications.
          </p>
        </div>

        {/* Discovery Action Link */}
        <Button asChild size="sm" className="gap-1.5 self-start sm:self-auto text-xs font-semibold">
          <Link to="/membership?tab=discover">
            <Compass className="h-3.5 w-3.5" />
            <span>Discover More Clubs</span>
          </Link>
        </Button>
      </header>

      {/* Tab Filter & Search */}
      <section aria-label="Membership filters" className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/80 self-start">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "all"
                ? "bg-card text-foreground font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Items ({ENROLLED_CLUBS.length + OWN_REQUESTS.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("enrolled")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "enrolled"
                ? "bg-card text-foreground font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Enrolled Clubs ({ENROLLED_CLUBS.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("requests")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "requests"
                ? "bg-card text-foreground font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Join Requests ({OWN_REQUESTS.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search my clubs or refs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-input bg-card pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </section>

      {/* SECTION 1: Active Enrolled Clubs (Member Club Home Cards) */}
      {(activeTab === "all" || activeTab === "enrolled") && (
        <section aria-labelledby="enrolled-clubs-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h2 id="enrolled-clubs-heading" className="text-xs font-bold uppercase tracking-wider text-foreground">
                Active Enrolled Clubs ({filteredEnrolled.length})
              </h2>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Ordinary Membership &bull; In Good Standing
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEnrolled.map((club) => (
              <Card
                key={club.id}
                hoverable
                className="border-border/80 flex flex-col justify-between"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Active Member
                    </span>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                      {club.code}
                    </span>
                  </div>
                  <CardTitle className="text-base mt-1.5 text-foreground">
                    {club.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Enrolled on {club.joinedDate} &bull; {club.role}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pt-2">
                  {/* Next Activity & Venue Preview */}
                  <div className="p-3 rounded-xl bg-muted/20 border border-border/70 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">{club.meetingSchedule.split(",")[0]}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">{club.regularVenue}</span>
                    </div>
                  </div>

                  {/* Latest Club Announcement Teaser */}
                  {club.announcements[0] && (
                    <div className="p-2.5 rounded-xl border border-primary/20 bg-primary/5 text-xs space-y-0.5">
                      <div className="flex items-center gap-1 text-primary font-bold text-[11px]">
                        <Megaphone className="h-3 w-3" />
                        <span className="truncate">{club.announcements[0].title}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {club.announcements[0].content}
                      </p>
                    </div>
                  )}

                  {/* Open Member Club Home Modal */}
                  <div className="pt-2 border-t border-border/60">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedClubForModal(club)}
                      className="w-full text-xs gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Open Member Club Home</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 2: Own Request Status & Review Tracking */}
      {(activeTab === "all" || activeTab === "requests") && (
        <section aria-labelledby="requests-tracking-heading" className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <h2 id="requests-tracking-heading" className="text-xs font-bold uppercase tracking-wider text-foreground">
                Your Join Requests ({filteredRequests.length})
              </h2>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Direct Bank Transfer Proof Submissions
            </span>
          </div>

          <Card className="border-border/80 divide-y divide-border/60">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">
                        {req.clubName}
                      </span>
                      <span className="rounded bg-muted px-1.5 py-0.2 text-[10px] font-mono text-muted-foreground">
                        {req.clubCode}
                      </span>
                      {req.status === "proof_awaiting_review" || req.status === "pending" ? (
                        <StatusBadge
                          variant="warning"
                          dot
                          label="Proof Awaiting Review"
                        />
                      ) : req.status === "verified" ? (
                        <StatusBadge
                          variant="success"
                          dot
                          label="Verified & Enrolled"
                        />
                      ) : (
                        <StatusBadge
                          variant="error"
                          dot
                          label="Proof Rejected"
                        />
                      )}
                    </div>

                    <div className="text-[11px] text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-0.5">
                      <span>Transaction Ref: <strong className="font-mono text-foreground">{req.proofRef}</strong></span>
                      <span>&bull;</span>
                      <span>Dues: <strong>₦{req.duesAmount.toLocaleString()}</strong></span>
                      <span>&bull;</span>
                      <span>Submitted {req.submittedAt}</span>
                    </div>

                    {/* Explanatory notes */}
                    {req.status === "rejected" && req.rejectionReason && (
                      <p className="text-[11px] text-destructive pt-0.5">
                        <strong>Reason:</strong> {req.rejectionReason}
                      </p>
                    )}
                    {req.status === "proof_awaiting_review" && req.reviewNotes && (
                      <p className="text-[11px] text-muted-foreground pt-0.5 italic">
                        {req.reviewNotes}
                      </p>
                    )}
                  </div>

                  {/* Contextual Action */}
                  <div className="shrink-0">
                    {req.status === "rejected" ? (
                      <Button asChild size="sm" variant="outline" className="text-xs">
                        <Link to="/membership?tab=discover">Re-Apply in Discover</Link>
                      </Button>
                    ) : (
                      <span className="text-[11px] text-muted-foreground font-mono">
                        Queue: Nile Accounting Desk
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No active membership requests in this filter.
              </div>
            )}
          </Card>
        </section>
      )}

      {/* MEMBER CLUB HOME MODAL (Read-Only Identity + Status + Club Updates) */}
      <Dialog
        open={!!selectedClubForModal}
        onOpenChange={(open) => !open && setSelectedClubForModal(null)}
      >
        <DialogContent maxWidth="lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Active Ordinary Member
              </span>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                {selectedClubForModal?.code}
              </span>
            </div>
            <DialogTitle className="text-xl mt-1 text-foreground">
              {selectedClubForModal?.name} — Member Home
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Enrolled since {selectedClubForModal?.joinedDate} &bull; Standing: Good Standing
            </DialogDescription>
          </DialogHeader>

          {selectedClubForModal && (
            <div className="space-y-4 py-2 text-xs">
              {/* Student Membership Identity (Read-Only) */}
              <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Verified Student Membership Identity (Read-Only)
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    SSO Certified
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-foreground">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Student Name</span>
                    <span className="font-semibold">{studentIdentity.fullName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Matric ID</span>
                    <span className="font-mono font-semibold">{studentIdentity.studentId}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Department</span>
                    <span className="font-semibold">{studentIdentity.department}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Membership Role</span>
                    <span className="font-semibold">{selectedClubForModal.role}</span>
                  </div>
                </div>
              </div>

              {/* Club Venue & Officers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl border border-border/70 bg-card">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Meeting Schedule &amp; Venue
                  </span>
                  <p className="font-medium text-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                    {selectedClubForModal.meetingSchedule}
                  </p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 pl-5">
                    <MapPin className="h-3 w-3 text-primary shrink-0" />
                    {selectedClubForModal.regularVenue}
                  </p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Club Leadership
                  </span>
                  <p className="font-medium text-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-primary shrink-0" />
                    {selectedClubForModal.president}
                  </p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 pl-5">
                    <GraduationCap className="h-3 w-3 text-primary shrink-0" />
                    {selectedClubForModal.advisor}
                  </p>
                </div>
              </div>

              {/* Club-Specific Announcements */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-foreground font-bold">
                  <Megaphone className="h-4 w-4 text-primary" />
                  <span>Official {selectedClubForModal.code} Announcements ({selectedClubForModal.announcements.length})</span>
                </div>

                <div className="space-y-2">
                  {selectedClubForModal.announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className={`p-3 rounded-xl border text-xs space-y-1 ${
                        ann.pinned
                          ? "border-primary/30 bg-primary/5"
                          : "border-border/70 bg-card"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">{ann.title}</span>
                        <span className="text-[10px] text-muted-foreground">{ann.date}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {ann.content}
                      </p>
                      <p className="text-[10px] text-muted-foreground/80 font-medium">
                        Posted by: {ann.author}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedClubForModal(null)}
            >
              Close
            </Button>
            <Button asChild className="gap-1.5">
              <Link to="/events">
                <Calendar className="h-4 w-4" />
                <span>View Club Events</span>
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
