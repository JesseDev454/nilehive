import { useState, useEffect } from "react";
import QRCode from "qrcode";
import {
  Calendar,
  Clock,
  Download,
  MapPin,
  Maximize2,
  Printer,
  QrCode,
  Sparkles,
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
import { toast } from "sonner";
import type { AdminEventRecord } from "@/data/adminEventsData";

interface AdminOrganizerQRModalProps {
  event: AdminEventRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminOrganizerQRModal({
  event,
  open,
  onOpenChange
}: AdminOrganizerQRModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    if (event) {
      // Generate QR Code data URL
      QRCode.toDataURL(
        event.qrCodePayload,
        {
          width: 320,
          margin: 2,
          color: {
            dark: "#0F172A",
            light: "#FFFFFF"
          }
        },
        (err, url) => {
          if (!err && url) {
            setQrDataUrl(url);
          }
        }
      );
    }
  }, [event]);

  if (!event) return null;

  const handlePrint = () => {
    window.print();
    toast.success("Dispatched to campus print dialogue.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center p-6 space-y-4">
        <DialogHeader className="space-y-1">
          <div className="mx-auto flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <QrCode className="h-3.5 w-3.5" />
            <span>Official Event Organizer QR Code</span>
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            {event.title}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Display or project at venue check-in desk. Students scan with their camera to record attendance.
          </p>
        </DialogHeader>

        {/* QR Code Card */}
        <div className="mx-auto rounded-2xl border border-border bg-white p-5 shadow-xs flex flex-col items-center justify-center max-w-[260px]">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Organizer Event QR Code"
              className="h-56 w-56 object-contain rounded-lg"
            />
          ) : (
            <div className="h-56 w-56 flex items-center justify-center bg-muted/40 rounded-lg text-xs text-muted-foreground font-mono">
              Generating secure QR...
            </div>
          )}
          <span className="mt-2 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            {event.clubName} • Verified Nile Protocol
          </span>
        </div>

        {/* Live Logistics Summary */}
        <div className="rounded-xl border border-border/80 bg-muted/20 p-3 text-xs space-y-1 text-left">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Venue:</span>
            <span className="font-semibold text-foreground">{event.venue}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Session Schedule:</span>
            <span className="font-semibold text-foreground">{event.eventDate} ({event.startTime} - {event.endTime})</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border/50">
            <span className="text-muted-foreground font-medium">Live Attendance:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {event.attendeesCount} Students Verified
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="text-xs gap-1.5 h-9"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print QR Sign</span>
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-9"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
