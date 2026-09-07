const { Queue } = require("bullmq");
const ApiError = require("../shared/ApiError");
const { getEnv } = require("../config/env");
const { getSharedRedisConnection, pingRedis } = require("../config/redis");
const { logger } = require("../config/logger");
const { JOB_NAMES, JOB_QUEUE_NAME } = require("./constants");

let backgroundQueue;

function getWorkerHeartbeatKey(env = getEnv()) {
  return `${getQueuePrefix(env)}:worker:${JOB_QUEUE_NAME}:heartbeat`;
}

function areAsyncJobsEnabled(env = getEnv()) {
  return String(env.ASYNC_JOBS_ENABLED).toLowerCase() === "true";
}

function getQueuePrefix(env = getEnv()) {
  return env.REDIS_QUEUE_PREFIX || "nilehive";
}

function getDefaultJobOptions(env = getEnv()) {
  return {
    attempts: Number(env.JOB_DEFAULT_ATTEMPTS || 3),
    backoff: {
      type: "exponential",
      delay: Number(env.JOB_BACKOFF_MS || 5000)
    },
    removeOnComplete: 100,
    removeOnFail: 200
  };
}

function getBackgroundQueue() {
  if (!backgroundQueue) {
    backgroundQueue = new Queue(JOB_QUEUE_NAME, {
      connection: getSharedRedisConnection(),
      prefix: getQueuePrefix()
    });
  }

  return backgroundQueue;
}

async function hasRecentWorkerHeartbeat(connection = getSharedRedisConnection(), env = getEnv()) {
  const heartbeat = await connection.get(getWorkerHeartbeatKey(env));
  return Boolean(heartbeat);
}

async function ensureQueueReady(options = {}) {
  const { requireWorker = false } = options;
  const env = getEnv();

  if (!areAsyncJobsEnabled(env)) {
    return { status: "not_required" };
  }

  try {
    await pingRedis();
  } catch (error) {
    throw new ApiError(503, "Redis connectivity check failed", "QUEUE_UNAVAILABLE", {
      cause: error instanceof Error ? error.message : "unknown_error"
    });
  }

  if (requireWorker) {
    const workerAvailable = await hasRecentWorkerHeartbeat(getSharedRedisConnection(), env);

    if (!workerAvailable) {
      throw new ApiError(503, "Background worker heartbeat is unavailable", "WORKER_UNAVAILABLE");
    }
  }

  return { status: "configured" };
}

async function getQueueHealth() {
  const env = getEnv();

  if (!areAsyncJobsEnabled(env)) {
    return {
      status: "not_required",
      worker_status: "not_required",
      waiting: 0,
      active: 0,
      failed: 0,
      delayed: 0
    };
  }

  try {
    await pingRedis();
    const queue = getBackgroundQueue();
    const counts = await queue.getJobCounts("waiting", "active", "failed", "delayed");
    const workerAvailable = await hasRecentWorkerHeartbeat(getSharedRedisConnection(), env);

    return {
      status: workerAvailable ? "running" : "worker_unavailable",
      worker_status: workerAvailable ? "running" : "unavailable",
      waiting: counts.waiting ?? 0,
      active: counts.active ?? 0,
      failed: counts.failed ?? 0,
      delayed: counts.delayed ?? 0
    };
  } catch (error) {
    logger.warn("queue.health_unavailable", {
      cause: error instanceof Error ? error.message : "unknown_error"
    });

    return {
      status: "unavailable",
      worker_status: "unavailable",
      waiting: 0,
      active: 0,
      failed: 0,
      delayed: 0
    };
  }
}

async function enqueueJob(name, data, options = {}) {
  const env = getEnv();

  if (!areAsyncJobsEnabled(env)) {
    return {
      queued: false,
      reason: "disabled"
    };
  }

  await ensureQueueReady();
  const queue = getBackgroundQueue();
  const job = await queue.add(name, data, {
    ...getDefaultJobOptions(env),
    ...options
  });

  logger.info("queue.job_enqueued", {
    queue: JOB_QUEUE_NAME,
    job_name: name,
    job_id: job.id,
    related_entity_id: data.announcementId ?? data.proposalId ?? null
  });

  return {
    queued: true,
    jobId: job.id
  };
}

async function enqueueAnnouncementFanout({ announcementId }) {
  return enqueueJob(
    JOB_NAMES.ANNOUNCEMENT_NOTIFICATION_FANOUT,
    { announcementId },
    { jobId: `announcement-fanout:${announcementId}` }
  );
}

async function enqueueAnnouncementChunk({ announcementId, recipientUserIds, chunkIndex }) {
  return enqueueJob(
    JOB_NAMES.ANNOUNCEMENT_NOTIFICATION_CHUNK,
    { announcementId, recipientUserIds },
    { jobId: `announcement-chunk:${announcementId}:${chunkIndex}` }
  );
}

async function enqueueHighPriorityEmailDelivery({ announcementId, notificationTargets, chunkIndex }) {
  return enqueueJob(
    JOB_NAMES.HIGH_PRIORITY_EMAIL_DELIVERY,
    { announcementId, notificationTargets },
    { jobId: `announcement-email:${announcementId}:${chunkIndex}` }
  );
}

function getEventReminderDelayMs(eventDate) {
  if (!eventDate) {
    return 0;
  }

  const target = new Date(`${eventDate}T09:00:00.000Z`).getTime();
  return Math.max(0, target - Date.now());
}

async function enqueueEventReminderGeneration({ proposalId, recipientUserIds, eventDate }) {
  return enqueueJob(
    JOB_NAMES.EVENT_REMINDER_GENERATION,
    { proposalId, recipientUserIds, eventDate },
    {
      jobId: `event-reminders:${proposalId}`,
      delay: getEventReminderDelayMs(eventDate)
    }
  );
}

function getMissingReportDelayMs(eventDate) {
  if (!eventDate) {
    return 0;
  }

  const target = new Date(`${eventDate}T09:00:00.000Z`).getTime() + 24 * 60 * 60 * 1000;
  return Math.max(0, target - Date.now());
}

async function enqueueMissingReportPrompt({ proposalId, clubId, eventDate }) {
  return enqueueJob(
    JOB_NAMES.MISSING_REPORT_PROMPT,
    { proposalId, clubId, eventDate },
    {
      jobId: `missing-report:${proposalId}`,
      delay: getMissingReportDelayMs(eventDate)
    }
  );
}

async function closeQueue() {
  if (!backgroundQueue) {
    return;
  }

  const queue = backgroundQueue;
  backgroundQueue = null;
  await queue.close();
}

module.exports = {
  JOB_NAMES,
  areAsyncJobsEnabled,
  closeQueue,
  enqueueAnnouncementChunk,
  enqueueAnnouncementFanout,
  enqueueEventReminderGeneration,
  enqueueHighPriorityEmailDelivery,
  enqueueJob,
  enqueueMissingReportPrompt,
  ensureQueueReady,
  getBackgroundQueue,
  getDefaultJobOptions,
  getEventReminderDelayMs,
  getQueuePrefix,
  getQueueHealth,
  getWorkerHeartbeatKey,
  hasRecentWorkerHeartbeat
};
