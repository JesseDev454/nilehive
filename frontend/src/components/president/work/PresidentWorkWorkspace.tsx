import { useState, useMemo } from "react";
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  CheckSquare,
  Clock,
  Edit2,
  Eye,
  Filter,
  Layers,
  MoreVertical,
  Plus,
  Search,
  Send,
  Sparkles,
  Tag,
  Trash2,
  User,
  UserCheck,
  Users,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/shared/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/Card";
import { TextField } from "@/shared/components/TextField";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/Dialog";
import { Banner } from "@/shared/components/Banner";

export type TaskPriority = "High" | "Medium" | "Low";
export type TaskStatus = "Pending" | "In Progress" | "Completed";

export interface ClubExecutive {
  id: string;
  name: string;
  roleTitle: string;
  department: string;
  email: string;
}

export interface ClubTaskRecord {
  id: string;
  title: string;
  description: string;
  assignedTo: ClubExecutive;
  assignedBy: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null; // Optional due date
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

export const CLUB_EXECUTIVES: ClubExecutive[] = [
  {
    id: "exec-01",
    name: "Zainab Mukhtar",
    roleTitle: "Vice President & Tech Lead",
    department: "Computer Science (400L)",
    email: "z.mukhtar@nileuniversity.edu.ng"
  },
  {
    id: "exec-02",
    name: "Tariq Ibrahim",
    roleTitle: "Workshops Coordinator",
    department: "Software Engineering (300L)",
    email: "tariq.ibrahim@nileuniversity.edu.ng"
  },
  {
    id: "exec-03",
    name: "Oluwaseun Adeleke",
    roleTitle: "Logistics & Treasury Officer",
    department: "Business Administration (400L)",
    email: "o.adeleke@nileuniversity.edu.ng"
  }
];

const INITIAL_TASKS: ClubTaskRecord[] = [
  {
    id: "task-101",
    title: "Finalize Speaker Itinerary for Flutter Workshop",
    description: "Coordinate arrival time, campus security clearance, and AV setup for Google Developer Expert keynote.",
    assignedTo: CLUB_EXECUTIVES[0], // Zainab
    assignedBy: "Farouk Al-Mansoor (President)",
    priority: "High",
    status: "In Progress",
    dueDate: "2026-08-25",
    createdAt: "Aug 18, 2026",
    notes: "Security passes must be submitted to Student Affairs by Thursday 2 PM."
  },
  {
    id: "task-102",
    title: "Inspect Lab 3 WiFi Router & Projector HDMI Switchers",
    description: "Verify that all 45 desktop workstations have active internet connectivity and test the main overhead projector.",
    assignedTo: CLUB_EXECUTIVES[1], // Tariq
    assignedBy: "Farouk Al-Mansoor (President)",
    priority: "Medium",
    status: "Pending",
    dueDate: "2026-08-23",
    createdAt: "Aug 19, 2026"
  },
  {
    id: "task-103",
    title: "Reconcile Refreshment Invoices with Campus Cafeteria",
    description: "Collect printed receipts for the 90 snack boxes distributed during the Git bootcamp session.",
    assignedTo: CLUB_EXECUTIVES[2], // Oluwaseun
    assignedBy: "Farouk Al-Mansoor (President)",
    priority: "Low",
    status: "Completed",
    dueDate: "2026-08-20",
    createdAt: "Aug 15, 2026",
    completedAt: "Aug 20, 2026",
    notes: "Total verified: ₦41,500. Receipts matched in treasurer ledger."
  }
];

export function PresidentWorkWorkspace() {
  const { profile } = useAuth();
  const presidentName = profile?.full_name || "Farouk Al-Mansoor";
  const clubName = profile?.club_name || "Nile Google Developers";
  const clubCode = "NGD";

  const [tasks, setTasks] = useState<ClubTaskRecord[]>(INITIAL_TASKS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");

  // Selection & Details Dialog
  const [selectedTask, setSelectedTask] = useState<ClubTaskRecord | null>(null);

  // New Task Dialog State
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({
    title: "",
    description: "",
    assignedExecId: CLUB_EXECUTIVES[0].id,
    priority: "Medium" as TaskPriority,
    dueDate: ""
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Confirmation State
  const [taskToDelete, setTaskToDelete] = useState<ClubTaskRecord | null>(null);

  // Success Feedback Banner
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Filtered Tasks List
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.assignedTo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "All" || t.status === statusFilter;
      const matchesPriority = priorityFilter === "All" || t.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  // Task Statistics
  const pendingCount = useMemo(() => tasks.filter((t) => t.status === "Pending").length, [tasks]);
  const inProgressCount = useMemo(() => tasks.filter((t) => t.status === "In Progress").length, [tasks]);
  const completedCount = useMemo(() => tasks.filter((t) => t.status === "Completed").length, [tasks]);

  // Handle Create Task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskForm.title.trim()) {
      setFormError("Please provide a descriptive task title.");
      return;
    }

    const assignedExec = CLUB_EXECUTIVES.find((e) => e.id === newTaskForm.assignedExecId) || CLUB_EXECUTIVES[0];

    setIsSubmittingTask(true);
    setFormError(null);

    setTimeout(() => {
      const newTask: ClubTaskRecord = {
        id: `task-${Date.now().toString().slice(-3)}`,
        title: newTaskForm.title.trim(),
        description: newTaskForm.description.trim(),
        assignedTo: assignedExec,
        assignedBy: `${presidentName} (President)`,
        priority: newTaskForm.priority,
        status: "Pending",
        dueDate: newTaskForm.dueDate.trim() ? newTaskForm.dueDate : null,
        createdAt: "Just now"
      };

      setTasks((prev) => [newTask, ...prev]);
      setIsSubmittingTask(false);
      setIsNewTaskOpen(false);
      setNewTaskForm({
        title: "",
        description: "",
        assignedExecId: CLUB_EXECUTIVES[0].id,
        priority: "Medium",
        dueDate: ""
      });
      setSuccessBanner(`Task "${newTask.title}" assigned to ${assignedExec.name}.`);
      setTimeout(() => setSuccessBanner(null), 5000);
    }, 350);
  };

  // Toggle Task Status (Quick status transition)
  const handleUpdateStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const isDone = newStatus === "Completed";
          return {
            ...t,
            status: newStatus,
            completedAt: isDone ? "Today" : undefined
          };
        }
        return t;
      })
    );

    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask((prev) => prev ? { ...prev, status: newStatus } : null);
    }
  };

  // Handle Delete Task
  const handleConfirmDelete = () => {
    if (!taskToDelete) return;
    setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
    if (selectedTask?.id === taskToDelete.id) {
      setSelectedTask(null);
    }
    setTaskToDelete(null);
    setSuccessBanner("Assigned task removed.");
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case "High":
        return "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30";
      case "Medium":
        return "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30";
      case "Low":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30";
    }
  };

  return (
    <main className="space-y-6 max-w-5xl mx-auto text-left py-2 px-1 sm:px-0 animate-fade-in" aria-labelledby="club-work-heading">
      {/* Header & Visual Cue */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              id="president-club-work-indicator"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-primary uppercase"
            >
              PRESIDENT/CLUB_WORK
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Delegation &bull; {clubCode}
            </span>
          </div>
          <h1 id="club-work-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {clubName} Executive Delegation
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Assign lightweight responsibilities and operational tasks to your executive committee members. Track progress, due dates, and completion milestones.
          </p>
        </div>

        {/* Primary Action Button */}
        <Button
          onClick={() => {
            setFormError(null);
            setIsNewTaskOpen(true);
          }}
          size="sm"
          className="font-bold gap-1.5 self-start sm:self-auto text-xs shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Assign New Task</span>
        </Button>
      </header>

      {/* CONFIRMATION BANNER */}
      {successBanner && (
        <Banner
          variant="success"
          title="Executive Work Updated"
          description={successBanner}
          onClose={() => setSuccessBanner(null)}
        />
      )}

      {/* METRICS OVERVIEW */}
      <section aria-labelledby="work-overview-heading" className="grid grid-cols-3 gap-3">
        <Card className="p-3.5 border-border/80 flex items-center justify-between bg-card">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">In Progress</span>
            <p className="text-lg sm:text-xl font-bold text-primary font-mono">{inProgressCount}</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Clock className="h-4 w-4" />
          </div>
        </Card>

        <Card className="p-3.5 border-border/80 flex items-center justify-between bg-card">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pending Start</span>
            <p className="text-lg sm:text-xl font-bold text-amber-600 dark:text-amber-400 font-mono">{pendingCount}</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Layers className="h-4 w-4" />
          </div>
        </Card>

        <Card className="p-3.5 border-border/80 flex items-center justify-between bg-card">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Completed</span>
            <p className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">{completedCount}</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </Card>
      </section>

      {/* FILTER CONTROLS */}
      <section aria-labelledby="filter-heading" className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="w-full sm:w-72">
            <TextField
              id="search-tasks"
              placeholder="Search tasks, descriptions, or executives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startAdornment={<Search className="h-4 w-4 text-muted-foreground" />}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/60 text-xs">
              {(["All", "In Progress", "Pending", "Completed"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    statusFilter === st
                      ? "bg-card text-foreground font-bold shadow-xs border border-border/60"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/60 text-xs">
              {(["All", "High", "Medium", "Low"] as const).map((pr) => (
                <button
                  key={pr}
                  type="button"
                  onClick={() => setPriorityFilter(pr)}
                  className={`px-2 py-1 rounded-lg font-medium transition-all ${
                    priorityFilter === pr
                      ? "bg-card text-foreground font-bold shadow-xs border border-border/60"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {pr}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TASKS LIST SECTION */}
      <section aria-labelledby="tasks-list-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="tasks-list-heading" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Club Executive Tasks ({filteredTasks.length})
          </h2>
          <span className="text-[11px] text-muted-foreground">
            Lightweight delegation &bull; Non-board list
          </span>
        </div>

        {tasks.length === 0 ? (
          /* EMPTY STATE: NO ASSIGNED WORK YET */
          <Card className="border-dashed border-border/80 p-10 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
              <CheckSquare className="h-6 w-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-sm font-bold text-foreground">No assigned work yet</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You haven’t delegated any operational tasks to your executive committee yet. Delegate logistics, technical setups, and workshop tasks to keep your team aligned.
              </p>
            </div>
            <Button
              onClick={() => setIsNewTaskOpen(true)}
              size="sm"
              className="text-xs font-bold gap-1 mt-2"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Assign First Task</span>
            </Button>
          </Card>
        ) : filteredTasks.length === 0 ? (
          /* EMPTY STATE: NO MATCHING SEARCH RESULTS */
          <Card className="border-dashed border-border/80 p-8 text-center space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground mx-auto">
              <Search className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-foreground">No matching tasks</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              No executive tasks match your current filter and search criteria.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("All");
                setPriorityFilter("All");
              }}
              className="text-xs mt-1"
            >
              Clear Filters
            </Button>
          </Card>
        ) : (
          /* POPULATED VERTICAL LIST */
          <div className="space-y-2.5">
            {filteredTasks.map((task) => (
              <Card
                key={task.id}
                hoverable
                onClick={() => setSelectedTask(task)}
                className="p-4 border-border/80 hover:border-primary/50 cursor-pointer transition-all duration-180 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-primary">
                      {task.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority} Priority
                    </span>
                    <StatusBadge
                      status={
                        task.status === "Completed"
                          ? "success"
                          : task.status === "In Progress"
                          ? "info"
                          : "warning"
                      }
                      label={task.status}
                    />
                  </div>

                  <h3 className={`text-sm font-bold text-foreground leading-snug ${task.status === "Completed" ? "line-through opacity-70" : ""}`}>
                    {task.title}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
                    {task.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1 text-foreground font-medium">
                      <User className="h-3.5 w-3.5 text-primary" />
                      <span>{task.assignedTo.name}</span>
                      <span className="text-[10px] text-muted-foreground">({task.assignedTo.roleTitle})</span>
                    </span>

                    {task.dueDate && (
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>Due: {task.dueDate}</span>
                      </span>
                    )}

                    <span className="text-[10px] text-muted-foreground/80">
                      Created {task.createdAt}
                    </span>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div
                  className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40 w-full sm:w-auto justify-between sm:justify-end"
                  onClick={(e) => e.stopPropagation()}
                >
                  <select
                    value={task.status}
                    onChange={(e) => handleUpdateStatus(task.id, e.target.value as TaskStatus)}
                    className="h-8 rounded-lg border border-border/80 bg-card px-2.5 text-xs text-foreground font-medium focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setTaskToDelete(task)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Remove Task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* ASSIGN NEW TASK MODAL */}
      <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
        <DialogContent maxWidth="md">
          <form onSubmit={handleCreateTask} className="space-y-4">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-primary/10 text-primary">
                  {clubCode} &bull; DELEGATION
                </span>
                <span className="text-[11px] text-muted-foreground">Executive Committee</span>
              </div>
              <DialogTitle className="text-foreground text-base sm:text-lg">
                Assign Executive Task
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Delegate an operational responsibility to one of your club officers.
              </DialogDescription>
            </DialogHeader>

            {formError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-xs text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <TextField
                id="task-title"
                label="Task Title"
                placeholder="e.g., Secure Lab 3 Audio-Visual Key & Cables"
                required
                value={newTaskForm.title}
                onChange={(e) => setNewTaskForm((prev) => ({ ...prev, title: e.target.value }))}
                helperText="Clear, actionable summary of what needs to be done."
              />

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Assign To Executive
                </label>
                <select
                  value={newTaskForm.assignedExecId}
                  onChange={(e) => setNewTaskForm((prev) => ({ ...prev, assignedExecId: e.target.value }))}
                  className="w-full rounded-xl border border-border/80 bg-card p-2.5 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                >
                  {CLUB_EXECUTIVES.map((exec) => (
                    <option key={exec.id} value={exec.id}>
                      {exec.name} — {exec.roleTitle} ({exec.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Task Description &amp; Instructions
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide context, required deliverables, student contacts, or instructions..."
                  value={newTaskForm.description}
                  onChange={(e) => setNewTaskForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-xl border border-border/80 bg-card p-3 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Priority Level
                  </label>
                  <select
                    value={newTaskForm.priority}
                    onChange={(e) =>
                      setNewTaskForm((prev) => ({ ...prev, priority: e.target.value as TaskPriority }))
                    }
                    className="w-full rounded-xl border border-border/80 bg-card p-2.5 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                  >
                    <option value="High">High (Urgent before next event)</option>
                    <option value="Medium">Medium (Standard operational task)</option>
                    <option value="Low">Low (Administrative backlog)</option>
                  </select>
                </div>

                <TextField
                  id="task-due-date"
                  label="Due Date (Optional)"
                  type="date"
                  value={newTaskForm.dueDate}
                  onChange={(e) => setNewTaskForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                  helperText="Leave empty if open-ended."
                />
              </div>
            </div>

            <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsNewTaskOpen(false)}
                className="w-full sm:w-1/2 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmittingTask || !newTaskForm.title.trim()}
                className="w-full sm:w-1/2 text-xs font-bold gap-1 bg-primary text-primary-foreground"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isSubmittingTask ? "Assigning..." : "Assign Task"}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* TASK DETAILS INSPECT DIALOG */}
      <Dialog open={Boolean(selectedTask)} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent maxWidth="md">
          {selectedTask && (
            <div className="space-y-4 text-xs">
              <DialogHeader>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-primary">
                    {selectedTask.id}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityColor(
                        selectedTask.priority
                      )}`}
                    >
                      {selectedTask.priority}
                    </span>
                    <StatusBadge
                      status={
                        selectedTask.status === "Completed"
                          ? "success"
                          : selectedTask.status === "In Progress"
                          ? "info"
                          : "warning"
                      }
                      label={selectedTask.status}
                    />
                  </div>
                </div>
                <DialogTitle className="text-foreground text-base sm:text-lg">
                  {selectedTask.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Assigned by {selectedTask.assignedBy} &bull; Created {selectedTask.createdAt}
                </DialogDescription>
              </DialogHeader>

              {/* DETAILS GRID */}
              <div className="space-y-3">
                <div className="p-3.5 bg-muted/40 rounded-xl border border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Assigned Executive</span>
                    <p className="font-bold text-foreground">{selectedTask.assignedTo.name}</p>
                    <p className="text-[11px] text-muted-foreground">{selectedTask.assignedTo.roleTitle}</p>
                    <p className="text-[11px] font-mono text-muted-foreground">{selectedTask.assignedTo.email}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Due Date</span>
                    <p className="font-semibold text-foreground font-mono">
                      {selectedTask.dueDate || "No specific deadline set"}
                    </p>
                    {selectedTask.completedAt && (
                      <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] mt-1">
                        Completed: {selectedTask.completedAt}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-foreground">Task Instructions</h4>
                  <p className="text-muted-foreground leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/50">
                    {selectedTask.description || "No additional description provided."}
                  </p>
                </div>

                {selectedTask.notes && (
                  <div className="space-y-1">
                    <h4 className="font-bold text-foreground">Officer Progress Notes</h4>
                    <p className="text-muted-foreground leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/50">
                      {selectedTask.notes}
                    </p>
                  </div>
                )}

                {/* Status Updater inside details dialog */}
                <div className="p-3 bg-muted/30 rounded-xl border border-border/60 flex items-center justify-between">
                  <span className="font-semibold text-foreground">Update Execution Status:</span>
                  <div className="flex items-center gap-1.5">
                    {(["Pending", "In Progress", "Completed"] as const).map((st) => (
                      <Button
                        key={st}
                        size="sm"
                        variant={selectedTask.status === st ? "primary" : "outline"}
                        onClick={() => handleUpdateStatus(selectedTask.id, st)}
                        className="text-xs h-7 px-2.5 font-bold"
                      >
                        {st}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-2 flex justify-between items-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setTaskToDelete(selectedTask);
                  }}
                  className="text-xs gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTask(null)}
                  className="text-xs"
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={Boolean(taskToDelete)} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <DialogContent maxWidth="sm">
          {taskToDelete && (
            <div className="space-y-3 text-xs">
              <DialogHeader>
                <DialogTitle className="text-destructive text-base">
                  Delete Assigned Task?
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Are you sure you want to remove the task "{taskToDelete.title}" assigned to {taskToDelete.assignedTo.name}?
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="pt-2 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTaskToDelete(null)}
                  className="w-1/2 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleConfirmDelete}
                  className="w-1/2 text-xs font-bold"
                >
                  Delete Task
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
