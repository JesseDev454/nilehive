import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bell,
  Building,
  Calendar,
  Check,
  CheckCheck,
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
  MapPin,
  Megaphone,
  Pin,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  User,
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

export interface StudentAnnouncementRecord {
  id: string;
  clubCode: string;
  clubName: string;
  isUniversityWide?: boolean;
  title: string;
  summary: string;
  content: string;
  publishedAt: string;
  author: string;
  authorRole: string;
  priority: "urgent" | "high" | "normal";
  pinned?: boolean;
  isRead: boolean;
  relatedEventTitle?: string;
  relatedEventDate?: string;
}

const INITIAL_ANNOUNCEMENTS: StudentAnnouncementRecord[] = [
  {
    id: "ann-01",
    clubCode: "NGD",
    clubName: "Nile Google Developers",
    title: "DevFest 2025 Student Speaker Call & Project Showcase",
    summary: "Proposals are open for 15-minute lightning talks on Web, Cloud, AI in Healthcare, and Mobile development.",
    content: `Dear Developers and Campus Builders,

We are thrilled to officially open speaker submissions for the upcoming Nile DevFest 2025 Annual Conference! 

Key Submission Tracks:
1. Cloud Architecture & Firebase Scalability
2. AI/ML and Gemini API integrations in student workflows
3. Mobile Engineering with Flutter 3.x
4. Open-Source contribution journeys

Selected student speakers will receive 1-on-1 slide coaching with Google Developer Experts (GDEs) and an official speaker credential on their Nile Co-Curricular Transcript.

Submission Deadline: November 28, 2025 at 11:59 PM.`,
    publishedAt: "2 hours ago",
    author: "Mustapha Mohammed",
    authorRole: "President, Nile Google Developers",
    priority: "high",
    pinned: true,
    isRead: false,
    relatedEventTitle: "DevFest 2025 Technical Conference",
    relatedEventDate: "Dec 05, 2025"
  },
  {
    id: "ann-02",
    clubCode: "CAMPUS",
    clubName: "Nile University Student Affairs",
    isUniversityWide: true,
    title: "Club Dues Clearance & Semester Registration Audit Notice",
    summary: "All enrolled club members must ensure their semester bank transfer receipts are uploaded for clearance.",
    content: `Official University Notice to All Club Members:

In accordance with Student Senate resolution #2025/08, all active student organizations are completing their mid-semester attendance and dues audit.

Please verify that:
1. Your session dues bank-transfer proof has been uploaded in OneClub.
2. Your matriculation number appears accurately on your Providus Bank transfer narration.

Unverified members may experience temporary check-in holds for upcoming off-campus symposiums. For assistance, visit the Student Affairs Desk at the Central Administration Building.`,
    publishedAt: "Yesterday at 10:15 AM",
    author: "Dr. Aisha Bello",
    authorRole: "Director of Student Activities",
    priority: "urgent",
    pinned: true,
    isRead: false
  },
  {
    id: "ann-03",
    clubCode: "NBC",
    clubName: "Nile Book Club",
    title: "November Reading Circle: African Speculative Fiction Loan Copies",
    summary: "Physical copies of the selected anthology are now ready for loan in the Main Library Annex.",
    content: `Hello Book Club Members!

Copies of our November reading selection, "African Speculative Anthologies 2025", have arrived at the Main Library Annex (Desk 4).

Active members in good standing can borrow a copy for up to 14 days by showing their OneClub student profile. Discussion prompts and reading guides are posted on the club study portal.

Our next live circle discussion takes place Saturday, November 22 at 11:00 AM in Conference Hall B.`,
    publishedAt: "Nov 12, 2025",
    author: "Zainab Mukhtar",
    authorRole: "President, Nile Book Club",
    priority: "normal",
    isRead: true,
    relatedEventTitle: "African Speculative Fiction Seminar",
    relatedEventDate: "Nov 22, 2025"
  },
  {
    id: "ann-04",
    clubCode: "NGD",
    clubName: "Nile Google Developers",
    title: "Google Cloud Skills Boost Free Lab Vouchers Distributed",
    summary: "Check your Nile student webmail for voucher redemption codes for 200 free Qwiklabs credits.",
    content: `All active NGD members have been credited with 200 complimentary Google Cloud Skills Boost credits to support your cloud computing bootcamp projects.

Voucher codes were delivered to your student webmail (@nileuniversity.edu.ng). Codes must be activated within 30 days of issuance.`,
    publishedAt: "Nov 08, 2025",
    author: "NGD Executive Committee",
    authorRole: "Technical Secretariat",
    priority: "normal",
    isRead: true
  }
];

