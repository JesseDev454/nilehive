const express = require("express");
const helmet = require("helmet");
const ApiError = require("./shared/ApiError");
const { logger } = require("./config/logger");
const errorHandler = require("./middleware/errorHandler");
const { createRequestContextMiddleware } = require("./middleware/requestContext");
const { createRequestTimeoutMiddleware } = require("./middleware/requestTimeout");
const { createCampusOneAuthRouter } = require("./modules/auth/campusOneOidc");
const { createAdminUsersRouter } = require("./modules/admin-users/admin-users.routes");
const { createAnalyticsRouter } = require("./modules/analytics/analytics.routes");
const { createHealthRouter, createReadyRouter } = require("./modules/health/health.routes");
const { createClubsRouter } = require("./modules/clubs/clubs.routes");
const { createCommunicationsRouter } = require("./modules/communications/communications.routes");
const { createDashboardRouter } = require("./modules/dashboard/dashboard.routes");
const { createDuesRouter } = require("./modules/dues/dues.routes");
const { createEventsRouter } = require("./modules/events/events.routes");
const { createLeadershipApplicationsRouter } = require("./modules/leadership-applications/leadership-applications.routes");
const { createMembersRouter } = require("./modules/members/members.routes");
const { createMembershipRequestsRouter } = require("./modules/membership-requests/membership-requests.routes");
const { createNotificationsRouter } = require("./modules/notifications/notifications.routes");
const { createProfileRouter } = require("./modules/profile/profile.routes");
const { createProposalsRouter } = require("./modules/proposals/proposals.routes");
const { createRemindersRouter } = require("./modules/reminders/reminders.routes");
const { createReportsRouter } = require("./modules/reports/reports.routes");
const { createStorageRouter } = require("./modules/storage/storage.routes");
const { createTasksRouter } = require("./modules/tasks/tasks.routes");
const { getEnv } = require("./config/env");

function getAllowedOrigins() {
  const { CORS_ALLOWED_ORIGINS, FRONTEND_APP_URL } = getEnv();
  const origins = new Set(
    [FRONTEND_APP_URL, ...CORS_ALLOWED_ORIGINS.split(",")]
      .map((origin) => origin.trim().replace(/\/+$/, ""))
      .filter(Boolean)
  );

  return origins;
}

function createApp(options = {}) {
  const { database } = options;
  const app = express();
  const allowedOrigins = getAllowedOrigins();
  const env = getEnv();
  const isProduction = env.NODE_ENV === "production";

  app.use(helmet({
    crossOriginResourcePolicy: false
  }));
  app.use(createRequestContextMiddleware({ baseLogger: logger }));
  app.use(createRequestTimeoutMiddleware({
    timeoutMs: Number(env.REQUEST_TIMEOUT_MS)
  }));

  app.use((req, res, next) => {
    const requestOrigin = req.headers.origin?.replace(/\/+$/, "");

    if (requestOrigin) {
      if (!allowedOrigins.has(requestOrigin)) {
        if (isProduction) {
          next(new ApiError(403, "Origin is not allowed", "CORS_ORIGIN_BLOCKED"));
          return;
        }

        res.header("Access-Control-Allow-Origin", requestOrigin);
      } else {
        res.header("Access-Control-Allow-Origin", requestOrigin);
      }
    } else if (!isProduction) {
      res.header("Access-Control-Allow-Origin", env.FRONTEND_APP_URL);
    }

    res.header("Vary", "Origin");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Idempotency-Key, X-Request-Id");

    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }

    next();
  });

  app.use(express.json({ limit: "10mb" }));

  app.get("/", (req, res) => {
    res.status(200).json({
      service: "nilehive-backend",
      scope: "week1"
    });
  });

  app.head("/api/health", (req, res) => {
    res.status(200).end();
  });

  app.get("/api/health", (req, res) => {
    res.status(200).json({
      status: "healthy",
      service: "nilehive-backend",
      timestamp: new Date().toISOString()
    });
  });

  app.use("/api/v1/health", createHealthRouter({ database }));
  app.use("/api/v1/ready", createReadyRouter({ database }));
  app.use("/api/v1/auth", createCampusOneAuthRouter({ database }));
  app.use("/api/v1/admin/users", createAdminUsersRouter({ database }));
  app.use("/api/v1/analytics", createAnalyticsRouter({ database }));
  app.use("/api/v1/clubs", createClubsRouter({ database }));
  app.use("/api/v1/communications", createCommunicationsRouter({ database }));
  app.use("/api/v1/dashboard", createDashboardRouter({ database }));
  app.use("/api/v1/dues", createDuesRouter({ database }));
  app.use("/api/v1/events", createEventsRouter({ database }));
  app.use("/api/v1/leadership-applications", createLeadershipApplicationsRouter({ database }));
  app.use("/api/v1/members", createMembersRouter({ database }));
  app.use("/api/v1/membership-requests", createMembershipRequestsRouter({ database }));
  app.use("/api/v1/notifications", createNotificationsRouter({ database }));
  app.use("/api/v1/profile", createProfileRouter({ database }));
  app.use("/api/v1/proposals", createProposalsRouter({ database }));
  app.use("/api/v1/reminders", createRemindersRouter({ database }));
  app.use("/api/v1/reports", createReportsRouter({ database }));
  app.use("/api/v1/storage", createStorageRouter({ database }));
  app.use("/api/v1/tasks", createTasksRouter({ database }));

  app.use((req, res, next) => {
    next(new ApiError(404, "Route not found", "NOT_FOUND"));
  });

  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
