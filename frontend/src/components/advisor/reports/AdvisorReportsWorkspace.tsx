import { useState, useMemo } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Image as ImageIcon,
  MapPin,
  Search,
  ShieldCheck,
  TrendingUp,
  User,
  Users
} from "lucide-react";
import { AdvisorRoleHeader } from "../header/AdvisorRoleHeader";
import { Button } from "@/shared/components/Button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/shared/components/Dialog";

interface AdvisorEventReport {
  id: string;
  proposalId: string;
  clubId: string;
  clubName: string;
  clubCode: string;
  eventTitle: string;
  presidentName: string;
  eventDate: string;
  venue: string;
  attendeeCount: number;
  expectedRsvps: number;
  totalSpent: number;
  allocatedBudget: number;
  executiveSummary: string;
  highlights: string[];
  challenges: string;
  recommendations: string;
  submittedAt: string;
  hasMedia: boolean;
  mediaCount: number;
}

const MOCK_ADVISOR_REPORTS: AdvisorEventReport[] = [
  {
    id: "rep-adv-01",
    proposalId: "prop-101",
    clubId: "club-8",
    clubName: "Nile Google Developers",
    clubCode: "NGD",
    eventTitle: "Google Cloud & Generative AI Buildathon 2026",
    presidentName: "Farouk Aliyu",
    eventDate: "2026-08-14",
    venue: "Nile Tech Auditorium & Lab 4",
    attendeeCount: 142,
    expectedRsvps: 150,
    totalSpent: 145000,
    allocatedBudget: 150000,
    executiveSummary: "A highly successful hands-on buildathon with 28 teams submitting functional prototypes on Vertex AI and Gemini APIs. Keynote delivered by external Google Developer Expert.",
    highlights: [
      "28 working student prototypes built in 8 hours",
      "94.6% attendance conversion rate from RSVPs",
      "15 student teams invited to incubation mentorship"
    ],
    challenges: "Auditorium Wi-Fi network experienced transient packet congestion during live API deploy phase; solved by switching to Nile ICT backup subnet.",
    recommendations: "Request dedicated VLAN allocation from Nile ICT director for future hackathons.",
    submittedAt: "2026-08-16",
    hasMedia: true,
    mediaCount: 8
  },
  {
    id: "rep-adv-02",
    proposalId: "prop-104",
    clubId: "club-4",
    clubName: "Nile Climate Initiatives Club",
    clubCode: "NCIC",
    eventTitle: "Campus Solar & E-Waste Awareness Drive",
    presidentName: "Aisha Mohammed",
    eventDate: "2026-07-28",
    venue: "Main Campus Amphitheater",
    attendeeCount: 95,
    expectedRsvps: 100,
    totalSpent: 62000,
    allocatedBudget: 75000,
    executiveSummary: "Campus-wide awareness campaign with solar energy demonstration kits and electronic waste collection bin installations across all faculty buildings.",
    highlights: [
      "Collected 140kg of discarded electronic parts for recycling",
      "Engaged 4 faculty deans and Club Services representatives",
      "Delivered 3 hands-on micro-solar assembly workshops"
    ],
    challenges: "Heavy rain in the afternoon required moving the outdoor exhibition under the amphitheater portico.",
    recommendations: "Schedule outdoor sustainability fairs during morning hours (9am - 12pm).",
    submittedAt: "2026-07-30",
    hasMedia: true,
    mediaCount: 12
  },
  {
    id: "rep-adv-03",
    proposalId: "prop-106",
    clubId: "club-11",
    clubName: "Nile Startup Campus",
    clubCode: "NSC",
    eventTitle: "Venture Ideation & Founder Pitch Clinic",
    presidentName: "Chiamaka Okafor",
    eventDate: "2026-06-20",
    venue: "Innovation Hub Hall B",
    attendeeCount: 78,
    expectedRsvps: 80,
    totalSpent: 89000,
    allocatedBudget: 90000,
    executiveSummary: "Interactive founder bootcamp covering customer discovery, pitch deck storytelling, and unit economics for early-stage university ventures.",
    highlights: [
      "12 student teams pitched to alumni angel investors",
      "Best venture awarded 50,000 NGN seed prize from club funds",
      "100% positive feedback on mentor breakout sessions"
    ],
    challenges: "Limited time for individual team Q&A during afternoon sessions.",
    recommendations: "Extend future clinics across two days with dedicated mentor office hours.",
    submittedAt: "2026-06-22",
    hasMedia: true,
    mediaCount: 6
  }
];

