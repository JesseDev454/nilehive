import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Eye,
  FileEdit,
  FilePlus2,
  FileText,
  HelpCircle,
  Megaphone,
  QrCode,
  School,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/shared/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/Card";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/Dialog";

interface AttentionItem {
  id: string;
  type: "returned_proposal" | "unfinished_draft" | "upcoming_approved_event" | "report_due";
  title: string;
  subtitle: string;
  badge: { label: string; tone: "warning" | "default" | "success" | "destructive" };
  actionLabel: string;
  actionUrl: string;
  dateInfo: string;
  details?: string;
}

export function PresidentHomeWorkspace() {
  const { profile } = useAuth();
  const presidentName = profile?.full_name || "Farouk Al-Mansoor";
  const clubName = profile?.club_name || "Nile Google Developers";
  const clubCode = "NGD";

  const [selectedQrEvent, setSelectedQrEvent] = useState<{
    id: string;
    title: string;
    date: string;
    venue: string;
    eventCode: string;
  } | null>(null);

  // Home attention ONLY: returned proposal, unfinished draft, upcoming approved event, report due.
  // NEVER membership requests or payment proofs.
  const attentionItems: AttentionItem[] = [
    {
      id: "att-1",
      type: "returned_proposal",
      title: "AI Agent Hackathon 2025",
      subtitle: "Proposal returned by Staff Advisor (Dr. Aminu Galadima)",
      badge: { label: "Revision Requested", tone: "warning" },
      actionLabel: "Revise & Resubmit",
      actionUrl: "/proposals/prop-102",
      dateInfo: "Returned yesterday",
      details: "Feedback: 'Please specify the lab safety protocol for external hardware devices and include the catering quotation.'"
    },
    {
      id: "att-2",
      type: "unfinished_draft",
      title: "Google Cloud TechSprint & Certification Clinic",
      subtitle: "Unfinished draft saved in pipeline",
      badge: { label: "Draft in Progress", tone: "default" },
      actionLabel: "Continue Writing",
      actionUrl: "/proposals/prop-104",
      dateInfo: "Updated 3 days ago",
      details: "Step 3 of 5 completed. Budget details are next."
    },
    {
      id: "att-3",
      type: "upcoming_approved_event",
      title: "Nile DevFest & Career Keynote 2025",
      subtitle: "Approved campus event starting this Saturday",
      badge: { label: "Approved Event", tone: "success" },
      actionLabel: "Organizer QR & Attendance",
      actionUrl: "/events",
      dateInfo: "Saturday, Oct 25 &bull; 10:00 AM",
      details: "Venue: Main Campus Auditorium &bull; 142 RSVPs registered."
    },
    {
      id: "att-4",
      type: "report_due",
      title: "Flutter Forward Hands-on Lab",
      subtitle: "Post-event report due for concluded event",
      badge: { label: "Report Overdue", tone: "destructive" },
      actionLabel: "Submit Event Report",
      actionUrl: "/archive",
      dateInfo: "Concluded Oct 18",
      details: "88 verified attendees recorded via QR scanner. Student Affairs closure form pending."
    }
  ];

  return (
    <main className="space-y-6 max-w-6xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in" aria-labelledby="president-home-heading">
      {/* Header & Visual Cue */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              id="president-header-badge"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-primary uppercase"
            >
              President
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Assigned Club: {clubCode}
            </span>
          </div>
          <h1 id="president-home-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {clubName}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Create proposals, prepare approved events, and keep your club updated.
          </p>
        </div>

        {/* Primary Dominant Action */}
        <Button asChild size="sm" className="font-bold gap-1.5 self-start sm:self-auto text-xs shadow-xs">
          <Link to="/proposals/new">
            <FilePlus2 className="h-4 w-4" />
            <span>Draft New Proposal</span>
          </Link>
        </Button>
      </header>

      {/* ASSIGNED CLUB IDENTITY & OVERVIEW CARD */}
      <section aria-labelledby="club-overview-heading">
        <Card className="border-border/80 bg-gradient-to-r from-primary/5 via-card to-card p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-base shadow-xs">
                {clubCode}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 id="club-overview-heading" className="text-base font-bold text-foreground">
                    {clubName}
                  </h2>
                  <span className="rounded bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold font-mono">
                    Official club
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-full px-2 py-0.5">
                    <ShieldCheck className="h-3 w-3" />
                    President
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Club President: <strong className="text-foreground">{presidentName}</strong> &bull; Staff Advisor: Prof. Halima Yusuf
                </p>
              </div>
            </div>

            {/* Quick stats banner (Strictly no dues or join requests) */}
            <div className="flex items-center gap-2 sm:gap-4 divide-x divide-border/60 bg-muted/30 p-2.5 rounded-xl border border-border/60 text-xs self-start lg:self-auto">
              <div className="px-2 text-center">
                <div className="text-sm font-bold text-foreground">168</div>
                <div className="text-[10px] text-muted-foreground">Verified Members</div>
              </div>
              <div className="px-3 text-center">
                <div className="text-sm font-bold text-primary">4</div>
                <div className="text-[10px] text-muted-foreground">Approved Events</div>
              </div>
              <div className="px-3 text-center">
                <div className="text-sm font-bold text-amber-600 dark:text-amber-400">1</div>
                <div className="text-[10px] text-muted-foreground">Revision Needed</div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* HOME ATTENTION ONLY SECTION */}
      <section aria-labelledby="attention-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 id="attention-heading" className="text-sm font-bold text-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span>Needs your attention ({attentionItems.length})</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Continue the club work that needs you today.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {attentionItems.map((item) => {
            return (
              <Card
                key={item.id}
                className="border-border/80 hover:border-primary/50 transition-all duration-180 p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={item.badge.tone} label={item.badge.label} />
                      <span className="text-[11px] text-muted-foreground font-mono" dangerouslySetInnerHTML={{ __html: item.dateInfo }} />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">
                      {item.title}
                    </h3>
                  </div>
                </div>

                {item.details && (
                  <p className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border/50 leading-relaxed">
                    {item.details}
                  </p>
                )}

                <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    {item.subtitle}
                  </span>

                  {item.type === "upcoming_approved_event" ? (
                    <Button
                      size="sm"
                      onClick={() =>
                        setSelectedQrEvent({
                          id: "ev-101",
                          title: item.title,
                          date: "Saturday, Oct 25, 2025 &bull; 10:00 AM",
                          venue: "Main Campus Auditorium",
                          eventCode: "DEV-8891"
                        })
                      }
                      className="text-xs font-bold gap-1.5 h-8"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      <span>{item.actionLabel}</span>
                    </Button>
                  ) : (
                    <Button asChild size="sm" variant={item.type === "returned_proposal" ? "default" : "outline"} className="text-xs font-bold gap-1.5 h-8">
                      <Link to={item.actionUrl}>
                        <span>{item.actionLabel}</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* QUICK WORKSPACE TILES */}
      <section aria-labelledby="modules-heading" className="space-y-3">
        <h2 id="modules-heading" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Club tools
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Proposals */}
          <Link to="/proposals" className="group block focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-2xl">
            <Card hoverable className="h-full border-border/80 hover:border-primary/50 transition-all p-4 space-y-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <FileText className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Proposals</h3>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs text-muted-foreground">Draft, edit returned, and submit event requests.</p>
              </div>
            </Card>
          </Link>

          {/* Events & Attendance */}
          <Link to="/events" className="group block focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-2xl">
            <Card hoverable className="h-full border-border/80 hover:border-primary/50 transition-all p-4 space-y-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Approved Events</h3>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs text-muted-foreground">Organizer QR and live attendee check-in.</p>
              </div>
            </Card>
          </Link>

          {/* Read-only Member Directory */}
          <Link to="/members" className="group block focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-2xl">
            <Card hoverable className="h-full border-border/80 hover:border-primary/50 transition-all p-4 space-y-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Users className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Members (Read-Only)</h3>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs text-muted-foreground">Verified club roster and student contacts.</p>
              </div>
            </Card>
          </Link>

          {/* Post-Event Reports */}
          <Link to="/archive" className="group block focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-2xl">
            <Card hoverable className="h-full border-border/80 hover:border-primary/50 transition-all p-4 space-y-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <ClipboardCheck className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Event Reports</h3>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs text-muted-foreground">Official closure documentation and metrics.</p>
              </div>
            </Card>
          </Link>
        </div>
      </section>

      {/* RECENT PRESIDENTIAL ACTIVITY LIST */}
      <section aria-labelledby="activity-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="activity-heading" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Recent Club Activity
          </h2>
          <span className="text-[11px] text-muted-foreground">
            Proposals &bull; Events &bull; Reports
          </span>
        </div>

        <Card className="border-border/80 divide-y divide-border/60">
          {[
            {
              id: "act-1",
              title: "Proposal Returned for Clarification",
              description: "Staff Advisor returned 'AI Agent Hackathon 2025' with feedback on lab safety protocols.",
              time: "Yesterday, 3:45 PM",
              icon: AlertTriangle,
              iconColor: "text-amber-500 bg-amber-500/10"
            },
            {
              id: "act-2",
              title: "Proposal Approved by Student Affairs",
              description: "'Nile DevFest & Career Keynote 2025' proposal cleared all approval stages and scheduled for Oct 25.",
              time: "2 days ago",
              icon: CheckCircle2,
              iconColor: "text-emerald-500 bg-emerald-500/10"
            },
            {
              id: "act-3",
              title: "Club Broadcast Dispatched",
              description: "Announcement 'DevFest Volunteer Orientation' sent to 168 enrolled club members.",
              time: "4 days ago",
              icon: Megaphone,
              iconColor: "text-primary bg-primary/10"
            },
            {
              id: "act-4",
              title: "Post-Event Attendance Reconciled",
              description: "88 attendees verified via Organizer QR scanner for 'Flutter Forward Hands-on Lab'.",
              time: "Oct 18",
              icon: ClipboardCheck,
              iconColor: "text-sky-500 bg-sky-500/10"
            }
          ].map((act) => {
            const Icon = act.icon;
            return (
              <div key={act.id} className="p-3.5 flex items-start gap-3 text-xs">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${act.iconColor}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-foreground truncate">{act.title}</h3>
                    <span className="text-[10px] text-muted-foreground shrink-0 font-mono">{act.time}</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed line-clamp-1">{act.description}</p>
                </div>
              </div>
            );
          })}
        </Card>
      </section>

      {/* ORGANIZER QR DIALOG (PRESIDENT TOOL) */}
      <Dialog
        open={Boolean(selectedQrEvent)}
        onOpenChange={(open) => !open && setSelectedQrEvent(null)}
      >
        <DialogContent maxWidth="sm">
          {selectedQrEvent && (
            <div className="space-y-4 text-center">
              <DialogHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mx-auto mb-1">
                  <QrCode className="h-5 w-5" />
                </div>
                <DialogTitle className="text-foreground">
                  {selectedQrEvent.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Display this QR code at the event entrance for student camera check-in.
                </DialogDescription>
              </DialogHeader>

              {/* QR Code Presentation */}
              <div className="p-5 bg-card rounded-2xl border-2 border-dashed border-primary/40 inline-block mx-auto shadow-xs">
                <div className="h-44 w-44 bg-white p-3 rounded-xl flex flex-col items-center justify-center border border-border/60 mx-auto">
                  <div className="grid grid-cols-4 gap-1.5 w-full h-full p-2 bg-neutral-900 rounded-lg">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-xs ${
                          i % 3 === 0 || i % 5 === 0 ? "bg-white" : "bg-neutral-900"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-3 font-mono font-bold text-sm tracking-wider text-foreground">
                  PASSCODE: {selectedQrEvent.eventCode}
                </div>
              </div>

              <div className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border/60">
                <span>{selectedQrEvent.venue}</span>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedQrEvent(null)}
                  className="w-full sm:w-1/2 text-xs"
                >
                  Close Code
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="w-full sm:w-1/2 text-xs font-bold gap-1"
                >
                  <Link to="/events">
                    <span>View Roster</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
