const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/app");
const {
  createTask,
  getTaskDetail,
  listVisibleTasks,
  updateTaskStatus
} = require("../src/modules/tasks/tasks.service");

function createTaskRecord(overrides = {}) {
  return {
    id: "task-1",
    club_id: "club-1",
    assigned_by: "president-1",
    assigned_to: "executive-1",
    title: "Prepare budget breakdown",
    description: "Prepare the detailed event budget.",
    priority: "high",
    status: "pending",
    due_date: "2026-05-01",
    created_at: "2026-04-11T10:00:00.000Z",
    updated_at: "2026-04-11T10:00:00.000Z",
    ...overrides
  };
}

test("president can assign a task to an executive in their club", async () => {
  let createdTask;
  let createdHistory;
  const fakeDatabase = {
    async getProfileById(profileId) {
      assert.equal(profileId, "executive-1");
      return {
        id: "executive-1",
        role: "executive",
        club_id: "club-1"
      };
    },
    async createTask(task) {
      createdTask = task;
      return createTaskRecord(task);
    },
    async createTaskStatusHistory(history) {
      createdHistory = history;
      return history;
    }
  };

  const task = await createTask({
    actor: {
      id: "president-1",
      role: "president",
      clubId: "club-1"
    },
    payload: {
      assigned_to: "executive-1",
      title: "Prepare budget breakdown",
      description: "Prepare the detailed event budget.",
      priority: "high",
      due_date: "2026-05-01"
    },
    database: fakeDatabase
  });

  assert.equal(createdTask.club_id, "club-1");
  assert.equal(createdTask.assigned_by, "president-1");
  assert.equal(createdTask.assigned_to, "executive-1");
  assert.equal(createdTask.status, "pending");
  assert.equal(createdHistory.new_status, "pending");
  assert.equal(task.title, "Prepare budget breakdown");
});

test("president cannot assign a task to another club's executive", async () => {
  const fakeDatabase = {
    async getProfileById() {
      return {
        id: "executive-2",
        role: "executive",
        club_id: "club-2"
      };
    }
  };

  await assert.rejects(
    () =>
      createTask({
        actor: {
          id: "president-1",
          role: "president",
          clubId: "club-1"
        },
        payload: {
          assigned_to: "executive-2",
          title: "Prepare budget breakdown"
        },
        database: fakeDatabase
      }),
    (error) => error.statusCode === 400 && error.code === "INVALID_ASSIGNEE"
  );
});

test("executive can list only assigned tasks", async () => {
  const fakeDatabase = {
    async listTasks(filters) {
      assert.deepEqual(filters, {
        assignedTo: "executive-1",
        status: undefined
      });
      return [createTaskRecord()];
    }
  };

  const tasks = await listVisibleTasks({
    actor: {
      id: "executive-1",
      role: "executive"
    },
    database: fakeDatabase
  });

  assert.equal(tasks.length, 1);
  assert.equal(tasks[0].assigned_to, "executive-1");
});

test("president can list club tasks", async () => {
  const fakeDatabase = {
    async listTasks(filters) {
      assert.deepEqual(filters, {
        clubId: "club-1",
        status: "pending"
      });
      return [createTaskRecord()];
    }
  };

  const tasks = await listVisibleTasks({
    actor: {
      id: "president-1",
      role: "president",
      clubId: "club-1"
    },
    filters: {
      status: "pending"
    },
    database: fakeDatabase
  });

  assert.equal(tasks.length, 1);
});

test("admin can list all club tasks", async () => {
  const fakeDatabase = {
    async listTasks(filters) {
      assert.deepEqual(filters, {
        clubId: undefined,
        status: undefined
      });
      return [
        createTaskRecord(),
        createTaskRecord({
          id: "task-2",
          club_id: "club-2",
          assigned_to: "executive-2"
        })
      ];
    }
  };

  const tasks = await listVisibleTasks({
    actor: {
      id: "admin-1",
      role: "admin"
    },
    database: fakeDatabase
  });

  assert.equal(tasks.length, 2);
});

test("admin can list tasks filtered by club", async () => {
  const fakeDatabase = {
    async listTasks(filters) {
      assert.deepEqual(filters, {
        clubId: "club-2",
        status: undefined
      });
      return [
        createTaskRecord({
          id: "task-2",
          club_id: "club-2",
          assigned_to: "executive-2"
        })
      ];
    }
  };

  const tasks = await listVisibleTasks({
    actor: {
      id: "admin-1",
      role: "admin"
    },
    filters: {
      club_id: "club-2"
    },
    database: fakeDatabase
  });

  assert.equal(tasks.length, 1);
  assert.equal(tasks[0].club_id, "club-2");
});

