import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import QRCode from "qrcode";
import { Bell, CalendarDays, CheckCircle2, Clock, Copy, Loader2, MapPin, MessageSquare, Printer, QrCode, Share2, Users } from "lucide-react";
import { NeoLoadingState, NeoPageHeader } from "@/components/NeoBrutal";
import { DataPagination } from "@/components/DataPagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRole } from "@/contexts/RoleContext";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { getEventLifecycleLabel, isPastEvent } from "@/lib/eventLifecycle";
import { getEventCheckInPath, getEventCheckInUrl } from "@/lib/eventCheckIn";
import { canViewProposalDetails } from "@/lib/roleAccess";
import { buildAppUrl, shareOrCopy } from "@/lib/share";
import {
  getAnnouncements,
  ApiClientError,
  createFeedback,
  getClubs,
  getPublicClubs,
  getApprovedEvents,
  getEventEngagement,
  getEventReminders,
  getMyMembershipRequests,
  submitEventSelfCheckIn,
  submitEventAttendance,
  submitEventRsvp,
  type AnnouncementRecord,
  type ApprovedEventRecord,
  type EventReminderRecord,
  type EventRsvpRecord,
  type MembershipRequestRecord
} from "@/lib/api";
import { DEFAULT_PAGE_SIZE, emptyPaginatedResponse } from "@/lib/pagination";
import { actionError, actionSuccess } from "@/lib/notify";

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError || error instanceof Error) {
    return error.message;
  }

  return "Unable to load events right now.";
}

function getDateLabel(value?: string | null) {
  return value ? new Date(value).toLocaleDateString() : "-";
}

function getTimeLabel(value?: string | null) {
  return value ? value.slice(0, 5) : "Time TBC";
}

function getEventDetailUrl(event: ApprovedEventRecord) {
  return buildAppUrl(`/events?event=${encodeURIComponent(event.proposal_id)}`);
}

function getEventShareText(event: ApprovedEventRecord, clubName: string) {
  const dateTime = `${getDateLabel(event.event_date)} at ${getTimeLabel(event.event_time)}`;
  return `${clubName} has an event: ${event.title} on ${dateTime}. Join on Campus One.`;
}

function shareEventInvite(event: ApprovedEventRecord, clubName: string) {
  void shareOrCopy({
    title: `${event.title} - ${clubName}`,
    text: getEventShareText(event, clubName),
    url: getEventDetailUrl(event),
    successTitle: "Event invite ready",
    fallbackTitle: "Event invite copied"
  });
}

function isEventThisWeek(event: ApprovedEventRecord) {
  const eventDate = new Date(`${event.event_date}T00:00:00`);

  if (Number.isNaN(eventDate.getTime())) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 7);

  return eventDate >= today && eventDate <= weekEnd;
}

function getEventRequirementText(event: ApprovedEventRecord) {
  if (event.number_of_participants) {
    return `${event.number_of_participants} expected participant(s). RSVP early so organizers can plan.`;
  }

  if (event.can_rsvp) {
    return "RSVP is open for this event.";
  }

  if (event.event_lifecycle === "happening_today") {
    return "Check-in is available on the event date when allowed by Club Services.";
  }

  return "No special event requirements have been published.";
}

function getCheckInAvailabilityLabel(event: ApprovedEventRecord, attended?: boolean) {
  if (attended) {
    return "Checked in";
  }

  if (event.event_lifecycle === "happening_today") {
    return "Check-in open";
  }

  if (event.event_lifecycle === "past") {
    return "Check-in closed";
  }

  return "Opens on event day";
}

function RsvpBadge({ status }: { status?: string | null }) {
  if (!status) {
    return <Badge variant="outline">No RSVP</Badge>;
  }

  const className = {
    going: "bg-success/15 text-success hover:bg-success/15",
    interested: "bg-primary/15 text-primary hover:bg-primary/15",
    not_going: "bg-muted text-muted-foreground hover:bg-muted",
    cancelled: "bg-destructive/15 text-destructive hover:bg-destructive/15"
  }[status] || "bg-muted text-muted-foreground hover:bg-muted";

  return <Badge className={`${className} capitalize`}>{status.replace("_", " ")}</Badge>;
}

