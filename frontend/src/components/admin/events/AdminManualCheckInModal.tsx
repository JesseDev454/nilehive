import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Search,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { AdminEventRecord, AttendanceRecord } from "@/data/adminEventsData";

interface AdminManualCheckInModalProps {
  event: AdminEventRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckInSuccess: (eventId: string, newAttendee: AttendanceRecord) => void;
}

export function AdminManualCheckInModal({
  event,
  open,
  onOpenChange,
  onCheckInSuccess
}: AdminManualCheckInModalProps) {
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [verificationNote, setVerificationNote] = useState("Physical student ID verified at venue door");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!event) return null;

  const handleManualCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!studentId.trim()) {
      setError("Student Matric / ID number is required.");
      return;
    }

    if (!studentName.trim()) {
      setError("Student full name is required.");
      return;
    }

    // Check if already checked in
    const isAlreadyCheckedIn = event.attendanceRoster.some(
      (a) => a.studentId.toLowerCase() === studentId.trim().toLowerCase()
    );

    if (isAlreadyCheckedIn) {
      setError("This student is already verified and recorded in the attendance roster.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);

      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}`,
        studentId: studentId.trim().toUpperCase(),
        studentName: studentName.trim(),
        studentEmail: studentEmail.trim() || `${studentId.trim().toLowerCase()}@student.nileuniversity.edu.ng`,
        checkedInAt: new Date().toISOString(),
        checkInMethod: "manual_fallback",
        verifiedBy: "Directorate Admin"
      };

      onCheckInSuccess(event.id, newRecord);
      toast.success(`Manually checked in ${studentName.trim()} (${studentId.trim()}).`);

      // Reset form
      setStudentId("");
      setStudentName("");
      setStudentEmail("");
      onOpenChange(false);
    }, 250);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleManualCheckIn} className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <UserCheck className="h-4 w-4" />
              <span>Manual Check-In Fallback</span>
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Check In Student
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Record verified physical attendance for <strong className="text-foreground">{event.title}</strong> when QR scan is unavailable.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-border/80 bg-muted/20 p-3 text-xs space-y-1">
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Event Target</span>
            <p className="font-semibold text-foreground">{event.clubName} • {event.venue}</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <Label htmlFor="manual-student-id" className="text-xs font-semibold">
                Matric / Student ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="manual-student-id"
                placeholder="e.g. NIL/2023/UG/0491"
                value={studentId}
                onChange={(e) => {
                  setStudentId(e.target.value);
                  if (error) setError(null);
                }}
                className="text-xs h-9 font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="manual-student-name" className="text-xs font-semibold">
                Student Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="manual-student-name"
                placeholder="e.g. Amina Yusuf"
                value={studentName}
                onChange={(e) => {
                  setStudentName(e.target.value);
                  if (error) setError(null);
                }}
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="manual-student-email" className="text-xs font-semibold">
                Institutional Email (Optional)
              </Label>
              <Input
                id="manual-student-email"
                placeholder="a.yusuf@student.nileuniversity.edu.ng"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="manual-note" className="text-xs font-semibold">
                Verification Method / Notes
              </Label>
              <Input
                id="manual-note"
                value={verificationNote}
                onChange={(e) => setVerificationNote(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-2.5 text-[11px] text-destructive flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end pt-2 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={isSubmitting}
              className="text-xs gap-1.5 h-9"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>{isSubmitting ? "Recording..." : "Record Check-In"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
