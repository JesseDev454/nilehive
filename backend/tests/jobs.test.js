const test = require("node:test");
const assert = require("node:assert/strict");
const {
  processAnnouncementNotificationChunk,
  processAnnouncementNotificationFanout,
  processEventReminderGeneration,
  processHighPriorityEmailDelivery,
  processMissingReportPrompt
} = require("../src/jobs/processors");

test("announcement fanout splits recipients into configured chunks", async () => {
  const queuedChunks = [];
  const result = await processAnnouncementNotificationFanout({
    data: { announcementId: "announcement-1" }
  }, {
    env: { JOB_CHUNK_SIZE: "2" },
    database: {
      async getAnnouncementById() {
        return {
          id: "announcement-1",
          audience: "all_users",
          priority: "normal"
        };
      },
      async listProfiles() {
        return [
          { id: "user-1" },
          { id: "user-2" },
          { id: "user-3" },
          { id: "user-4" },
          { id: "user-5" }
        ];
      }
    },
    async enqueueAnnouncementChunk(payload) {
      queuedChunks.push(payload);
    }
  });

  assert.equal(result.totalRecipients, 5);
  assert.equal(result.chunks, 3);
  assert.deepEqual(queuedChunks, [
    { announcementId: "announcement-1", recipientUserIds: ["user-1", "user-2"], chunkIndex: 0 },
    { announcementId: "announcement-1", recipientUserIds: ["user-3", "user-4"], chunkIndex: 1 },
    { announcementId: "announcement-1", recipientUserIds: ["user-5"], chunkIndex: 2 }
  ]);
});

test("announcement chunk creates notifications and queues high-priority email delivery", async () => {
  const queuedEmails = [];
  const result = await processAnnouncementNotificationChunk({
    data: {
      announcementId: "announcement-1",
      recipientUserIds: ["user-1", "user-2"],
      chunkIndex: 0
    }
  }, {
    database: {
      async getAnnouncementById() {
        return {
          id: "announcement-1",
          title: "Urgent notice",
          priority: "high"
        };
      },
      async createNotifications(notifications) {
        return notifications.map((notification, index) => ({
          ...notification,
          id: `notification-${index + 1}`
        }));
      }
    },
    async enqueueHighPriorityEmailDelivery(payload) {
      queuedEmails.push(payload);
    }
  });

  assert.equal(result.notificationsCreated, 2);
  assert.deepEqual(queuedEmails, [{
    announcementId: "announcement-1",
    notificationTargets: [
      { notificationId: "notification-1", userId: "user-1" },
      { notificationId: "notification-2", userId: "user-2" }
    ],
    chunkIndex: 0
  }]);
});

test("high-priority email delivery keeps working when one email fails", async () => {
  const attempts = [];
  const result = await processHighPriorityEmailDelivery({
    data: {
      announcementId: "announcement-1",
      notificationTargets: [
        { notificationId: "notification-1", userId: "user-1" },
        { notificationId: "notification-2", userId: "user-2" }
      ]
    }
  }, {
    database: {
      async getAnnouncementById() {
        return {
          id: "announcement-1",
          title: "Urgent notice",
          message: "Read this now.",
          priority: "urgent"
        };
      },
      async getAuthEmailsByProfileIds() {
        return {
          "user-1": "one@nileuniversity.edu.ng",
          "user-2": "two@nileuniversity.edu.ng"
        };
      }
    },
    emailService: {
      isDeliveryEnabled() {
        return true;
      },
      async sendEmail({ to }) {
        attempts.push(to);
        if (to === "two@nileuniversity.edu.ng") {
          return { status: "failed" };
        }

        return { status: "sent" };
      }
    }
  });

  assert.deepEqual(attempts, ["one@nileuniversity.edu.ng", "two@nileuniversity.edu.ng"]);
  assert.equal(result.attempted, 2);
  assert.equal(result.sent, 1);
});

test("missing report prompt skips already reported events", async () => {
  const createdNotifications = [];
  const result = await processMissingReportPrompt({
    data: {
      proposalId: "proposal-1"
    }
  }, {
    database: {
      async getProposalById() {
        return {
          id: "proposal-1",
          club_id: "club-1",
          title: "Club Fair",
          proposed_activity: "Club Fair",
          status: "approved"
        };
      },
      async getEventReportByProposalId() {
        return {
          id: "report-1"
        };
      },
      async createNotifications(notifications) {
        createdNotifications.push(...notifications);
        return notifications;
      }
    }
  });

  assert.equal(result.reason, "report_already_exists");
  assert.equal(createdNotifications.length, 0);
});

test("event reminder generation creates in-app notifications for RSVP users and leads", async () => {
  const createdNotifications = [];
  const createdReminders = [];
  const result = await processEventReminderGeneration({
    data: {
      proposalId: "proposal-1",
      recipientUserIds: ["president-1", "advisor-1"]
    }
  }, {
    database: {
      async getProposalById() {
        return {
          id: "proposal-1",
          club_id: "club-1",
          title: "Club Fair",
          proposed_activity: "Club Fair",
          event_date: "2026-05-10",
          status: "approved"
        };
      },
      async listEventRsvps() {
        return [
          { user_id: "student-going", status: "going" },
          { user_id: "student-interested", status: "interested" },
          { user_id: "student-not-going", status: "not_going" }
        ];
      },
      async getAdminProfileIds() {
        return ["admin-1"];
      },
      async createEventReminders(reminders) {
        createdReminders.push(...reminders);
        return reminders;
      },
      async createNotifications(notifications) {
        createdNotifications.push(...notifications);
        return notifications;
      }
    }
  });

  assert.equal(result.remindersCreated, 5);
  assert.equal(result.notificationsCreated, 5);
  assert.deepEqual(createdNotifications.map((notification) => notification.user_id).sort(), [
    "admin-1",
    "advisor-1",
    "president-1",
    "student-going",
    "student-interested"
  ]);
  assert.ok(createdReminders.every((reminder) => reminder.delivery_status === "stored"));
  assert.ok(createdNotifications.every((notification) => notification.type === "event_reminder"));
});

test("missing report prompt notifies presidents, advisors, and admins", async () => {
  const createdNotifications = [];
  const result = await processMissingReportPrompt({
    data: {
      proposalId: "proposal-1"
    }
  }, {
    database: {
      async getProposalById() {
        return {
          id: "proposal-1",
          club_id: "club-1",
          title: "Club Fair",
          proposed_activity: "Club Fair",
          status: "approved"
        };
      },
      async getEventReportByProposalId() {
        return null;
      },
      async getPresidentProfileIdsByClubId() {
        return ["president-1"];
      },
      async getAdvisorProfileIdsByClubId() {
        return ["advisor-1"];
      },
      async getAdminProfileIds() {
        return ["admin-1"];
      },
      async createNotifications(notifications) {
        createdNotifications.push(...notifications);
        return notifications;
      }
    }
  });

  assert.equal(result.notificationsCreated, 3);
  assert.deepEqual(createdNotifications.map((notification) => notification.user_id).sort(), [
    "admin-1",
    "advisor-1",
    "president-1"
  ]);
  assert.ok(createdNotifications.every((notification) => notification.type === "missing_report_prompt"));
});