function EventQrDialog({
  event,
  open,
  onOpenChange
}: {
  event: ApprovedEventRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const checkInUrl = getEventCheckInUrl(event.proposal_id);

  useEffect(() => {
    let isMounted = true;

    if (!open) {
      return () => {
        isMounted = false;
      };
    }

    setIsGenerating(true);
    setQrCodeUrl("");

    void QRCode.toDataURL(checkInUrl, {
      errorCorrectionLevel: "M",
      margin: 1,
      scale: 10,
      width: 360
    })
      .then((value) => {
        if (!isMounted) {
          return;
        }

        setQrCodeUrl(value);
      })
      .catch((error) => {
        actionError("Could not prepare event QR", error, "Please try again.");
      })
      .finally(() => {
        if (isMounted) {
          setIsGenerating(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [checkInUrl, open]);

  async function copyCheckInLink() {
    try {
      await navigator.clipboard.writeText(checkInUrl);
      actionSuccess("Check-in link copied", "You can paste it into a message or display workflow.");
    } catch (error) {
      actionError("Could not copy check-in link", error, "Please copy the link manually.");
    }
  }

  function printQrSheet() {
    if (!qrCodeUrl) {
      return;
    }

    if (typeof document === "undefined") {
      actionError("Could not prepare print view", undefined, "Please try again.");
      return;
    }
    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.visibility = "hidden";

    const cleanup = () => {
      window.setTimeout(() => {
        iframe.remove();
      }, 150);
    };

    document.body.appendChild(iframe);
    const printDocument = iframe.contentWindow?.document;

    if (!printDocument || !iframe.contentWindow) {
      cleanup();
      actionError("Could not prepare print view", undefined, "Please try again.");
      return;
    }

    const printMarkup = `<!doctype html>
<html>
  <head>
    <title>${event.title} check-in QR</title>
    <meta charset="utf-8" />
    <style>
      body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
      .sheet { max-width: 720px; margin: 0 auto; text-align: center; }
      .eyebrow { letter-spacing: 0.18em; text-transform: uppercase; font-size: 12px; font-weight: 700; }
      h1 { font-size: 34px; margin: 12px 0; }
      p { font-size: 16px; line-height: 1.5; }
      img { width: 320px; height: 320px; margin: 24px auto; display: block; }
      .meta { margin-top: 8px; font-size: 14px; color: #444; }
      .link { margin-top: 16px; font-size: 13px; word-break: break-all; color: #444; }
    </style>
  </head>
  <body>
    <div class="sheet">
      <p class="eyebrow">Club Services Event Check-In</p>
      <h1>${event.title}</h1>
      <p>Students should sign in to Club Services and scan this QR on the event date to record attendance.</p>
      <img src="${qrCodeUrl}" alt="QR code for ${event.title}" />
      <p class="meta">${getDateLabel(event.event_date)} - ${getTimeLabel(event.event_time)} - ${event.location || "Venue TBC"}</p>
      <p class="link">${checkInUrl}</p>
    </div>
    <script>
      (function () {
        const image = document.querySelector("img");
        const startPrint = function () {
          window.setTimeout(function () {
            window.focus();
            window.print();
          }, 120);
        };

        if (!image || image.complete) {
          startPrint();
          return;
        }

        image.addEventListener("load", startPrint, { once: true });
        image.addEventListener("error", startPrint, { once: true });
      })();
    </script>
  </body>
</html>`;

    iframe.onload = () => {
      iframe.contentWindow?.addEventListener("afterprint", cleanup, { once: true });
      window.setTimeout(cleanup, 5000);
    };

    printDocument.open();
    printDocument.write(printMarkup);
    printDocument.close();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Event Check-In QR</DialogTitle>
          <DialogDescription>
            Display or print this QR so eligible students can scan it on the event date and record attendance instantly.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="nh-card-soft space-y-2 p-4 text-sm">
            <p className="text-lg font-black uppercase">{event.title}</p>
            <p className="text-muted-foreground">
              {getDateLabel(event.event_date)} - {getTimeLabel(event.event_time)} - {event.location || "Venue TBC"}
            </p>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Students can only use this QR on the event date.
            </p>
          </div>
          <div className="flex min-h-[24rem] items-center justify-center border-2 border-dashed border-foreground/40 bg-muted/30 p-4">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Preparing QR code...</span>
              </div>
            ) : qrCodeUrl ? (
              <img src={qrCodeUrl} alt={`QR code for ${event.title}`} className="w-full max-w-[20rem] bg-white p-3" />
            ) : (
              <div className="text-center text-sm text-muted-foreground">
                <QrCode className="mx-auto mb-3 h-8 w-8" />
                <p>We could not prepare the QR yet.</p>
              </div>
            )}
          </div>
          <div className="rounded-lg border border-foreground/20 bg-background p-3 text-xs text-muted-foreground">
            {checkInUrl}
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={copyCheckInLink}>
            <Copy className="h-4 w-4" />
            Copy Link
          </Button>
          <Button type="button" onClick={printQrSheet} disabled={!qrCodeUrl}>
            <Printer className="h-4 w-4" />
            Print QR
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EventEngagementPanel({ event }: { event: ApprovedEventRecord }) {
  const { role } = useRole();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState("5");
  const [showQrDialog, setShowQrDialog] = useState(false);
  const isStudent = role === "student";
  const canManageAttendance = ["admin", "president"].includes(role);
  const {
    data: engagement,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["event-engagement", event.proposal_id],
    queryFn: () => getEventEngagement(event.proposal_id),
    retry: false
  });
  const rsvpMutation = useMutation({
    mutationFn: (status: EventRsvpRecord["status"]) =>
      submitEventRsvp(event.proposal_id, { status }),
    onSuccess: async () => {
      actionSuccess("RSVP updated", "Your event response has been saved.");
      await queryClient.invalidateQueries({ queryKey: ["event-engagement", event.proposal_id] });
    },
    onError: (mutationError) => {
      actionError("Could not update RSVP", mutationError, getErrorMessage(mutationError));
    }
  });
  const attendanceMutation = useMutation({
    mutationFn: (userId: string) =>
      submitEventAttendance(event.proposal_id, {
        user_id: userId,
        attended: true
      }),
    onSuccess: async () => {
      actionSuccess("Attendance marked", "Attendance has been saved for this event.");
      await queryClient.invalidateQueries({ queryKey: ["event-engagement", event.proposal_id] });
    },
    onError: (mutationError) => {
      actionError("Could not mark attendance", mutationError, getErrorMessage(mutationError));
    }
  });
  const feedbackMutation = useMutation({
    mutationFn: () =>
      createFeedback({
        club_id: event.club_id,
        proposal_id: event.proposal_id,
        category: "event",
        rating: Number(rating),
        comment: feedback
      }),
    onSuccess: async () => {
      actionSuccess("Feedback submitted", "Thank you for helping improve club events.");
      setFeedback("");
      setRating("5");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["event-engagement", event.proposal_id] }),
        queryClient.invalidateQueries({ queryKey: ["approved-events"] })
      ]);
    },
    onError: (mutationError) => {
      actionError("Could not submit feedback", mutationError, getErrorMessage(mutationError));
    }
  });
  const attendanceUserIds = new Set((engagement?.attendance || []).filter((record) => record.attended).map((record) => record.user_id));
  const selectedRsvpStatus = engagement?.current_user_rsvp?.status;
  const effectiveEvent = engagement?.event || event;
  const isPast = isPastEvent(effectiveEvent);
  const canSubmitFeedback = Boolean(effectiveEvent.can_submit_feedback);

  function getRsvpButtonVariant(status: EventRsvpRecord["status"]) {
    return selectedRsvpStatus === status ? "default" : "outline";
  }

  function getRsvpButtonClassName(status: EventRsvpRecord["status"]) {
    if (selectedRsvpStatus !== status) {
      return "";
    }

    if (status === "going") {
      return "bg-success text-success-foreground hover:bg-success/90";
    }

    if (status === "interested") {
      return "bg-primary text-primary-foreground hover:bg-primary/90";
    }

    if (status === "not_going") {
      return "bg-muted text-foreground hover:bg-muted/90";
    }

    return "";
  }

  if (isLoading) {
    return <NeoLoadingState title="Loading event engagement" message="We are checking RSVPs and feedback." compact />;
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
        <p className="font-medium">Unable to load engagement</p>
        <p className="text-muted-foreground mt-1">{getErrorMessage(error)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div className="nh-card-soft p-3">
          <p className="text-muted-foreground">Going</p>
          <p className="text-lg font-bold">{engagement?.summary.going ?? 0}</p>
        </div>
        <div className="nh-card-soft p-3">
          <p className="text-muted-foreground">Interested</p>
          <p className="text-lg font-bold">{engagement?.summary.interested ?? 0}</p>
        </div>
        {canManageAttendance ? (
          <div className="nh-card-soft p-3">
            <p className="text-muted-foreground">Attendance</p>
            <p className="text-lg font-bold">{engagement?.summary.attended ?? 0}</p>
          </div>
        ) : null}
        <div className="nh-card-soft p-3">
          <p className="text-muted-foreground">My RSVP</p>
          <div className="mt-1">
            <RsvpBadge status={engagement?.current_user_rsvp?.status} />
          </div>
        </div>
        {isStudent ? (
          <div className="nh-card-soft p-3">
            <p className="text-muted-foreground">My check-in</p>
            <p className="mt-1 text-sm font-semibold">{getCheckInAvailabilityLabel(effectiveEvent, engagement?.current_user_attendance?.attended)}</p>
          </div>
        ) : null}
      </div>

      {isStudent ? (
        <div className="space-y-3 border-2 border-foreground bg-primary/5 p-4">
          {!isPast ? (
            <>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={getRsvpButtonVariant("going")}
                  className={getRsvpButtonClassName("going")}
                  disabled={rsvpMutation.isPending || !effectiveEvent.can_rsvp}
                  onClick={() => rsvpMutation.mutate("going")}
                >
                  Going
                </Button>
                <Button
                  size="sm"
                  variant={getRsvpButtonVariant("interested")}
                  className={getRsvpButtonClassName("interested")}
                  disabled={rsvpMutation.isPending || !effectiveEvent.can_rsvp}
                  onClick={() => rsvpMutation.mutate("interested")}
                >
                  Interested
                </Button>
                <Button
                  size="sm"
                  variant={getRsvpButtonVariant("not_going")}
                  className={getRsvpButtonClassName("not_going")}
                  disabled={rsvpMutation.isPending || !effectiveEvent.can_rsvp}
                  onClick={() => rsvpMutation.mutate("not_going")}
                >
                  Not Going
                </Button>
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Feedback opens after the event for students marked attended.
              </p>
            </>
          ) : canSubmitFeedback ? (
            <form
              className="space-y-3"
              onSubmit={(submitEvent) => {
                submitEvent.preventDefault();
                feedbackMutation.mutate();
              }}
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="h-4 w-4" />
                Event feedback
              </div>
              <div className="grid gap-2 sm:grid-cols-[140px_1fr]">
                <Select value={rating} onValueChange={setRating}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 stars</SelectItem>
                    <SelectItem value="4">4 stars</SelectItem>
                    <SelectItem value="3">3 stars</SelectItem>
                    <SelectItem value="2">2 stars</SelectItem>
                    <SelectItem value="1">1 star</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  value={feedback}
                  onChange={(feedbackEvent) => setFeedback(feedbackEvent.target.value)}
                  placeholder="Share what worked, what could improve, or what made the event memorable."
                  rows={2}
                />
              </div>
              <Button type="submit" size="sm" disabled={feedbackMutation.isPending || !feedback.trim()}>
                {feedbackMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </Button>
            </form>
          ) : (
            <p className="text-sm font-semibold text-muted-foreground">
              Feedback is available for students marked as attended.
            </p>
          )}
        </div>
      ) : null}

      {canManageAttendance ? (
        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium">RSVP List & Attendance</p>
            <Button size="sm" variant="outline" onClick={() => setShowQrDialog(true)}>
              <QrCode className="h-4 w-4" />
              Show Event QR
            </Button>
          </div>
          {!engagement?.rsvps.length ? (
            <p className="text-sm text-muted-foreground">No RSVPs yet.</p>
          ) : (
            <div className="space-y-2">
              {engagement.rsvps.map((rsvp) => (
                <div key={rsvp.id} className="nh-list-card flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{rsvp.profile?.full_name || "Student"}</p>
                    <p className="text-xs text-muted-foreground">{rsvp.profile?.student_id || "No student ID"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <RsvpBadge status={rsvp.status} />
                    {attendanceUserIds.has(rsvp.user_id) ? (
                      <Badge className="bg-success/15 text-success hover:bg-success/15">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Attended
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={attendanceMutation.isPending}
                        onClick={() => attendanceMutation.mutate(rsvp.user_id)}
                      >
                        Mark attended
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <EventQrDialog event={effectiveEvent} open={showQrDialog} onOpenChange={setShowQrDialog} />
        </div>
      ) : null}
    </div>
  );
}

function EventDetailDialog({
  event,
  clubName,
  open,
  onOpenChange
}: {
  event: ApprovedEventRecord;
  clubName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const {
    data: announcementsPage = emptyPaginatedResponse<AnnouncementRecord>(),
    isLoading: announcementsLoading,
    isError: announcementsError,
    error: announcementsErrorValue
  } = useQuery({
    queryKey: ["event-detail-announcements", event.club_id],
    queryFn: () => getAnnouncements({ club_id: event.club_id, page: 1, page_size: 3 }),
    enabled: open,
    retry: false
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
          <DialogDescription>{clubName}</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-muted/40 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Date / time</p>
              <p className="mt-1 font-semibold">{getDateLabel(event.event_date)} - {getTimeLabel(event.event_time)}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Location</p>
              <p className="mt-1 font-semibold">{event.location || "Venue TBC"}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
              <p className="mt-1 font-semibold">{getEventLifecycleLabel(event)}</p>
            </div>
          </div>
          <div>
            <p className="text-sm leading-6 text-muted-foreground">{event.description}</p>
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
            <p className="font-semibold text-primary">Event requirements</p>
            <p className="mt-1 text-muted-foreground">{getEventRequirementText(event)}</p>
          </div>
          <EventEngagementPanel event={event} />
          <div className="space-y-3">
            <p className="text-sm font-semibold">Related announcements</p>
            {announcementsLoading ? (
              <NeoLoadingState title="Loading announcements" message="Checking recent club updates." compact />
            ) : announcementsError ? (
              <p className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                {getErrorMessage(announcementsErrorValue)}
              </p>
            ) : announcementsPage.items.length === 0 ? (
              <p className="rounded-xl border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                No event-related announcements have been published yet.
              </p>
            ) : (
              announcementsPage.items.map((announcement) => (
                <Link key={announcement.id} to="/communications" className="block">
                  <div className="nh-list-card">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold">{announcement.title}</p>
                      {!announcement.is_read ? <Badge>Unread</Badge> : null}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{announcement.message}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          {event.event_lifecycle === "happening_today" ? (
            <Button asChild type="button" variant="outline">
              <Link to={getEventCheckInPath(event.proposal_id)}>
                <QrCode className="mr-2 h-4 w-4" />
                Open Check-In Link
              </Link>
            </Button>
          ) : (
            <span />
          )}
          <Button type="button" onClick={() => shareEventInvite(event, clubName)}>
            <Share2 className="mr-2 h-4 w-4" />
            Share Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EventCard({
  event,
  clubName,
  isJoinedClub,
  isDeepLinked = false
}: {
  event: ApprovedEventRecord;
  clubName: string;
  isJoinedClub: boolean;
  isDeepLinked?: boolean;
}) {
  const { role } = useRole();
  const queryClient = useQueryClient();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const showProposalLink = canViewProposalDetails(role);
  const isStudent = role === "student";
  const {
    data: engagement,
    isLoading: engagementLoading
  } = useQuery({
    queryKey: ["event-engagement", event.proposal_id],
    queryFn: () => getEventEngagement(event.proposal_id),
    retry: false
  });
  const rsvpMutation = useMutation({
    mutationFn: () => submitEventRsvp(event.proposal_id, { status: "going" }),
    onSuccess: async () => {
      actionSuccess("RSVP updated", "You're marked as going.");
      await queryClient.invalidateQueries({ queryKey: ["event-engagement", event.proposal_id] });
    },
    onError: (mutationError) => {
      actionError("Could not update RSVP", mutationError, getErrorMessage(mutationError));
    }
  });
  const selfCheckInMutation = useMutation({
    mutationFn: () => submitEventSelfCheckIn(event.proposal_id),
    onSuccess: async () => {
      actionSuccess("Check-in recorded", "Your attendance has been saved.");
      await queryClient.invalidateQueries({ queryKey: ["event-engagement", event.proposal_id] });
    },
    onError: (mutationError) => {
      actionError("Could not check in", mutationError, getErrorMessage(mutationError));
    }
  });
  const rsvpStatus = engagement?.current_user_rsvp?.status;
  const attended = engagement?.current_user_attendance?.attended;
  const checkInLabel = getCheckInAvailabilityLabel(event, attended);
  const canSelfCheckIn = isStudent && event.event_lifecycle === "happening_today" && !attended;

  useEffect(() => {
    if (isDeepLinked) {
      setDetailsOpen(true);
    }
  }, [isDeepLinked]);

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-black uppercase">{event.title}</h3>
                <Badge className="bg-success/15 text-success hover:bg-success/15">Approved</Badge>
                <Badge variant="outline">{getEventLifecycleLabel(event)}</Badge>
                <Badge variant="outline">{isJoinedClub ? "Joined club" : "Campus event"}</Badge>
              </div>
              <p className="mt-1 text-sm font-semibold">{clubName}</p>
              <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {getDateLabel(event.event_date)}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {getTimeLabel(event.event_time)}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {event.location || "Venue TBC"}
              </span>
            </div>

            {event.number_of_participants ? (
              <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {event.number_of_participants} expected participant(s)
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <RsvpBadge status={rsvpStatus} />
              <Badge variant={attended ? "default" : "outline"}>{checkInLabel}</Badge>
              {engagementLoading ? <Badge variant="outline">Loading state...</Badge> : null}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
            <Button type="button" variant="outline" size="sm" className="w-full sm:w-auto lg:w-full" onClick={() => setDetailsOpen(true)}>
              View Details
            </Button>
            <Button type="button" variant="outline" size="sm" className="w-full sm:w-auto lg:w-full" onClick={() => shareEventInvite(event, clubName)}>
              <Share2 className="mr-2 h-4 w-4" />
              Share Event
            </Button>
            {isStudent && event.can_rsvp && !isPastEvent(event) ? (
              <Button
                type="button"
                size="sm"
                className="w-full sm:w-auto lg:w-full"
                disabled={rsvpMutation.isPending || rsvpStatus === "going"}
                onClick={() => rsvpMutation.mutate()}
              >
                {rsvpStatus === "going" ? "RSVP Saved" : "RSVP"}
              </Button>
            ) : null}
            {canSelfCheckIn ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="w-full sm:w-auto lg:w-full"
                disabled={selfCheckInMutation.isPending}
                onClick={() => selfCheckInMutation.mutate()}
              >
                {selfCheckInMutation.isPending ? "Checking in..." : "Check In"}
              </Button>
            ) : null}
            {canSelfCheckIn ? (
              <Button asChild variant="outline" size="sm" className="w-full sm:w-auto lg:w-full">
                <Link to={getEventCheckInPath(event.proposal_id)}>Check In with QR</Link>
              </Button>
            ) : null}
            {showProposalLink ? (
              <Button asChild variant="outline" size="sm" className="w-full sm:w-auto lg:w-full">
                <Link to={`/proposals/${event.proposal_id}`}>View proposal</Link>
              </Button>
            ) : null}
          </div>
        </div>
        <EventEngagementPanel event={event} />
      </CardContent>
      <EventDetailDialog event={event} clubName={clubName} open={detailsOpen} onOpenChange={setDetailsOpen} />
    </Card>
  );
}

function ReminderCard({ reminder }: { reminder: EventReminderRecord }) {
  return (
    <div className="nh-list-card">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-foreground bg-accent text-accent-foreground">
          <Bell className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium">{reminder.message}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Reminder: {getDateLabel(reminder.remind_at)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function EventCalendar() {
  useUsageTracking("event_view");
  const { role } = useRole();
  const [searchParams] = useSearchParams();
  const sharedEventId = searchParams.get("event");
  const deepLinkPageSize = sharedEventId ? 100 : DEFAULT_PAGE_SIZE;
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);
  const {
    data: upcomingEventsPage = emptyPaginatedResponse<ApprovedEventRecord>(),
    isLoading: upcomingLoading,
    isError: upcomingError,
    error: upcomingErrorValue
  } = useQuery({
    queryKey: ["approved-events", "upcoming", upcomingPage, deepLinkPageSize],
    queryFn: () => getApprovedEvents({ lifecycle: "upcoming", page: upcomingPage, page_size: deepLinkPageSize }),
    retry: false
  });
  const {
    data: pastEventsPage = emptyPaginatedResponse<ApprovedEventRecord>(),
    isLoading: pastLoading,
    isError: pastError,
    error: pastErrorValue
  } = useQuery({
    queryKey: ["approved-events", "past", pastPage, deepLinkPageSize],
    queryFn: () => getApprovedEvents({ lifecycle: "past", page: pastPage, page_size: deepLinkPageSize }),
    retry: false
  });
  const {
    data: reminders = [],
    isLoading: remindersLoading,
    isError: remindersError,
    error: remindersErrorValue
  } = useQuery({
    queryKey: ["event-reminders"],
    queryFn: () => getEventReminders(),
    retry: false
  });
  const { data: clubs = [] } = useQuery({
    queryKey: ["events-clubs", role],
    queryFn: () => (role === "student" ? getPublicClubs() : getClubs()),
    retry: false
  });
  const { data: myRequests = [] } = useQuery({
    queryKey: ["my-membership-requests"],
    queryFn: () => getMyMembershipRequests(),
    enabled: role === "student",
    retry: false
  });
  const activeEvents = upcomingEventsPage.items;
  const pastEvents = pastEventsPage.items;
  const eventsLoading = upcomingLoading || pastLoading;
  const eventsError = upcomingError || pastError;
  const eventsErrorValue = upcomingErrorValue || pastErrorValue;
  const joinedClubIds = useMemo(
    () => new Set((myRequests as MembershipRequestRecord[]).filter((request) => request.status === "active").map((request) => request.club_id)),
    [myRequests]
  );
  const clubNameById = useMemo(
    () => {
      const fromClubs = new Map(clubs.map((club) => [club.id, club.name] as const));

      myRequests.forEach((request) => {
        if (request.club?.name) {
          fromClubs.set(request.club_id, request.club.name);
        }
      });

      return fromClubs;
    },
    [clubs, myRequests]
  );
  const todayEvents = activeEvents.filter((event) => event.event_lifecycle === "happening_today");
  const thisWeekEvents = activeEvents.filter((event) => event.event_lifecycle !== "happening_today" && isEventThisWeek(event));
  const upcomingOnlyEvents = activeEvents.filter((event) => event.event_lifecycle !== "happening_today" && !isEventThisWeek(event));
  function isSharedEvent(event: ApprovedEventRecord) {
    return sharedEventId === event.proposal_id || sharedEventId === event.id;
  }

  function renderEventList(events: ApprovedEventRecord[], emptyTitle: string, emptyMessage: string) {
    if (events.length === 0) {
      return (
        <div className="nh-empty">
          <p className="font-medium">{emptyTitle}</p>
          <p className="mt-1 text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      );
    }

    return events.map((event) => (
      <EventCard
        key={event.id}
        event={event}
        clubName={clubNameById.get(event.club_id) || "Campus club"}
        isJoinedClub={joinedClubIds.has(event.club_id)}
        isDeepLinked={isSharedEvent(event)}
      />
    ));
  }

  return (
    <div className="nh-page">
      <NeoPageHeader
        eyebrow="Events"
        title="Events"
        description="Find today's events, RSVP for what is coming up, and check in when an event is live."
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="text-lg">Student Event Feed</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">Events from your joined clubs are highlighted, while public campus club events remain discoverable.</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-xl border border-border bg-muted/40 p-3">
                    <p className="text-lg font-black">{todayEvents.length}</p>
                    <p className="text-muted-foreground">Today</p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/40 p-3">
                    <p className="text-lg font-black">{activeEvents.filter((event) => joinedClubIds.has(event.club_id)).length}</p>
                    <p className="text-muted-foreground">My clubs</p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/40 p-3">
                    <p className="text-lg font-black">{activeEvents.filter((event) => !joinedClubIds.has(event.club_id)).length}</p>
                    <p className="text-muted-foreground">Campus</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {eventsLoading ? (
                <NeoLoadingState
                  title="Getting events ready"
                  message="Please wait while we load the events you can see."
                  delayedMessage="This is taking longer than usual. Please check your network connection."
                  compact
                />
              ) : eventsError ? (
                <div className="nh-empty border-destructive bg-destructive/5">
                  <p className="font-medium">We couldn't load events right now</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getErrorMessage(eventsErrorValue)}
                  </p>
                </div>
              ) : activeEvents.length === 0 && pastEvents.length === 0 ? (
                <div className="nh-empty">
                  <CalendarDays className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium">No events yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Approved events will appear here once they are ready.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <section className="space-y-3">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-[0.12em]">Today's Events</h3>
                      <p className="text-sm text-muted-foreground">Check in here when the event is active.</p>
                    </div>
                    {renderEventList(todayEvents, "No events happening today", "This is a quiet day. Check this week and upcoming events below.")}
                  </section>

                  <section className="space-y-3">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-[0.12em]">This Week</h3>
                      <p className="text-sm text-muted-foreground">Events coming soon from clubs you can follow or join.</p>
                    </div>
                    {renderEventList(thisWeekEvents, "No events this week", "Upcoming events beyond this week are listed below.")}
                  </section>

                  <section className="space-y-3">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-[0.12em]">Upcoming Events</h3>
                      <p className="text-sm text-muted-foreground">Plan ahead and RSVP before event day.</p>
                    </div>
                    {renderEventList(upcomingOnlyEvents, "No upcoming events", "Past events are still available below for memories and feedback.")}
                    {activeEvents.length > 0 ? (
                      <DataPagination
                        page={upcomingEventsPage.page}
                        pageSize={upcomingEventsPage.page_size}
                        total={upcomingEventsPage.total}
                        hasNext={upcomingEventsPage.has_next}
                        onPageChange={setUpcomingPage}
                      />
                    ) : null}
                  </section>

                  <section className="space-y-3">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-[0.12em]">Past Events</h3>
                      <p className="text-sm text-muted-foreground">Look back on completed events and leave feedback if you attended.</p>
                    </div>
                    {pastEvents.length === 0 ? renderEventList([], "No past events yet", "Completed events will appear here after their event date passes.") : (
                      <>
                        {pastEvents.map((event) => (
                          <EventCard
                            key={event.id}
                            event={event}
                            clubName={clubNameById.get(event.club_id) || "Campus club"}
                            isJoinedClub={joinedClubIds.has(event.club_id)}
                            isDeepLinked={isSharedEvent(event)}
                          />
                        ))}
                        <DataPagination
                          page={pastEventsPage.page}
                          pageSize={pastEventsPage.page_size}
                          total={pastEventsPage.total}
                          hasNext={pastEventsPage.has_next}
                          onPageChange={setPastPage}
                        />
                      </>
                    )}
                  </section>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
          <CardTitle className="text-lg">Event Reminders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {remindersLoading ? (
              <NeoLoadingState
                title="Getting reminders ready"
                message="Please wait while we load your event reminders."
                delayedMessage="This is taking longer than usual. Please check your network connection."
                compact
              />
            ) : remindersError ? (
              <div className="nh-empty border-destructive bg-destructive/5">
                <p className="font-medium">We couldn't load reminders right now</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {getErrorMessage(remindersErrorValue)}
                </p>
              </div>
            ) : reminders.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No event reminders for your account yet.
              </p>
            ) : (
              reminders.map((reminder) => <ReminderCard key={reminder.id} reminder={reminder} />)
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
