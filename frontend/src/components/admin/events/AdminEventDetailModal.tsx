import { AlertCircle, FileCheck2, Loader2, QrCode, UserCheck, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getEventLifecycle } from "@/lib/events/lifecycle";
import type { EventsUiError } from "@/lib/events/errors";
import type { AdminEventView } from "@/lib/events/types";

interface AdminEventDetailModalProps {
  event: AdminEventView | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDisplayQR: (event: AdminEventView) => void;
  onManualCheckIn: (event: AdminEventView) => void;
  detailStatus: "idle" | "loading" | "ready" | "error";
  detailError: EventsUiError | null;
  onRetry: () => void;
}

export function AdminEventDetailModal({
  event,
  open,
  onOpenChange,
  onDisplayQR,
  onManualCheckIn,
  detailStatus,
  detailError,
  onRetry,
}: AdminEventDetailModalProps) {
  if (!event) return null;

  const lifecycle = getEventLifecycle(event.eventDate);
  const isPast = lifecycle === "past";
  const goingRsvps = event.rsvpRoster.filter((row) => row.status === "going");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-md bg-secondary px-2.5 py-0.5 text-[10px] font-bold text-foreground">
              {event.clubName}
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">
              Proposal Ref: {event.proposalId}
            </span>
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">{event.title}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {event.organizerName
              ? `Organized by ${event.organizerName}${event.organizerEmail ? ` (${event.organizerEmail})` : ""}`
              : "Organizer identity is not stored on the approved-event record."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 text-xs pt-1">
          {detailStatus === "loading" ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center" role="status" aria-live="polite">
              <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
              <p className="mt-2 text-muted-foreground">Loading RSVP and attendance roster…</p>
            </div>
          ) : null}

          {detailStatus === "error" ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4" role="alert">
              <p className="font-medium text-destructive">{detailError?.message || "This event could not be loaded."}</p>
              {detailError?.kind !== "not_found" ? (
                <Button type="button" variant="outline" size="sm" className="mt-3 h-11 text-xs" onClick={onRetry}>
                  Retry
                </Button>
              ) : null}
            </div>
          ) : null}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Event Date</span>
              <span className="font-semibold text-foreground mt-0.5 block">{event.eventDate}</span>
            </div>
            <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Time Window</span>
              <span className="font-semibold text-foreground mt-0.5 block">
                {event.endTime ? `${event.startTime} - ${event.endTime}` : event.startTime}
              </span>
            </div>
            <div className="rounded-xl border border-border/80 bg-muted/20 p-3 col-span-2 sm:col-span-1">
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Campus Venue</span>
              <span className="font-semibold text-foreground mt-0.5 block truncate">{event.venue}</span>
            </div>
          </div>

          <div className="space-y-1 rounded-xl border border-border/80 bg-muted/10 p-3.5">
            <span className="font-semibold text-foreground block">Event Scope &amp; Objectives</span>
            <p className="text-muted-foreground leading-relaxed">
              {event.description || "No description was stored for this approved event."}
            </p>
          </div>

          <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" aria-hidden="true" />
                <span>Attendance &amp; RSVP Engagement</span>
              </span>
              <span className="font-mono font-bold text-foreground">
                {event.attendeesCount === null || event.rsvpsCount === null
                  ? "Open roster for totals"
                  : `${event.attendeesCount} / ${event.rsvpsCount} Checked In`}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/50 text-[11px] text-center">
              <div>
                <span className="text-muted-foreground block text-[10px]">Venue Capacity</span>
                <span className="font-bold text-foreground font-mono">
                  {event.capacity === null ? "Not provided" : `${event.capacity} seats`}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Confirmed RSVPs</span>
                <span className="font-bold text-foreground font-mono">
                  {event.rsvpsCount === null ? "—" : event.rsvpsCount}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Actual Attendance</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {event.attendeesCount === null ? "—" : event.attendeesCount}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-border/80 bg-card p-4">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Users className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>RSVP roster ({event.engagementLoaded ? goingRsvps.length : "…"} going)</span>
            </div>
            {!event.engagementLoaded ? (
              <p className="text-muted-foreground">RSVP names load with the event roster.</p>
            ) : goingRsvps.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground rounded-lg border border-dashed border-border/70 text-xs">
                No student RSVPs recorded for this approved event.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <caption className="sr-only">Students who RSVP’d going</caption>
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-medium text-[10px] uppercase">
                      <th scope="col" className="py-2 pr-2">Student Name</th>
                      <th scope="col" className="py-2 px-2">Matric ID</th>
                      <th scope="col" className="py-2 pl-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {goingRsvps.map((row) => (
                      <tr key={row.id}>
                        <td className="py-2 pr-2 font-medium text-foreground">{row.studentName}</td>
                        <td className="py-2 px-2 font-mono text-muted-foreground text-[11px]">{row.studentId}</td>
                        <td className="py-2 pl-2 text-right capitalize">{row.status.replace("_", " ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="space-y-2 rounded-xl border border-border/80 bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <UserCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                <span>Verified Attendance Roster ({event.attendanceRoster.length})</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onManualCheckIn(event);
                }}
                className="h-11 text-[11px] gap-1"
              >
                <span>+ Manual Entry</span>
              </Button>
            </div>

            {event.attendanceRoster.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground rounded-lg border border-dashed border-border/70 text-xs">
                No students recorded in the attendance roster yet. Present Organizer QR at door to initiate check-ins.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <caption className="sr-only">Verified attendance roster</caption>
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-medium text-[10px] uppercase">
                      <th scope="col" className="py-2 pr-2">Student Name</th>
                      <th scope="col" className="py-2 px-2">Matric ID</th>
                      <th scope="col" className="py-2 px-2">Timestamp</th>
                      <th scope="col" className="py-2 pl-2 text-right">Method</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {event.attendanceRoster.map((att) => (
                      <tr key={att.id} className="hover:bg-muted/20">
                        <td className="py-2 pr-2 font-medium text-foreground">{att.studentName}</td>
                        <td className="py-2 px-2 font-mono text-muted-foreground text-[11px]">{att.studentId}</td>
                        <td className="py-2 px-2 text-muted-foreground text-[11px]">
                          {att.checkedInAt
                            ? new Date(att.checkedInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "Not provided"}
                        </td>
                        <td className="py-2 pl-2 text-right">
                          {att.checkInMethod === "qr_scan" ? (
                            <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                              Self check-in
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-amber-600 dark:text-amber-400 border-amber-500/30">
                              Manual Admin Check
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <FileCheck2 className="h-4 w-4 text-primary" aria-hidden="true" />
                <span>Post-Event Accountability Report</span>
              </span>
              {event.postEventReport.status === "submitted" ? (
                <Badge className="bg-emerald-600 text-white text-[10px]">Submitted</Badge>
              ) : event.postEventReport.status === "unavailable" ? (
                <Badge variant="outline" className="text-[10px]">Unavailable</Badge>
              ) : isPast ? (
                <Badge variant="outline" className="text-[10px]">Not on file</Badge>
              ) : (
                <Badge variant="outline" className="text-[10px]">Pending (Event Upcoming)</Badge>
              )}
            </div>

            {event.postEventReport.status === "submitted" ? (
              <div className="space-y-1.5 pt-1 border-t border-border/50 text-[11px] text-muted-foreground">
                {event.postEventReport.submittedAt ? (
                  <p>
                    <strong>Submission Date:</strong> {new Date(event.postEventReport.submittedAt).toLocaleDateString()}
                  </p>
                ) : null}
                <p>
                  {event.postEventReport.verifiedAttendees !== null && event.postEventReport.verifiedAttendees !== undefined ? (
                    <>
                      <strong>Reported Attendance:</strong> {event.postEventReport.verifiedAttendees} students
                    </>
                  ) : null}
                  {event.postEventReport.budgetReconciled !== null && event.postEventReport.budgetReconciled !== undefined ? (
                    <>
                      {" "}
                      • <strong>Budget used:</strong> ₦{event.postEventReport.budgetReconciled.toLocaleString()}
                    </>
                  ) : null}
                </p>
                {event.postEventReport.summary ? (
                  <p className="italic bg-background/50 p-2.5 rounded border border-border/50 text-foreground">
                    {event.postEventReport.summary}
                  </p>
                ) : null}
              </div>
            ) : event.postEventReport.status === "unavailable" ? (
              <p className="text-[11px] text-muted-foreground pt-1">
                OneClub could not load post-event reports for this event.
              </p>
            ) : isPast ? (
              <p className="text-[11px] text-muted-foreground pt-1">
                No president-submitted post-event report is on file for this approved event.
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground pt-1">
                Post-event report submission is available to the club president after the session.
              </p>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground">
            Events cannot be created, edited, cancelled, or postponed from this workspace. They are approved proposals.
          </p>

          <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-11"
            >
              Close
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onManualCheckIn(event);
                }}
                className="text-xs h-11 gap-1"
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>Manual Check-In</span>
              </Button>

              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onDisplayQR(event);
                }}
                className="text-xs h-11 gap-1.5 bg-primary text-primary-foreground"
              >
                <QrCode className="h-3.5 w-3.5" />
                <span>Organizer QR Code</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
