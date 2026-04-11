import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Bell, CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ApiClientError,
  getApprovedEvents,
  getEventReminders,
  type ApprovedEventRecord,
  type EventReminderRecord
} from "@/lib/api";

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError || error instanceof Error) {
    return error.message;
  }

  return "Unable to load approved events right now.";
}

function getDateLabel(value?: string | null) {
  return value ? new Date(value).toLocaleDateString() : "-";
}

function getTimeLabel(value?: string | null) {
  return value ? value.slice(0, 5) : "Time TBC";
}

function EventCard({ event }: { event: ApprovedEventRecord }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">{event.title}</h3>
                <Badge className="bg-success/15 text-success hover:bg-success/15">Approved</Badge>
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

          <Button asChild variant="outline" size="sm">
            <Link to={`/proposals/${event.proposal_id}`}>View proposal</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ReminderCard({ reminder }: { reminder: EventReminderRecord }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
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
  const {
    data: events = [],
    isLoading: eventsLoading,
    isError: eventsError,
    error: eventsErrorValue
  } = useQuery({
    queryKey: ["approved-events"],
    queryFn: () => getApprovedEvents(),
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

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold">Approved Events</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Only events with final admin approval appear here.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Calendar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {eventsLoading ? (
                <p className="text-sm text-muted-foreground">Loading approved events...</p>
              ) : eventsError ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                  <p className="font-medium">Unable to load approved events</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getErrorMessage(eventsErrorValue)}
                  </p>
                </div>
              ) : events.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <CalendarDays className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium">No approved events yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Events will show here after admin final approval.
                  </p>
                </div>
              ) : (
                events.map((event) => <EventCard key={event.id} event={event} />)
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Approved Event Reminders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {remindersLoading ? (
              <p className="text-sm text-muted-foreground">Loading reminders...</p>
            ) : remindersError ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <p className="font-medium">Unable to load reminders</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {getErrorMessage(remindersErrorValue)}
                </p>
              </div>
            ) : reminders.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No approved event reminders for your account yet.
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