test("admin can view task detail and history", async () => {
  const fakeDatabase = {
    async getTaskById(taskId) {
      assert.equal(taskId, "task-1");
      return createTaskRecord();
    },
    async listTaskStatusHistory(taskId) {
      assert.equal(taskId, "task-1");
      return [
        {
          id: "history-1",
          task_id: "task-1",
          changed_by: "president-1",
          old_status: null,
          new_status: "pending",
          remarks: "Task assigned",
          created_at: "2026-04-11T10:00:00.000Z"
        }
      ];
    }
  };

  const task = await getTaskDetail({
    actor: {
      id: "admin-1",
      role: "admin"
    },
    taskId: "task-1",
    database: fakeDatabase
  });

  assert.equal(task.id, "task-1");
  assert.equal(task.status_history.length, 1);
});

test("admin cannot assign tasks", async () => {
  await assert.rejects(
    () =>
      createTask({
        actor: {
          id: "admin-1",
          role: "admin"
        },
        payload: {
          assigned_to: "executive-1",
          title: "Prepare budget breakdown"
        },
        database: {}
      }),
    (error) => error.statusCode === 403 && error.code === "FORBIDDEN"
  );
});

test("admin cannot update task status", async () => {
  const fakeDatabase = {
    async getTaskById() {
      return createTaskRecord();
    }
  };

  await assert.rejects(
    () =>
      updateTaskStatus({
        actor: {
          id: "admin-1",
          role: "admin"
        },
        taskId: "task-1",
        payload: {
          status: "in_progress"
        },
        database: fakeDatabase
      }),
    (error) => error.statusCode === 403 && error.code === "FORBIDDEN"
  );
});

test("executive can update assigned task status and history is recorded", async () => {
  let createdHistory;
  const fakeDatabase = {
    async getTaskById(taskId) {
      assert.equal(taskId, "task-1");
      return createTaskRecord();
    },
    async updateTaskStatus(taskId, update) {
      assert.equal(taskId, "task-1");
      assert.deepEqual(update, { status: "in_progress" });
      return createTaskRecord({
        status: "in_progress"
      });
    },
    async createTaskStatusHistory(history) {
      createdHistory = history;
      return history;
    },
    async listTaskStatusHistory(taskId) {
      assert.equal(taskId, "task-1");
      return [createdHistory];
    }
  };

  const task = await updateTaskStatus({
    actor: {
      id: "executive-1",
      role: "executive"
    },
    taskId: "task-1",
    payload: {
      status: "in_progress",
      remarks: "Started working on it."
    },
    database: fakeDatabase
  });

  assert.equal(task.status, "in_progress");
  assert.equal(createdHistory.old_status, "pending");
  assert.equal(createdHistory.new_status, "in_progress");
  assert.equal(createdHistory.remarks, "Started working on it.");
});

test("duplicate task status update is blocked", async () => {
  const fakeDatabase = {
    async getTaskById() {
      return createTaskRecord({
        status: "completed"
      });
    }
  };

  await assert.rejects(
    () =>
      updateTaskStatus({
        actor: {
          id: "executive-1",
          role: "executive"
        },
        taskId: "task-1",
        payload: {
          status: "completed"
        },
        database: fakeDatabase
      }),
    (error) => error.statusCode === 409 && error.code === "INVALID_TASK_STATE"
  );
});

function createRouteDatabase() {
  const profiles = {
    "president-1": {
      id: "president-1",
      full_name: "Tomi President",
      role: "president",
      club_id: "club-1"
    }
  };

  return {
    async getUserByAccessToken(accessToken) {
      if (accessToken !== "president-token") {
        return null;
      }

      return {
        id: "president-1",
        email: "president@nilehive.test"
      };
    },
    async getProfileById(profileId) {
      return profiles[profileId] ?? null;
    },
    async listTasks() {
      return [createTaskRecord()];
    }
  };
}

async function createTestServer(database) {
  const app = createApp({ database });
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  return {
    baseUrl,
    close: () =>
      new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      })
  };
}

test("missing-token access is blocked for tasks", async (t) => {
  const server = await createTestServer(createRouteDatabase());
  t.after(() => server.close());

  const response = await fetch(`${server.baseUrl}/api/v1/tasks`);
  const payload = await response.json();

  assert.equal(response.status, 401);
  assert.equal(payload.error.code, "AUTH_REQUIRED");
});
