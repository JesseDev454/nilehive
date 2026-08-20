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
  ExternalLink,
  FileCheck,
  FileEdit,
  FilePlus2,
  FileText,
  Filter,
  Info,
  MapPin,
  Printer,
  QrCode,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserX,
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

export type EventTimelineCategory = "today" | "upcoming" | "past";

export interface ApprovedEventRecord {
  id: string;
  proposalId: string;
  title: string;
  category: string;
  dateStr: string; // ISO format or formatted
  rawDate: string; // YYYY-MM-DD
  time: string;
  venue: string;
  description: string;
  leadOrganizer: string;
  rsvpCount: number;
  confirmedGoing: number;
  expectedAttendance: number;
  actualCheckIns: number;
  eventPasscode: string;
  timelineCategory: EventTimelineCategory;
  hasPostEventReport: boolean;
  postEventReportId?: string;
}

export interface AttendeeItem {
  id: string;
  fullName: string;
  studentId: string;
  department: string;
  level: string;
  checkedIn: boolean;
  checkedInTime?: string;
  method?: "QR Camera Scan" | "Manual Check-In";
}

const APPROVED_EVENTS_DATA: ApprovedEventRecord[] = [
  {
    id: "ev-today-01",
    proposalId: "prop-101",
    title: "Nile DevFest & Tech Keynote 2025",
    category: "Industry Keynote & Tech Expo",
    dateStr: "Today, Wednesday",
    rawDate: "2025-10-22",
    time: "10:00 AM - 3:30 PM",
    venue: "Main Campus Auditorium & CS Foyer",
    description: "Annual flagship developer keynote featuring Nile alumni working at Google, Microsoft, and AWS. Interactive tech exhibitions.",
    leadOrganizer: "Farouk Al-Mansoor (President)",
    rsvpCount: 142,
    confirmedGoing: 118,
    expectedAttendance: 150,
    actualCheckIns: 46,
    eventPasscode: "DEV-8891",
    timelineCategory: "today",
    hasPostEventReport: false
  },
  {
    id: "ev-up-02",
    proposalId: "prop-103",
    title: "Google Cloud TechSprint & Hands-on Clinic",
    category: "Technical Workshop",
    dateStr: "Wednesday, Nov 5, 2025",
    rawDate: "2025-11-05",
    time: "2:00 PM - 5:30 PM",
    venue: "Engineering Computer Lab 3",
    description: "Hands-on guided clinic preparing students for GCP Associate Cloud Engineer certifications with live sandbox exercises.",
    leadOrganizer: "Farouk Al-Mansoor & Cloud Exec",
    rsvpCount: 60,
    confirmedGoing: 54,
    expectedAttendance: 60,
    actualCheckIns: 0,
    eventPasscode: "GCP-4022",
    timelineCategory: "upcoming",
    hasPostEventReport: false
  },
  {
    id: "ev-past-03",
    proposalId: "prop-098",
    title: "Flutter Forward Hands-on Mobile Workshop",
    category: "Developer Workshop",
    dateStr: "Saturday, Oct 18, 2025",
    rawDate: "2025-10-18",
    time: "11:00 AM - 4:00 PM",
    venue: "Student Center Complex B1",
    description: "Comprehensive mobile app engineering workshop covering cross-platform architecture with Dart & Flutter SDK.",
    leadOrganizer: "Tariq Ibrahim (VP Tech)",
    rsvpCount: 95,
    confirmedGoing: 90,
    expectedAttendance: 90,
    actualCheckIns: 88,
    eventPasscode: "FLT-1109",
    timelineCategory: "past",
    hasPostEventReport: false // Entry to submit post-event report available!
  },
  {
    id: "ev-past-04",
    proposalId: "prop-085",
    title: "Open Source Git & GitHub Bootcamp",
    category: "Practical Skills Lab",
    dateStr: "Saturday, Sept 20, 2025",
    rawDate: "2025-09-20",
    time: "10:00 AM - 2:00 PM",
    venue: "Computer Science Lab 1",
    description: "Version control fundamentals, branch workflows, and practical open-source pull request clinics for 100L-300L students.",
    leadOrganizer: "Zainab Mukhtar (VP Logistics)",
    rsvpCount: 80,
    confirmedGoing: 75,
    expectedAttendance: 75,
    actualCheckIns: 74,
    eventPasscode: "GIT-3310",
    timelineCategory: "past",
    hasPostEventReport: true,
    postEventReportId: "rep-2025-085"
  }
];

