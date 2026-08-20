import { useState, useMemo } from "react";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  HelpCircle,
  Info,
  Laptop,
  MapPin,
  QrCode,
  RefreshCw,
  School,
  Search,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
  Users,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/shared/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/Card";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/Dialog";
import { TextField } from "@/shared/components/TextField";
import { Banner } from "@/shared/components/Banner";

export type EventLifecycle = "today" | "upcoming" | "past";
export type RsvpType = "going" | "interested" | "not_going" | "none";

export interface StudentEnrolledEvent {
  id: string;
  clubId: string;
  clubName: string;
  clubCode: string;
  title: string;
  description: string;
  fullAgenda: string;
  dateLabel: string;
  timeLabel: string;
  venue: string;
  roomDetails: string;
  facilitator: string;
  requirements: string[];
  lifecycle: EventLifecycle;
  rsvp: RsvpType;
  attended: boolean;
  checkInTimestamp?: string;
}

const INITIAL_EVENTS: StudentEnrolledEvent[] = [
  {
    id: "evt-today-01",
    clubId: "club-8",
    clubName: "Nile Google Developers",
    clubCode: "NGD",
    title: "Google Cloud & Flutter Hands-on Bootcamp",
    description: "Live development session building a full-stack mobile app with Cloud Run, Firestore, and modern Flutter UI patterns.",
    fullAgenda: "14:00 - Architecture Overview\n14:45 - Flutter State Management Clinic\n15:30 - Live Deployment to Cloud Run\n16:30 - Q&A and Attendance Log",
    dateLabel: "Today",
    timeLabel: "2:00 PM – 5:00 PM",
    venue: "Engineering Complex, Computer Lab 4",
    roomDetails: "Block C, 2nd Floor, Room 204",
    facilitator: "Mustapha Mohammed (Lead) & Dr. Aisha Bello (Advisor)",
    requirements: ["Personal Laptop with Flutter SDK", "Chrome Browser", "Active Student ID Card"],
    lifecycle: "today",
    rsvp: "going",
    attended: false
  },
  {
    id: "evt-up-02",
    clubId: "club-1",
    clubName: "Nile Book Club",
    clubCode: "NBC",
    title: "Contemporary African Speculative Fiction Seminar",
    description: "Critical discussion of selected African sci-fi anthologies with guest author presentation and book exchange.",
    fullAgenda: "11:00 - Welcome & Opening Remarks\n11:30 - Chapter Keynotes & Dialectics\n12:30 - Open Audience Discourse\n13:00 - Book Swapping Circle",
    dateLabel: "Saturday, Nov 22, 2025",
    timeLabel: "11:00 AM – 1:30 PM",
    venue: "Main Library, Conference Hall B",
    roomDetails: "Library Annex, Ground Floor",
    facilitator: "Zainab Mukhtar & Prof. Halima Yusuf",
    requirements: ["Assigned Reading Excerpts (PDF)", "Student Notebook"],
    lifecycle: "upcoming",
    rsvp: "interested",
    attended: false
  },
  {
    id: "evt-up-03",
    clubId: "club-8",
    clubName: "Nile Google Developers",
    clubCode: "NGD",
    title: "TensorFlow & AI Integration Workshop",
    description: "Hands-on machine learning model training session for real-time computer vision and natural language processing.",
    fullAgenda: "15:00 - ML Model Foundations\n16:00 - Transfer Learning Code-Along\n17:00 - Project Presentations",
    dateLabel: "Wednesday, Dec 3, 2025",
    timeLabel: "3:00 PM – 5:30 PM",
    venue: "ICT Innovation Center, Auditorium 1",
    roomDetails: "Building F, Ground Floor",
    facilitator: "Mustapha Mohammed",
    requirements: ["Google Colab Account", "Laptop with WebGL support"],
    lifecycle: "upcoming",
    rsvp: "none",
    attended: false
  },
  {
    id: "evt-past-04",
    clubId: "club-8",
    clubName: "Nile Google Developers",
    clubCode: "NGD",
    title: "Introduction to Modern Web Architectures & React 19",
    description: "Deep dive into server components, optimistic mutations, client transitions, and performant state management.",
    fullAgenda: "15:00 - React 19 Paradigms\n16:00 - Hands-on Project Scaffold\n17:00 - Code Review",
    dateLabel: "October 18, 2025",
    timeLabel: "3:00 PM – 5:00 PM",
    venue: "Block B, Lecture Theatre 1",
    roomDetails: "Management Sciences Wing",
    facilitator: "Mustapha Mohammed",
    requirements: ["Node.js LTS Installed"],
    lifecycle: "past",
    rsvp: "going",
    attended: true,
    checkInTimestamp: "Oct 18, 2025 at 3:12 PM"
  },
  {
    id: "evt-past-05",
    clubId: "club-1",
    clubName: "Nile Book Club",
    clubCode: "NBC",
    title: "Semester Kickoff: Critical Reading & Poetry Masterclass",
    description: "Introductory seminar welcoming returning and new members with poetic analysis and critical writing critique.",
    fullAgenda: "14:00 - Welcome & Icebreakers\n14:30 - Poetry Recitals\n15:30 - Semester Reading List Unveiling",
    dateLabel: "September 27, 2025",
    timeLabel: "2:00 PM – 4:00 PM",
    venue: "Faculty of Arts, Moot Room 1",
    roomDetails: "Block A, Room 102",
    facilitator: "Zainab Mukhtar",
    requirements: ["Pen & Journal"],
    lifecycle: "past",
    rsvp: "going",
    attended: true,
    checkInTimestamp: "Sep 27, 2025 at 2:05 PM"
  }
];

