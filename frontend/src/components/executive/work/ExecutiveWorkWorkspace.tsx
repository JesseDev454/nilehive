import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  CheckSquare,
  Clock,
  Edit3,
  Filter,
  HelpCircle,
  Info,
  Layers,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Tag,
  User,
  Users,
  X
} from "lucide-react";
import { Button } from "@/shared/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/Card";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/Dialog";
import { Banner } from "@/shared/components/Banner";
import { TextField } from "@/shared/components/TextField";

export type ExecutiveTaskStatus = "Pending" | "In Progress" | "Completed" | "Blocked";
export type ExecutiveTaskPriority = "Urgent" | "High" | "Medium" | "Low";

export interface ExecutiveTask {
  id: string;
  title: string;
  description: string;
  assignedBy: string;
  assignedRole: string;
  assignedDate: string;
  dueDate: string;
  priority: ExecutiveTaskPriority;
  status: ExecutiveTaskStatus;
  blockerReason?: string;
  progressNote?: string;
  eventContext?: string;
}

export const INITIAL_EXECUTIVE_TASKS: ExecutiveTask[] = [
  {
    id: "task-01",
    title: "Finalize Venue Audio/Visual Setup with Nile ICT Lab",
    description: "Coordinate with Mr. Bello at Nile ICT Lab to secure dual wireless microphones, HDMI distribution box, and a backup projector for DevFest Keynote in Auditorium 1.",
    assignedBy: "Tariq Ibrahim",
    assignedRole: "Club President",
    assignedDate: "Aug 18, 2025",
    dueDate: "Tomorrow, 2:00 PM",
    priority: "High",
    status: "In Progress",
    progressNote: "Conducted preliminary audio walk in Auditorium 1. Testing backup projector with ICT engineer tomorrow morning.",
    eventContext: "Nile DevFest & Keynote 2025"
  },
  {
    id: "task-02",
    title: "Test HDMI Matrix & Projector Resolution in Aud 1",
    description: "Run 1080p and 4K display resolution checks on the main projection screens before the speaker keynote decks are loaded.",
    assignedBy: "Tariq Ibrahim",
    assignedRole: "Club President",
    assignedDate: "Aug 17, 2025",
    dueDate: "Thursday, 10:00 AM",
    priority: "Urgent",
    status: "Blocked",
    blockerReason: "Waiting on Auditorium 1 security key from Nile Campus Safety supervisor.",
    eventContext: "Nile DevFest & Keynote 2025"
  },
  {
    id: "task-03",
    title: "Prepare Workshop Code Starter Repositories on GitHub",
    description: "Set up the starter branch, README guide, and Docker compose configuration for the Android Jetpack Compose coding session.",
    assignedBy: "Zainab Mukhtar",
    assignedRole: "Vice President & Tech Lead",
    assignedDate: "Aug 16, 2025",
    dueDate: "Friday, 5:00 PM",
    priority: "Medium",
    status: "Pending",
    eventContext: "Android Jetpack Bootcamp"
  },
  {
    id: "task-04",
    title: "Confirm Participant Lanyard & Name Tag Badges",
    description: "Cross-check the confirmed attendee headcount (142 students) with the media printing team for badge printouts.",
    assignedBy: "Tariq Ibrahim",
    assignedRole: "Club President",
    assignedDate: "Aug 15, 2025",
    dueDate: "Saturday, 8:30 AM",
    priority: "Medium",
    status: "Pending",
    eventContext: "Nile DevFest & Keynote 2025"
  },
  {
    id: "task-05",
    title: "Draft Post-Workshop Feedback Google Form",
    description: "Formulate 5 quantitative survey questions assessing hands-on code lab difficulty, speaker pacing, and lab WiFi stability.",
    assignedBy: "Tariq Ibrahim",
    assignedRole: "Club President",
    assignedDate: "Aug 14, 2025",
    dueDate: "Completed Aug 19",
    priority: "Low",
    status: "Completed",
    progressNote: "Form finalized and shared with President for review.",
    eventContext: "Flutter Hands-on Lab"
  }
];

