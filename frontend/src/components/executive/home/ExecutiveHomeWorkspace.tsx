import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronRight,
  Clock,
  ExternalLink,
  HelpCircle,
  Info,
  Layers,
  MapPin,
  RefreshCw,
  School,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  WifiOff,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/shared/components/Button";
import { Banner } from "@/shared/components/Banner";
import { AssignedClubSection } from "./AssignedClubSection";
import { AssignedActionsSection } from "./AssignedActionsSection";
import { UpcomingEventsSection } from "./UpcomingEventsSection";
import { UpdateActionModal } from "./UpdateActionModal";

export type ExecutiveTaskStatus = "Pending" | "In Progress" | "Completed" | "Blocked";
export type ExecutiveTaskPriority = "Urgent" | "High" | "Medium" | "Low";

export interface ExecutiveActionItem {
  id: string;
  title: string;
  description: string;
  assignedBy: string;
  dueDate: string;
  priority: ExecutiveTaskPriority;
  status: ExecutiveTaskStatus;
  blockerReason?: string;
  progressNote?: string;
}

export const INITIAL_EXECUTIVE_ACTIONS: ExecutiveActionItem[] = [
  {
    id: "exec-act-1",
    title: "Finalize Venue Audio/Visual Setup with Nile ICT Lab",
    description: "Verify HDMI splitters, secondary podium wireless microphones, and livestream capture rig in Innovation Lab 2 for the DevFest keynote.",
    assignedBy: "President Tariq Ibrahim",
    dueDate: "Tomorrow, 2:00 PM",
    priority: "High",
    status: "In Progress",
    progressNote: "Contacted Mr. Bello at ICT Lab. Audio testing scheduled for 11:00 AM."
  },
  {
    id: "exec-act-2",
    title: "Test HDMI Matrix & Projector Resolution in Aud 1",
    description: "Run display resolution checks on the main 4K projection screens before speaker slide decks are loaded.",
    assignedBy: "President Tariq Ibrahim",
    dueDate: "Thursday, 10:00 AM",
    priority: "Urgent",
    status: "Blocked",
    blockerReason: "Waiting on Auditorium 1 access key from Nile Security ICT supervisor."
  },
  {
    id: "exec-act-3",
    title: "Prepare Workshop Code Starter Repositories on GitHub",
    description: "Create GitHub template repository with boilerplate code for the Jetpack Compose & Cloud Functions coding session.",
    assignedBy: "Vice President Zainab Mukhtar",
    dueDate: "Friday, 5:00 PM",
    priority: "Medium",
    status: "Pending"
  },
  {
    id: "exec-act-4",
    title: "Confirm Participant Lanyard & Name Tag Badges",
    description: "Cross-check the confirmed attendee headcount (142 students) with the media printing team for badge printouts.",
    assignedBy: "President Tariq Ibrahim",
    dueDate: "Saturday, 8:30 AM",
    priority: "Medium",
    status: "Pending"
  },
  {
    id: "exec-act-5",
    title: "Draft Post-Workshop Feedback Google Form",
    description: "Formulate 5 survey questions assessing hands-on code lab difficulty and speaker engagement.",
    assignedBy: "President Tariq Ibrahim",
    dueDate: "Completed yesterday",
    priority: "Low",
    status: "Completed",
    progressNote: "Form finalized and shared with President for review."
  }
];

