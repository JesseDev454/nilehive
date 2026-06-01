import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth, type AppRole } from "@/contexts/AuthContext";

type OnboardingStep = {
  id: string;
  route: string;
  target: string;
  title: string;
  body: string;
};

type HighlightBox = {
  top: number;
  left: number;
  width: number;
  height: number;
} | null;

const TOUR_VERSION = "v1";

const stepsByRole: Record<AppRole, OnboardingStep[]> = {
  student: [
    {
      id: "student-dashboard",
      route: "/",
      target: "nav-dashboard",
      title: "Start from your student dashboard",
      body: "This is your home base. You can see your membership status, next actions, and recent updates here."
    },
    {
      id: "student-clubs",
      route: "/membership",
      target: "nav-membership",
      title: "Discover and join clubs",
      body: "Use Discover Clubs to choose a club, enter your University ID, and submit the required joining details."
    },
    {
      id: "student-events",
      route: "/events",
      target: "nav-events",
      title: "Keep up with events",
      body: "Approved events appear here. You can RSVP, check details, and use QR check-in when an event is happening."
    },
    {
      id: "student-feedback",
      route: "/feedback",
      target: "nav-feedback",
      title: "Tell us what is confusing",
      body: "If onboarding, joining clubs, dues, or events feel unclear, send feedback here so the team can improve the app."
    }
  ],
  admin: [
    {
      id: "admin-dashboard",
      route: "/",
      target: "nav-dashboard",
      title: "Monitor Club Services",
      body: "The admin dashboard gives you the operational overview for clubs, proposals, dues, reports, and activity."
    },
    {
      id: "admin-users",
      route: "/user-management",
      target: "nav-user-management",
      title: "Manage local app roles",
      body: "Assign Club Services roles like advisor, president, executive, and student. Campus One still controls admin access."
    },
    {
      id: "admin-membership",
      route: "/membership",
      target: "nav-membership",
      title: "Review membership activity",
      body: "Use this section to monitor join requests and help clubs keep membership records clean."
    },
    {
      id: "admin-dues",
      route: "/dues",
      target: "nav-dues",
      title: "Verify and filter dues",
      body: "Review dues records, filter by club, and confirm payment status before students get full club access."
    },
    {
      id: "admin-feedback",
      route: "/feedback",
      target: "nav-feedback",
      title: "Track feedback and export it",
      body: "Use Feedback to see onboarding issues, app confusion, event feedback, and export records for review."
    }
  ],
  president: [
    {
      id: "president-dashboard",
      route: "/",
      target: "nav-dashboard",
      title: "Run your club from the dashboard",
      body: "Your dashboard points you to active members, proposals, reports, tasks, and upcoming event work."
    },
    {
      id: "president-proposal",
      route: "/proposals/new",
      target: "nav-create-proposal",
      title: "Create proposals",
      body: "Start event proposals here. They move through advisor review and then Club Services final review."
    },
    {
      id: "president-events",
      route: "/events",
      target: "nav-events",
      title: "Manage events and QR check-in",
      body: "Approved events live here. You can display QR check-in and fall back to manual attendance when needed."
    },
    {
      id: "president-reports",
      route: "/archive",
      target: "nav-archive",
      title: "Submit and download reports",
      body: "After events, review reports, media, and downloadable records from the archive."
    }
  ],
  advisor: [
    {
      id: "advisor-approvals",
      route: "/approvals",
      target: "nav-approvals",
      title: "Review pending proposals",
      body: "Start here when clubs need advisor approval. You can approve or reject proposals with clear notes."
    },
    {
      id: "advisor-events",
      route: "/events",
      target: "nav-events",
      title: "Follow assigned club events",
      body: "Events shows approved activities for the clubs you advise, including upcoming and past activity."
    },
    {
      id: "advisor-archive",
      route: "/archive",
      target: "nav-archive",
      title: "Check reports and media",
      body: "Use the archive to review event reports, supporting media, and downloadable event records."
    },
    {
      id: "advisor-feedback",
      route: "/feedback",
      target: "nav-feedback",
      title: "Review and send feedback",
      body: "Feedback helps you spot problems from students and also report app workflow issues from your side."
    }
  ],
  executive: [
    {
      id: "executive-dashboard",
      route: "/",
      target: "nav-dashboard",
      title: "Use your executive dashboard",
      body: "This is where you see club activity, assigned work, and the next operational steps."
    },
    {
      id: "executive-tasks",
      route: "/tasks",
      target: "nav-tasks",
      title: "Track your tasks",
      body: "My Tasks keeps delegated club work visible so nothing gets lost in chats."
    },
    {
      id: "executive-announcements",
      route: "/communications",
      target: "nav-communications",
      title: "Read announcements",
      body: "Announcements keep you updated on club instructions, reminders, and official Club Services messages."
    },
    {
      id: "executive-events",
      route: "/events",
      target: "nav-events",
      title: "Follow club events",
      body: "Use Events to see approved club activities and attendance-related updates."
    }
  ],
  feedback_manager: [
    {
      id: "feedback-manager-inbox",
      route: "/feedback",
      target: "nav-feedback",
      title: "Review app feedback",
      body: "This inbox collects onboarding, login/access, club joining, dues payment, and general app feedback from all users."
    }
  ]
};

