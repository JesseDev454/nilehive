const JOB_QUEUE_NAME = "background";

const JOB_NAMES = Object.freeze({
  ANNOUNCEMENT_NOTIFICATION_FANOUT: "announcement_notification_fanout",
  ANNOUNCEMENT_NOTIFICATION_CHUNK: "announcement_notification_chunk",
  EVENT_REMINDER_GENERATION: "event_reminder_generation",
  MISSING_REPORT_PROMPT: "missing_report_prompt",
  HIGH_PRIORITY_EMAIL_DELIVERY: "high_priority_email_delivery"
});

module.exports = {
  JOB_NAMES,
  JOB_QUEUE_NAME
};