export function AdvisorReportsWorkspace() {
  const [reports] = useState<AdvisorEventReport[]>(MOCK_ADVISOR_REPORTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [clubFilter, setClubFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<AdvisorEventReport | null>(null);
  const [isReadingModalOpen, setIsReadingModalOpen] = useState(false);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        report.eventTitle.toLowerCase().includes(query) ||
        report.clubName.toLowerCase().includes(query) ||
        report.presidentName.toLowerCase().includes(query) ||
        report.executiveSummary.toLowerCase().includes(query);

      const matchesClub =
        clubFilter === "all" ||
        report.clubId === clubFilter ||
        report.clubCode.toLowerCase() === clubFilter.toLowerCase();

      return matchesSearch && matchesClub;
    });
  }, [reports, searchTerm, clubFilter]);

  const handleOpenReport = (report: AdvisorEventReport) => {
    setSelectedReport(report);
    setIsReadingModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in">
      <AdvisorRoleHeader
        title="Post-Event Reports &amp; Archive"
        subtitle="Read concluded event summaries, verified attendance tallies, and financial expenditure audits submitted by presidents of your assigned clubs."
        pendingCount={0}
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border/80 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search reports by event title, club, president, or highlights..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={clubFilter}
            onChange={(e) => setClubFilter(e.target.value)}
            className="h-9 px-3 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="Filter reports by club"
          >
            <option value="all">All Assigned Clubs</option>
            <option value="club-8">Nile Google Developers</option>
            <option value="club-4">Nile Climate Initiatives</option>
            <option value="club-11">Nile Startup Campus</option>
          </select>
        </div>
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border/80 bg-card/50 space-y-3">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="font-bold text-foreground text-base">No reports found</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            No post-event reports match your search query.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredReports.map((report) => {
            const formattedSpent = new Intl.NumberFormat("en-NG", {
              style: "currency",
              currency: "NGN",
              maximumFractionDigits: 0
            }).format(report.totalSpent);

            const attendancePercent = Math.round(
              (report.attendeeCount / report.expectedRsvps) * 100
            );

            return (
              <Card
                key={report.id}
                className="overflow-hidden border border-border/80 bg-card hover:border-primary/50 transition-all duration-200 flex flex-col justify-between"
              >
                <CardContent className="p-5 space-y-4">
                  {/* Top Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="secondary" className="font-bold text-primary bg-primary/10">
                      {report.clubCode}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Documented
                    </Badge>
                  </div>

                  {/* Title & Metadata */}
                  <div className="space-y-1">
                    <h2 className="font-bold text-base text-foreground line-clamp-2 leading-snug">
                      {report.eventTitle}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Held on {report.eventDate} &bull; {report.venue}
                    </p>
                  </div>

                  {/* Executive Summary Preview */}
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {report.executiveSummary}
                  </p>

                  {/* Metrics Box */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-muted/40 text-xs border border-border/40">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                        Attendance
                      </span>
                      <p className="font-bold text-foreground">
                        {report.attendeeCount} / {report.expectedRsvps} ({attendancePercent}%)
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                        Reconciled Spend
                      </span>
                      <p className="font-bold text-foreground">{formattedSpent}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenReport(report)}
                      className="text-xs gap-1 flex-1"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Read Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Full Read Report Dialog */}
      {selectedReport && (
        <Dialog open={isReadingModalOpen} onOpenChange={setIsReadingModalOpen}>
          <DialogContent className="max-w-3xl text-left max-h-[88vh] flex flex-col p-0 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-border/80 bg-muted/30">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="font-bold text-primary">
                  {selectedReport.clubCode} REPORT
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  Submitted {selectedReport.submittedAt}
                </Badge>
              </div>
              <DialogTitle className="text-xl font-bold font-display text-foreground">
                {selectedReport.eventTitle}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Authored by {selectedReport.presidentName} (Club President) &bull; {selectedReport.clubName}
              </DialogDescription>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs sm:text-sm">
              {/* Event Metrics Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-border/80 bg-card p-3 space-y-1">
                  <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-primary" /> Event Date
                  </span>
                  <p className="font-semibold text-foreground">{selectedReport.eventDate}</p>
                </div>
                <div className="rounded-xl border border-border/80 bg-card p-3 space-y-1">
                  <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-primary" /> Venue
                  </span>
                  <p className="font-semibold text-foreground truncate">{selectedReport.venue}</p>
                </div>
                <div className="rounded-xl border border-border/80 bg-card p-3 space-y-1">
                  <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-primary" /> Turnout
                  </span>
                  <p className="font-semibold text-foreground">{selectedReport.attendeeCount} verified</p>
                </div>
                <div className="rounded-xl border border-border/80 bg-card p-3 space-y-1">
                  <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <FileSpreadsheet className="h-3.5 w-3.5 text-primary" /> Total Spent
                  </span>
                  <p className="font-semibold text-foreground">
                    {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(selectedReport.totalSpent)}
                  </p>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="rounded-xl border border-border/80 bg-card p-4 space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Executive Summary of Event Proceedings
                </h4>
                <p className="text-foreground leading-relaxed">
                  {selectedReport.executiveSummary}
                </p>
              </div>

              {/* Key Achievements & Highlights */}
              <div className="rounded-xl border border-border/80 bg-card p-4 space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  Key Achievements &amp; Outcomes
                </h4>
                <ul className="space-y-1.5 list-disc list-inside text-foreground leading-relaxed">
                  {selectedReport.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>

              {/* Challenges & Solutions */}
              <div className="rounded-xl border border-border/80 bg-card p-4 space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Operational Challenges Encountered
                </h4>
                <p className="text-foreground leading-relaxed">
                  {selectedReport.challenges}
                </p>
              </div>

              {/* Future Recommendations for Advisor & Admin */}
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-2 text-blue-950 dark:text-blue-200">
                <h4 className="font-bold text-xs uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  President's Recommendations for Advisory Council
                </h4>
                <p className="leading-relaxed text-xs">
                  {selectedReport.recommendations}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border/80 bg-muted/20 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsReadingModalOpen(false)}
                className="text-xs"
              >
                Close Report
              </Button>
              <span className="text-[11px] text-muted-foreground">Read-only report preview</span>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
