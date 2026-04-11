const { db } = require("../../config/db");
const ApiError = require("../../shared/ApiError");
const {
  validateCreateTaskPayload,
  validateUpdateTaskStatusPayload
} = require("./tasks.validation");

function requireActor(actor) {
  if (!actor) {
    throw new ApiError(401, "Authentication is required", "AUTH_REQUIRED");
  }
}

function requireClubLinked(actor) {
  if (!actor.clubId) {
    throw new ApiError(409, "This profile is not linked to a club", "PROFILE_NOT_LINKED_TO_CLUB");
  }
}

function formatTask(task, history = null) {
  return {
    id: task.id,
    club_id: task.club_id,
    assigned_by: task.assigned_by,
    assigned_to: task.assigned_to,
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    due_date: task.due_date,
    created_at: task.created_at,
    updated_at: task.updated_at,
    status_history: history
  };
}

async function createTask(options) {
  const { actor, payload, database = db } = options;
  requireActor(actor);

  if (actor.role !== "president") {
    throw new ApiError(403, "Only presidents can assign tasks", "FORBIDDEN");
  }

  requireClubLinked(actor);

  const validatedPayload = validateCreateTaskPayload(payload);
  const assignedProfile = await database.getProfileById(validatedPayload.assigned_to);

  if (
    !assignedProfile ||
    assignedProfile.role !== "executive" ||
    assignedProfile.club_id !== actor.clubId
  ) {
    throw new ApiError(
      400,
      "Assigned user must be an executive in the president's club",
      "INVALID_ASSIGNEE"
    );
  }

  const task = await database.createTask({
    club_id: actor.clubId,
    assigned_by: actor.id,
    assigned_to: assignedProfile.id,
    title: validatedPayload.title,
    description: validatedPayload.description,
    priority: validatedPayload.priority,
    due_date: validatedPayload.due_date,
    status: "pending"
  });

  await database.createTaskStatusHistory({
    task_id: task.id,
    changed_by: actor.id,
    old_status: null,
    new_status: "pending",
    remarks: "Task assigned"
  });

  return formatTask(task);
}

async function listVisibleTasks(options) {
  const { actor, filters = {}, database = db } = options;
  requireActor(actor);

  if (actor.role === "president") {
    requireClubLinked(actor);

    const tasks = await database.listTasks({
      clubId: actor.clubId,
      status: filters.status
    });

    return tasks.map((task) => formatTask(task));
  }

  if (actor.role === "executive") {
    const tasks = await database.listTasks({
      assignedTo: actor.id,
      status: filters.status
    });

    return tasks.map((task) => formatTask(task));
  }

  throw new ApiError(403, "This role cannot view task delegation", "FORBIDDEN");
}

async function getTaskDetail(options) {
  const { actor, taskId, database = db } = options;
  requireActor(actor);

  const task = await database.getTaskById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found", "TASK_NOT_FOUND");
  }

  const canView =
    (actor.role === "executive" && task.assigned_to === actor.id) ||
    (actor.role === "president" && actor.clubId && task.club_id === actor.clubId);

  if (!canView) {
    throw new ApiError(404, "Task not found", "TASK_NOT_FOUND");
  }

  const history = await database.listTaskStatusHistory(taskId);

  return formatTask(task, history);
}

async function updateTaskStatus(options) {
  const { actor, taskId, payload, database = db } = options;
  requireActor(actor);

  const validatedPayload = validateUpdateTaskStatusPayload(payload);
  const task = await database.getTaskById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found", "TASK_NOT_FOUND");
  }

  const canUpdate =
    (actor.role === "executive" && task.assigned_to === actor.id) ||
    (actor.role === "president" && actor.clubId && task.club_id === actor.clubId);

  if (!canUpdate) {
    throw new ApiError(403, "You cannot update this task", "FORBIDDEN");
  }

  if (task.status === validatedPayload.status) {
    throw new ApiError(409, "Task is already in that status", "INVALID_TASK_STATE");
  }

  const updatedTask = await database.updateTaskStatus(taskId, {
    status: validatedPayload.status
  });

  await database.createTaskStatusHistory({
    task_id: taskId,
    changed_by: actor.id,
    old_status: task.status,
    new_status: validatedPayload.status,
    remarks: validatedPayload.remarks
  });

  const history = await database.listTaskStatusHistory(taskId);

  return formatTask(updatedTask, history);
}

module.exports = {
  createTask,
  getTaskDetail,
  listVisibleTasks,
  updateTaskStatus
};
