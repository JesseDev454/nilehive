import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, QrCode, XCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { NeoLoadingState, NeoStateCard } from "@/components/NeoBrutal";
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
  }, [engagement, proposalId, role, checkInMutation]);

  if (!proposalId) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center">
        <NeoStateCard
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
        <NeoLoadingState
          title="Opening event check-in"
          message="We are confirming your access and checking today's event details."
        />
      </div>
    );
  }

  if (isError || !engagement) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center">
        <NeoStateCard
          icon={XCircle}
          title="Unable to open event check-in"
          message={getErrorMessage(error)}
          tone="danger"
        >
          <div className="flex justify-center">
            <Button asChild variant="outline">
              <Link to="/events">Back to events</Link>
            </Button>
          </div>
        </NeoStateCard>
      </div>
    );
  }

  const event = engagement.event;

  if (role !== "student") {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center">
        <NeoStateCard
          icon={QrCode}
          title="Student check-in only"
          message={`This QR code is for student attendance check-in. ${event.title} is still available in the events section.`}
        >
          <div className="flex justify-center">
            <Button asChild variant="outline">
              <Link to="/events">Open events</Link>
            </Button>
          </div>
        </NeoStateCard>
      </div>
    );
  }

  if (checkInState === "success") {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center">
        <NeoStateCard
          icon={CheckCircle2}
          title="Check-in recorded"
          message={`Your attendance for ${event.title} has been saved successfully.`}
          tone="success"
        >
          <div className="flex justify-center">
            <Button asChild variant="outline">
              <Link to="/events">Back to events</Link>
            </Button>
          </div>
        </NeoStateCard>
      </div>
    );
  }

  if (engagement.current_user_attendance?.attended) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center">
        <NeoStateCard
          icon={CheckCircle2}
          title="Already checked in"
          message={`Your attendance for ${event.title} has already been recorded.`}
          tone="success"
        >
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>{getEventLifecycleLabel(event)}</p>
            <div className="flex justify-center">
              <Button asChild variant="outline">
                <Link to="/events">Back to events</Link>
              </Button>
            </div>
          </div>
        </NeoStateCard>
      </div>
    );
  }

  if (event.event_lifecycle !== "happening_today") {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center">
        <NeoStateCard
          icon={QrCode}
          title="Check-in unavailable right now"
          message={`Attendance for ${event.title} can only be recorded on the event date.`}
        >
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>{getEventLifecycleLabel(event)}</p>
            <div className="flex justify-center">
              <Button asChild variant="outline">
                <Link to="/events">Back to events</Link>
              </Button>
            </div>
          </div>
        </NeoStateCard>
      </div>
    );
  }

  if (checkInState === "error") {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center">
        <NeoStateCard
          icon={XCircle}
          title="Could not complete check-in"
          message={checkInError || `We could not record attendance for ${event.title}.`}
          tone="danger"
        >
          <div className="flex justify-center">
            <Button asChild variant="outline">
              <Link to="/events">Back to events</Link>
            </Button>
          </div>
        </NeoStateCard>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center">
      <NeoStateCard
        icon={Loader2}
        title="Recording attendance"
        message={`Please wait while we mark your attendance for ${event.title}.`}
      >
        <div className="flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      </NeoStateCard>
    </div>
  );
}
