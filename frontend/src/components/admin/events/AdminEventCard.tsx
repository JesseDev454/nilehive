import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  MapPin,
  QrCode,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getEventLifecycle, type EventLifecycle } from "@/lib/events/lifecycle";
import type { AdminEventView } from "@/lib/events/types";

interface AdminEventCardProps {
  event: AdminEventView;
  onInspect: (event: AdminEventView) => void;
  onDisplayQR: (event: AdminEventView) => void;
  onManualCheckIn: (event: AdminEventView) => void;
}

function LifecycleBadge({ lifecycle }: { lifecycle: EventLifecycle }) {
  switch (lifecycle) {
    case "happening_today":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" aria-hidden="true" />
          Happening Today
        </span>
      );
    case "upcoming":
      return (
        <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 dark:text-blue-300">
          Upcoming
        </span>
      );
    case "past":
      return (
        <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
          Past Event
        </span>
      );
  }
}

function countLabel(value: number | null, fallback: string): string {
  return value === null ? fallback : String(value);
}

export function AdminEventCard({
  event,
  onInspect,
  onDisplayQR,
  onManualCheckIn,
}: AdminEventCardProps) {
  const lifecycle = getEventLifecycle(event.eventDate);
  const isPast = lifecycle === "past";
  const capacity = event.capacity;
  const rsvpPercentage =
    event.rsvpsCount !== null && capacity && capacity > 0
      ? Math.min(Math.round((event.rsvpsCount / capacity) * 100), 100)
      : null;

  return (
    <article
      id={`event-card-${event.id}`}
      aria-labelledby={`event-title-${event.id}`}
      className={`group flex flex-col justify-between rounded-2xl border bg-card p-5 shadow-2xs transition-all duration-180 hover:border-primary/40 ${
        lifecycle === "happening_today"
          ? "border-amber-500/40 ring-1 ring-amber-500/20 bg-amber-500/2"
          : "border-border"
      }`}
    >
      <div className="space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-md bg-secondary px-2.5 py-0.5 text-[10px] font-bold text-foreground">
            {event.clubName}
          </span>
          <LifecycleBadge lifecycle={lifecycle} />
        </div>

        <div>
          <h2 id={`event-title-${event.id}`} className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
            {event.title}
          </h2>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
            {event.description || "No description was stored for this approved event."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/30 p-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 truncate">
            <Calendar className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
            <span className="font-medium text-foreground">{event.eventDate}</span>
          </div>

          <div className="flex items-center gap-1.5 truncate">
            <Clock className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
            <span>{event.endTime ? `${event.startTime} - ${event.endTime}` : event.startTime}</span>
          </div>

          <div className="col-span-2 flex items-center gap-1.5 truncate pt-0.5">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        <div className="space-y-1.5 pt-1 text-xs">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">
              Confirmed RSVPs:{" "}
              <strong className="text-foreground">
                {countLabel(event.rsvpsCount, "Open roster")}
              </strong>
              {capacity !== null ? ` / ${capacity}` : ""}
            </span>
            <span className="font-semibold text-foreground">
              {event.attendeesCount === null
                ? "Attendance in roster"
                : `${event.attendeesCount} Verified Checked-In`}
            </span>
          </div>

          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden" aria-hidden="true">
            <div
              className={`h-full transition-all duration-300 ${
                lifecycle === "happening_today" ? "bg-amber-500" : "bg-primary"
              }`}
              style={{ width: `${rsvpPercentage ?? 0}%` }}
            />
          </div>
        </div>

        {isPast && (
          <div className="pt-1">
            {event.postEventReport.status === "submitted" ? (
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>Post-Event Report Submitted</span>
              </div>
            ) : event.postEventReport.status === "unavailable" ? (
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-lg border border-border">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>Post-event report status unavailable</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>No post-event report on file</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-border/70 flex flex-wrap items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onInspect(event)}
          aria-label={`Open roster and details for ${event.title}`}
          className="h-11 gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Roster &amp; Details</span>
        </Button>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onManualCheckIn(event)}
            aria-label={`Manual check-in for ${event.title}`}
            className="h-11 gap-1 text-xs hover:border-primary hover:text-primary"
            title="Manual check-in fallback for students without QR scan"
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Manual Check-In</span>
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => onDisplayQR(event)}
            aria-label={`Show organizer check-in QR for ${event.title}`}
            className={`h-11 gap-1.5 text-xs font-semibold ${
              lifecycle === "happening_today"
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "bg-primary text-primary-foreground"
            }`}
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>Organizer QR</span>
          </Button>
        </div>
      </div>
    </article>
  );
}
