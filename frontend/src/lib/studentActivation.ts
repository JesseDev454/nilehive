export type StudentMembershipRequestStatus = "pending" | "approved_pending_dues" | "active" | "rejected" | "cancelled";
export type StudentDuePaymentStatus = "unpaid" | "submitted" | "paid" | "rejected";

type MembershipSnapshot = { status: StudentMembershipRequestStatus };
type DuePaymentSnapshot = { status: StudentDuePaymentStatus };
type EventSnapshot = { id: string };

export type StudentNextActionKind =
  | "complete_profile"
  | "discover_clubs"
  | "update_payment"
  | "payment_review"
  | "check_in"
  | "rsvp_event"
  | "read_announcement"
  | "submit_feedback"
  | "see_updates"
  | "track_request";

export interface StudentNextAction {
  kind: StudentNextActionKind;
  title: string;
  description: string;
  label: string;
  to: string;
}

export function getStudentNextAction({
  membershipRequests,
  duePayments,
  upcomingEvents,
  hasRsvp,
  isProfileComplete = true,
  hasTodayCheckIn = false,
  hasUnreadAnnouncement = false,
  hasFeedbackOpportunity = false
}: {
  membershipRequests: MembershipSnapshot[];
  duePayments: DuePaymentSnapshot[];
  upcomingEvents: EventSnapshot[];
  hasRsvp: boolean;
  isProfileComplete?: boolean;
  hasTodayCheckIn?: boolean;
  hasUnreadAnnouncement?: boolean;
  hasFeedbackOpportunity?: boolean;
}): StudentNextAction {
  const paymentNeedingAttention = duePayments.find((payment) => payment.status === "unpaid" || payment.status === "rejected");
  const paymentUnderReview = duePayments.find((payment) => payment.status === "submitted");
  const activeMembership = membershipRequests.find((request) => request.status === "active");

  if (!isProfileComplete) {
    return {
      kind: "complete_profile",
      title: "Complete your profile",
      description: "Add your student details so club joins, dues proof, and event check-ins stay connected to you.",
      label: "Open membership",
      to: "/membership"
    };
  }

  if (membershipRequests.length === 0) {
    return {
      kind: "discover_clubs",
      title: "Start with one club",
      description: "Pick a club, read what they do, and submit your join request.",
      label: "Discover clubs",
      to: "/membership"
    };
  }

  if (paymentNeedingAttention) {
    return {
      kind: "update_payment",
      title: "Finish your dues step",
      description: "Upload or update your payment proof so Club Services can activate your membership.",
      label: "Upload Dues Proof",
      to: "/membership"
    };
  }

  if (paymentUnderReview) {
    return {
      kind: "payment_review",
      title: "Payment is being checked",
      description: "Your proof is with Club Services. You can keep an eye on the status from membership.",
      label: "View status",
      to: "/membership"
    };
  }

  if (activeMembership && hasTodayCheckIn) {
    return {
      kind: "check_in",
      title: "Check in to today's event",
      description: "A club event is happening today. View events and complete your attendance check-in.",
      label: "Check in",
      to: "/events"
    };
  }

  if (activeMembership && upcomingEvents.length > 0 && !hasRsvp) {
    return {
      kind: "rsvp_event",
      title: "Choose an event response",
      description: "RSVP to an approved club event so organizers know you are interested.",
      label: "View Events",
      to: "/events"
    };
  }

  if (activeMembership && hasUnreadAnnouncement) {
    return {
      kind: "read_announcement",
      title: "Read the latest announcement",
      description: "There are new club or Club Services updates waiting for you.",
      label: "Read announcements",
      to: "/communications"
    };
  }

  if (activeMembership && hasFeedbackOpportunity) {
    return {
      kind: "submit_feedback",
      title: "Submit event feedback",
      description: "You attended an event recently. Share what worked and what should improve.",
      label: "Give feedback",
      to: "/events"
    };
  }

  if (activeMembership) {
    return {
      kind: "see_updates",
      title: "Stay in the loop",
      description: "Check announcements and events so you do not miss club updates.",
      label: "See updates",
      to: "/communications"
    };
  }

  return {
    kind: "track_request",
    title: "Track your request",
    description: "Your club request is in progress. Check the current status and next step.",
    label: "View membership",
    to: "/membership"
  };
}
