import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Camera,
  CameraOff,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  HelpCircle,
  Info,
  KeyRound,
  MapPin,
  QrCode,
  RefreshCw,
  School,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  WifiOff,
  X,
  XCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/shared/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/Card";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/Dialog";
import { TextField } from "@/shared/components/TextField";
import { Banner } from "@/shared/components/Banner";

export type CheckInState =
  | "ready"
  | "permission_prompt"
  | "permission_denied"
  | "scanning"
  | "submitting"
  | "checked_in"
  | "already_checked_in"
  | "invalid_qr"
  | "not_today"
  | "not_member"
  | "offline";

export interface ActiveTodaySession {
  eventId: string;
  clubId: string;
  clubName: string;
  clubCode: string;
  title: string;
  venue: string;
  room: string;
  timeWindow: string;
  facilitator: string;
  isEnrolled: boolean;
  isToday: boolean;
  attendanceLogged: boolean;
  loggedTimestamp?: string;
  validPin: string;
}

const ACTIVE_TODAY_SESSION: ActiveTodaySession = {
  eventId: "evt-today-ngd-01",
  clubId: "club-8",
  clubName: "Nile Google Developers",
  clubCode: "NGD",
  title: "Google Cloud & Flutter Hands-on Bootcamp",
  venue: "Engineering Complex, Computer Lab 4",
  room: "Block C, 2nd Floor, Room 204",
  timeWindow: "2:00 PM – 5:00 PM (Today)",
  facilitator: "Mustapha Mohammed (President) & Dr. Aisha Bello (Advisor)",
  isEnrolled: true,
  isToday: true,
  attendanceLogged: false,
  validPin: "NGD-802"
};