export function StudentEventsWorkspace() {
  const { profile } = useAuth();
  const studentName = profile?.full_name || "Amina Bello";
  const studentId = profile?.student_id || "2021/0458";

  const [events, setEvents] = useState<StudentEnrolledEvent[]>(INITIAL_EVENTS);
  const [activeFilter, setActiveFilter] = useState<"all" | "today" | "upcoming" | "past">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [targetEventForCheckIn, setTargetEventForCheckIn] = useState<StudentEnrolledEvent | null>(null);
  const [selectedEventForDetails, setSelectedEventForDetails] = useState<StudentEnrolledEvent | null>(null);

  // QR Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const [manualPin, setManualPin] = useState("");
  const [pinSubmitting, setPinSubmitting] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesFilter =
        activeFilter === "all" || e.lifecycle === activeFilter;
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        query === "" ||
        e.title.toLowerCase().includes(query) ||
        e.clubName.toLowerCase().includes(query) ||
        e.clubCode.toLowerCase().includes(query) ||
        e.venue.toLowerCase().includes(query);
      return matchesFilter && matchesQuery;
    });
  }, [events, activeFilter, searchQuery]);

  // Today's event available for check-in
  const todayEvent = useMemo(
    () => events.find((e) => e.lifecycle === "today"),
    [events]
  );

  // RSVP Handler (Disabled for past events)
  const handleRsvpChange = (eventId: string, newRsvp: RsvpType) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId && e.lifecycle !== "past") {
          return { ...e, rsvp: newRsvp };
        }
        return e;
      })
    );
    const target = events.find((e) => e.id === eventId);
    if (target) {
      setFeedbackNotice(
        `RSVP for "${target.title}" set to: ${
          newRsvp === "going"
            ? "Going"
            : newRsvp === "interested"
            ? "Interested"
            : newRsvp === "not_going"
            ? "Not Going"
            : "Cleared"
        }.`
      );
    }
  };

  // Open Check-In Modal (Only for Today's Event)
  const handleOpenCheckIn = (event: StudentEnrolledEvent) => {
    if (event.lifecycle !== "today") return;
    setTargetEventForCheckIn(event);
    setCheckInModalOpen(true);
    setManualPin("");
    setIsScanning(false);
  };

  // Optical Scan Simulation (Student scanning organizer's projected QR)
  const handleSimulateOpticalScan = () => {
    if (!targetEventForCheckIn) return;
    setIsScanning(true);

    setTimeout(() => {
      setIsScanning(false);
      const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setEvents((prev) =>
        prev.map((e) =>
          e.id === targetEventForCheckIn.id
            ? { ...e, attended: true, checkInTimestamp: `Today at ${timestamp}` }
            : e
        )
      );
      setCheckInModalOpen(false);
      setFeedbackNotice(
        `Verified attendance logged for "${targetEventForCheckIn.title}". Your student participation is recorded.`
      );
    }, 1000);
  };

  // Manual PIN submission
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPin.trim() || !targetEventForCheckIn) return;

    setPinSubmitting(true);
    setTimeout(() => {
      setPinSubmitting(false);
      const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setEvents((prev) =>
        prev.map((e) =>
          e.id === targetEventForCheckIn.id
            ? { ...e, attended: true, checkInTimestamp: `Today at ${timestamp} (PIN Verified)` }
            : e
        )
      );
      setCheckInModalOpen(false);
      setFeedbackNotice(
        `Checked in with PIN "${manualPin}" for "${targetEventForCheckIn.title}". Attendance confirmed.`
      );
      setManualPin("");
    }, 600);
  };

  return (
    <main className="space-y-6 max-w-5xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in" aria-labelledby="events-heading">
      {/* Header & Visual Cue */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              id="student-events-indicator"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-primary uppercase"
            >
              STUDENT/EVENTS
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Enrolled Clubs Only &bull; {studentId}
            </span>
          </div>
          <h1 id="events-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Club Events &amp; Attendance
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Upcoming schedules, seminars, and verified attendance for clubs you belong to (Nile Google Developers, Nile Book Club).
          </p>
        </div>

        {/* Today's Check-In Quick Trigger */}
        {todayEvent && !todayEvent.attended && (
          <Button
            onClick={() => handleOpenCheckIn(todayEvent)}
            className="gap-2 shrink-0 self-start sm:self-auto font-bold shadow-xs"
          >
            <QrCode className="h-4 w-4" />
            <span>Scan Today&apos;s Event QR</span>
          </Button>
        )}
      </header>

      {/* Global Status Banner */}
      {feedbackNotice && (
        <Banner
          variant="success"
          title="Attendance Update"
          description={feedbackNotice}
          onDismiss={() => setFeedbackNotice(null)}
        />
      )}

      {/* Today's Highlighted Event Card */}
      {todayEvent && (
        <section aria-labelledby="today-highlight-heading" className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-4 sm:p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span id="today-highlight-heading" className="text-xs font-bold uppercase tracking-wider text-primary">
                  Happening Today &bull; {todayEvent.clubName}
                </span>
                <span className="rounded bg-primary/20 px-1.5 py-0.2 text-[10px] font-mono font-bold text-primary">
                  {todayEvent.clubCode}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {todayEvent.title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  {todayEvent.timeLabel}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  {todayEvent.venue}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {todayEvent.attended ? (
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Attendance Verified</span>
                </div>
              ) : (
                <Button
                  onClick={() => handleOpenCheckIn(todayEvent)}
                  className="gap-2 text-xs font-bold"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>Check In (QR / PIN)</span>
                </Button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Filter Tabs & Search Bar */}
      <section aria-label="Event filtering" className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/80 self-start">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === "all"
                  ? "bg-card text-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({events.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("today")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === "today"
                  ? "bg-card text-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Today ({events.filter((e) => e.lifecycle === "today").length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("upcoming")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === "upcoming"
                  ? "bg-card text-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Upcoming ({events.filter((e) => e.lifecycle === "upcoming").length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("past")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === "past"
                  ? "bg-card text-foreground font-bold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Past ({events.filter((e) => e.lifecycle === "past").length})
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search enrolled events..."
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

      {/* Events Listing */}
      <section aria-label="Enrolled events schedule" className="space-y-4">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((evt) => {
            const isPast = evt.lifecycle === "past";
            const isToday = evt.lifecycle === "today";

            return (
              <Card
                key={evt.id}
                className={`border-border/80 text-left transition-all ${
                  isPast ? "opacity-90 bg-muted/10" : ""
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary">
                          {evt.clubName}
                        </span>
                        <span className="rounded bg-muted px-1.5 py-0.2 text-[10px] font-mono text-muted-foreground">
                          {evt.clubCode}
                        </span>
                        {isToday ? (
                          <span className="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-2 py-0.2 text-[10px] font-bold">
                            Today
                          </span>
                        ) : isPast ? (
                          <span className="rounded-full bg-muted px-2 py-0.2 text-[10px] font-medium text-muted-foreground">
                            Event Ended
                          </span>
                        ) : (
                          <span className="rounded-full bg-primary/10 text-primary px-2 py-0.2 text-[10px] font-medium">
                            Upcoming
                          </span>
                        )}
                      </div>

                      <CardTitle className="text-base font-bold text-foreground mt-1">
                        {evt.title}
                      </CardTitle>
                    </div>

                    {/* Attendance State */}
                    <div>
                      {evt.attended ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 rounded-xl px-2.5 py-1 border border-emerald-500/20">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Attended
                        </span>
                      ) : isPast ? (
                        <span className="text-xs text-muted-foreground font-medium">
                          Did Not Attend
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <CardDescription className="text-xs leading-relaxed mt-1 text-muted-foreground">
                    {evt.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pt-2">
                  {/* Event Time & Location Badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-xl border border-border/60 bg-muted/20 text-xs">
                    <div className="flex items-center gap-2 text-foreground">
                      <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{evt.dateLabel} &bull; {evt.timeLabel}</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">{evt.venue}</span>
                    </div>
                  </div>

                  {/* Controls Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/60 text-xs">
                    {/* RSVP Controls */}
                    {isPast ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-semibold">RSVP:</span>
                        <span className="capitalize font-mono text-foreground">
                          {evt.rsvp === "none" ? "No RSVP recorded" : evt.rsvp.replace("_", " ")}
                        </span>
                        <span className="text-[11px] italic">(RSVP closed for past events)</span>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-medium text-muted-foreground mr-1">
                          Your RSVP:
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRsvpChange(evt.id, "going")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                            evt.rsvp === "going"
                              ? "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold"
                              : "border-border bg-card text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          Going
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRsvpChange(evt.id, "interested")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                            evt.rsvp === "interested"
                              ? "border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold"
                              : "border-border bg-card text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          Interested
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRsvpChange(evt.id, "not_going")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                            evt.rsvp === "not_going"
                              ? "border-destructive bg-destructive/15 text-destructive font-bold"
                              : "border-border bg-card text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          Not Going
                        </button>
                        {evt.rsvp !== "none" && (
                          <button
                            type="button"
                            onClick={() => handleRsvpChange(evt.id, "none")}
                            className="text-[11px] text-muted-foreground hover:text-foreground underline ml-1"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    )}

                    {/* Secondary Actions */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedEventForDetails(evt)}
                        className="text-xs"
                      >
                        Full Details
                      </Button>

                      {/* Check-In Action: Only offered when the event is today */}
                      {isToday && !evt.attended && (
                        <Button
                          size="sm"
                          onClick={() => handleOpenCheckIn(evt)}
                          className="text-xs gap-1.5 font-bold"
                        >
                          <QrCode className="h-3.5 w-3.5" />
                          <span>Check In</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-2">
            <Calendar className="h-8 w-8 text-muted-foreground mx-auto" />
            <h3 className="text-sm font-bold text-foreground">No events found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No matching events found for the selected filter or query.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveFilter("all");
                setSearchQuery("");
              }}
              className="text-xs mt-2"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </section>

      {/* DIALOG 1: Separate QR Check-In Workspace (Offered ONLY when event is today) */}
      <Dialog
        open={checkInModalOpen}
        onOpenChange={(open) => !open && setCheckInModalOpen(false)}
      >
        <DialogContent maxWidth="md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                Today&apos;s Active Session
              </span>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                {targetEventForCheckIn?.clubCode}
              </span>
            </div>
            <DialogTitle className="flex items-center gap-2 mt-1">
              <QrCode className="h-5 w-5 text-primary" />
              Event Attendance Check-In
            </DialogTitle>
            <DialogDescription className="text-xs">
              {targetEventForCheckIn?.title} &bull; {targetEventForCheckIn?.venue}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Viewfinder: Student scans organizer's code */}
            <div className="relative aspect-video w-full rounded-2xl border-2 border-dashed border-primary/40 bg-muted/30 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
              {isScanning ? (
                <div className="space-y-3 flex flex-col items-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="text-xs font-bold text-foreground">Decoding venue attendance token...</p>
                </div>
              ) : (
                <div className="space-y-3 flex flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Camera className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Optical QR Scanner</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 max-w-xs">
                      Aim your camera at the session QR code projected on the hall screen or presenter rostrum.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleSimulateOpticalScan}
                    className="gap-1.5 text-xs font-bold"
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    <span>Scan Projected QR Code</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Manual PIN Fallback */}
            <form onSubmit={handlePinSubmit} className="space-y-3 pt-2 border-t border-border/70">
              <TextField
                label="Or Enter 6-Digit Venue PIN"
                placeholder="e.g. NGD-802"
                value={manualPin}
                onChange={(e) => setManualPin(e.target.value)}
              />
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                disabled={!manualPin.trim() || pinSubmitting}
                className="w-full text-xs"
              >
                {pinSubmitting ? "Verifying PIN..." : "Validate PIN & Record Attendance"}
              </Button>
            </form>

            <div className="p-3 rounded-xl bg-muted/20 border border-border/70 text-[11px] text-muted-foreground leading-relaxed">
              <strong>Institutional Attendance Policy:</strong> Verified check-in tokens are stamped with your student ID ({studentId}) and logged directly to the Nile Student Affairs activity transcript.
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCheckInModalOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: Full Event Details Modal */}
      <Dialog
        open={!!selectedEventForDetails}
        onOpenChange={(open) => !open && setSelectedEventForDetails(null)}
      >
        <DialogContent maxWidth="lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                {selectedEventForDetails?.clubName}
              </span>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                {selectedEventForDetails?.clubCode}
              </span>
            </div>
            <DialogTitle className="text-lg mt-1 text-foreground">
              {selectedEventForDetails?.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {selectedEventForDetails?.dateLabel} &bull; {selectedEventForDetails?.timeLabel}
            </DialogDescription>
          </DialogHeader>

          {selectedEventForDetails && (
            <div className="space-y-4 py-2 text-xs">
              {/* Overview */}
              <div className="p-3.5 rounded-xl border border-border/70 bg-muted/20 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Session Overview
                </span>
                <p className="text-xs leading-relaxed text-foreground">
                  {selectedEventForDetails.description}
                </p>
              </div>

              {/* Location & Facilitator */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl border border-border/70 bg-card">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Venue &amp; Room
                  </span>
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    {selectedEventForDetails.venue}
                  </p>
                  <p className="text-[11px] text-muted-foreground pl-5">
                    {selectedEventForDetails.roomDetails}
                  </p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Facilitator / Lead
                  </span>
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-primary shrink-0" />
                    {selectedEventForDetails.facilitator}
                  </p>
                </div>
              </div>

              {/* Agenda & Requirements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-border/70 bg-muted/10 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Session Agenda
                  </span>
                  <pre className="font-sans text-[11px] leading-relaxed text-foreground whitespace-pre-line">
                    {selectedEventForDetails.fullAgenda}
                  </pre>
                </div>

                <div className="p-3 rounded-xl border border-border/70 bg-muted/10 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Student Preparation
                  </span>
                  <ul className="space-y-1 text-[11px] text-foreground">
                    {selectedEventForDetails.requirements.map((req, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-primary shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Status Banner */}
              {selectedEventForDetails.attended && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>
                    Your attendance was verified for this event ({selectedEventForDetails.checkInTimestamp || "Confirmed"}).
                  </span>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedEventForDetails(null)}
            >
              Close
            </Button>
            {selectedEventForDetails?.lifecycle === "today" && !selectedEventForDetails.attended && (
              <Button
                onClick={() => {
                  const evt = selectedEventForDetails;
                  setSelectedEventForDetails(null);
                  handleOpenCheckIn(evt);
                }}
                className="gap-1.5"
              >
                <QrCode className="h-4 w-4" />
                <span>Check In Now</span>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
