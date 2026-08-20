import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  HelpCircle,
  Info,
  Layers,
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
import { Button } from "@/shared/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/Card";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/Dialog";

export interface ClubEventDetail {
  id: string;
  title: string;
  type: "Keynote" | "Workshop" | "Bootcamp" | "Hackathon" | "Meeting";
  date: string;
  time: string;
  venue: string;
  status: "Upcoming" | "In Progress" | "Concluded";
  rsvps: number;
  capacity: number;
  description: string;
  speakers: string[];
  agenda: { time: string; activity: string }[];
  equipmentNeeded: string[];
  logisticsLead: string;
}

export const OFFICIAL_CLUB_EVENTS: ClubEventDetail[] = [
  {
    id: "evt-01",
    title: "Nile DevFest & Career Keynote 2025",
    type: "Keynote",
    date: "Saturday, Oct 25, 2025",
    time: "10:00 AM – 3:30 PM",
    venue: "Main Campus Auditorium",
    status: "Upcoming",
    rsvps: 142,
    capacity: 200,
    description: "Annual Nile developer keynote bringing industry tech leaders, cloud architects, and alumni founders for hands-on sessions and career panels.",
    speakers: ["Engr. Aliyu Sanusi (Google Dev Expert)", "Zainab Mukhtar (VP)", "Dr. Aminu Galadima (Advisor)"],
    agenda: [
      { time: "10:00 AM", activity: "Opening Welcome & Nile GDG Overview" },
      { time: "11:00 AM", activity: "Keynote: Architecting Cloud-Native Systems" },
      { time: "12:30 PM", activity: "Technical Networking & Lunch Break" },
      { time: "1:30 PM", activity: "Breakout: Android & ML Code Labs" },
      { time: "3:00 PM", activity: "Closing Remarks & Swag Distribution" }
    ],
    equipmentNeeded: ["4K Projector Rig", "Dual Wireless Mics", "HDMI Splitter", "WiFi APs"],
    logisticsLead: "Fatima Al-Hassan (Workshops Coordinator)"
  },
  {
    id: "evt-02",
    title: "Android Jetpack Compose Bootcamp",
    type: "Bootcamp",
    date: "Wednesday, Nov 05, 2025",
    time: "4:00 PM – 6:00 PM",
    venue: "Innovation Complex, Lab 2",
    status: "Upcoming",
    rsvps: 68,
    capacity: 75,
    description: "Hands-on masterclass transitioning from imperative Android XML layouts to declarative modern UI with Kotlin & Jetpack Compose.",
    speakers: ["Tariq Ibrahim (President)", "Fatima Al-Hassan (Workshops Coordinator)"],
    agenda: [
      { time: "4:00 PM", activity: "Introduction to Declarative UI Paradigms" },
      { time: "4:30 PM", activity: "Hands-on Code Lab: Building a News Feed App" },
      { time: "5:30 PM", activity: "State Hoisting & Performance Best Practices" },
      { time: "5:50 PM", activity: "Q&A & GitHub Repo Submission" }
    ],
    equipmentNeeded: ["Lab Workstations (Android Studio installed)", "Dual Projector"],
    logisticsLead: "Fatima Al-Hassan (Workshops Coordinator)"
  },
  {
    id: "evt-03",
    title: "Google Cloud TechSprint & Certification Clinic",
    type: "Workshop",
    date: "Tuesday, Nov 18, 2025",
    time: "2:00 PM – 5:00 PM",
    venue: "ICT Complex, Hall B",
    status: "Upcoming",
    rsvps: 95,
    capacity: 120,
    description: "Guided Cloud Skills Boost lab session covering Cloud Run deployment, Firestore schema design, and associate engineer certification pathways.",
    speakers: ["Dr. Aminu Galadima (Advisor)", "Zainab Mukhtar (VP)"],
    agenda: [
      { time: "2:00 PM", activity: "Google Cloud Console Provisioning & IAM" },
      { time: "2:45 PM", activity: "Hands-on: Serverless Microservices on Cloud Run" },
      { time: "4:00 PM", activity: "Certification Prep: Sample Exam Question Review" }
    ],
    equipmentNeeded: ["GCP Credits Voucher Codes", "High-speed Ethernet Switch"],
    logisticsLead: "Oluwaseun Adeleke (Logistics & Treasury)"
  },
  {
    id: "evt-04",
    title: "Flutter Forward Hands-on Lab",
    type: "Workshop",
    date: "Friday, Sep 12, 2025",
    time: "3:00 PM – 5:30 PM",
    venue: "Innovation Complex, Lab 2",
    status: "Concluded",
    rsvps: 84,
    capacity: 80,
    description: "Introductory cross-platform app building with Flutter and Dart, concluding with 28 completed student demo projects.",
    speakers: ["Fatima Al-Hassan", "Tariq Ibrahim"],
    agenda: [
      { time: "3:00 PM", activity: "Flutter Setup & Dart Syntax Refresher" },
      { time: "3:45 PM", activity: "Live Coding: State Management with Riverpod" },
      { time: "5:00 PM", activity: "Showcase & Post-Event Report Review" }
    ],
    equipmentNeeded: ["Lab PCs", "Projector"],
    logisticsLead: "Fatima Al-Hassan (Workshops Coordinator)"
  }
];

