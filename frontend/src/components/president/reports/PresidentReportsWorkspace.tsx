import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Coins,
  DollarSign,
  Download,
  Eye,
  FileCheck,
  FileEdit,
  FilePlus2,
  FileText,
  Filter,
  ImageIcon,
  Info,
  Layers,
  MapPin,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Upload,
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

export interface PastEventEligible {
  id: string;
  proposalId: string;
  title: string;
  category: string;
  date: string;
  venue: string;
  allocatedBudget: number;
  expectedAttendance: number;
  hasReport: boolean;
  reportId?: string;
}

export interface PostEventReportRecord {
  id: string;
  eventId: string;
  proposalId: string;
  eventTitle: string;
  category: string;
  eventDate: string;
  venue: string;
  clubName: string;
  clubCode: string;
  submittedAt: string;
  submittedBy: string;
  attendanceCount: number;
  summary: string;
  outcomes: string;
  challenges: string;
  budgetAllocated: number;
  budgetSpent: number;
  budgetReconciled: boolean;
  mediaFiles: Array<{ name: string; size: string }>;
  status: "Archived & Reviewed" | "Pending Advisor Review";
}

const PAST_EVENTS_CATALOG: PastEventEligible[] = [
  {
    id: "ev-past-01",
    proposalId: "prop-098",
    title: "Flutter Forward Hands-on Mobile Workshop",
    category: "Developer Workshop",
    date: "Oct 18, 2025",
    venue: "Student Center Complex B1",
    allocatedBudget: 54000,
    expectedAttendance: 90,
    hasReport: false // Ready to report!
  },
  {
    id: "ev-past-02",
    proposalId: "prop-085",
    title: "Open Source Git & GitHub Bootcamp",
    category: "Practical Skills Lab",
    date: "Sept 20, 2025",
    venue: "Computer Science Lab 1",
    allocatedBudget: 45000,
    expectedAttendance: 75,
    hasReport: true,
    reportId: "rep-2025-085"
  },
  {
    id: "ev-past-03",
    proposalId: "prop-072",
    title: "Web3 & Smart Contracts Onboarding Seminar",
    category: "Technical Seminar",
    date: "Aug 15, 2025",
    venue: "Faculty of Engineering Auditorium",
    allocatedBudget: 35000,
    expectedAttendance: 60,
    hasReport: true,
    reportId: "rep-2025-072"
  }
];

const INITIAL_REPORTS: PostEventReportRecord[] = [
  {
    id: "rep-2025-085",
    eventId: "ev-past-02",
    proposalId: "prop-085",
    eventTitle: "Open Source Git & GitHub Bootcamp",
    category: "Practical Skills Lab",
    eventDate: "Sept 20, 2025",
    venue: "Computer Science Lab 1",
    clubName: "Nile Google Developers",
    clubCode: "NGD",
    submittedAt: "Sept 22, 2025",
    submittedBy: "Farouk Al-Mansoor (President)",
    attendanceCount: 74,
    summary: "Comprehensive version control clinic for 100L-300L students. Covered repository management, branch merging, and live open-source contribution pull requests.",
    outcomes: "74 students successfully opened their first GitHub pull request. 3 students contributed documentation to an active university repository.",
    challenges: "Lab internet bandwidth experienced intermittent throttling around 11:30 AM; hot-spot backup routers were deployed smoothly.",
    budgetAllocated: 45000,
    budgetSpent: 41500,
    budgetReconciled: true,
    mediaFiles: [
      { name: "github-bootcamp-lab-session.jpg", size: "2.4 MB" },
      { name: "group-photo-participants.jpg", size: "3.1 MB" }
    ],
    status: "Archived & Reviewed"
  },
  {
    id: "rep-2025-072",
    eventId: "ev-past-03",
    proposalId: "prop-072",
    eventTitle: "Web3 & Smart Contracts Onboarding Seminar",
    category: "Technical Seminar",
    eventDate: "Aug 15, 2025",
    venue: "Faculty of Engineering Auditorium",
    clubName: "Nile Google Developers",
    clubCode: "NGD",
    submittedAt: "Aug 17, 2025",
    submittedBy: "Farouk Al-Mansoor (President)",
    attendanceCount: 58,
    summary: "Introductory seminar on decentralized protocols, Solidity syntax fundamentals, and Web3 careers.",
    outcomes: "Students deployed testnet smart contracts using browser sandboxes and received digital certificate tokens.",
    challenges: "Time constraints allowed only 20 minutes for the hands-on coding walkthrough instead of the scheduled 40 minutes.",
    budgetAllocated: 35000,
    budgetSpent: 35000,
    budgetReconciled: true,
    mediaFiles: [
      { name: "web3-seminar-slides.pdf", size: "4.8 MB" }
    ],
    status: "Archived & Reviewed"
  }
];

