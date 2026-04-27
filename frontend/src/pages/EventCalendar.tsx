import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Bell, CalendarDays, CheckCircle2, Clock, Loader2, MapPin, MessageSquare, Users } from "lucide-react";
import { NeoLoadingState, NeoPageHeader } from "@/components/NeoBrutal";
import { DataPagination } from "@/components/DataPagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRole } from "@/contexts/RoleContext";
import { getEventLifecycleLabel, isPastEvent } from "@/lib/eventLifecycle";
import { canViewProposalDetails } from "@/lib/roleAccess";
import {
  ApiClientError,
  createFeedback,
  getApprovedEvents,
  getEventEngagement,
  getEventReminders,
  submitEventAttendance,
  submitEventRsvp,
  type ApprovedEventRecord,
  type EventReminderRecord,
  type EventRsvpRecord
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

function EventEngagementPanel({ event }: { event: ApprovedEventRecord }) {
  const { role } = useRole();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState("5");
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
        <div className="nh-card-soft p-3">
          <p className="text-muted-foreground">Attendance</p>
          <p className="text-lg font-bold">{engagement?.summary.attended ?? 0}</p>
        </div>
        <div className="nh-card-soft p-3">
          <p className="text-muted-foreground">My RSVP</p>
          <div className="mt-1">
            <RsvpBadge status={engagement?.current_user_rsvp?.status} />
          </div>
        </div>
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
          <p className="text-sm font-medium">RSVP List & Attendance</p>
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
        </div>
      ) : null}
    </div>
  );
}

function EventCard({ event }: { event: ApprovedEventRecord }) {
  const { role } = useRole();
  const showProposalLink = canViewProposalDetails(role);

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
              </div>
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
          </div>

          {showProposalLink ? (
            <Button asChild variant="outline" size="sm">
              <Link to={`/proposals/${event.proposal_id}`}>View proposal</Link>
            </Button>
          ) : null}
        </div>
        <EventEngagementPanel event={event} />
      </CardContent>
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
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);
  const {
    data: upcomingEventsPage = emptyPaginatedResponse<ApprovedEventRecord>(),
    isLoading: upcomingLoading,
    isError: upcomingError,
    error: upcomingErrorValue
  } = useQuery({
    queryKey: ["approved-events", "upcoming", upcomingPage],
    queryFn: () => getApprovedEvents({ lifecycle: "upcoming", page: upcomingPage, page_size: DEFAULT_PAGE_SIZE }),
    retry: false
  });
  const {
    data: pastEventsPage = emptyPaginatedResponse<ApprovedEventRecord>(),
    isLoading: pastLoading,
    isError: pastError,
    error: pastErrorValue
  } = useQuery({
    queryKey: ["approved-events", "past", pastPage],
    queryFn: () => getApprovedEvents({ lifecycle: "past", page: pastPage, page_size: DEFAULT_PAGE_SIZE }),
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
  const activeEvents = upcomingEventsPage.items;
  const pastEvents = pastEventsPage.items;
  const eventsLoading = upcomingLoading || pastLoading;
  const eventsError = upcomingError || pastError;
  const eventsErrorValue = upcomingErrorValue || pastErrorValue;

  return (
    <div className="nh-page">
      <NeoPageHeader
        eyebrow="Events"
        title="Events"
        description="See approved events, RSVP updates, and reminders in one place."
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Calendar</CardTitle>
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
                  <p className="font-medium">We couldn’t load events right now</p>
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
                      <h3 className="text-sm font-black uppercase tracking-[0.12em]">Upcoming & Happening Now</h3>
                      <p className="text-sm text-muted-foreground">These events are still open for student RSVP.</p>
                    </div>
                    {activeEvents.length === 0 ? (
                      <div className="nh-empty">
                        <p className="font-medium">No upcoming events</p>
                        <p className="mt-1 text-sm text-muted-foreground">Past events are still available below for memories and feedback.</p>
                      </div>
                    ) : (
                      <>
                        {activeEvents.map((event) => <EventCard key={event.id} event={event} />)}
                        <DataPagination
                          page={upcomingEventsPage.page}
                          pageSize={upcomingEventsPage.page_size}
                          total={upcomingEventsPage.total}
                          hasNext={upcomingEventsPage.has_next}
                          onPageChange={setUpcomingPage}
                        />
                      </>
                    )}
                  </section>

                  <section className="space-y-3">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-[0.12em]">Past Events</h3>
                      <p className="text-sm text-muted-foreground">Look back on completed events and leave feedback if you attended.</p>
                    </div>
                    {pastEvents.length === 0 ? (
                      <div className="nh-empty">
                        <p className="font-medium">No past events yet</p>
                        <p className="mt-1 text-sm text-muted-foreground">Completed events will appear here after their event date passes.</p>
                      </div>
                    ) : (
                      <>
                        {pastEvents.map((event) => <EventCard key={event.id} event={event} />)}
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
                <p className="font-medium">We couldn’t load reminders right now</p>
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
