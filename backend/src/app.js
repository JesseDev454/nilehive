const express = require("express");
const ApiError = require("./shared/ApiError");
const errorHandler = require("./middleware/errorHandler");
const { createHealthRouter } = require("./modules/health/health.routes");
const { createClubsRouter } = require("./modules/clubs/clubs.routes");
const { createNotificationsRouter } = require("./modules/notifications/notifications.routes");
const { createProposalsRouter } = require("./modules/proposals/proposals.routes");

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
  app.use("/api/v1/notifications", createNotificationsRouter({ database }));
  app.use("/api/v1/proposals", createProposalsRouter({ database }));

  app.use((req, res, next) => {
    next(new ApiError(404, "Route not found", "NOT_FOUND"));
  });

  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
