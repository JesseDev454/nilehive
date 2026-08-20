import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  CalendarDays,
  ChevronRight,
  Eye,
  Info,
  MapPin,
  Sparkles,
  Users,
  X
} from "lucide-react";
import { Card, CardContent } from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/Dialog";

export interface HomeEventItem {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  venue: string;
  rsvpCount: number;
  capacity: number;
  executiveRole: string;
  description: string;
  speakers: string[];
  agenda: { time: string; activity: string }[];
  equipmentNeeded: string[];
}

export const INITIAL_HOME_EVENTS: HomeEventItem[] = [
  {
    id: "evt-home-1",
    title: "Nile DevFest & Career Keynote 2025",
    type: "Keynote",
    date: "Saturday, Oct 25, 2025",
    time: "10:00 AM – 3:30 PM",
    venue: "Main Campus Auditorium",
    rsvpCount: 142,
    capacity: 200,
    executiveRole: "AV setup, microphone distribution & speaker technical coordination",
    description: "Annual Nile developer keynote bringing industry tech leaders, cloud architects, and alumni founders for hands-on sessions and career panels.",
    speakers: ["Engr. Aliyu Sanusi (Google Dev Expert)", "Zainab Mukhtar (VP)", "Dr. Aminu Galadima (Advisor)"],
    agenda: [
      { time: "10:00 AM", activity: "Opening Welcome & Nile GDG Overview" },
      { time: "11:00 AM", activity: "Keynote: Architecting Cloud-Native Systems" },
      { time: "12:30 PM", activity: "Technical Networking & Lunch Break" },
      { time: "1:30 PM", activity: "Breakout: Android & ML Code Labs" },
      { time: "3:00 PM", activity: "Closing Remarks & Swag Distribution" }
    ],
    equipmentNeeded: ["4K Projector Rig", "Dual Wireless Mics", "HDMI Splitter", "WiFi APs"]
  },
  {
    id: "evt-home-2",
    title: "Android Jetpack Compose Bootcamp",
    type: "Bootcamp",
    date: "Wednesday, Nov 05, 2025",
    time: "4:00 PM – 6:00 PM",
    venue: "Innovation Complex, Lab 2",
    rsvpCount: 68,
    capacity: 75,
    executiveRole: "Workshop starter repository GitHub creation & code lab support",
    description: "Hands-on masterclass transitioning from imperative Android XML layouts to declarative modern UI with Kotlin & Jetpack Compose.",
    speakers: ["Tariq Ibrahim (President)", "Fatima Al-Hassan (Workshops Coordinator)"],
    agenda: [
      { time: "4:00 PM", activity: "Introduction to Declarative UI Paradigms" },
      { time: "4:30 PM", activity: "Hands-on Code Lab: Building a News Feed App" },
      { time: "5:30 PM", activity: "State Hoisting & Performance Best Practices" },
      { time: "5:50 PM", activity: "Q&A & GitHub Repo Submission" }
    ],
    equipmentNeeded: ["Lab Workstations (Android Studio installed)", "Dual Projector Rig"]
  },
  {
    id: "evt-home-3",
    title: "Google Cloud TechSprint & Certification Clinic",
    type: "Workshop",
    date: "Tuesday, Nov 18, 2025",
    time: "2:00 PM – 5:00 PM",
    venue: "ICT Complex, Hall B",
    rsvpCount: 95,
    capacity: 120,
    executiveRole: "Cloud Skills Boost credit distribution & access verification",
    description: "Guided Cloud Skills Boost lab session covering Cloud Run deployment, Firestore schema design, and associate engineer certification pathways.",
    speakers: ["Dr. Aminu Galadima (Advisor)", "Zainab Mukhtar (VP)"],
    agenda: [
      { time: "2:00 PM", activity: "Google Cloud Console Provisioning & IAM" },
      { time: "2:45 PM", activity: "Hands-on: Serverless Microservices on Cloud Run" },
      { time: "4:00 PM", activity: "Certification Prep: Sample Exam Question Review" }
    ],
    equipmentNeeded: ["GCP Credits Voucher Codes", "High-speed Ethernet Switch"]
  }
];

