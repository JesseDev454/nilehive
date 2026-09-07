import type { ApprovedEventRecord } from "@/lib/api";

export function isPastEvent(event: ApprovedEventRecord) {
  return event.event_lifecycle === "past";
}

export function isAttendableEvent(event: ApprovedEventRecord) {
  return event.event_lifecycle === "upcoming" || event.event_lifecycle === "happening_today";
}

export function getEventLifecycleLabel(event: ApprovedEventRecord) {
  if (event.event_lifecycle === "past") {
    return "Past Event";
  }

  if (event.event_lifecycle === "happening_today") {
    return "Happening Today";
  }

  return "Upcoming";
}
