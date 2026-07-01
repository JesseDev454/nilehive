import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, QrCode, XCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { ClublyLoadingState, ClublyStateCard } from "@/components/Clubly";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ApiClientError, getEventEngagement, submitEventSelfCheckIn } from "@/lib/api";
import { getEventLifecycleLabel } from "@/lib/eventLifecycle";

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError || error instanceof Error) {
    return error.message;
  }

  return "We could not open this event check-in right now.";
}

function getCheckInErrorTitle(error: unknown) {
  if (error instanceof ApiClientError) {
    if (error.status === 401 || error.status === 403) {
      return "Check-in not authorized";
    }

    if (error.status === 404) {
      return "Invalid check-in link";
    }

    if (error.status === 409) {
      return "Check-in already handled";
    }

    if (error.status === 422) {
      return "Check-in unavailable";
    }
  }

  return "Unable to open event check-in";
}

function getMutationErrorTitle(message?: string | null) {
  const normalized = message?.toLowerCase() ?? "";

  if (normalized.includes("already")) {
    return "Already checked in";
  }

  if (normalized.includes("expired") || normalized.includes("not active") || normalized.includes("event date")) {
    return "Check-in expired";
  }

  if (normalized.includes("unauthorized") || normalized.includes("not allowed")) {
    return "Check-in not authorized";
  }

  return "Could not complete check-in";
}

export default function EventCheckIn() {
  const { proposalId = "" } = useParams();
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const [checkInState, setCheckInState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [checkInError, setCheckInError] = useState<string | null>(null);
  const attemptedProposalIdRef = useRef<string | null>(null);
  const {
    data: engagement,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["event-engagement", proposalId, "check-in"],
    queryFn: () => getEventEngagement(proposalId),
    enabled: Boolean(proposalId),
    retry: false
  });

  const checkInMutation = useMutation({
    mutationFn: () => submitEventSelfCheckIn(proposalId),
    onSuccess: async () => {
      setCheckInState("success");
      setCheckInError(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["event-engagement", proposalId] }),
        queryClient.invalidateQueries({ queryKey: ["event-engagement", proposalId, "check-in"] }),
        queryClient.invalidateQueries({ queryKey: ["approved-events"] })
      ]);
    },
    onError: (mutationError) => {
      setCheckInState("error");
      setCheckInError(getErrorMessage(mutationError));
    }
  });

  useEffect(() => {
    if (!proposalId || !engagement || role !== "student") {
      return;
    }

    if (checkInState === "success") {
      return;
    }

    if (engagement.current_user_attendance?.attended) {
      setCheckInState("idle");
      setCheckInError(null);
      return;
    }

    if (engagement.event.event_lifecycle !== "happening_today") {
      return;
    }

    if (attemptedProposalIdRef.current === proposalId) {
      return;
    }

    attemptedProposalIdRef.current = proposalId;
    setCheckInState("submitting");
    setCheckInError(null);
    checkInMutation.mutate();
  }, [checkInState, engagement, proposalId, role, checkInMutation]);

  if (!proposalId) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center">
        <ClublyStateCard
          icon={XCircle}
          title="Invalid check-in link"
          message="This event QR link is incomplete. Please ask the organizer to open the event QR again."
          tone="danger"
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center">
        <ClublyLoadingState
          title="Opening event check-in"
          message="We are confirming your access and checking today's event details."
        />
      </div>
    );
  }

  if (isError || !engagement) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center">
        <ClublyStateCard
          icon={XCircle}
          title={getCheckInErrorTitle(error)}
          message={getErrorMessage(error)}
          tone="danger"
        >
          <div className="flex justify-center">
            <Button asChild variant="outline">
              <Link to="/events">View Events</Link>
            </Button>
          </div>
        </ClublyStateCard>
      </div>
    );
  }

  const event = engagement.event;

  if (role !== "student") {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center">
        <ClublyStateCard
          icon={QrCode}
          title="Student check-in only"
          message={`This QR code is for student attendance check-in. ${event.title} is still available in the events section.`}
        >
          <div className="flex justify-center">
            <Button asChild variant="outline">
              <Link to="/events">View Events</Link>
            </Button>
          </div>
        </ClublyStateCard>
      </div>
    );
  }

  if (checkInState === "success") {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center">
        <ClublyStateCard
          icon={CheckCircle2}
          title="Check-in recorded"
          message={`Your attendance for ${event.title} has been saved successfully.`}
          tone="success"
        >
          <div className="flex justify-center">
            <Button asChild variant="outline">
              <Link to="/events">View Events</Link>
            </Button>
          </div>
        </ClublyStateCard>
      </div>
    );
  }

  if (engagement.current_user_attendance?.attended) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center">
        <ClublyStateCard
          icon={CheckCircle2}
          title="Already checked in"
          message={`Your attendance for ${event.title} has already been recorded.`}
          tone="success"
        >
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>{getEventLifecycleLabel(event)}</p>
            <div className="flex justify-center">
              <Button asChild variant="outline">
                <Link to="/events">View Events</Link>
              </Button>
            </div>
          </div>
        </ClublyStateCard>
      </div>
    );
  }

  if (event.event_lifecycle !== "happening_today") {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center">
        <ClublyStateCard
          icon={QrCode}
          title="Check-in unavailable right now"
          message={`Attendance for ${event.title} can only be recorded while Club Services check-in is active for the event date.`}
        >
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>{getEventLifecycleLabel(event)}</p>
            <div className="flex justify-center">
              <Button asChild variant="outline">
                <Link to="/events">View Events</Link>
              </Button>
            </div>
          </div>
        </ClublyStateCard>
      </div>
    );
  }

  if (checkInState === "error") {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center">
        <ClublyStateCard
          icon={XCircle}
          title={getMutationErrorTitle(checkInError)}
          message={checkInError || `We could not record attendance for ${event.title}.`}
          tone="danger"
        >
          <div className="flex justify-center">
            <Button asChild variant="outline">
              <Link to="/events">View Events</Link>
            </Button>
          </div>
        </ClublyStateCard>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center">
      <ClublyStateCard
        icon={Loader2}
        title="Recording attendance"
        message={`Please wait while we mark your attendance for ${event.title}.`}
      >
        <div className="flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      </ClublyStateCard>
    </div>
  );
}
