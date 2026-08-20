import { useState, useId } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  FileCheck,
  FileText,
  HelpCircle,
  Info,
  MapPin,
  QrCode,
  RefreshCw,
  School,
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
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/Dialog";
import { TextField } from "@/shared/components/TextField";
import { Banner } from "@/shared/components/Banner";
import { Skeleton } from "@/shared/components/Skeleton";

// Types
export interface NextJoinedEvent {
  id: string;
  clubName: string;
  clubCode: string;
  title: string;
  description: string;
  dateLabel: string;
  timeLabel: string;
  location: string;
  isToday: boolean;
  rsvpStatus: "going" | "maybe" | "decline" | "none";
  checkedIn: boolean;
}

export interface DuesAttentionRecord {
  id: string;
  clubName: string;
  clubCode: string;
  amount: number;
  dueDate: string;
  status: "unpaid" | "submitted" | "paid";
  proofRef?: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface LatestAnnouncement {
  id: string;
  title: string;
  sender: string;
  senderRole: string;
  timestamp: string;
  summary: string;
  content: string;
  category: "Notice" | "Event Reminder" | "Dues Advisory";
}

// Initial Mock Data (Deterministic)
const INITIAL_NEXT_EVENT: NextJoinedEvent = {
  id: "evt-today-ngd",
  clubName: "Nile Google Developers",
  clubCode: "NGD",
  title: "Google Cloud & Flutter Hands-on Bootcamp",
  description: "Live development session covering cross-platform state management and Firebase deployment in Computer Lab 4.",
  dateLabel: "Today",
  timeLabel: "2:00 PM – 5:00 PM",
  location: "Computer Lab 4, Block C",
  isToday: true,
  rsvpStatus: "going",
  checkedIn: false
};

const INITIAL_DUES_ATTENTION: DuesAttentionRecord = {
  id: "due-ngd-2025",
  clubName: "Nile Google Developers",
  clubCode: "NGD",
  amount: 10000,
  dueDate: "November 30, 2025",
  status: "unpaid",
  bankName: "Providus Bank",
  accountNumber: "1305861314",
  accountName: "Nile University Student Clubs"
};

const INITIAL_ANNOUNCEMENT: LatestAnnouncement = {
  id: "ann-nov-01",
  title: "First Semester Club Activity Schedules & Lab Access Hours",
  sender: "Student Affairs & Club Services",
  senderRole: "Dean of Student Affairs",
  timestamp: "2 hours ago",
  summary: "Official guidance regarding booking campus lecture halls, engineering laboratories, and student center venues for approved club workshops.",
  content: "All officially registered student organizations are reminded that evening hall bookings must be submitted at least 48 hours in advance via OneClub. Equipment reservations for projectors, sound systems, and robotics toolkits can be collected from Building A, Room 102 with an active club advisor authorization.",
  category: "Notice"
};

export function StudentHomeWorkspace() {
  const { profile } = useAuth();
  const studentName = profile?.full_name || "Amina Bello";
  const studentId = profile?.student_id || "2021/0458";
  const department = profile?.department || "Computer Engineering";

  // Data States
  const [nextEvent, setNextEvent] = useState<NextJoinedEvent | null>(INITIAL_NEXT_EVENT);
  const [duesAttention, setDuesAttention] = useState<DuesAttentionRecord | null>(INITIAL_DUES_ATTENTION);
  const [announcement, setAnnouncement] = useState<LatestAnnouncement | null>(INITIAL_ANNOUNCEMENT);

  // Workflow Dialog States
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [duesModalOpen, setDuesModalOpen] = useState(false);
  const [announcementDetailOpen, setAnnouncementDetailOpen] = useState(false);

  // Check-In Form State
  const [pinCode, setPinCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [checkInSubmitting, setCheckInSubmitting] = useState(false);

  // Dues Proof Form State
  const [senderAccountName, setSenderAccountName] = useState("");
  const [bankTxnRef, setBankTxnRef] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [duesSubmitting, setDuesSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // UI Feedback States
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sectionError, setSectionError] = useState<string | null>(null);

  // Handlers
  const handleRefresh = () => {
    setIsRefreshing(true);
    setSectionError(null);
    setTimeout(() => {
      setIsRefreshing(false);
      setToastMessage("Workspace data refreshed with Nile University records.");
    }, 500);
  };

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      if (nextEvent) {
        setNextEvent({ ...nextEvent, checkedIn: true });
        setCheckInModalOpen(false);
        setToastMessage("Attendance verified! You are checked in to the Google Developer Bootcamp.");
      }
    }, 1000);
  };

  const handlePinCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinCode.trim()) return;

    setCheckInSubmitting(true);
    setTimeout(() => {
      setCheckInSubmitting(false);
      if (nextEvent) {
        setNextEvent({ ...nextEvent, checkedIn: true });
        setCheckInModalOpen(false);
        setPinCode("");
        setToastMessage(`Checked in with PIN "${pinCode}". Attendance logged successfully.`);
      }
    }, 600);
  };

  const handleRsvpChange = (status: "going" | "maybe" | "decline") => {
    if (!nextEvent) return;
    setNextEvent({ ...nextEvent, rsvpStatus: status });
    setToastMessage(`RSVP updated to "${status.toUpperCase()}" for ${nextEvent.title}.`);
  };

  const handleSubmitDuesProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderAccountName.trim() || !bankTxnRef.trim()) {
      setFormError("Please provide both sender account name and transaction reference ID.");
      return;
    }

    setDuesSubmitting(true);
    setFormError(null);

    setTimeout(() => {
      setDuesSubmitting(false);
      if (duesAttention) {
        setDuesAttention({
          ...duesAttention,
          status: "submitted",
          proofRef: bankTxnRef
        });
      }
      setDuesModalOpen(false);
      setToastMessage("Payment receipt submitted. Club Services accounting will verify your transfer.");
    }, 700);
  };

  return (
    <main className="space-y-6 max-w-4xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in" aria-labelledby="student-home-heading">
      {/* Visual Cue & Role Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              id="student-role-indicator"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-primary uppercase"
            >
              STUDENT/HOME
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              {studentId} &bull; {department}
            </span>
          </div>
          <h1 id="student-home-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Student Overview
          </h1>
        </div>

        {/* Refresh & SSO Status */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            aria-label="Refresh student workspace"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-card hover:bg-muted/50 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors focus:outline-hidden focus:ring-2 focus:ring-primary"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Syncing..." : "Sync"}</span>
          </button>

          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-xl px-2.5 py-1.5 border border-emerald-500/20">
            <ShieldCheck className="h-3.5 w-3.5" />
            SSO Active
          </span>
        </div>
      </header>

      {/* Global Feedback Banner */}
      {toastMessage && (
        <Banner
          variant="success"
          title="Status Update"
          description={toastMessage}
          onDismiss={() => setToastMessage(null)}
        />
      )}

      {/* Dominant Primary Next Step (Callout) */}
      {nextEvent && !nextEvent.checkedIn && nextEvent.isToday ? (
        <section aria-labelledby="primary-action-heading" className="rounded-2xl border-2 border-primary/40 bg-primary/5 p-4 sm:p-5 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span id="primary-action-heading" className="text-xs font-bold uppercase tracking-wider text-primary">
                  Dominant Next Step &bull; Workshop Check-In
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {nextEvent.title}
              </h2>
              <p className="text-xs text-muted-foreground">
                Happening today at {nextEvent.timeLabel} in {nextEvent.location}.
              </p>
            </div>

            <Button
              onClick={() => setCheckInModalOpen(true)}
              size="md"
              className="gap-2 shrink-0 font-bold shadow-xs"
            >
              <QrCode className="h-4 w-4" />
              <span>Scan Event QR Code</span>
            </Button>
          </div>
        </section>
      ) : duesAttention && duesAttention.status === "unpaid" ? (
        <section aria-labelledby="primary-action-heading" className="rounded-2xl border-2 border-amber-500/40 bg-amber-500/5 p-4 sm:p-5 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span id="primary-action-heading" className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                Dominant Next Step &bull; Dues Proof Required
              </span>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                Submit session dues proof for {duesAttention.clubName}
              </h2>
              <p className="text-xs text-muted-foreground">
                ₦{duesAttention.amount.toLocaleString()} due by {duesAttention.dueDate} to maintain active status.
              </p>
            </div>

            <Button
              onClick={() => setDuesModalOpen(true)}
              size="md"
              className="gap-2 shrink-0 font-bold shadow-xs bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Upload className="h-4 w-4" />
              <span>Submit Payment Proof</span>
            </Button>
          </div>
        </section>
      ) : null}

      {/* THREE SECTIONS ONLY (Constraint adherence) */}
      <div className="space-y-5">
        {/* SECTION 1: Next Event from a Joined Club */}
        <section aria-labelledby="section-event-heading">
          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <h2 id="section-event-heading" className="text-sm font-bold text-foreground uppercase tracking-wide">
                    Next Event (Joined Club)
                  </h2>
                </div>
                {nextEvent && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-mono font-bold text-primary">
                    {nextEvent.clubCode}
                  </span>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {nextEvent ? (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-semibold text-primary block">
                        {nextEvent.clubName}
                      </span>
                      <h3 className="text-base font-bold text-foreground mt-0.5">
                        {nextEvent.title}
                      </h3>
                    </div>

                    <div>
                      {nextEvent.checkedIn ? (
                        <StatusBadge variant="success" dot label="Checked In" />
                      ) : nextEvent.isToday ? (
                        <span className="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 text-[11px] font-bold">
                          Happening Today
                        </span>
                      ) : (
                        <StatusBadge variant="default" label="Upcoming" />
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {nextEvent.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl border border-border/60 bg-muted/20 text-xs text-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{nextEvent.dateLabel}, {nextEvent.timeLabel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{nextEvent.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>RSVP: <strong className="capitalize">{nextEvent.rsvpStatus}</strong></span>
                    </div>
                  </div>

                  {/* Attendance Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Your Attendance:</span>
                      <button
                        type="button"
                        onClick={() => handleRsvpChange("going")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          nextEvent.rsvpStatus === "going"
                            ? "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold"
                            : "border-border bg-card text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        Going
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRsvpChange("maybe")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          nextEvent.rsvpStatus === "maybe"
                            ? "border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold"
                            : "border-border bg-card text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        Maybe
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRsvpChange("decline")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          nextEvent.rsvpStatus === "decline"
                            ? "border-destructive bg-destructive/15 text-destructive font-bold"
                            : "border-border bg-card text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        Decline
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {!nextEvent.checkedIn && (
                        <Button
                          size="sm"
                          onClick={() => setCheckInModalOpen(true)}
                          className="text-xs gap-1.5"
                        >
                          <QrCode className="h-3.5 w-3.5" />
                          <span>Check In Now</span>
                        </Button>
                      )}
                      <Button asChild variant="outline" size="sm" className="text-xs">
                        <Link to="/events">
                          View Club Schedule
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center space-y-2">
                  <p className="text-xs font-bold text-foreground">No upcoming events scheduled</p>
                  <p className="text-[11px] text-muted-foreground">
                    Your enrolled clubs have no pending meetings for this week.
                  </p>
                  <Button asChild variant="outline" size="sm" className="text-xs mt-2">
                    <Link to="/events">Browse Events</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* SECTION 2: Dues / Proof that Needs Attention */}
        <section aria-labelledby="section-dues-heading">
          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <h2 id="section-dues-heading" className="text-sm font-bold text-foreground uppercase tracking-wide">
                    Dues &amp; Payment Proofs
                  </h2>
                </div>
                {duesAttention && (
                  <StatusBadge
                    variant={duesAttention.status === "paid" ? "success" : duesAttention.status === "submitted" ? "warning" : "error"}
                    dot
                    label={duesAttention.status === "paid" ? "Paid & Verified" : duesAttention.status === "submitted" ? "Proof Under Review" : "Payment Due"}
                  />
                )}
              </div>
            </CardHeader>

            <CardContent>
              {duesAttention ? (
                <div className="space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/60 bg-muted/20">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{duesAttention.clubName}</span>
                        <span className="rounded bg-muted px-1.5 py-0.2 text-[10px] font-mono text-muted-foreground">
                          {duesAttention.clubCode}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Session dues &bull; <strong>₦{duesAttention.amount.toLocaleString()}</strong> &bull; Due: {duesAttention.dueDate}
                      </p>
                      {duesAttention.proofRef && (
                        <p className="text-[11px] font-mono text-muted-foreground flex items-center gap-1 pt-0.5">
                          <FileCheck className="h-3 w-3 text-primary" />
                          Submitted Ref: {duesAttention.proofRef}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      {duesAttention.status === "unpaid" ? (
                        <Button
                          size="sm"
                          onClick={() => setDuesModalOpen(true)}
                          className="gap-1.5 text-xs"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          <span>Submit Transfer Proof</span>
                        </Button>
                      ) : duesAttention.status === "submitted" ? (
                        <span className="text-xs text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          In Verification Queue
                        </span>
                      ) : (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Good Standing
                        </span>
                      )}

                      <Button asChild variant="outline" size="sm" className="text-xs">
                        <Link to="/dues">
                          All Dues
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Official Nile Providus Bank Account: <strong>{duesAttention.accountNumber}</strong> ({duesAttention.accountName}). Direct online card charges are disabled to protect student accounts.
                  </p>
                </div>
              ) : (
                <div className="py-6 text-center space-y-1">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  <p className="text-xs font-bold text-foreground">All Dues Cleared</p>
                  <p className="text-[11px] text-muted-foreground">
                    You have no outstanding dues or pending payment proofs.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* SECTION 3: Latest Announcement */}
        <section aria-labelledby="section-announcement-heading">
          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  <h2 id="section-announcement-heading" className="text-sm font-bold text-foreground uppercase tracking-wide">
                    Latest Campus Announcement
                  </h2>
                </div>
                {announcement && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    {announcement.category}
                  </span>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {announcement ? (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <h3 className="text-sm font-bold text-foreground">
                      {announcement.title}
                    </h3>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                      {announcement.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {announcement.summary}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                    <span className="text-muted-foreground">
                      From: <strong>{announcement.sender}</strong> ({announcement.senderRole})
                    </span>
                    <button
                      type="button"
                      onClick={() => setAnnouncementDetailOpen(true)}
                      className="font-bold text-primary hover:underline"
                    >
                      Read Full Notice &rarr;
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center space-y-1">
                  <p className="text-xs font-bold text-foreground">No recent announcements</p>
                  <p className="text-[11px] text-muted-foreground">
                    Check back later for university-wide bulletins.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      {/* DIALOG 1: Scan Event QR / Check-In Modal */}
      <Dialog open={checkInModalOpen} onOpenChange={setCheckInModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              Event Check-In Scanner
            </DialogTitle>
            <DialogDescription>
              {nextEvent?.title} &bull; {nextEvent?.location}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="relative aspect-video w-full rounded-2xl border-2 border-dashed border-primary/40 bg-muted/40 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
              {isScanning ? (
                <div className="space-y-3 flex flex-col items-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="text-xs font-bold text-foreground">Processing QR attendance token...</p>
                </div>
              ) : (
                <div className="space-y-3 flex flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Camera className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Optical Scanner Ready</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Aim your camera at the workshop display screen or sign-in stand
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleSimulateScan}
                    className="gap-1.5 text-xs"
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    Scan QR Displayed at Event
                  </Button>
                </div>
              )}
            </div>

            {/* Manual PIN Fallback */}
            <form onSubmit={handlePinCheckIn} className="space-y-3 pt-2 border-t border-border/60">
              <TextField
                label="Or Enter 6-digit Check-In PIN from Venue"
                placeholder="e.g. NGD-802"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
              />
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                disabled={!pinCode.trim() || checkInSubmitting}
                className="w-full text-xs"
              >
                {checkInSubmitting ? "Validating..." : "Validate PIN & Record Attendance"}
              </Button>
            </form>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCheckInModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: Submit Dues Proof Modal */}
      <Dialog open={duesModalOpen} onOpenChange={setDuesModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Payment Proof</DialogTitle>
            <DialogDescription>
              {duesAttention?.clubName} &bull; ₦{duesAttention?.amount.toLocaleString()} session dues
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitDuesProof} className="space-y-4">
            {formError && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                {formError}
              </div>
            )}

            <div className="p-3 rounded-xl border border-border bg-muted/20 text-xs space-y-1">
              <p className="font-semibold text-foreground">Official Bank Transfer Destination:</p>
              <p className="text-muted-foreground">
                Providus Bank &bull; <strong>1305861314</strong> &bull; Nile University Student Clubs
              </p>
            </div>

            <TextField
              label="Sender Bank Account Name *"
              placeholder="e.g. Amina Bello"
              value={senderAccountName}
              onChange={(e) => setSenderAccountName(e.target.value)}
              required
            />

            <TextField
              label="Transaction Session / Reference ID *"
              placeholder="e.g. 00001398248912"
              value={bankTxnRef}
              onChange={(e) => setBankTxnRef(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                Upload Receipt Screenshot / PDF *
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                required
                onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-muted-foreground file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDuesModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={duesSubmitting || !senderAccountName || !bankTxnRef}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                <span>{duesSubmitting ? "Uploading..." : "Upload & Submit Proof"}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 3: Read Full Announcement Modal */}
      <Dialog open={announcementDetailOpen} onOpenChange={setAnnouncementDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                {announcement?.category}
              </span>
              <span className="text-xs text-muted-foreground">{announcement?.timestamp}</span>
            </div>
            <DialogTitle className="text-lg mt-1">{announcement?.title}</DialogTitle>
            <DialogDescription>
              Issued by {announcement?.sender} ({announcement?.senderRole})
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 text-xs leading-relaxed text-foreground whitespace-pre-line">
            {announcement?.content}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAnnouncementDetailOpen(false)}
            >
              Dismiss
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
