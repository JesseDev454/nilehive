const { db } = require("../config/db");
const { getEnv } = require("../config/env");
const { logger } = require("../config/logger");
const { createEmailService } = require("../modules/email/email.service");
const {
  buildAnnouncementEmail,
  buildAnnouncementNotification,
  resolveAnnouncementRecipients,
  shouldEmailAnnouncement,
  uniqueIds
} = require("../modules/communications/communications.helpers");
const { sendPushForNotifications } = require("../modules/notifications/push.service");
const {
  enqueueAnnouncementChunk,
  enqueueHighPriorityEmailDelivery
} = require("./queue");

function chunkItems(items, size) {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function buildApprovedEventReminderMessage(proposal) {
  return `Approved event "${proposal.proposed_activity || proposal.title}" is scheduled for ${proposal.event_date}.`;
}

function getApprovedEventReminderAt(proposal) {
  return `${proposal.event_date}T09:00:00.000Z`;
}

async function processAnnouncementNotificationFanout(job, options = {}) {
  const { database = db, env = getEnv() } = options;
  const enqueueChunk = options.enqueueAnnouncementChunk ?? enqueueAnnouncementChunk;
  const announcement = await database.getAnnouncementById(job.data.announcementId);

  if (!announcement) {
    return { status: "skipped", reason: "announcement_not_found" };
  }

  const recipientIds = uniqueIds(await resolveAnnouncementRecipients(database, announcement));
  const chunkSize = Number(env.JOB_CHUNK_SIZE || 250);
  const recipientChunks = chunkItems(recipientIds, chunkSize);

  await Promise.all(
    recipientChunks.map((recipientUserIds, index) =>
      enqueueChunk({
        announcementId: announcement.id,
        recipientUserIds,
        chunkIndex: index
      })
    )
  );

  return {
    status: "enqueued",
    totalRecipients: recipientIds.length,
    chunks: recipientChunks.length
  };
}

async function processAnnouncementNotificationChunk(job, options = {}) {
  const { database = db } = options;
  const enqueueEmailDelivery = options.enqueueHighPriorityEmailDelivery ?? enqueueHighPriorityEmailDelivery;
  const announcement = await database.getAnnouncementById(job.data.announcementId);

  if (!announcement) {
    return { status: "skipped", reason: "announcement_not_found" };
  }

  if (!job.data.recipientUserIds?.length || typeof database.createNotifications !== "function") {
    return { status: "skipped", reason: "no_recipients" };
  }

  const baseNotification = buildAnnouncementNotification(announcement);
  const notifications = await database.createNotifications(
    uniqueIds(job.data.recipientUserIds).map((userId) => ({
      ...baseNotification,
      user_id: userId
    }))
  );

  try {
    await sendPushForNotifications({ database, notifications, logger });
  } catch (error) {
    logger.warn("push.delivery_batch_failed", {
      cause: error instanceof Error ? error.message : "unknown_error"
    });
  }

  if (shouldEmailAnnouncement(announcement) && notifications.length) {
    await enqueueEmailDelivery({
      announcementId: announcement.id,
      notificationTargets: notifications.map((notification) => ({
        notificationId: notification.id ?? null,
        userId: notification.user_id
      })),
      chunkIndex: job.data.chunkIndex ?? 0
    });
  }

  return {
    status: "processed",
    notificationsCreated: notifications.length
  };
}

async function processHighPriorityEmailDelivery(job, options = {}) {
  const { database = db, emailService = createEmailService({ database }) } = options;
  const announcement = await database.getAnnouncementById(job.data.announcementId);

  if (!announcement) {
    return { status: "skipped", reason: "announcement_not_found" };
  }

  if (!emailService.isDeliveryEnabled()) {
    return { status: "skipped", reason: "email_disabled" };
  }

  const targets = job.data.notificationTargets ?? [];

  if (!targets.length) {
    return { status: "skipped", reason: "no_targets" };
  }

  const emailsByProfileId = typeof database.getAuthEmailsByProfileIds === "function"
    ? await database.getAuthEmailsByProfileIds(targets.map((target) => target.userId))
    : {};
  const email = buildAnnouncementEmail(announcement);

  const results = await Promise.all(
    targets.map((target) =>
      emailService.sendEmail({
        to: emailsByProfileId[target.userId] ?? null,
        ...email,
        metadata: {
          recipient_user_id: target.userId,
          announcement_id: announcement.id,
          notification_id: target.notificationId ?? null
        }
      })
    )
  );

  return {
    status: "processed",
    attempted: results.length,
    sent: results.filter((result) => result.status === "sent").length
  };
}

async function processEventReminderGeneration(job, options = {}) {
  const { database = db } = options;
  const proposal = await database.getProposalById(job.data.proposalId);

  if (!proposal || proposal.status !== "approved") {
    return { status: "skipped", reason: "proposal_not_approved" };
  }

  const rsvps = database.listEventRsvps
    ? await database.listEventRsvps({ proposalId: proposal.id })
    : [];
  const rsvpRecipientIds = rsvps
    .filter((rsvp) => ["going", "interested"].includes(rsvp.status))
    .map((rsvp) => rsvp.user_id);
  const adminIds = database.getAdminProfileIds
    ? await database.getAdminProfileIds()
    : [];
  const recipientIds = uniqueIds([
    ...(job.data.recipientUserIds ?? []),
    ...rsvpRecipientIds,
    ...adminIds
  ]);

  if (!recipientIds.length || !database.createEventReminders) {
    return { status: "skipped", reason: "no_recipients" };
  }

  const message = buildApprovedEventReminderMessage(proposal);
  const reminders = await database.createEventReminders(
    recipientIds.map((recipientId) => ({
      user_id: recipientId,
      proposal_id: proposal.id,
      message,
      remind_at: getApprovedEventReminderAt(proposal),
      delivery_status: "stored"
    }))
  );
  const notifications = typeof database.createNotifications === "function"
    ? await database.createNotifications(
        recipientIds.map((recipientId) => ({
          user_id: recipientId,
          proposal_id: proposal.id,
          announcement_id: null,
          type: "event_reminder",
          message,
          delivery_status: "stored"
        }))
      )
    : [];

  try {
    await sendPushForNotifications({ database, notifications, logger });
  } catch (error) {
    logger.warn("push.delivery_batch_failed", {
      cause: error instanceof Error ? error.message : "unknown_error"
    });
  }

  return {
    status: "processed",
    remindersCreated: reminders.length,
    notificationsCreated: notifications.length
  };
}

async function processMissingReportPrompt(job, options = {}) {
  const { database = db } = options;
  const proposal = await database.getProposalById(job.data.proposalId);

  if (!proposal || proposal.status !== "approved") {
    return { status: "skipped", reason: "proposal_not_approved" };
  }

  const existingReport = database.getEventReportByProposalId
    ? await database.getEventReportByProposalId(proposal.id)
    : null;

  if (existingReport) {
    return { status: "skipped", reason: "report_already_exists" };
  }

  const presidentIds = database.getPresidentProfileIdsByClubId
    ? await database.getPresidentProfileIdsByClubId(proposal.club_id)
    : [];
  const advisorIds = database.getAdvisorProfileIdsByClubId
    ? await database.getAdvisorProfileIdsByClubId(proposal.club_id)
    : [];
  const adminIds = database.getAdminProfileIds
    ? await database.getAdminProfileIds()
    : [];
  const recipientIds = uniqueIds([...presidentIds, ...advisorIds, ...adminIds]);

  if (!recipientIds.length || typeof database.createNotifications !== "function") {
    return { status: "skipped", reason: "no_recipients" };
  }

  const message = `Post-event report for "${proposal.proposed_activity || proposal.title}" is now due.`;
  const notifications = await database.createNotifications(
    recipientIds.map((userId) => ({
      user_id: userId,
      proposal_id: proposal.id,
      announcement_id: null,
      type: "missing_report_prompt",
      message,
      delivery_status: "stored"
    }))
  );

  try {
    await sendPushForNotifications({ database, notifications, logger });
  } catch (error) {
    logger.warn("push.delivery_batch_failed", {
      cause: error instanceof Error ? error.message : "unknown_error"
    });
  }

  return {
    status: "processed",
    notificationsCreated: notifications.length
  };
}

async function processJob(job, options = {}) {
  const startedAt = Date.now();
  const jobLogger = (options.logger || logger).child({
    job_name: job.name,
    job_id: job.id,
    attempt: job.attemptsMade + 1,
    related_entity_id: job.data.announcementId ?? job.data.proposalId ?? null
  });

  jobLogger.info("worker.job_started");

  try {
    let result;

    switch (job.name) {
      case "announcement_notification_fanout":
        result = await processAnnouncementNotificationFanout(job, options);
        break;
      case "announcement_notification_chunk":
        result = await processAnnouncementNotificationChunk(job, options);
        break;
      case "event_reminder_generation":
        result = await processEventReminderGeneration(job, options);
        break;
      case "missing_report_prompt":
        result = await processMissingReportPrompt(job, options);
        break;
      case "high_priority_email_delivery":
        result = await processHighPriorityEmailDelivery(job, options);
        break;
      default:
        throw new Error(`Unsupported job: ${job.name}`);
    }

    jobLogger.info("worker.job_completed", {
      latency_ms: Date.now() - startedAt,
      result
    });

    return result;
  } catch (error) {
    jobLogger.error("worker.job_failed", {
      latency_ms: Date.now() - startedAt,
      cause: error instanceof Error ? error.message : "unknown_error"
    });
    throw error;
  }
}

module.exports = {
  processAnnouncementNotificationChunk,
  processAnnouncementNotificationFanout,
  processEventReminderGeneration,
  processHighPriorityEmailDelivery,
  processJob,
  processMissingReportPrompt
};
