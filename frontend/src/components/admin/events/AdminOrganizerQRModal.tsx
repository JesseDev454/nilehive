import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Printer, QrCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { AdminEventView } from "@/lib/events/types";

interface AdminOrganizerQRModalProps {
  event: AdminEventView | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function checkInAbsoluteUrl(path: string): string {
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

export function AdminOrganizerQRModal({
  event,
  open,
  onOpenChange,
}: AdminOrganizerQRModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    if (!event) {
      setQrDataUrl("");
      return;
    }
    const value = checkInAbsoluteUrl(event.checkInPath);
    void QRCode.toDataURL(value, {
      width: 320,
      margin: 2,
      color: { dark: "#0F172A", light: "#FFFFFF" },
    }).then((url) => {
      setQrDataUrl(url);
    }).catch(() => {
      setQrDataUrl("");
    });
  }, [event]);

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center p-6 space-y-4">
        <DialogHeader className="space-y-1">
          <div className="mx-auto flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Official Event Organizer QR Code</span>
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">{event.title}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Display or project at the venue check-in desk. Students scan this code, sign in, and check in on the event date. OneClub does not store a secret QR token for this event.
          </DialogDescription>
        </DialogHeader>

        <div className="mx-auto rounded-2xl border border-border bg-white p-5 shadow-xs flex flex-col items-center justify-center max-w-[260px]">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`Check-in QR code for ${event.title}. Students must sign in on the event date.`}
              className="h-56 w-56 object-contain rounded-lg"
            />
          ) : (
            <div className="h-56 w-56 flex items-center justify-center bg-muted/40 rounded-lg text-xs text-muted-foreground font-mono">
              Generating check-in QR…
            </div>
          )}
          <span className="mt-2 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            {event.clubName} • Approved event
          </span>
        </div>

        <div className="rounded-xl border border-border/80 bg-muted/20 p-3 text-xs space-y-1 text-left">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground font-medium">Venue:</span>
            <span className="font-semibold text-foreground text-right">{event.venue}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground font-medium">Session Schedule:</span>
            <span className="font-semibold text-foreground text-right">
              {event.eventDate} ({event.endTime ? `${event.startTime} - ${event.endTime}` : event.startTime})
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border/50">
            <span className="text-muted-foreground font-medium">Live Attendance:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {event.attendeesCount === null ? "Open roster" : `${event.attendeesCount} Students Verified`}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs gap-1.5 h-11"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print QR Sign</span>
          </Button>

          <Button type="button" variant="default" size="sm" onClick={() => onOpenChange(false)} className="text-xs h-11">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