export function PresidentReportsWorkspace() {
  const { profile } = useAuth();
  const presidentName = profile?.full_name || "Farouk Al-Mansoor";
  const clubName = profile?.club_name || "Nile Google Developers";
  const clubCode = "NGD";

  const [pastEvents, setPastEvents] = useState<PastEventEligible[]>(PAST_EVENTS_CATALOG);
  const [reports, setReports] = useState<PostEventReportRecord[]>(INITIAL_REPORTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<PostEventReportRecord | null>(null);

  // Form Submission State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedEventIdForReport, setSelectedEventIdForReport] = useState<string>("");
  const [formData, setFormData] = useState({
    attendanceCount: "",
    summary: "",
    outcomes: "",
    challenges: "",
    budgetSpent: "",
    budgetReconciled: true,
    mediaFiles: [] as Array<{ name: string; size: string }>
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Eligible un-reported past events
  const pendingPastEvents = useMemo(() => {
    return pastEvents.filter((ev) => !ev.hasReport);
  }, [pastEvents]);

  // Selected event object for prefilling
  const activeEventToReport = useMemo(() => {
    return pastEvents.find((e) => e.id === selectedEventIdForReport);
  }, [pastEvents, selectedEventIdForReport]);

  // Filtered reports list
  const filteredReports = useMemo(() => {
    return reports.filter((rep) => {
      return (
        rep.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [reports, searchQuery]);

  // Launch Create Report for specific event
  const handleOpenCreateReport = (eventId?: string) => {
    const targetEvent = eventId
      ? pastEvents.find((e) => e.id === eventId)
      : pendingPastEvents[0];

    if (!targetEvent) return;

    setSelectedEventIdForReport(targetEvent.id);
    setFormData({
      attendanceCount: targetEvent.expectedAttendance.toString(),
      summary: `The event "${targetEvent.title}" concluded successfully with active member engagement at ${targetEvent.venue}.`,
      outcomes: "Delivered core educational curriculum and practical exercises as proposed.",
      challenges: "None. Logistics ran on schedule.",
      budgetSpent: targetEvent.allocatedBudget.toString(),
      budgetReconciled: true,
      mediaFiles: [
        { name: "event-photo-overview.jpg", size: "2.1 MB" }
      ]
    });
    setIsSubmitModalOpen(true);
  };

  // Submit Post-Event Report Handler
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEventToReport) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newReportId = `rep-${Date.now().toString().slice(-4)}`;
      const newReport: PostEventReportRecord = {
        id: newReportId,
        eventId: activeEventToReport.id,
        proposalId: activeEventToReport.proposalId,
        eventTitle: activeEventToReport.title,
        category: activeEventToReport.category,
        eventDate: activeEventToReport.date,
        venue: activeEventToReport.venue,
        clubName,
        clubCode,
        submittedAt: "Just now",
        submittedBy: `${presidentName} (President)`,
        attendanceCount: parseInt(formData.attendanceCount) || activeEventToReport.expectedAttendance,
        summary: formData.summary.trim(),
        outcomes: formData.outcomes.trim(),
        challenges: formData.challenges.trim(),
        budgetAllocated: activeEventToReport.allocatedBudget,
        budgetSpent: parseFloat(formData.budgetSpent) || activeEventToReport.allocatedBudget,
        budgetReconciled: formData.budgetReconciled,
        mediaFiles: formData.mediaFiles,
        status: "Pending Advisor Review"
      };

      // Update past event state (prevent duplicate)
      setPastEvents((prev) =>
        prev.map((ev) =>
          ev.id === activeEventToReport.id
            ? { ...ev, hasReport: true, reportId: newReportId }
            : ev
        )
      );

      // Add to submitted reports
      setReports((prev) => [newReport, ...prev]);

      setIsSubmitting(false);
      setIsSubmitModalOpen(false);
      setSuccessBanner(`Post-event report for "${activeEventToReport.title}" submitted to Staff Advisor & Student Affairs.`);
      setTimeout(() => setSuccessBanner(null), 5000);
    }, 500);
  };

  return (
    <main className="space-y-6 max-w-6xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in" aria-labelledby="reports-heading">
      {/* Header & Visual Cue */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              id="president-reports-indicator"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-primary uppercase"
            >
              PRESIDENT/REPORTS
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Closure &bull; {clubCode}
            </span>
          </div>
          <h1 id="reports-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {clubName} Post-Event Reports
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Submit one official closure report per approved past event. Reports require attendance counts, summaries, outcomes, and budget reconciliations, and are reviewed by your Staff Advisor and Student Affairs.
          </p>
        </div>

        {/* Primary Action if Pending Reports Exist */}
        {pendingPastEvents.length > 0 && (
          <Button
            onClick={() => handleOpenCreateReport()}
            size="sm"
            className="font-bold gap-1.5 self-start sm:self-auto text-xs shadow-xs"
          >
            <FilePlus2 className="h-4 w-4" />
            <span>Submit Event Report ({pendingPastEvents.length} Due)</span>
          </Button>
        )}
      </header>

      {/* CONFIRMATION BANNER */}
      {successBanner && (
        <Banner
          variant="success"
          title="Report Submitted"
          description={successBanner}
          onClose={() => setSuccessBanner(null)}
        />
      )}

      {/* PENDING EVENT REPORTS BANNER / QUEUE */}
      {pendingPastEvents.length > 0 ? (
        <section aria-labelledby="pending-reports-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <h2 id="pending-reports-heading" className="text-xs font-bold uppercase tracking-wider text-foreground">
                Action Required: Past Events Awaiting Closure ({pendingPastEvents.length})
              </h2>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Duplicate reports forbidden
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {pendingPastEvents.map((event) => (
              <Card key={event.id} className="p-4 border-amber-500/30 bg-amber-500/5 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold text-amber-700 dark:text-amber-300">
                      Approved Proposal: {event.proposalId}
                    </span>
                    <span className="text-[10px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full border border-amber-500/30">
                      Report Pending
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      {event.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {event.date} &bull; {event.venue}
                    </p>
                  </div>

                  <div className="text-xs text-muted-foreground pt-1 border-t border-amber-500/20 flex items-center justify-between">
                    <span>Allocated Budget: <strong>₦{event.allocatedBudget.toLocaleString()}</strong></span>
                    <span>Expected: <strong>{event.expectedAttendance}</strong></span>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-500/20 flex items-center justify-end">
                  <Button
                    size="sm"
                    onClick={() => handleOpenCreateReport(event.id)}
                    className="text-xs font-bold h-8 gap-1 bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    <FileEdit className="h-3.5 w-3.5" />
                    <span>Complete Report</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>All concluded campus events have been formally documented. No overdue post-event reports.</span>
        </div>
      )}

      {/* SEARCH AND DIRECTORY LIST */}
      <section aria-labelledby="history-heading" className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 id="history-heading" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Submitted Event Closure Reports ({filteredReports.length})
            </h2>
            <p className="text-xs text-muted-foreground">
              Official institutional records archived for Staff Advisor and Student Affairs auditing.
            </p>
          </div>

          <div className="w-full sm:w-72">
            <TextField
              id="report-search"
              placeholder="Search reports by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startAdornment={<Search className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <Card className="border-dashed border-border/80 p-8 text-center space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mx-auto">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-foreground">No reports found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No submitted event reports match your search query.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredReports.map((report) => (
              <Card
                key={report.id}
                hoverable
                onClick={() => setSelectedReport(report)}
                className="p-4 border-border/80 hover:border-primary/50 cursor-pointer transition-all duration-180 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold text-primary">
                      {report.id}
                    </span>
                    <StatusBadge
                      status={report.status === "Archived & Reviewed" ? "success" : "warning"}
                      label={report.status}
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-foreground leading-snug">
                      {report.eventTitle}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {report.eventDate} &bull; {report.venue}
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed bg-muted/30 p-2 rounded-lg border border-border/50">
                    "{report.summary}"
                  </p>
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span>Verified Attendees: <strong className="text-foreground font-mono">{report.attendanceCount}</strong></span>
                    <span>Budget Spent: <strong className="text-foreground font-mono">₦{report.budgetSpent.toLocaleString()}</strong></span>
                  </div>

                  <span className="text-primary font-semibold flex items-center gap-1 text-[11px]">
                    <Eye className="h-3.5 w-3.5" />
                    <span>Inspect</span>
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* CREATE / SUBMIT REPORT MODAL */}
      <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
        <DialogContent maxWidth="lg" className="max-h-[92vh] flex flex-col p-0 overflow-hidden">
          {activeEventToReport && (
            <form onSubmit={handleSubmitReport} className="flex flex-col h-full overflow-hidden">
              {/* MODAL HEADER WITH PREFILLED EVENT METADATA */}
              <div className="p-5 border-b border-border/80 bg-card space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold font-mono">
                      {clubName}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      Proposal: {activeEventToReport.proposalId}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    1 Report Per Event
                  </span>
                </div>

                <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                  Submit Post-Event Report: {activeEventToReport.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Official report for Nile University Student Affairs &bull; Concluded on {activeEventToReport.date} at {activeEventToReport.venue}
                </DialogDescription>
              </div>

              {/* MODAL SCROLLABLE BODY */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
                {/* PREFILLED METADATA READ-ONLY CARD */}
                <div className="p-3.5 bg-muted/40 rounded-xl border border-border/60 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Event Title</span>
                    <p className="font-semibold text-foreground truncate">{activeEventToReport.title}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Date &amp; Venue</span>
                    <p className="font-semibold text-foreground truncate">{activeEventToReport.date} ({activeEventToReport.venue})</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Allocated Budget</span>
                    <p className="font-mono font-bold text-primary">₦{activeEventToReport.allocatedBudget.toLocaleString()}</p>
                  </div>
                </div>

                {/* FORM INPUTS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <TextField
                    id="actual-attendance"
                    label="Verified Attendance Count"
                    type="number"
                    required
                    value={formData.attendanceCount}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, attendanceCount: e.target.value }))
                    }
                    helperText="Total students verified via QR camera scan or manual roster check-in."
                  />

                  <TextField
                    id="actual-budget-spent"
                    label="Actual Budget Utilized (₦)"
                    type="number"
                    required
                    value={formData.budgetSpent}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, budgetSpent: e.target.value }))
                    }
                    helperText="Final expenditure verified with receipts and invoices."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Executive Summary of Event Proceedings
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.summary}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, summary: e.target.value }))
                    }
                    placeholder="Describe the main activities, keynote speeches, student engagement level..."
                    className="w-full rounded-xl border border-border/80 bg-card p-3 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Key Outcomes &amp; Measurable Student Achievements
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.outcomes}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, outcomes: e.target.value }))
                    }
                    placeholder="List specific milestones: projects built, certificates issued, skills mastered..."
                    className="w-full rounded-xl border border-border/80 bg-card p-3 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Challenges Encountered &amp; Recommendations for Future Events
                  </label>
                  <textarea
                    rows={2}
                    value={formData.challenges}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, challenges: e.target.value }))
                    }
                    placeholder="Any technical issues, lab space constraints, catering or crowd control notes..."
                    className="w-full rounded-xl border border-border/80 bg-card p-3 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* BUDGET RECONCILIATION & MEDIA */}
                <div className="p-3 bg-muted/40 rounded-xl border border-border/60 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-foreground">Budget Reconciliation Confirmation</span>
                    <p className="text-[11px] text-muted-foreground">All expense receipts have been archived and matched with club ledger.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.budgetReconciled}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, budgetReconciled: e.target.checked }))
                    }
                    className="h-4 w-4 rounded text-primary focus:ring-primary"
                  />
                </div>

                {/* OPTIONAL MEDIA FILES ATTACHMENT */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-foreground">
                    Event Photos &amp; Media Attachments (Optional)
                  </label>
                  <div className="p-3 border border-dashed border-border/80 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ImageIcon className="h-4 w-4 text-primary" />
                      <span>{formData.mediaFiles.length} photo(s) attached</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {formData.mediaFiles.map((m) => m.name).join(", ") || "No extra files"}
                    </span>
                  </div>
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="p-4 border-t border-border/80 bg-card flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || !formData.summary.trim() || !formData.outcomes.trim()}
                  className="text-xs font-bold gap-1 bg-primary text-primary-foreground"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isSubmitting ? "Submitting Report..." : "Submit to Staff Advisor & Admin"}</span>
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* INSPECT REPORT DETAILS DIALOG */}
      <Dialog open={Boolean(selectedReport)} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent maxWidth="md">
          {selectedReport && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-muted-foreground">
                    {selectedReport.id}
                  </span>
                  <StatusBadge
                    status={selectedReport.status === "Archived & Reviewed" ? "success" : "warning"}
                    label={selectedReport.status}
                  />
                </div>
                <DialogTitle className="text-foreground text-lg">
                  {selectedReport.eventTitle}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {selectedReport.clubName} &bull; Submitted {selectedReport.submittedAt} by {selectedReport.submittedBy}
                </DialogDescription>
              </DialogHeader>

              {/* DETAILS SUMMARY */}
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-muted/40 rounded-xl border border-border/60 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase">Event Date</span>
                    <p className="font-semibold text-foreground">{selectedReport.eventDate}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase">Venue</span>
                    <p className="font-semibold text-foreground truncate">{selectedReport.venue}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase">Attendees</span>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{selectedReport.attendanceCount}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase">Budget Spent</span>
                    <p className="font-mono font-bold text-primary">₦{selectedReport.budgetSpent.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-foreground">Executive Summary</h4>
                  <p className="text-muted-foreground leading-relaxed bg-muted/20 p-2.5 rounded-lg border border-border/50">
                    {selectedReport.summary}
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-foreground">Outcomes &amp; Student Achievements</h4>
                  <p className="text-muted-foreground leading-relaxed bg-muted/20 p-2.5 rounded-lg border border-border/50">
                    {selectedReport.outcomes}
                  </p>
                </div>

                {selectedReport.challenges && (
                  <div className="space-y-1">
                    <h4 className="font-bold text-foreground">Challenges &amp; Logistics Notes</h4>
                    <p className="text-muted-foreground leading-relaxed bg-muted/20 p-2.5 rounded-lg border border-border/50">
                      {selectedReport.challenges}
                    </p>
                  </div>
                )}

                {/* MEDIA ATTACHMENTS */}
                {selectedReport.mediaFiles.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <h4 className="font-bold text-foreground">Archived Media Files</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedReport.mediaFiles.map((m, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px] bg-card border border-border/80 px-2.5 py-1 rounded-lg">
                          <ImageIcon className="h-3.5 w-3.5 text-primary" />
                          <span className="font-mono">{m.name}</span>
                          <span className="text-muted-foreground font-mono">({m.size})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedReport(null)}
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