export function StudentQrCheckInWorkspace() {
  const { profile } = useAuth();
  const studentName = profile?.full_name || "Amina Bello";
  const studentId = profile?.student_id || "2021/0458";
  const department = profile?.department || "Computer Engineering";

  // Core Scanner State
  const [session, setSession] = useState<ActiveTodaySession>(ACTIVE_TODAY_SESSION);
  const [scannerState, setScannerState] = useState<CheckInState>("ready");
  const [manualPin, setManualPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [scanAttempts, setScanAttempts] = useState(0);

  // Network Simulation State
  const [isOnline, setIsOnline] = useState(true);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setScannerState("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Optical Camera Start
  const handleStartScanner = () => {
    if (!isOnline) {
      setScannerState("offline");
      return;
    }
    setScannerState("scanning");
  };

  // Optical Scan Simulation (Scanning the organizer's QR on screen)
  const handleScanSampleQr = (type: "valid" | "already" | "invalid" | "not_today" | "not_member") => {
    if (!isOnline) {
      setScannerState("offline");
      return;
    }

    setScannerState("submitting");

    setTimeout(() => {
      if (type === "valid") {
        const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setSession((prev) => ({
          ...prev,
          attendanceLogged: true,
          loggedTimestamp: `Today at ${timeStr}`
        }));
        setScannerState("checked_in");
      } else if (type === "already") {
        setScannerState("already_checked_in");
      } else if (type === "invalid") {
        setScannerState("invalid_qr");
      } else if (type === "not_today") {
        setScannerState("not_today");
      } else if (type === "not_member") {
        setScannerState("not_member");
      }
    }, 800);
  };

  // Manual PIN Submission
  const handleManualPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPin.trim()) return;

    if (!isOnline) {
      setScannerState("offline");
      return;
    }

    setPinError(null);
    setScannerState("submitting");

    setTimeout(() => {
      const cleaned = manualPin.trim().toUpperCase();
      if (cleaned === session.validPin) {
        if (session.attendanceLogged) {
          setScannerState("already_checked_in");
        } else {
          const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          setSession((prev) => ({
            ...prev,
            attendanceLogged: true,
            loggedTimestamp: `Today at ${timeStr} (PIN Verified)`
          }));
          setScannerState("checked_in");
          setManualPin("");
        }
      } else if (cleaned === "INVALID" || cleaned === "000000") {
        setScannerState("invalid_qr");
      } else if (cleaned === "NOT-TODAY") {
        setScannerState("not_today");
      } else if (cleaned === "NOT-MEMBER") {
        setScannerState("not_member");
      } else {
        setPinError(`Invalid session PIN "${manualPin}". Please check the code projected on the hall screen.`);
        setScannerState("ready");
      }
    }, 600);
  };

  // Reset to Ready
  const handleResetScanner = () => {
    setScannerState("ready");
    setPinError(null);
  };

  return (
    <main className="space-y-6 max-w-4xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in" aria-labelledby="qr-checkin-heading">
      {/* Header & Visual Cue */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              id="student-qr-indicator"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-primary uppercase"
            >
              STUDENT/QR-CheckIn
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Scan Organizer QR &bull; {studentId}
            </span>
          </div>
          <h1 id="qr-checkin-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Event Attendance Scanner
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Scan the official session QR code projected on the venue screen to log your verified attendance for today&apos;s workshop.
          </p>
        </div>

        {/* Student Verification Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-xl px-2.5 py-1.5 border border-emerald-500/20">
            <ShieldCheck className="h-3.5 w-3.5" />
            SSO Stamped ({studentName.split(" ")[0]})
          </span>
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link to="/events">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Events Schedule
            </Link>
          </Button>
        </div>
      </header>

      {/* Target Active Session Summary */}
      <section aria-labelledby="target-session-heading" className="rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span id="target-session-heading" className="text-xs font-bold uppercase tracking-wider text-primary">
                Active Session &bull; {session.clubName}
              </span>
              <span className="rounded bg-primary/20 px-1.5 py-0.2 text-[10px] font-mono font-bold text-primary">
                {session.clubCode}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              {session.title}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-0.5">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                {session.timeWindow}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                {session.venue} ({session.room})
              </span>
            </div>
          </div>

          <div className="shrink-0">
            {session.attendanceLogged ? (
              <StatusBadge variant="success" dot label="Attendance Logged" />
            ) : (
              <StatusBadge variant="warning" dot label="Check-In Open" />
            )}
          </div>
        </div>
      </section>

      {/* Primary Optical Scanner & State Engine */}
      <section aria-label="QR optical scanner viewport" className="space-y-4">
        {/* STATE: CHECKED IN (SUCCESS) */}
        {scannerState === "checked_in" && (
          <Card className="border-emerald-500/40 bg-emerald-500/5 text-center p-6 sm:p-8 space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                Attendance Successfully Verified!
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your presence at <strong>{session.title}</strong> has been stamped with student ID <strong>{studentId}</strong> on {session.loggedTimestamp}.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-card border border-border/80 max-w-sm mx-auto text-xs text-left space-y-1">
              <div className="flex justify-between text-muted-foreground">
                <span>Student Name:</span>
                <span className="font-semibold text-foreground">{studentName}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Organizing Club:</span>
                <span className="font-semibold text-foreground">{session.clubName}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Nile Transcript Credit:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">1 Activity Unit Logged</span>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <Button asChild size="sm" className="text-xs font-semibold">
                <Link to="/events">Return to Events</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleResetScanner} className="text-xs">
                Scan Another Session
              </Button>
            </div>
          </Card>
        )}

        {/* STATE: ALREADY CHECKED IN */}
        {scannerState === "already_checked_in" && (
          <Card className="border-blue-500/40 bg-blue-500/5 text-center p-6 sm:p-8 space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/20 text-primary mx-auto">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h2 className="text-lg font-bold text-foreground">
                Already Checked In
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You have already logged your verified attendance for today&apos;s session of <strong>{session.title}</strong> ({session.loggedTimestamp || "Recorded earlier"}). Duplicate submissions are not permitted.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Button asChild size="sm" className="text-xs">
                <Link to="/events">View Schedule</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleResetScanner} className="text-xs">
                Dismiss
              </Button>
            </div>
          </Card>
        )}

        {/* STATE: INVALID QR CODE */}
        {scannerState === "invalid_qr" && (
          <Card className="border-destructive/40 bg-destructive/5 text-center p-6 sm:p-8 space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/20 text-destructive mx-auto">
              <XCircle className="h-7 w-7" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h2 className="text-lg font-bold text-foreground">
                Invalid or Expired QR Code
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The scanned QR token is not a recognized Nile OneClub attendance token, or the session security key has expired. Please rescan the live projected code.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Button size="sm" onClick={() => setScannerState("scanning")} className="text-xs gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Try Scanning Again</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleResetScanner} className="text-xs">
                Enter PIN Manually
              </Button>
            </div>
          </Card>
        )}

        {/* STATE: NOT TODAY */}
        {scannerState === "not_today" && (
          <Card className="border-amber-500/40 bg-amber-500/5 text-center p-6 sm:p-8 space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 mx-auto">
              <Clock className="h-7 w-7" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h2 className="text-lg font-bold text-foreground">
                Event Not Scheduled For Today
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Check-in is strictly opened on the day of the event during the authorized session window. You cannot record attendance in advance or for concluded events.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Button asChild size="sm" variant="outline" className="text-xs">
                <Link to="/events">Check Event Date</Link>
              </Button>
              <Button size="sm" onClick={handleResetScanner} className="text-xs">
                Back to Scanner
              </Button>
            </div>
          </Card>
        )}

        {/* STATE: NOT A MEMBER */}
        {scannerState === "not_member" && (
          <Card className="border-destructive/40 bg-destructive/5 text-center p-6 sm:p-8 space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/20 text-destructive mx-auto">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h2 className="text-lg font-bold text-foreground">
                Not a Member of This Club
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Attendance check-in for this session requires active ordinary membership in the organizing club. Please submit a membership request first.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Button asChild size="sm" className="text-xs gap-1.5">
                <Link to="/membership?tab=discover">Discover &amp; Join Club</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleResetScanner} className="text-xs">
                Dismiss
              </Button>
            </div>
          </Card>
        )}

        {/* STATE: OFFLINE */}
        {scannerState === "offline" && (
          <Card className="border-border bg-card text-center p-6 sm:p-8 space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground mx-auto">
              <WifiOff className="h-7 w-7" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h2 className="text-lg font-bold text-foreground">
                Network Connection Offline
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Attendance validation requires a live network connection to the Nile Campus One authentication server. Please check your Wi-Fi or mobile data.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Button
                size="sm"
                onClick={() => {
                  if (navigator.onLine) {
                    setIsOnline(true);
                    setScannerState("ready");
                  }
                }}
                className="text-xs gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry Connection</span>
              </Button>
            </div>
          </Card>
        )}

        {/* STATE: SCANNING & READY VIEWPORT */}
        {(scannerState === "ready" || scannerState === "scanning" || scannerState === "submitting") && (
          <Card className="border-border/80 text-left overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/70">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground">
                    Optical Camera Viewfinder
                  </CardTitle>
                </div>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {scannerState === "scanning" ? "Camera Active" : "Standby"}
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-6">
              {/* Instructions Callout */}
              <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 text-xs space-y-1 text-foreground">
                <div className="flex items-center gap-1.5 font-bold text-primary">
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  <span>How to check in:</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed pl-5">
                  1. The workshop organizer displays a unique QR code on the projector or registration desk.
                  <br />
                  2. Click &ldquo;Open Camera Scanner&rdquo; and align the code within the viewfinder.
                  <br />
                  3. If camera access is unavailable or lighting is poor, enter the 6-digit PIN below.
                </p>
              </div>

              {/* Optical Viewfinder Box */}
              <div className="relative aspect-video sm:aspect-21/9 w-full rounded-2xl border-2 border-dashed border-primary/50 bg-muted/30 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                {scannerState === "submitting" ? (
                  <div className="space-y-3 flex flex-col items-center animate-fade-in">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-xs font-bold text-foreground">Validating token with Nile University SSO...</p>
                  </div>
                ) : scannerState === "scanning" ? (
                  <div className="space-y-4 flex flex-col items-center w-full max-w-sm animate-fade-in">
                    {/* Live Scanner Simulation Overlay */}
                    <div className="relative h-32 w-32 rounded-xl border-2 border-primary bg-primary/5 flex items-center justify-center">
                      <div className="absolute inset-x-0 top-0 h-0.5 bg-primary animate-bounce shadow-xs" />
                      <QrCode className="h-12 w-12 text-primary/40" />
                    </div>

                    <div className="space-y-1 text-center">
                      <p className="text-xs font-bold text-foreground">Scanning for session QR code...</p>
                      <p className="text-[11px] text-muted-foreground">
                        Keep your phone steady in front of the screen.
                      </p>
                    </div>

                    {/* Simulation buttons for all required states */}
                    <div className="pt-2 flex flex-wrap justify-center gap-1.5 text-[10px]">
                      <button
                        type="button"
                        onClick={() => handleScanSampleQr("valid")}
                        className="px-2 py-1 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30 hover:bg-emerald-500/25"
                      >
                        Simulate Valid QR
                      </button>
                      <button
                        type="button"
                        onClick={() => handleScanSampleQr("already")}
                        className="px-2 py-1 rounded bg-blue-500/15 text-blue-700 dark:text-blue-300 font-bold border border-blue-500/30 hover:bg-blue-500/25"
                      >
                        Simulate Already Scanned
                      </button>
                      <button
                        type="button"
                        onClick={() => handleScanSampleQr("invalid")}
                        className="px-2 py-1 rounded bg-destructive/15 text-destructive font-bold border border-destructive/30 hover:bg-destructive/25"
                      >
                        Simulate Invalid QR
                      </button>
                      <button
                        type="button"
                        onClick={() => handleScanSampleQr("not_today")}
                        className="px-2 py-1 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30 hover:bg-amber-500/25"
                      >
                        Simulate Not Today
                      </button>
                      <button
                        type="button"
                        onClick={() => handleScanSampleQr("not_member")}
                        className="px-2 py-1 rounded bg-purple-500/15 text-purple-700 dark:text-purple-300 font-bold border border-purple-500/30 hover:bg-purple-500/25"
                      >
                        Simulate Non-Member
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setScannerState("ready")}
                      className="text-xs text-muted-foreground hover:text-foreground underline pt-1"
                    >
                      Cancel Scanning
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 flex flex-col items-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Camera className="h-7 w-7" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-foreground">Optical Camera Ready</p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        Tap the button below to initiate optical recognition using your device camera.
                      </p>
                    </div>
                    <Button
                      onClick={handleStartScanner}
                      size="md"
                      className="gap-2 font-bold shadow-xs text-xs mt-1"
                    >
                      <Camera className="h-4 w-4" />
                      <span>Open Camera Scanner</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* Alternative: 6-Digit Venue PIN Entry */}
              <div className="space-y-3 pt-4 border-t border-border/70">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Manual Session PIN Fallback
                  </h3>
                </div>

                {pinError && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{pinError}</span>
                  </div>
                )}

                <form onSubmit={handleManualPinSubmit} className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <TextField
                      label="6-Digit PIN Projected at Event"
                      placeholder="e.g. NGD-802"
                      value={manualPin}
                      onChange={(e) => setManualPin(e.target.value)}
                    />
                  </div>
                  <div className="sm:self-end">
                    <Button
                      type="submit"
                      variant="secondary"
                      disabled={!manualPin.trim() || scannerState === "submitting"}
                      className="w-full sm:w-auto text-xs"
                    >
                      Validate PIN
                    </Button>
                  </div>
                </form>

                <p className="text-[11px] text-muted-foreground">
                  Today&apos;s test PIN for <em>{session.title}</em> is <strong>NGD-802</strong>.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Institutional Privacy Boundary Notice */}
      <footer className="p-4 rounded-2xl border border-border/80 bg-muted/10 text-xs text-muted-foreground space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Institutional Privacy &amp; Attendance Protection</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Students scan event QR codes to verify attendance. Personal student QR codes, peer attendance rosters, and organizer broadcast keys are restricted to faculty advisors and verified club executives.
        </p>
      </footer>
    </main>
  );
}
