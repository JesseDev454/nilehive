import { useEffect, useState } from "react";
import { AlertCircle, UserCheck, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { EventsUiError } from "@/lib/events/errors";
import type { AdminEventView } from "@/lib/events/types";

interface AdminManualCheckInModalProps {
  event: AdminEventView | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submitting: boolean;
  error: EventsUiError | null;
  onSubmit: (
    event: AdminEventView,
    payload: { studentId: string; studentName: string },
  ) => Promise<boolean>;
}

export function AdminManualCheckInModal({
  event,
  open,
  onOpenChange,
  submitting,
  error,
  onSubmit,
}: AdminManualCheckInModalProps) {
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setStudentId("");
      setStudentName("");
      setLocalError(null);
    }
  }, [open]);

  if (!event) return null;

  const handleManualCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!studentId.trim()) {
      setLocalError("Student Matric / ID number is required.");
      return;
    }

    const ok = await onSubmit(event, {
      studentId: studentId.trim(),
      studentName: studentName.trim(),
    });
    if (ok) {
      toast.success(`Manually checked in ${studentName.trim() || studentId.trim()}.`);
      setStudentId("");
      setStudentName("");
      onOpenChange(false);
    }
  };

  const shownError = localError || error?.message;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleManualCheckIn} className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <UserCheck className="h-4 w-4" aria-hidden="true" />
              <span>Manual Check-In Fallback</span>
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">Check In Student</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Record verified physical attendance for <strong className="text-foreground">{event.title}</strong> when QR scan is unavailable. OneClub looks up the student by matric ID.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-border/80 bg-muted/20 p-3 text-xs space-y-1">
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Event Target</span>
            <p className="font-semibold text-foreground">
              {event.clubName} • {event.venue}
            </p>
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
                  if (localError) setLocalError(null);
                }}
                className="text-xs h-9 font-mono"
                autoComplete="off"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="manual-student-name" className="text-xs font-semibold">
                Student Full Name (optional confirmation)
              </Label>
              <Input
                id="manual-student-name"
                placeholder="e.g. Amina Yusuf"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            {shownError ? (
              <div
                id="admin-events-checkin-error"
                className="rounded-lg bg-destructive/10 border border-destructive/30 p-2.5 text-[11px] text-destructive flex items-center gap-1.5"
                role="alert"
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{shownError}</span>
              </div>
            ) : null}
          </div>

          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end pt-2 border-t border-border">
            <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-xs h-11">
              Cancel
            </Button>
            <Button type="submit" variant="default" size="sm" disabled={submitting} className="text-xs gap-1.5 h-11">
              <UserPlus className="h-3.5 w-3.5" />
              <span>{submitting ? "Recording..." : "Record Check-In"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