export function StudentAnnouncementsWorkspace() {
  const { profile } = useAuth();
  const studentId = profile?.student_id || "2021/0458";

  const [announcements, setAnnouncements] = useState<StudentAnnouncementRecord[]>(INITIAL_ANNOUNCEMENTS);
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "priority" | "club">("all");
  const [selectedClubFilter, setSelectedClubFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<StudentAnnouncementRecord | null>(null);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // Unread Count
  const unreadCount = useMemo(() => {
    return announcements.filter((a) => !a.isRead).length;
  }, [announcements]);

  // Mark single announcement as read
  const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isRead: true } : a))
    );
    if (selectedAnnouncement?.id === id) {
      setSelectedAnnouncement((prev) => (prev ? { ...prev, isRead: true } : null));
    }
  };

  // Mark all announcements as read (Dominant Action)
  const handleMarkAllRead = () => {
    setAnnouncements((prev) => prev.map((a) => ({ ...a, isRead: true })));
    setBannerNotice("All announcements have been marked as read.");
  };

  // Open detail modal and auto-mark as read
  const handleOpenAnnouncement = (ann: StudentAnnouncementRecord) => {
    setSelectedAnnouncement(ann);
    if (!ann.isRead) {
      handleMarkAsRead(ann.id);
    }
  };

  // Filtered List
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((ann) => {
      // Status Filter
      if (activeFilter === "unread" && ann.isRead) return false;
      if (activeFilter === "priority" && ann.priority === "normal") return false;
      if (activeFilter === "club" && selectedClubFilter !== "all" && ann.clubCode !== selectedClubFilter) {
        return false;
      }

      // Search Query
      const q = searchQuery.toLowerCase().trim();
      if (q === "") return true;

      return (
        ann.title.toLowerCase().includes(q) ||
        ann.summary.toLowerCase().includes(q) ||
        ann.content.toLowerCase().includes(q) ||
        ann.clubName.toLowerCase().includes(q) ||
        ann.clubCode.toLowerCase().includes(q) ||
        ann.author.toLowerCase().includes(q)
      );
    });
  }, [announcements, activeFilter, selectedClubFilter, searchQuery]);

  return (
    <main className="space-y-6 max-w-4xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in" aria-labelledby="announcements-heading">
      {/* Header & Visual Cue */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              id="student-announcements-indicator"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-primary uppercase"
            >
              STUDENT/ANNOUNCEMENTS
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Enrolled Clubs &bull; {studentId}
            </span>
          </div>
          <h1 id="announcements-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Official Club Announcements
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Read verified bulletins, meeting notices, and urgent broadcast alerts from the clubs you belong to.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {unreadCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs font-semibold gap-1.5"
            >
              <CheckCheck className="h-3.5 w-3.5 text-primary" />
              <span>Mark All as Read ({unreadCount})</span>
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-xl px-2.5 py-1.5 border border-emerald-500/20">
              <CheckCircle2 className="h-3.5 w-3.5" />
              All Caught Up
            </span>
          )}

          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link to="/student/more">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              More
            </Link>
          </Button>
        </div>
      </header>

      {/* Confirmation Banner */}
      {bannerNotice && (
        <Banner
          variant="success"
          title="Announcements Updated"
          description={bannerNotice}
          onDismiss={() => setBannerNotice(null)}
        />
      )}

      {/* FILTER & SEARCH CONTROLS */}
      <section aria-label="Announcement filters" className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/80 self-start overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => {
                setActiveFilter("all");
                setSelectedClubFilter("all");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === "all"
                  ? "bg-card text-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Bulletins ({announcements.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveFilter("unread");
                setSelectedClubFilter("all");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeFilter === "unread"
                  ? "bg-card text-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary text-primary-foreground px-1.5 py-0.2 text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveFilter("priority");
                setSelectedClubFilter("all");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === "priority"
                  ? "bg-card text-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Priority &amp; Urgent
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search announcements..."
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
        </div>
      </section>

      {/* ANNOUNCEMENT LIST VIEWPORT */}
      <section aria-label="Announcement broadcast list" className="space-y-3">
        {filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((ann) => {
            const isUnread = !ann.isRead;
            const isUrgent = ann.priority === "urgent";
            const isHigh = ann.priority === "high";

            return (
              <Card
                key={ann.id}
                hoverable
                onClick={() => handleOpenAnnouncement(ann)}
                className={`border-border/80 text-left transition-all cursor-pointer relative overflow-hidden ${
                  isUnread
                    ? "border-primary/40 bg-primary/2 dark:bg-primary/5"
                    : "bg-card/70"
                }`}
              >
                {/* Unread Accent Indicator */}
                {isUnread && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                )}

                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {ann.pinned && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 rounded-full px-2 py-0.5">
                            <Pin className="h-3 w-3" />
                            Pinned
                          </span>
                        )}

                        <span className="font-bold text-xs text-primary">
                          {ann.clubName}
                        </span>

                        <span className="rounded bg-muted px-1.5 py-0.2 text-[10px] font-mono text-muted-foreground">
                          {ann.clubCode}
                        </span>

                        {isUrgent && (
                          <StatusBadge variant="error" dot label="Urgent" />
                        )}
                        {isHigh && (
                          <StatusBadge variant="warning" dot label="Important" />
                        )}
                      </div>

                      <CardTitle className={`text-base tracking-tight ${isUnread ? "font-bold text-foreground" : "font-semibold text-foreground/90"}`}>
                        {ann.title}
                      </CardTitle>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-muted-foreground">
                        {ann.publishedAt}
                      </span>
                      {isUnread && (
                        <span className="h-2 w-2 rounded-full bg-primary" title="Unread" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-1">
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {ann.summary}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-border/60 text-xs">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <User className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{ann.author} ({ann.authorRole})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isUnread && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(ann.id, e)}
                          className="text-[11px] font-semibold text-primary hover:underline"
                        >
                          Mark as read
                        </button>
                      )}
                      <span className="text-xs font-semibold text-primary flex items-center gap-0.5">
                        <span>Read Full Broadcast</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          /* EMPTY STATE: "You're up to date" */
          <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">You&apos;re all caught up!</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                You’re up to date. No unread announcements or pending club bulletins require your attention.
              </p>
            </div>
            {activeFilter !== "all" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveFilter("all");
                  setSearchQuery("");
                }}
                className="text-xs mt-2"
              >
                View All Bulletins
              </Button>
            )}
          </div>
        )}
      </section>

      {/* ANNOUNCEMENT READER MODAL / SHEET */}
      <Dialog
        open={!!selectedAnnouncement}
        onOpenChange={(open) => !open && setSelectedAnnouncement(null)}
      >
        <DialogContent maxWidth="lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                {selectedAnnouncement?.clubName}
              </span>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                {selectedAnnouncement?.clubCode}
              </span>
              {selectedAnnouncement?.priority === "urgent" && (
                <StatusBadge variant="error" dot label="Urgent Broadcast" />
              )}
            </div>
            <DialogTitle className="text-lg sm:text-xl mt-1 text-foreground">
              {selectedAnnouncement?.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Published {selectedAnnouncement?.publishedAt} by {selectedAnnouncement?.author} ({selectedAnnouncement?.authorRole})
            </DialogDescription>
          </DialogHeader>

          {selectedAnnouncement && (
            <div className="space-y-4 py-2 text-xs">
              {/* Context / Metadata Strip */}
              <div className="p-3 rounded-xl bg-muted/20 border border-border/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <Megaphone className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Official Club Broadcast</span>
                </div>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified Institutional Dispatch
                </span>
              </div>

              {/* Full Content Body */}
              <div className="p-4 rounded-xl bg-card border border-border/80 text-foreground text-xs leading-relaxed whitespace-pre-line">
                {selectedAnnouncement.content}
              </div>

              {/* Related Event Callout if applicable */}
              {selectedAnnouncement.relatedEventTitle && (
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-primary">
                      Referenced Club Event
                    </span>
                    <p className="font-bold text-foreground">
                      {selectedAnnouncement.relatedEventTitle}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Scheduled for: {selectedAnnouncement.relatedEventDate}
                    </p>
                  </div>
                  <Button asChild size="sm" className="text-xs gap-1 self-start sm:self-auto">
                    <Link to="/events">
                      <span>View in Calendar</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground font-mono">
              Status: Read &amp; Stamped
            </span>
            <Button
              variant="outline"
              onClick={() => setSelectedAnnouncement(null)}
            >
              Close Broadcast
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
