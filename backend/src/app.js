const express = require("express");
const ApiError = require("./shared/ApiError");
const errorHandler = require("./middleware/errorHandler");
const { createHealthRouter } = require("./modules/health/health.routes");
const { createProposalsRouter } = require("./modules/proposals/proposals.routes");

function createApp(options = {}) {
  const { database } = options;
  const app = express();

  app.use(express.json());

  app.get("/", (req, res) => {
    res.status(200).json({
      service: "nilehive-backend",
      scope: "week1"
    });
  });

  app.use("/api/v1/health", createHealthRouter({ database }));
  app.use("/api/v1/proposals", createProposalsRouter({ database }));

  app.use((req, res, next) => {
    next(new ApiError(404, "Route not found", "NOT_FOUND"));
  });

  app.use(errorHandler);

  return app;
}

module.exports = { createApp };

