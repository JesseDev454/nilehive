const express = require("express");
const ApiError = require("./shared/ApiError");
const errorHandler = require("./middleware/errorHandler");
const { createHealthRouter } = require("./modules/health/health.routes");
const { createClubsRouter } = require("./modules/clubs/clubs.routes");
const { createCommunicationsRouter } = require("./modules/communications/communications.routes");
const { createDashboardRouter } = require("./modules/dashboard/dashboard.routes");
const { createDuesRouter } = require("./modules/dues/dues.routes");
const { createEventsRouter } = require("./modules/events/events.routes");
const { createMembersRouter } = require("./modules/members/members.routes");
const { createMembershipRequestsRouter } = require("./modules/membership-requests/membership-requests.routes");
const { createNotificationsRouter } = require("./modules/notifications/notifications.routes");
const { createProfileRouter } = require("./modules/profile/profile.routes");
const { createProposalsRouter } = require("./modules/proposals/proposals.routes");
const { createRemindersRouter } = require("./modules/reminders/reminders.routes");
const { createReportsRouter } = require("./modules/reports/reports.routes");
const { createTasksRouter } = require("./modules/tasks/tasks.routes");

function createApp(options = {}) {
  const { database } = options;
  const app = express();

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:8080");
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }

    next();
  });

  app.use(express.json());

  app.get("/", (req, res) => {
    res.status(200).json({
      service: "nilehive-backend",
      scope: "week1"
    });
  });

  app.use("/api/v1/health", createHealthRouter({ database }));
  app.use("/api/v1/clubs", createClubsRouter({ database }));
  app.use("/api/v1/communications", createCommunicationsRouter({ database }));
  app.use("/api/v1/dashboard", createDashboardRouter({ database }));
  app.use("/api/v1/dues", createDuesRouter({ database }));
  app.use("/api/v1/events", createEventsRouter({ database }));
  app.use("/api/v1/members", createMembersRouter({ database }));
  app.use("/api/v1/membership-requests", createMembershipRequestsRouter({ database }));
  app.use("/api/v1/notifications", createNotificationsRouter({ database }));
  app.use("/api/v1/profile", createProfileRouter({ database }));
  app.use("/api/v1/proposals", createProposalsRouter({ database }));
  app.use("/api/v1/reminders", createRemindersRouter({ database }));
  app.use("/api/v1/reports", createReportsRouter({ database }));
  app.use("/api/v1/tasks", createTasksRouter({ database }));

  app.use((req, res, next) => {
    next(new ApiError(404, "Route not found", "NOT_FOUND"));
  });

  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
