import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, Loader2, Target, UserCheck } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { DataPagination } from "@/components/DataPagination";
import { NeoLoadingState, NeoMetricCard, NeoPageHeader, NeoStateCard } from "@/components/NeoBrutal";
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
  getClubs,
  getPresidentDashboard,
  getTasks,
  updateTaskStatus,
  type CreateTaskPayload,
  type TaskRecord
} from "@/lib/api";
import { actionError, actionSuccess } from "@/lib/notify";
import { DEFAULT_PAGE_SIZE, emptyPaginatedResponse } from "@/lib/pagination";

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
    <div className="nh-list-card">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-black uppercase">{task.title}</h3>
              <TaskBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
            </div>
            {task.description ? (
              <p className="text-sm text-muted-foreground">{task.description}</p>
            ) : null}
            <p className="text-xs text-muted-foreground">
              Due: {getDateLabel(task.due_date)} - Updated: {getDateLabel(task.updated_at)}
            </p>
            <p className="text-xs text-muted-foreground">
              Assigned to {task.assigned_to_profile?.full_name || task.assigned_to}
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
    </div>
  );
}

export default function Tasks() {
  const { role } = useRole();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [assignedTo, setAssignedTo] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<CreateTaskPayload["priority"]>("medium");
  const [dueDate, setDueDate] = useState("");
  const [page, setPage] = useState(1);
  const adminClubId = searchParams.get("club_id") || "all";
  const canUseTasks = role === "president" || role === "executive" || role === "admin";
  useEffect(() => {
    setPage(1);
  }, [role, adminClubId]);

  const {
    data: tasksPage = emptyPaginatedResponse<TaskRecord>(),
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["tasks", role, adminClubId, page],
    queryFn: () =>
      getTasks({
        club_id: role === "admin" && adminClubId !== "all" ? adminClubId : undefined,
        page,
        page_size: DEFAULT_PAGE_SIZE
      }),
    enabled: canUseTasks,
    retry: false
  });
  const tasks = tasksPage.items;
  const { data: clubs = [] } = useQuery({
    queryKey: ["clubs", "tasks-admin-filter"],
    queryFn: () => getClubs(),
    enabled: role === "admin",
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
      actionSuccess("Task assigned", "The executive can now see this task.");
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
      actionError("Could not assign task", mutationError, getErrorMessage(mutationError));
    }
  });
  const updateMutation = useMutation({
    mutationFn: ({ task, status }: { task: TaskRecord; status: TaskRecord["status"] }) =>
      updateTaskStatus(task.id, {
        status,
        remarks: `Status changed to ${getTaskStatusLabel(status)}`
      }),
    onSuccess: async () => {
      actionSuccess("Task updated", "Progress has been saved.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["tasks"] }),
        queryClient.invalidateQueries({ queryKey: ["president-dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["executive-dashboard"] })
      ]);
    },
    onError: (mutationError) => {
      actionError("Could not update task", mutationError, getErrorMessage(mutationError));
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
      <div className="nh-page">
        <NeoPageHeader
          eyebrow="Operations"
          title="Tasks"
          description="Task delegation is available to club presidents, executives, and Club Services oversight."
        />
        <NeoStateCard
          icon={ClipboardList}
          title="Task access is restricted"
          message="This role does not use task delegation yet."
        />
      </div>
    );
  }

  return (
    <div className="nh-page">
      <NeoPageHeader
        eyebrow="Operations"
        title={role === "admin" ? "All Club Tasks" : role === "president" ? "Task Delegation" : "My Tasks"}
        description={
          role === "admin"
            ? "Read-only task oversight across clubs. Presidents assign tasks and executives update progress."
            : role === "president"
            ? "Assign work to executives and track progress from one club operations board."
            : "Track what your president assigned and keep your progress visible."
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <NeoMetricCard title="Total Tasks" value={tasksPage.total} icon={ClipboardList} tone="navy" />
        <NeoMetricCard title="In Progress" value={tasks.filter((task) => task.status === "in_progress").length} icon={Target} tone="gold" />
        <NeoMetricCard title="Completed" value={tasks.filter((task) => task.status === "completed").length} icon={UserCheck} tone="green" />
      </div>

      {role === "president" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Assign A Task</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTask} className="nh-form-grid">
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

      {role === "admin" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Club Filter</CardTitle>
            <p className="text-sm text-muted-foreground">
              Filter task oversight by club. This board is view-only for Club Services admins.
            </p>
          </CardHeader>
          <CardContent>
            <Select
              value={adminClubId}
              onValueChange={(value) => {
                const nextParams = new URLSearchParams(searchParams);

                if (value === "all") {
                  nextParams.delete("club_id");
                } else {
                  nextParams.set("club_id", value);
                }

                setSearchParams(nextParams);
              }}
            >
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="All clubs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All clubs</SelectItem>
                {clubs.map((club) => (
                  <SelectItem key={club.id} value={club.id}>
                    {club.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {role === "admin" ? "Club Services Task Oversight" : role === "president" ? "Club Task Board" : "Assigned Tasks"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <NeoLoadingState title="Preparing task board" message="We are loading assigned work and progress updates." compact />
          ) : isError ? (
            <div className="nh-empty border-destructive bg-destructive/5">
              <p className="font-medium">Unable to load tasks</p>
              <p className="text-sm text-muted-foreground mt-1">{getErrorMessage(error)}</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="nh-empty">
              <ClipboardList className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No tasks yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                {role === "president"
                  ? "Assign the first task to an executive above."
                  : role === "admin"
                  ? "No tasks match this club filter yet."
                  : "Assigned tasks from your president will appear here."}
              </p>
            </div>
          ) : (
            <div>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    canUpdate={role === "executive" || role === "president"}
                    isUpdating={updateMutation.isPending}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
              <DataPagination
                page={tasksPage.page}
                pageSize={tasksPage.page_size}
                total={tasksPage.total}
                hasNext={tasksPage.has_next}
                onPageChange={setPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
