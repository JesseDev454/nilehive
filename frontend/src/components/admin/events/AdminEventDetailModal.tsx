import { useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileCheck2,
  FileText,
  Mail,
  MapPin,
  QrCode,
  ShieldCheck,
  UserCheck,
  Users,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  type AdminEventRecord,
  computeEventLifecycle
} from "@/data/adminEventsData";

interface AdminEventDetailModalProps {
  event: AdminEventRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDisplayQR: (event: AdminEventRecord) => void;
  onManualCheckIn: (event: AdminEventRecord) => void;
}

export function AdminEventDetailModal({
  event,
  open,
  onOpenChange,
  onDisplayQR,
  onManualCheckIn
}: AdminEventDetailModalProps) {
  if (!event) return null;

  const lifecycle = computeEventLifecycle(event.eventDate);
  const isPast = lifecycle === "past";

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
          <DialogTitle className="text-xl font-bold text-foreground">
            {event.title}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Organized by <strong className="text-foreground">{event.organizerName}</strong> ({event.organizerEmail})
          </p>
        </DialogHeader>

        <div className="space-y-5 text-xs pt-1">
          {/* Logistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Event Date</span>
              <span className="font-semibold text-foreground mt-0.5 block">{event.eventDate}</span>
            </div>
            <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Time Window</span>
              <span className="font-semibold text-foreground mt-0.5 block">{event.startTime} - {event.endTime}</span>
            </div>
            <div className="rounded-xl border border-border/80 bg-muted/20 p-3 col-span-2 sm:col-span-1">
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Campus Venue</span>
              <span className="font-semibold text-foreground mt-0.5 block truncate">{event.venue}</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1 rounded-xl border border-border/80 bg-muted/10 p-3.5">
            <span className="font-semibold text-foreground block">Event Scope &amp; Objectives</span>
            <p className="text-muted-foreground leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* RSVP & Capacity Stats */}
          <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" />
                <span>Attendance &amp; RSVP Engagement</span>
              </span>
              <span className="font-mono font-bold text-foreground">
                {event.attendeesCount} / {event.rsvpsCount} Checked In
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/50 text-[11px] text-center">
              <div>
                <span className="text-muted-foreground block text-[10px]">Venue Capacity</span>
                <span className="font-bold text-foreground font-mono">{event.capacity} seats</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Confirmed RSVPs</span>
                <span className="font-bold text-foreground font-mono">{event.rsvpsCount}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Actual Attendance</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{event.attendeesCount}</span>
              </div>
            </div>
          </div>

          {/* ATTENDANCE ROSTER (Verified checked-in students) */}
          <div className="space-y-2 rounded-xl border border-border/80 bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <UserCheck className="h-4 w-4 text-primary" />
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
                className="h-7 text-[11px] gap-1"
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
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-medium text-[10px] uppercase">
                      <th className="py-2 pr-2">Student Name</th>
                      <th className="py-2 px-2">Matric ID</th>
                      <th className="py-2 px-2">Timestamp</th>
                      <th className="py-2 pl-2 text-right">Method</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {event.attendanceRoster.map((att) => (
                      <tr key={att.id} className="hover:bg-muted/20">
                        <td className="py-2 pr-2 font-medium text-foreground">{att.studentName}</td>
                        <td className="py-2 px-2 font-mono text-muted-foreground text-[11px]">{att.studentId}</td>
                        <td className="py-2 px-2 text-muted-foreground text-[11px]">
                          {new Date(att.checkedInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="py-2 pl-2 text-right">
                          {att.checkInMethod === "qr_scan" ? (
                            <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                              QR Self-Scan
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

          {/* POST-EVENT REPORT STATUS */}
          <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <FileCheck2 className="h-4 w-4 text-primary" />
                <span>Post-Event Accountability Report</span>
              </span>
              {event.postEventReport.status === "submitted" ? (
                <Badge className="bg-emerald-600 text-white text-[10px]">Submitted &amp; Audited</Badge>
              ) : isPast ? (
                <Badge variant="destructive" className="text-[10px]">Compliance Alert: Missing</Badge>
              ) : (
                <Badge variant="outline" className="text-[10px]">Pending (Event Upcoming)</Badge>
              )}
            </div>

            {event.postEventReport.status === "submitted" ? (
              <div className="space-y-1.5 pt-1 border-t border-border/50 text-[11px] text-muted-foreground">
                <p>
                  <strong>Submission Date:</strong> {new Date(event.postEventReport.submittedAt!).toLocaleDateString()}
                </p>
                <p>
                  <strong>Verified Attendance:</strong> {event.postEventReport.verifiedAttendees} students • <strong>Budget Reconciled:</strong> ₦{event.postEventReport.budgetReconciled?.toLocaleString()}
                </p>
                <p className="italic bg-background/50 p-2.5 rounded border border-border/50 text-foreground">
                  "{event.postEventReport.summary}"
                </p>
              </div>
            ) : isPast ? (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 pt-1">
                The club executive has not submitted the mandatory post-event attendance and budget reconciliation report. Directorate notice dispatched.
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground pt-1">
                Post-event report submission window opens immediately after the scheduled session completes.
              </p>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-9"
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
                className="text-xs h-9 gap-1"
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
                className="text-xs h-9 gap-1.5 bg-primary text-primary-foreground"
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