export function ExecutiveHomeWorkspace() {
  const { profile } = useAuth();
  const executiveName = profile?.full_name || "Fatima Al-Hassan";
  const clubName = profile?.club_name || "Nile Google Developers";
  const clubCode = "NGD";
  const officerRole = "Workshops Coordinator & Technical Logistics";

  const [actions, setActions] = useState<ExecutiveActionItem[]>(INITIAL_EXECUTIVE_ACTIONS);
  const [selectedActionForUpdate, setSelectedActionForUpdate] = useState<ExecutiveActionItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline] = useState(!navigator.onLine);

  // Active count calculation
  const activeCount = actions.filter(
    (a) => a.status === "Pending" || a.status === "In Progress" || a.status === "Blocked"
  ).length;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setToastMessage("Synced latest club actions and event schedules.");
      setTimeout(() => setToastMessage(null), 3000);
    }, 600);
  };

  const handleSaveActionUpdate = async (
    actionId: string,
    newStatus: ExecutiveTaskStatus,
    progressNote: string,
    blockerReason?: string
  ) => {
    // Simulate short network delay for responsive feedback
    await new Promise((resolve) => setTimeout(resolve, 300));

    setActions((prev) =>
      prev.map((item) => {
        if (item.id === actionId) {
          return {
            ...item,
            status: newStatus,
            progressNote: progressNote || item.progressNote,
            blockerReason: newStatus === "Blocked" ? blockerReason : undefined
          };
        }
        return item;
      })
    );

    if (newStatus === "Blocked") {
      setToastMessage("Action marked as Blocked. Flagged for President unblocking.");
    } else if (newStatus === "Completed") {
      setToastMessage("Action marked as Completed! Great work.");
    } else {
      setToastMessage(`Action status updated to "${newStatus}".`);
    }

    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleQuickStatusChange = (actionId: string, status: ExecutiveTaskStatus) => {
    if (status === "Blocked") {
      const act = actions.find((a) => a.id === actionId);
      if (act) setSelectedActionForUpdate(act);
      return;
    }

    setActions((prev) =>
      prev.map((item) => {
        if (item.id === actionId) {
          return {
            ...item,
            status,
            blockerReason: status === "Completed" ? undefined : item.blockerReason
          };
        }
        return item;
      })
    );

    setToastMessage(status === "Completed" ? "Action marked as Completed!" : `Status updated to ${status}.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <main
      className="space-y-7 max-w-5xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in"
      aria-labelledby="executive-home-heading"
    >
      {/* ROLE HEADER & IDENTITY BADGE */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              id="executive-home-indicator"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-primary uppercase"
            >
              EXECUTIVE/HOME
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              {officerRole}
            </span>
          </div>

          <h1
            id="executive-home-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight text-foreground"
          >
            Welcome, {executiveName.split(" ")[0]}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Support <strong>{clubName}</strong> ({clubCode}) by completing assigned operational actions, updating deliverable statuses, and preparing workshop logistics.
          </p>
        </div>

        {/* Header Actions: Refresh and Quick Link */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-xs font-semibold gap-1.5 h-8.5 px-3"
            aria-label="Refresh workspace data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
            <span>Sync</span>
          </Button>

          <Link to="/tasks">
            <Button size="sm" className="text-xs font-bold gap-1.5 h-8.5 bg-primary text-primary-foreground shadow-xs">
              <CheckSquare className="h-3.5 w-3.5" />
              <span>My Work ({activeCount})</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* OFFLINE STATUS NOTIFICATION */}
      {isOffline && (
        <Banner
          variant="warning"
          title="Offline Mode Active"
          description="Your changes will be stored in your browser and synchronized once Nile University network reconnects."
        />
      )}

      {/* TOAST NOTIFICATION FEEDBACK */}
      {toastMessage && (
        <Banner
          variant="success"
          title="Update Saved"
          description={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* SECTION 1: ASSIGNED CLUB */}
      <AssignedClubSection
        clubName={clubName}
        clubCode={clubCode}
        category="Technology & Innovation"
        faculty="Faculty of Natural & Applied Sciences"
        meetingSchedule="Every Tuesday, 4:00 PM – 5:30 PM"
        meetingVenue="Innovation Complex, Lab 2"
        accreditationTier="Tier 1 Accredited Society"
        totalMembers={148}
        presidentName="Tariq Ibrahim (400L)"
        advisorName="Dr. Aminu Galadima (Senior Lecturer)"
      />

      {/* SECTION 2: ASSIGNED ACTIONS THAT NEED AN UPDATE */}
      <AssignedActionsSection
        actions={actions}
        isLoading={isRefreshing}
        onOpenUpdateModal={(act) => setSelectedActionForUpdate(act)}
        onQuickStatusChange={handleQuickStatusChange}
      />

      {/* SECTION 3: UPCOMING EVENTS */}
      <UpcomingEventsSection />

      {/* PRIMARY WORKFLOW MODAL: UPDATE ACTION STATUS & PROGRESS NOTE */}
      <UpdateActionModal
        action={selectedActionForUpdate}
        isOpen={!!selectedActionForUpdate}
        onClose={() => setSelectedActionForUpdate(null)}
        onSave={handleSaveActionUpdate}
      />
    </main>
  );
}
export default ExecutiveHomeWorkspace;
