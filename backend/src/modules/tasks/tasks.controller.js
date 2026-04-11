const asyncHandler = require("../../shared/asyncHandler");
const {
  createTask,
  getTaskDetail,
  listVisibleTasks,
  updateTaskStatus
} = require("./tasks.service");

function createTasksController(options = {}) {
  const { database } = options;

  return {
    createTask: asyncHandler(async (req, res) => {
      const task = await createTask({
        actor: req.user,
        payload: req.body,
        database
      });

      res.status(201).json({ data: task });
    }),

    listTasks: asyncHandler(async (req, res) => {
      const tasks = await listVisibleTasks({
        actor: req.user,
        filters: {
          status: req.query.status
        },
        database
      });

      res.status(200).json({ data: tasks });
    }),

    getTaskDetail: asyncHandler(async (req, res) => {
      const task = await getTaskDetail({
        actor: req.user,
        taskId: req.params.taskId,
        database
      });

      res.status(200).json({ data: task });
    }),

    updateTaskStatus: asyncHandler(async (req, res) => {
      const task = await updateTaskStatus({
        actor: req.user,
        taskId: req.params.taskId,
        payload: req.body,
        database
      });

      res.status(200).json({ data: task });
    })
  };
}

module.exports = { createTasksController };