const INITIAL_ROSTER: AttendeeItem[] = [
  { id: "att-1", fullName: "Amina Bello", studentId: "2021/0458", department: "Computer Engineering", level: "400L", checkedIn: true, checkedInTime: "10:04 AM", method: "QR Camera Scan" },
  { id: "att-2", fullName: "Tariq Ibrahim", studentId: "2022/0112", department: "Software Engineering", level: "300L", checkedIn: true, checkedInTime: "10:12 AM", method: "QR Camera Scan" },
  { id: "att-3", fullName: "Zainab Mukhtar", studentId: "2021/0890", department: "Computer Science", level: "400L", checkedIn: true, checkedInTime: "10:15 AM", method: "Manual Check-In" },
  { id: "att-4", fullName: "Chidubem Okafor", studentId: "2023/0541", department: "Electrical Engineering", level: "200L", checkedIn: false },
  { id: "att-5", fullName: "Fatima Aliyu", studentId: "2022/0774", department: "Information Technology", level: "300L", checkedIn: false },
  { id: "att-6", fullName: "Oluwaseun Adeleke", studentId: "2021/0309", department: "Business Administration", level: "400L", checkedIn: true, checkedInTime: "10:22 AM", method: "QR Camera Scan" },
  { id: "att-7", fullName: "Usman Danladi", studentId: "2023/0119", department: "Software Engineering", level: "200L", checkedIn: false },
  { id: "att-8", fullName: "Khadija Garba", studentId: "2022/0904", department: "Computer Science", level: "300L", checkedIn: false }
];

