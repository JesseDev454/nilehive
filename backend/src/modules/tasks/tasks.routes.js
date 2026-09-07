const { Router } = require("express");
const { db } = require("../../config/db");
const { createAuthMiddleware } = require("../../middleware/auth");
const { createTasksController } = require("./tasks.controller");

function createTasksRouter(options = {}) {
  const { database = db } = options;
  const router = Router();
  const auth = createAuthMiddleware({ database });
  const controller = createTasksController({ database });

  router.get("/", auth, controller.listTasks);
  router.post("/", auth, controller.createTask);
  router.get("/:taskId", auth, controller.getTaskDetail);
  router.post("/:taskId/status", auth, controller.updateTaskStatus);

  return router;
}

module.exports = { createTasksRouter };