export function ExecutiveEventsWorkspace() {
  const executiveName = "Fatima Al-Hassan";
  const clubName = "Nile Google Developers";
  const clubCode = "NGD";

  const [events] = useState<ClubEventDetail[]>(OFFICIAL_CLUB_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<ClubEventDetail | null>(null);
  const [filterType, setFilterType] = useState<string>("All");

  const filteredEvents = events.filter((e) => {
    if (filterType === "All") return true;
    if (filterType === "Upcoming") return e.status === "Upcoming";
    if (filterType === "Concluded") return e.status === "Concluded";
    return true;
  });

  return (
    <main
      className="space-y-6 max-w-5xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in"
      aria-labelledby="executive-events-heading"
    >
      {/* HEADER & ROLE BADGE */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              id="executive-events-indicator"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-primary uppercase"
            >
              EXECUTIVE/EVENTS
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
              <CalendarDays className="h-3.5 w-3.5" />
              {clubName}
            </span>
          </div>

          <h1
            id="executive-events-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight text-foreground"
          >
            Club Event Schedule &amp; Agendas
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Review upcoming club workshops, logistics setups, agendas, and technical requirements for {clubCode}.
          </p>
        </div>

        {/* Action: Jump to My Work */}
        <Button asChild size="sm" className="text-xs font-bold gap-1.5">
          <Link to="/executive/work">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Event Logistics Tasks</span>
          </Link>
        </Button>
      </header>

      {/* READ-ONLY & ATTENDANCE BOUNDARY CARD */}
      <div className="rounded-2xl border border-border/70 bg-card p-4 text-xs space-y-1.5 shadow-xs">
        <div className="flex items-center gap-2 font-bold text-foreground">
          <Info className="h-4 w-4 text-primary" />
          <span>Event details are read-only</span>
        </div>
        <p className="text-muted-foreground text-[11px] leading-relaxed">
          Review the schedule, venue, agenda, and equipment notes for your club. Attendance tools are not available in the Executive workspace.
        </p>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-2 text-xs">
        {["All", "Upcoming", "Concluded"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilterType(tab)}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filterType === tab
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            {tab} Events
          </button>
        ))}
      </div>

      {/* EVENT CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvents.map((evt) => (
          <Card
            key={evt.id}
            className={`border-border/80 shadow-xs flex flex-col justify-between ${
              evt.status === "Concluded" ? "opacity-75 bg-muted/20" : "bg-card"
            }`}
          >
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-primary/10 text-primary">
                      {evt.type}
                    </span>
                    {evt.status === "Upcoming" && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        Upcoming
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-sm font-bold text-foreground leading-snug">
                    {evt.title}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-3 pb-4 space-y-3 text-xs flex-1">
              <div className="space-y-1.5 text-muted-foreground text-[11px]">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{evt.date} &bull; {evt.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="font-semibold text-foreground">{evt.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{evt.rsvps} Registered / {evt.capacity} Capacity</span>
                </div>
              </div>

              <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">
                {evt.description}
              </p>

              <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  Logistics: <strong>{evt.logisticsLead}</strong>
                </span>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedEvent(evt)}
                  className="text-xs font-bold gap-1"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>View Details</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* EVENT DETAILS MODAL DIALOG */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent maxWidth="md">
          {selectedEvent && (
            <div className="space-y-4 text-xs">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-primary/10 text-primary">
                    {selectedEvent.type}
                  </span>
                  <StatusBadge
                    variant={selectedEvent.status === "Concluded" ? "default" : "success"}
                    label={selectedEvent.status}
                  />
                </div>
                <DialogTitle className="text-base font-bold text-foreground pt-1">
                  {selectedEvent.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {selectedEvent.date} &bull; {selectedEvent.time} &bull; {selectedEvent.venue}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 pt-2 border-t border-border/60">
                <div className="space-y-1">
                  <span className="font-bold text-foreground text-xs">Event Overview</span>
                  <p className="text-muted-foreground leading-relaxed text-xs">
                    {selectedEvent.description}
                  </p>
                </div>

                {/* Speakers */}
                <div className="space-y-1">
                  <span className="font-bold text-foreground text-xs">Speakers &amp; Facilitators</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedEvent.speakers.map((spk, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded-lg bg-muted text-foreground text-[11px] font-semibold"
                      >
                        {spk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Agenda */}
                <div className="space-y-1.5">
                  <span className="font-bold text-foreground text-xs">Schedule &amp; Agenda</span>
                  <div className="space-y-1.5 rounded-xl bg-muted/40 p-3 border border-border/50">
                    {selectedEvent.agenda.map((ag, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs">
                        <span className="font-mono font-bold text-primary text-[11px] w-16 shrink-0">
                          {ag.time}
                        </span>
                        <span className="text-foreground">{ag.activity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Required Equipment */}
                <div className="space-y-1">
                  <span className="font-bold text-foreground text-xs">Required Hardware &amp; AV Rig</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedEvent.equipmentNeeded.map((eq, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-300 text-[11px] font-mono"
                      >
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-3 border-t border-border/60 flex justify-end">
                <Button
                  size="sm"
                  onClick={() => setSelectedEvent(null)}
                  className="text-xs font-bold"
                >
                  Close Details
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
