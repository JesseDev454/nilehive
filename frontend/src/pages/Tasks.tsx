import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRole } from "@/contexts/RoleContext";
import {
  ApiClientError,
  createTask,
  getPresidentDashboard,
  getTasks,
  updateTaskStatus,
  type CreateTaskPayload,
  type TaskRecord
} from "@/lib/api";

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError || error instanceof Error) {
    return error.message;
  }

  return "Unable to load tasks right now.";
}

function getDateLabel(value?: string | null) {
  return value ? value.slice(0, 10) : "No due date";
}

function getTaskStatusLabel(status: string) {
  return status.replace(/_/g, " ");
}

function TaskBadge({ status }: { status: TaskRecord["status"] }) {
  const classNames = {
    pending: "bg-warning/15 text-warning hover:bg-warning/15",
    in_progress: "bg-primary/15 text-primary hover:bg-primary/15",
    completed: "bg-success/15 text-success hover:bg-success/15",
    blocked: "bg-destructive/15 text-destructive hover:bg-destructive/15"
  };

  return <Badge className={`${classNames[status]} capitalize`}>{getTaskStatusLabel(status)}</Badge>;
}

function PriorityBadge({ priority }: { priority: TaskRecord["priority"] }) {
  return <Badge variant="outline" className="capitalize">{priority}</Badge>;
}

function TaskCard({
  task,
  canUpdate,
  onStatusChange,
  isUpdating
}: {
  task: TaskRecord;
  canUpdate: boolean;
  onStatusChange: (task: TaskRecord, status: TaskRecord["status"]) => void;
  isUpdating: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">{task.title}</h3>
              <TaskBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
            </div>
            {task.description ? (
              <p className="text-sm text-muted-foreground">{task.description}</p>
            ) : null}
            <p className="text-xs text-muted-foreground">
              Due: {getDateLabel(task.due_date)} · Updated: {getDateLabel(task.updated_at)}
            </p>
          </div>

          {canUpdate ? (
            <Select
              value={task.status}
              disabled={isUpdating}
              onValueChange={(value) => onStatusChange(task, value as TaskRecord["status"])}
            >
              <SelectTrigger className="w-full lg:w-[190px]">
                <SelectValue placeholder="Update status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Tasks() {
  const { role } = useRole();
  const queryClient = useQueryClient();
  const [assignedTo, setAssignedTo] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<CreateTaskPayload["priority"]>("medium");
  const [dueDate, setDueDate] = useState("");
  const canUseTasks = role === "president" || role === "executive";

  const {
    data: tasks = [],
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["tasks", role],
    queryFn: () => getTasks(),
    enabled: canUseTasks,
    retry: false
  });
  const { data: presidentDashboard } = useQuery({
    queryKey: ["president-dashboard"],
    queryFn: () => getPresidentDashboard(),
    enabled: role === "president",
    retry: false
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createTask({
        assigned_to: assignedTo,
        title,
        description: description || null,
        priority,
        due_date: dueDate || null
      }),
    onSuccess: async () => {
      toast.success("Task assigned", {
        description: "The executive can now see this task."
      });
      setAssignedTo("");
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["tasks"] }),
        queryClient.invalidateQueries({ queryKey: ["president-dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["executive-dashboard"] })
      ]);
    },
    onError: (mutationError) => {
      toast.error("Could not assign task", {
        description: getErrorMessage(mutationError)
      });
    }
  });
  const updateMutation = useMutation({
    mutationFn: ({ task, status }: { task: TaskRecord; status: TaskRecord["status"] }) =>
      updateTaskStatus(task.id, {
        status,
        remarks: `Status changed to ${getTaskStatusLabel(status)}`
      }),
    onSuccess: async () => {
      toast.success("Task updated");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["tasks"] }),
        queryClient.invalidateQueries({ queryKey: ["president-dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["executive-dashboard"] })
      ]);
    },
    onError: (mutationError) => {
      toast.error("Could not update task", {
        description: getErrorMessage(mutationError)
      });
    }
  });

  function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate();
  }

  function handleStatusChange(task: TaskRecord, status: TaskRecord["status"]) {
    if (task.status === status) {
      return;
    }

    updateMutation.mutate({ task, status });
  }

  if (!canUseTasks) {
    return (
      <div className="space-y-6 animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground text-sm mt-1">Task delegation is available to presidents and executives.</p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">This role does not use task delegation yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold">{role === "president" ? "Task Delegation" : "My Tasks"}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {role === "president"
            ? "Assign work to executives and track progress."
            : "Track and update tasks assigned by your president."}
        </p>
      </div>

      {role === "president" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Assign A Task</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTask} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assigned_to">Executive</Label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger id="assigned_to">
                    <SelectValue placeholder="Select an executive" />
                  </SelectTrigger>
                  <SelectContent>
                    {presidentDashboard?.executive_team.map((executive) => (
                      <SelectItem key={executive.id} value={executive.id}>
                        {executive.full_name || "Unnamed executive"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Prepare event budget"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(value) => setPriority(value as CreateTaskPayload["priority"])}>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                />
              </div>
              <div className="lg:col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Add task context, expectations, or links."
                />
              </div>
              <div className="lg:col-span-2 flex justify-end">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    "Assign Task"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{role === "president" ? "Club Task Board" : "Assigned Tasks"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading tasks...</p>
          ) : isError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <p className="font-medium">Unable to load tasks</p>
              <p className="text-sm text-muted-foreground mt-1">{getErrorMessage(error)}</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <ClipboardList className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No tasks yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                {role === "president"
                  ? "Assign the first task to an executive above."
                  : "Assigned tasks from your president will appear here."}
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                canUpdate={role === "executive" || role === "president"}
                isUpdating={updateMutation.isPending}
                onStatusChange={handleStatusChange}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