export function ExecutiveWorkWorkspace() {
  const executiveName = "Fatima Al-Hassan";
  const clubName = "Nile Google Developers";

  const [tasks, setTasks] = useState<ExecutiveTask[]>(INITIAL_EXECUTIVE_TASKS);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<"All" | ExecutiveTaskStatus>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [activeTaskDetail, setActiveTaskDetail] = useState<ExecutiveTask | null>(null);
  const [blockerModalTask, setBlockerModalTask] = useState<ExecutiveTask | null>(null);
  const [blockerInput, setBlockerInput] = useState("");
  const [progressModalTask, setProgressModalTask] = useState<ExecutiveTask | null>(null);
  const [progressInput, setProgressInput] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Counts
  const counts = {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === "Pending").length,
    inProgress: tasks.filter((t) => t.status === "In Progress").length,
    blocked: tasks.filter((t) => t.status === "Blocked").length,
    completed: tasks.filter((t) => t.status === "Completed").length,
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesStatus =
        selectedStatusFilter === "All" ? true : task.status === selectedStatusFilter;
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.eventContext && task.eventContext.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [tasks, selectedStatusFilter, searchQuery]);

  const handleUpdateStatus = (taskId: string, newStatus: ExecutiveTaskStatus) => {
    if (newStatus === "Blocked") {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        setBlockerModalTask(task);
        setBlockerInput(task.blockerReason || "");
      }
      return;
    }

    setTasks((prev) =>
      prev.map((item) => {
        if (item.id === taskId) {
          return {
            ...item,
            status: newStatus,
            blockerReason: newStatus === "Completed" ? undefined : item.blockerReason,
          };
        }
        return item;
      })
    );

    setToastMessage(`Action updated to "${newStatus}".`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveBlocker = () => {
    if (!blockerModalTask) return;

    setTasks((prev) =>
      prev.map((item) => {
        if (item.id === blockerModalTask.id) {
          return {
            ...item,
            status: "Blocked",
            blockerReason: blockerInput.trim() || "Awaiting external resource or clearance.",
          };
        }
        return item;
      })
    );

    setBlockerModalTask(null);
    setToastMessage("Blocker noted and flagged for presidential review.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveProgress = () => {
    if (!progressModalTask) return;

    setTasks((prev) =>
      prev.map((item) => {
        if (item.id === progressModalTask.id) {
          return {
            ...item,
            progressNote: progressInput.trim() || undefined,
          };
        }
        return item;
      })
    );

    setProgressModalTask(null);
    setToastMessage("Progress note recorded.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <main
      className="space-y-6 max-w-5xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in"
      aria-labelledby="executive-work-heading"
    >
      {/* HEADER & ROLE BADGE */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              id="executive-work-indicator"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-primary uppercase"
            >
              EXECUTIVE/MY WORK
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              {clubName}
            </span>
          </div>

          <h1
            id="executive-work-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight text-foreground"
          >
            My Work &amp; Action List
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            A focused action list of operational deliverables assigned to you by the Club President and Vice President.
          </p>
        </div>

        {/* Action List Summary Badge */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-muted/60 border border-border/60 text-xs font-mono font-bold text-foreground flex items-center gap-2">
            <span>{counts.pending + counts.inProgress + counts.blocked} Active</span>
            <span>&bull;</span>
            <span className="text-emerald-600 dark:text-emerald-400">{counts.completed} Done</span>
          </div>
        </div>
      </header>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <Banner
          variant="success"
          title="Status Updated"
          description={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* STATUS TABS & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setSelectedStatusFilter("All")}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              selectedStatusFilter === "All"
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-muted/40 text-muted-foreground hover:text-foreground border-border/60 hover:bg-muted/60"
            }`}
          >
            All ({counts.all})
          </button>

          <button
            type="button"
            onClick={() => setSelectedStatusFilter("Pending")}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              selectedStatusFilter === "Pending"
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-muted/40 text-muted-foreground hover:text-foreground border-border/60 hover:bg-muted/60"
            }`}
          >
            Pending ({counts.pending})
          </button>

          <button
            type="button"
            onClick={() => setSelectedStatusFilter("In Progress")}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              selectedStatusFilter === "In Progress"
                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                : "bg-muted/40 text-muted-foreground hover:text-foreground border-border/60 hover:bg-muted/60"
            }`}
          >
            In Progress ({counts.inProgress})
          </button>

          <button
            type="button"
            onClick={() => setSelectedStatusFilter("Blocked")}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              selectedStatusFilter === "Blocked"
                ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                : "bg-muted/40 text-muted-foreground hover:text-foreground border-border/60 hover:bg-muted/60"
            }`}
          >
            Blocked ({counts.blocked})
          </button>

          <button
            type="button"
            onClick={() => setSelectedStatusFilter("Completed")}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              selectedStatusFilter === "Completed"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-muted/40 text-muted-foreground hover:text-foreground border-border/60 hover:bg-muted/60"
            }`}
          >
            Completed ({counts.completed})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search action items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-border/80 bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-hidden"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* LINEAR ACTION LIST */}
      {filteredTasks.length === 0 ? (
        <div className="rounded-2xl border border-border/70 bg-card p-10 text-center space-y-3">
          <div className="h-10 w-10 rounded-xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
            <CheckSquare className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-foreground">No Action Items Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery
              ? `No actions match "${searchQuery}". Try a different keyword.`
              : `No actions currently categorized as "${selectedStatusFilter}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <Card
              key={task.id}
              className={`border-border/80 shadow-xs transition-all ${
                task.status === "Blocked"
                  ? "border-amber-500/40 bg-amber-500/5"
                  : task.status === "Completed"
                  ? "border-emerald-500/30 bg-emerald-500/5 opacity-80"
                  : "bg-card"
              }`}
            >
              <CardContent className="p-4 sm:p-5 space-y-3 text-xs">
                {/* Title & Priority & Status */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-foreground">
                        {task.title}
                      </span>
                      {task.priority === "Urgent" && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-destructive/15 text-destructive font-mono">
                          URGENT
                        </span>
                      )}
                      {task.priority === "High" && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 font-mono">
                          HIGH
                        </span>
                      )}
                      {task.priority === "Medium" && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-300 font-mono">
                          MEDIUM
                        </span>
                      )}
                      {task.eventContext && (
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          {task.eventContext}
                        </span>
                      )}
                    </div>

                    <p className="text-muted-foreground text-xs leading-relaxed max-w-3xl">
                      {task.description}
                    </p>
                  </div>

                  <StatusBadge
                    variant={
                      task.status === "Completed"
                        ? "success"
                        : task.status === "Blocked"
                        ? "warning"
                        : task.status === "In Progress"
                        ? "info"
                        : "default"
                    }
                    label={task.status}
                  />
                </div>

                {/* Blocker Callout if Blocked */}
                {task.status === "Blocked" && task.blockerReason && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 text-xs flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Blocker Notice:</strong> {task.blockerReason}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setBlockerModalTask(task);
                        setBlockerInput(task.blockerReason || "");
                      }}
                      className="text-[10px] font-bold text-amber-700 dark:text-amber-300 underline shrink-0 hover:text-foreground"
                    >
                      Edit Blocker
                    </button>
                  </div>
                )}

                {/* Progress Note if Available */}
                {task.progressNote && task.status !== "Blocked" && (
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-xs flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <div className="text-muted-foreground">
                        <strong className="text-foreground">Progress Log:</strong> {task.progressNote}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setProgressModalTask(task);
                        setProgressInput(task.progressNote || "");
                      }}
                      className="text-[10px] font-bold text-primary underline shrink-0 hover:text-foreground"
                    >
                      Update Note
                    </button>
                  </div>
                )}

                {/* Footer Controls & Status Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-border/50 text-xs">
                  <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-[11px]">
                    <span>
                      Assigned by <strong>{task.assignedBy}</strong> ({task.assignedRole})
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Due: <strong>{task.dueDate}</strong>
                    </span>
                  </div>

                  {/* Status Actions */}
                  <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setProgressModalTask(task);
                        setProgressInput(task.progressNote || "");
                      }}
                      className="px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60 text-[11px] font-semibold transition-colors"
                      title="Add or update progress note"
                    >
                      Add Note
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(task.id, "Pending")}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-colors ${
                        task.status === "Pending"
                          ? "bg-muted text-foreground border-border"
                          : "bg-card text-muted-foreground hover:text-foreground border-border/50"
                      }`}
                    >
                      Pending
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(task.id, "In Progress")}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-colors ${
                        task.status === "In Progress"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-card text-muted-foreground hover:text-foreground border-border/50"
                      }`}
                    >
                      In Progress
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(task.id, "Blocked")}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-colors ${
                        task.status === "Blocked"
                          ? "bg-amber-600 text-white border-amber-600"
                          : "bg-card text-muted-foreground hover:text-foreground border-border/50"
                      }`}
                    >
                      Flag Blocked
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(task.id, "Completed")}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-colors ${
                        task.status === "Completed"
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-card text-muted-foreground hover:text-foreground border-border/50"
                      }`}
                    >
                      Complete
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* BLOCKER REASON MODAL DIALOG */}
      <Dialog open={!!blockerModalTask} onOpenChange={(open) => !open && setBlockerModalTask(null)}>
        <DialogContent maxWidth="sm">
          <div className="space-y-4 text-xs">
            <DialogHeader>
              <DialogTitle className="text-amber-700 dark:text-amber-400 text-base flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                Flag Task as Blocked
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Specify what is preventing completion of <strong>{blockerModalTask?.title}</strong> so the Club President can intervene.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <label htmlFor="modal-blocker-text" className="font-bold text-foreground text-xs block">
                Blocker Detail / Required Unblocking Action
              </label>
              <textarea
                id="modal-blocker-text"
                rows={3}
                value={blockerInput}
                onChange={(e) => setBlockerInput(e.target.value)}
                placeholder="e.g. Awaiting venue keys from security, need budget clearance from advisor..."
                className="w-full p-3 rounded-xl border border-border/80 bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-hidden leading-relaxed"
              />
            </div>

            <DialogFooter className="pt-2 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setBlockerModalTask(null)}
                className="w-1/2 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveBlocker}
                className="w-1/2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white"
              >
                Save Blocker Flag
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* PROGRESS NOTE MODAL DIALOG */}
      <Dialog open={!!progressModalTask} onOpenChange={(open) => !open && setProgressModalTask(null)}>
        <DialogContent maxWidth="sm">
          <div className="space-y-4 text-xs">
            <DialogHeader>
              <DialogTitle className="text-foreground text-base flex items-center gap-1.5">
                <Edit3 className="h-4 w-4 text-primary" />
                Log Progress Note
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Add an operational update for <strong>{progressModalTask?.title}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <label htmlFor="modal-progress-text" className="font-bold text-foreground text-xs block">
                Progress Details
              </label>
              <textarea
                id="modal-progress-text"
                rows={3}
                value={progressInput}
                onChange={(e) => setProgressInput(e.target.value)}
                placeholder="e.g. Contacted supplier, testing scheduled for tomorrow..."
                className="w-full p-3 rounded-xl border border-border/80 bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:outline-hidden leading-relaxed"
              />
            </div>

            <DialogFooter className="pt-2 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setProgressModalTask(null)}
                className="w-1/2 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveProgress}
                className="w-1/2 text-xs font-bold"
              >
                Save Note
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