export function UpcomingEventsSection() {
  const [selectedEvent, setSelectedEvent] = useState<HomeEventItem | null>(null);

  return (
    <section
      id="upcoming-events-section"
      aria-labelledby="upcoming-events-heading"
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary shrink-0" />
          <h2
            id="upcoming-events-heading"
            className="text-sm sm:text-base font-bold text-foreground tracking-tight"
          >
            Upcoming Club Events &amp; Logistics
          </h2>
        </div>

        <Button
          asChild
            variant="ghost"
            size="sm"
            className="text-xs font-semibold text-primary hover:text-primary/80 hover:bg-primary/5 gap-1 h-8 px-2.5"
        >
          <Link to="/executive/events">
            <span>Full Event Calendar</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {INITIAL_HOME_EVENTS.map((evt) => (
          <Card
            key={evt.id}
            className="border-border/80 bg-card shadow-xs flex flex-col justify-between hover:border-primary/40 transition-colors"
          >
            <CardContent className="p-4 space-y-3 text-xs flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-primary/10 text-primary">
                    {evt.type}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {evt.rsvpCount}/{evt.capacity} RSVPs
                  </span>
                </div>

                <h3 className="font-bold text-sm text-foreground line-clamp-2">
                  {evt.title}
                </h3>

                <div className="space-y-1 text-muted-foreground text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{evt.date} &bull; {evt.time.split("–")[0]}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{evt.venue}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50 text-[11px] space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-primary block">
                    Your Logistics Role:
                  </span>
                  <p className="text-muted-foreground line-clamp-2">
                    {evt.executiveRole}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground font-semibold">
                  {evt.agenda.length} Agenda Items
                </span>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedEvent(evt)}
                  className="text-xs font-bold gap-1 h-7.5 px-2.5"
                >
                  <Eye className="h-3 w-3" />
                  <span>Agenda &amp; Rig</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Read-Only Governance Advisory Banner */}
      <div className="rounded-2xl border border-border/60 bg-muted/20 p-3.5 text-xs flex items-start gap-2.5 text-muted-foreground">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <strong>Event details are read-only:</strong> You can review the schedule, venue, and equipment notes for your club. Attendance tools are not available in the Executive workspace.
        </p>
      </div>

      {/* Event Details Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent maxWidth="md" className="p-0 overflow-hidden border-border/80 shadow-lg">
          {selectedEvent && (
            <div className="space-y-0 text-left text-xs">
              <div className="p-5 bg-card border-b border-border/70 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-primary/10 text-primary">
                    {selectedEvent.type}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(null)}
                    className="text-muted-foreground hover:text-foreground rounded-lg p-1 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <DialogTitle className="text-base font-bold text-foreground">
                  {selectedEvent.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {selectedEvent.date} &bull; {selectedEvent.time} &bull; {selectedEvent.venue}
                </DialogDescription>
              </div>

              <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
                <div className="space-y-1">
                  <span className="font-bold text-foreground text-xs">Session Description</span>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {selectedEvent.description}
                  </p>
                </div>

                {/* Speakers */}
                <div className="space-y-1.5">
                  <span className="font-bold text-foreground text-xs">Speakers &amp; Facilitators</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedEvent.speakers.map((spk, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-muted text-foreground text-[11px] font-semibold"
                      >
                        {spk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Agenda */}
                <div className="space-y-1.5">
                  <span className="font-bold text-foreground text-xs">Official Schedule &amp; Agenda</span>
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

                {/* Required AV & Hardware Rig */}
                <div className="space-y-1.5">
                  <span className="font-bold text-foreground text-xs">Required Hardware &amp; AV Rig</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedEvent.equipmentNeeded.map((eq, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300 text-[11px] font-mono font-semibold"
                      >
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/20 border-t border-border/70 flex justify-end">
                <Button
                  size="sm"
                  onClick={() => setSelectedEvent(null)}
                  className="text-xs font-bold"
                >
                  Close Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