export function PresidentEventsWorkspace() {
  const { profile } = useAuth();
  const clubName = profile?.club_name || "Nile Google Developers";
  const clubCode = "NGD";

  const [events, setEvents] = useState<ApprovedEventRecord[]>(APPROVED_EVENTS_DATA);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<"all" | EventTimelineCategory>("all");
  const [selectedEventId, setSelectedEventId] = useState<string>(APPROVED_EVENTS_DATA[0].id);

  // Attendees State
  const [roster, setRoster] = useState<AttendeeItem[]>(INITIAL_ROSTER);
  const [rosterSearch, setRosterSearch] = useState("");
  const [rosterFilter, setRosterFilter] = useState<"all" | "present" | "pending">("all");
  const [manualInputId, setManualInputId] = useState("");
  const [manualSuccessMsg, setManualSuccessMsg] = useState<string | null>(null);

  // Organizer QR Display Modal State
  const [showOrganizerQrModal, setShowOrganizerQrModal] = useState(false);

  // Post-Event Report Form Modal State
  const [reportModalEvent, setReportModalEvent] = useState<ApprovedEventRecord | null>(null);
  const [reportFormData, setReportFormData] = useState({
    actualAttendance: "",
    summary: "",
    achievements: "",
    budgetReconciled: true,
    challenges: ""
  });
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccessState, setReportSuccessState] = useState(false);

  // Active selected event object
  const activeEvent = useMemo(() => {
    return events.find((e) => e.id === selectedEventId) || events[0];
  }, [events, selectedEventId]);

  // Filtered events list
  const filteredEvents = useMemo(() => {
    if (activeCategoryFilter === "all") return events;
    return events.filter((e) => e.timelineCategory === activeCategoryFilter);
  }, [events, activeCategoryFilter]);

  // Filtered attendees for active event roster
  const filteredAttendees = useMemo(() => {
    return roster.filter((att) => {
      const matchesSearch =
        att.fullName.toLowerCase().includes(rosterSearch.toLowerCase()) ||
        att.studentId.includes(rosterSearch) ||
        att.department.toLowerCase().includes(rosterSearch.toLowerCase());

      if (!matchesSearch) return false;

      if (rosterFilter === "present") return att.checkedIn;
      if (rosterFilter === "pending") return !att.checkedIn;
      return true;
    });
  }, [roster, rosterSearch, rosterFilter]);

  const checkedInCount = roster.filter((a) => a.checkedIn).length;

  // Manual Check-In action
  const handleMarkPresent = (attendeeId: string) => {
    setRoster((prev) =>
      prev.map((a) =>
        a.id === attendeeId
          ? {
              ...a,
              checkedIn: true,
              checkedInTime: "Just now",
              method: "Manual Check-In"
            }
          : a
      )
    );
    setManualSuccessMsg("Attendee successfully checked in.");
    setTimeout(() => setManualSuccessMsg(null), 3000);
  };

  // Quick Manual Check-In by ID form
  const handleQuickManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInputId.trim()) return;

    const trimmed = manualInputId.trim();
    const existing = roster.find((a) => a.studentId === trimmed);

    if (existing) {
      handleMarkPresent(existing.id);
    } else {
      const newAtt: AttendeeItem = {
        id: `att-manual-${Date.now()}`,
        fullName: "Nile University Student",
        studentId: trimmed,
        department: "Undergraduate Department",
        level: "Undergraduate",
        checkedIn: true,
        checkedInTime: "Just now",
        method: "Manual Check-In"
      };
      setRoster((prev) => [newAtt, ...prev]);
      setManualSuccessMsg(`Student ID ${trimmed} verified and marked present.`);
      setTimeout(() => setManualSuccessMsg(null), 3000);
    }
    setManualInputId("");
  };

  // Launch Post-Event Report Form
  const handleOpenReportModal = (event: ApprovedEventRecord) => {
    setReportModalEvent(event);
    setReportFormData({
      actualAttendance: event.actualCheckIns.toString(),
      summary: `The event "${event.title}" was conducted successfully with high student participation at ${event.venue}.`,
      achievements: "Covered all workshop objectives, provided sandbox cloud access, and answered student technical questions.",
      budgetReconciled: true,
      challenges: "None. Lab seating was well-organized."
    });
    setReportSuccessState(false);
  };

  // Submit Post-Event Report
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReport(true);

    setTimeout(() => {
      setIsSubmittingReport(false);
      setReportSuccessState(true);

      // Update event state
      if (reportModalEvent) {
        setEvents((prev) =>
          prev.map((ev) =>
            ev.id === reportModalEvent.id
              ? {
                  ...ev,
                  hasPostEventReport: true,
                  postEventReportId: `rep-${Date.now().toString().slice(-4)}`
                }
              : ev
          )
        );
      }
    }, 600);
  };

  return (
    <main className="space-y-6 max-w-6xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in" aria-labelledby="events-heading">
      {/* Header & Visual Cue */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              id="president-events-indicator"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-primary uppercase"
            >
              PRESIDENT/EVENTS
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Logistics &bull; {clubCode}
            </span>
          </div>
          <h1 id="events-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {clubName} Approved Events
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Approved proposals automatically convert into campus events. Display organizer QR codes for student camera check-ins, record manual attendance, and file post-event reports.
          </p>
        </div>

        {/* Action Button: Show Organizer QR */}
        <Button
          size="sm"
          onClick={() => setShowOrganizerQrModal(true)}
          className="font-bold gap-1.5 self-start sm:self-auto text-xs shadow-xs"
        >
          <QrCode className="h-4 w-4" />
          <span>Show Organizer QR</span>
        </Button>
      </header>

      {/* FILTER BUTTONS: Happening Today vs Upcoming vs Past */}
      <section aria-labelledby="timeline-filter-heading" className="flex items-center justify-between gap-2 overflow-x-auto pb-1 sm:pb-0">
        <div className="flex items-center gap-2">
          {[
            { id: "all", label: "All Events" },
            { id: "today", label: "Happening Today" },
            { id: "upcoming", label: "Upcoming" },
            { id: "past", label: "Past Events" }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategoryFilter(tab.id as typeof activeCategoryFilter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
                activeCategoryFilter === tab.id
                  ? "border-primary bg-primary/10 text-primary shadow-xs"
                  : "border-border/80 bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-[11px] text-muted-foreground font-mono hidden sm:inline-block">
          {filteredEvents.length} Event(s)
        </span>
      </section>

      {/* APPROVED EVENTS SELECTOR CARDS */}
      <section aria-labelledby="events-list-heading" className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {filteredEvents.map((event) => {
            const isSelected = activeEvent.id === event.id;

            return (
              <Card
                key={event.id}
                hoverable
                onClick={() => setSelectedEventId(event.id)}
                className={`cursor-pointer p-4 transition-all duration-180 space-y-3 flex flex-col justify-between ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-xs"
                    : "border-border/80 hover:border-primary/50"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded bg-primary/10 text-primary font-mono text-[10px] font-bold px-1.5 py-0.2">
                      {event.eventPasscode}
                    </span>
                    <StatusBadge
                      status={
                        event.timelineCategory === "today"
                          ? "info"
                          : event.timelineCategory === "upcoming"
                          ? "success"
                          : "default"
                      }
                      label={
                        event.timelineCategory === "today"
                          ? "Today"
                          : event.timelineCategory === "upcoming"
                          ? "Upcoming"
                          : "Past"
                      }
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-foreground leading-snug">
                      {event.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {event.dateStr} &bull; {event.venue}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>RSVPs: {event.rsvpCount}</span>
                  <span className="font-semibold text-primary">
                    {isSelected ? "Active View" : "Select &rarr;"}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* SELECTED EVENT DETAILS & COMMAND PANEL */}
      <section aria-labelledby="active-event-heading" className="space-y-4">
        <Card className="border-border/80 p-5 space-y-4 bg-gradient-to-r from-primary/5 via-card to-card">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold font-mono">
                  Approved Proposal: {activeEvent.proposalId}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  Passcode: {activeEvent.eventPasscode}
                </span>
                <StatusBadge
                  status={activeEvent.timelineCategory === "today" ? "info" : activeEvent.timelineCategory === "upcoming" ? "success" : "default"}
                  label={activeEvent.timelineCategory === "today" ? "Happening Today" : activeEvent.timelineCategory === "upcoming" ? "Upcoming" : "Past Event"}
                />
              </div>

              <h2 id="active-event-heading" className="text-lg sm:text-xl font-bold text-foreground">
                {activeEvent.title}
              </h2>

              <p className="text-xs text-muted-foreground max-w-3xl leading-relaxed">
                {activeEvent.description}
              </p>
            </div>

            {/* EVENT ACTION BUTTONS */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOrganizerQrModal(true)}
                className="text-xs font-bold gap-1.5 h-8"
              >
                <QrCode className="h-3.5 w-3.5" />
                <span>Show Organizer QR</span>
              </Button>

              {/* POST-EVENT REPORT BUTTON WHEN PAST AND NONE EXISTS */}
              {activeEvent.timelineCategory === "past" && !activeEvent.hasPostEventReport && (
                <Button
                  size="sm"
                  onClick={() => handleOpenReportModal(activeEvent)}
                  className="text-xs font-bold gap-1.5 h-8 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <FileEdit className="h-3.5 w-3.5" />
                  <span>Submit Post-Event Report</span>
                </Button>
              )}

              {activeEvent.hasPostEventReport && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-xl px-2.5 py-1.5 border border-emerald-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Report Filed ({activeEvent.postEventReportId})
                </span>
              )}
            </div>
          </div>

          {/* METADATA GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-border/60 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <span>{activeEvent.dateStr}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <span>{activeEvent.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate">{activeEvent.venue}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary shrink-0" />
              <span>Lead: {activeEvent.leadOrganizer}</span>
            </div>
          </div>
        </Card>

        {/* RSVP SUMMARY & ATTENDANCE PROGRESS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* RSVPs Summary Card */}
          <Card className="border-border/80 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-bold uppercase tracking-wider text-[10px]">RSVP Registration</span>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground font-mono">
              {activeEvent.rsvpCount}
            </div>
            <div className="text-xs text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60">
              <span>Confirmed Going: <strong>{activeEvent.confirmedGoing}</strong></span>
              <span>Capacity: <strong>{activeEvent.expectedAttendance}</strong></span>
            </div>
          </Card>

          {/* Verified Check-Ins Card */}
          <Card className="border-border/80 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-bold uppercase tracking-wider text-[10px]">Verified Check-Ins</span>
              <UserCheck className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {checkedInCount} / {roster.length}
            </div>
            <div className="space-y-1 pt-1 border-t border-border/60">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (checkedInCount / Math.max(1, roster.length)) * 100)}%`
                  }}
                />
              </div>
            </div>
          </Card>

          {/* Quick Manual Check-In Bar Card */}
          <Card className="border-border/80 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-bold uppercase tracking-wider text-[10px]">Manual Check-In</span>
              <Search className="h-4 w-4 text-primary" />
            </div>
            <form onSubmit={handleQuickManualSubmit} className="flex gap-2 pt-0.5">
              <TextField
                placeholder="ID (e.g. 2021/0458)"
                value={manualInputId}
                onChange={(e) => setManualInputId(e.target.value)}
                className="text-xs"
              />
              <Button type="submit" size="sm" className="text-xs font-bold shrink-0">
                Mark
              </Button>
            </form>
            {manualSuccessMsg && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold truncate animate-fade-in">
                {manualSuccessMsg}
              </p>
            )}
          </Card>
        </div>

        {/* ATTENDANCE ROSTER SECTION */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span>Verified Attendance Roster ({filteredAttendees.length})</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Live check-in stream synchronized with Nile University Student Affairs records.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-48 sm:w-60">
                <TextField
                  placeholder="Search attendee..."
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  startAdornment={<Search className="h-3.5 w-3.5 text-muted-foreground" />}
                />
              </div>

              <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/80 text-xs">
                {(["all", "present", "pending"] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setRosterFilter(filter)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all capitalize ${
                      rosterFilter === filter
                        ? "bg-card text-foreground shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ROSTER CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredAttendees.map((att) => (
              <Card key={att.id} className="border-border/80 p-3.5 space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">
                        {att.fullName}
                      </h4>
                      <p className="text-[10px] font-mono text-muted-foreground">
                        {att.studentId}
                      </p>
                    </div>

                    <StatusBadge
                      status={att.checkedIn ? "success" : "default"}
                      label={att.checkedIn ? "Present" : "Pending"}
                    />
                  </div>

                  <p className="text-[11px] text-muted-foreground truncate">
                    {att.department} &bull; {att.level}
                  </p>
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px]">
                  {att.checkedIn ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      {att.checkedInTime}
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkPresent(att.id)}
                      className="text-[11px] font-bold h-6 px-2 w-full"
                    >
                      Mark Present
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ORGANIZER QR DISPLAY MODAL (STUDENTS SCAN THIS) */}
      <Dialog open={showOrganizerQrModal} onOpenChange={setShowOrganizerQrModal}>
        <DialogContent maxWidth="sm">
          <div className="space-y-4 text-center">
            <DialogHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mx-auto mb-1">
                <QrCode className="h-5 w-5" />
              </div>
              <DialogTitle className="text-foreground">
                {activeEvent.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Official Organizer QR Code &bull; Students scan with their mobile phone camera at the venue entrance.
              </DialogDescription>
            </DialogHeader>

            {/* QR Code Presentation Box */}
            <div className="p-5 bg-card rounded-2xl border-2 border-dashed border-primary/40 inline-block mx-auto shadow-xs">
              <div className="h-48 w-48 bg-white p-3 rounded-xl flex flex-col items-center justify-center border border-border/60 mx-auto">
                <div className="grid grid-cols-5 gap-1.5 w-full h-full p-2 bg-neutral-900 rounded-lg">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-xs ${
                        i % 2 === 0 || i % 7 === 0 ? "bg-white" : "bg-neutral-900"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-3 font-mono font-bold text-sm tracking-wider text-foreground">
                PASSCODE: {activeEvent.eventPasscode}
              </div>
            </div>

            <div className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border/60 text-left space-y-1">
              <div className="flex justify-between">
                <span>Venue:</span>
                <strong className="text-foreground">{activeEvent.venue}</strong>
              </div>
              <div className="flex justify-between">
                <span>Date &amp; Time:</span>
                <strong className="text-foreground">{activeEvent.dateStr} ({activeEvent.time})</strong>
              </div>
            </div>

            <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowOrganizerQrModal(false)}
                className="w-full sm:w-1/2 text-xs"
              >
                Close Code
              </Button>
              <Button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="w-full sm:w-1/2 text-xs font-bold gap-1"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print QR Sheet</span>
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* POST-EVENT REPORT SUBMISSION MODAL */}
      <Dialog
        open={Boolean(reportModalEvent)}
        onOpenChange={(open) => !open && setReportModalEvent(null)}
      >
        <DialogContent maxWidth="md">
          {reportModalEvent && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold font-mono">
                    Event Closure
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {reportModalEvent.proposalId}
                  </span>
                </div>
                <DialogTitle className="text-foreground">
                  Post-Event Report: {reportModalEvent.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  File the official event closure summary, verified attendee count, and budget reconciliation for Student Affairs.
                </DialogDescription>
              </DialogHeader>

              {reportSuccessState ? (
                <div className="p-6 text-center space-y-3 animate-fade-in">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-foreground">Post-Event Report Submitted</h4>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Your event report has been archived and routed to Nile University Student Affairs for final institutional records.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setReportModalEvent(null)}
                    className="text-xs font-bold mt-2"
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmitReport} className="space-y-3.5 text-xs">
                  <TextField
                    id="actual-attendance-count"
                    label="Verified Attendance Count"
                    type="number"
                    value={reportFormData.actualAttendance}
                    onChange={(e) =>
                      setReportFormData((prev) => ({
                        ...prev,
                        actualAttendance: e.target.value
                      }))
                    }
                    helperText="Total students verified via QR scan or manual roster check-in."
                  />

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Event Summary &amp; Overview of Activities
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={reportFormData.summary}
                      onChange={(e) =>
                        setReportFormData((prev) => ({
                          ...prev,
                          summary: e.target.value
                        }))
                      }
                      className="w-full rounded-xl border border-border/80 bg-card p-3 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Key Outcomes &amp; Student Achievements
                    </label>
                    <textarea
                      rows={2}
                      value={reportFormData.achievements}
                      onChange={(e) =>
                        setReportFormData((prev) => ({
                          ...prev,
                          achievements: e.target.value
                        }))
                      }
                      className="w-full rounded-xl border border-border/80 bg-card p-3 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="p-3 bg-muted/40 rounded-xl border border-border/60 flex items-center justify-between">
                    <span className="font-semibold text-foreground">Budget Reconciled &amp; Invoices Attached</span>
                    <input
                      type="checkbox"
                      checked={reportFormData.budgetReconciled}
                      onChange={(e) =>
                        setReportFormData((prev) => ({
                          ...prev,
                          budgetReconciled: e.target.checked
                        }))
                      }
                      className="h-4 w-4 rounded text-primary focus:ring-primary"
                    />
                  </div>

                  <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setReportModalEvent(null)}
                      className="w-full sm:w-1/2 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isSubmittingReport}
                      className="w-full sm:w-1/2 text-xs font-bold gap-1 bg-primary text-primary-foreground"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{isSubmittingReport ? "Submitting..." : "Submit Event Report"}</span>
                    </Button>
                  </DialogFooter>
                </form>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
