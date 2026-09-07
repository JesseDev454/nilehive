const { Worker } = require("bullmq");
const { createRedisConnection } = require("./config/redis");
const { getEnv } = require("./config/env");
const { logger } = require("./config/logger");
const { JOB_QUEUE_NAME } = require("./jobs/constants");
const { getQueuePrefix, getWorkerHeartbeatKey } = require("./jobs/queue");
const { processJob } = require("./jobs/processors");

async function startWorker() {
  const env = getEnv();

  if (String(env.ASYNC_JOBS_ENABLED).toLowerCase() !== "true") {
    logger.warn("worker.disabled", {
      reason: "ASYNC_JOBS_ENABLED is false"
    });
    return;
  }

  const connection = createRedisConnection();
  const heartbeatKey = getWorkerHeartbeatKey(env);
  const heartbeatTtlSeconds = 45;
  const heartbeatIntervalMs = 15000;
  const worker = new Worker(
    JOB_QUEUE_NAME,
    (job) => processJob(job, { logger }),
    {
      connection,
      prefix: getQueuePrefix(env)
    }
  );
  let heartbeatInterval;

  const writeHeartbeat = async () => {
    await connection.set(heartbeatKey, new Date().toISOString(), "EX", heartbeatTtlSeconds);
  };

  worker.on("ready", () => {
    logger.info("worker.ready", { queue: JOB_QUEUE_NAME });
  });

  worker.on("active", (job) => {
    logger.info("worker.job_started", {
      queue: JOB_QUEUE_NAME,
      job_name: job.name,
      job_id: job.id,
      attempt: job.attemptsMade + 1
    });
  });

  worker.on("completed", (job) => {
    const processedOn = Number(job.processedOn || Date.now());
    const finishedOn = Number(job.finishedOn || Date.now());

    logger.info("worker.job_completed", {
      queue: JOB_QUEUE_NAME,
      job_name: job.name,
      job_id: job.id,
      attempt: job.attemptsMade,
      latency_ms: Math.max(0, finishedOn - processedOn)
    });
  });

  worker.on("failed", (job, error) => {
    logger.error("worker.job_failed", {
      queue: JOB_QUEUE_NAME,
      job_name: job?.name ?? "unknown",
      job_id: job?.id ?? null,
      attempt: job?.attemptsMade ?? null,
      cause: error instanceof Error ? error.message : "unknown_error"
    });
  });

  worker.on("error", (error) => {
    logger.error("worker.error", {
      queue: JOB_QUEUE_NAME,
      cause: error instanceof Error ? error.message : "unknown_error"
    });
  });

  await writeHeartbeat();
  heartbeatInterval = setInterval(() => {
    writeHeartbeat().catch((error) => {
      logger.warn("worker.heartbeat_failed", {
        queue: JOB_QUEUE_NAME,
        cause: error instanceof Error ? error.message : "unknown_error"
      });
    });
  }, heartbeatIntervalMs);

  const shutdown = async () => {
    logger.info("worker.shutdown_requested", { queue: JOB_QUEUE_NAME });
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
    await connection.del(heartbeatKey).catch(() => {});
    await worker.close();
    await connection.quit().catch(() => connection.disconnect());
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

startWorker().catch((error) => {
  logger.error("worker.start_failed", {
    cause: error instanceof Error ? error.message : "unknown_error"
  });
  process.exit(1);
});