function getStorageKey(profileId: string, role: AppRole) {
  return `nilehive:onboarding:${TOUR_VERSION}:${profileId}:${role}`;
}

function readCompleted(storageKey: string) {
  if (typeof window === "undefined") {
    return true;
  }

  return window.localStorage.getItem(storageKey) === "completed";
}

function writeCompleted(storageKey: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, "completed");
}

function findTarget(target: string) {
  if (typeof document === "undefined") {
    return null;
  }

  return document.querySelector<HTMLElement>(`[data-onboarding-target="${target}"]`);
}

export function GuidedOnboarding({ restartSignal = 0 }: { restartSignal?: number }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [highlightBox, setHighlightBox] = useState<HighlightBox>(null);
  const steps = useMemo(() => (role ? stepsByRole[role] : []), [role]);
  const storageKey = profile?.id && role ? getStorageKey(profile.id, role) : null;
  const currentStep = steps[stepIndex] ?? null;

  useEffect(() => {
    if (!storageKey || steps.length === 0) {
      return;
    }

    if (!readCompleted(storageKey)) {
      setStepIndex(0);
      setIsOpen(true);
    }
  }, [steps.length, storageKey]);

  useEffect(() => {
    if (!storageKey || steps.length === 0 || restartSignal === 0) {
      return;
    }

    setStepIndex(0);
    setIsOpen(true);
  }, [restartSignal, steps.length, storageKey]);

  useEffect(() => {
    if (!isOpen || !currentStep) {
      setHighlightBox(null);
      return;
    }

    if (location.pathname !== currentStep.route) {
      navigate(currentStep.route);
      return;
    }

    let frame = 0;
    const updateHighlight = (shouldScroll = false) => {
      const target = findTarget(currentStep.target);

      if (!target) {
        setHighlightBox(null);
        return;
      }

      if (shouldScroll) {
        target.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
      }

      const rect = target.getBoundingClientRect();
      setHighlightBox({
        top: Math.max(8, rect.top - 8),
        left: Math.max(8, rect.left - 8),
        width: rect.width + 16,
        height: rect.height + 16
      });
    };

    const timer = window.setTimeout(() => {
      frame = window.requestAnimationFrame(() => updateHighlight(true));
    }, 120);
    const refreshHighlight = () => updateHighlight(false);
    window.addEventListener("resize", refreshHighlight);
    window.addEventListener("scroll", refreshHighlight, true);

    return () => {
      window.clearTimeout(timer);
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", refreshHighlight);
      window.removeEventListener("scroll", refreshHighlight, true);
    };
  }, [currentStep, isOpen, location.pathname, navigate]);

  if (!isOpen || !currentStep || !storageKey) {
    return null;
  }

  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === steps.length - 1;

  function completeTour() {
    if (storageKey) {
      writeCompleted(storageKey);
    }
    setIsOpen(false);
  }

  return (
    <div className="fixed inset-0 z-[80] pointer-events-none" aria-live="polite">
      <div className="absolute inset-0 bg-slate-950/55" />
      {highlightBox ? (
        <div
          className="absolute rounded-xl border-4 border-primary bg-primary/10 shadow-[0_0_0_9999px_rgba(2,6,23,0.45),6px_6px_0_hsl(var(--foreground))] transition-all duration-200"
          style={{
            top: highlightBox.top,
            left: highlightBox.left,
            width: highlightBox.width,
            height: highlightBox.height
          }}
        />
      ) : null}
      <section className="pointer-events-auto absolute bottom-6 left-4 right-4 mx-auto max-w-lg border-2 border-foreground bg-card p-5 shadow-[6px_6px_0_hsl(var(--foreground))] md:bottom-8 md:right-8 md:left-auto">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
          Step {stepIndex + 1} of {steps.length}
        </p>
        <h2 className="mt-2 text-xl font-black uppercase tracking-[0.06em]">{currentStep.title}</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{currentStep.body}</p>
        {!highlightBox ? (
          <p className="mt-3 border-2 border-dashed border-muted-foreground/40 bg-muted/40 p-3 text-xs font-semibold text-muted-foreground">
            This section may be hidden on your screen. Use the sidebar menu if you do not see it immediately.
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
          <Button type="button" variant="ghost" onClick={completeTour}>
            Skip
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isFirstStep}
              onClick={() => setStepIndex((index) => Math.max(0, index - 1))}
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (isLastStep) {
                  completeTour();
                  return;
                }

                setStepIndex((index) => Math.min(steps.length - 1, index + 1));
              }}
            >
              {isLastStep ? "Finish" : "Next"}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
