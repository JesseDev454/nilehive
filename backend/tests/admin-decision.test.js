const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/app");
const { submitAdminDecision } = require("../src/modules/proposals/proposals.service");

function createPendingAdminProposal(overrides = {}) {
  return {
    id: "proposal-1",
    club_id: "club-1",
    submitted_by: "executive-1",
    title: "Leadership Summit",
    description: "A planning summit for executive handover.",
    event_date: "2026-05-20",
    location: "Main Hall",
    status: "pending_admin_review",
    advisor_remarks: "Ready for admin review.",
    advisor_decided_at: "2026-04-06T10:00:00.000Z",
    advisor_decided_by: "advisor-1",
    admin_remarks: null,
    admin_decided_at: null,
    admin_decided_by: null,
    created_at: "2026-04-05T10:00:00.000Z",
    updated_at: "2026-04-06T10:00:00.000Z",
    ...overrides
  };
}

test("admin approval creates final approval state and notifications", async () => {
  let adminDecisionInput;
  let createdNotifications = [];
  let createdReminders = [];
  const fakeDatabase = {
    async getProposalById(proposalId) {
      assert.equal(proposalId, "proposal-1");
      return createPendingAdminProposal();
    },
    async applyAdminDecision(decisionInput) {
      adminDecisionInput = decisionInput;
      return createPendingAdminProposal({
        status: decisionInput.nextStatus,
        admin_remarks: decisionInput.remarks,
        admin_decided_at: decisionInput.decidedAt,
        admin_decided_by: decisionInput.reviewerId
      });
    },
    async getAdvisorProfileIdsByClubId(clubId) {
      assert.equal(clubId, "club-1");
      return ["advisor-1"];
    },
    async getPresidentProfileIdsByClubId(clubId) {
      assert.equal(clubId, "club-1");
      return ["president-1"];
    },
    async createNotifications(notifications) {
      createdNotifications = notifications;
      return notifications;
    },
    async createEventReminders(reminders) {
      createdReminders = reminders;
      return reminders;
    }
  };

  const proposal = await submitAdminDecision({
    actor: {
      id: "admin-1",
      role: "admin"
    },
    proposalId: "proposal-1",
    payload: {
      decision: "approve",
      remarks: "Final approval granted."
    },
    database: fakeDatabase
  });

  assert.equal(adminDecisionInput.nextStatus, "approved");
  assert.equal(adminDecisionInput.reviewerRole, "admin");
  assert.equal(proposal.status, "approved");
  assert.equal(proposal.admin_remarks, "Final approval granted.");
  assert.equal(createdNotifications.length, 3);
  assert.ok(createdNotifications.every((notification) => notification.type === "admin_approved"));
  assert.deepEqual(
    createdNotifications.map((notification) => notification.user_id).sort(),
    ["advisor-1", "executive-1", "president-1"]
  );
  assert.equal(createdReminders.length, 3);
  assert.ok(createdReminders.every((reminder) => reminder.proposal_id === "proposal-1"));
  assert.ok(createdReminders.every((reminder) => reminder.delivery_status === "stored"));
});

test("admin rejection creates final rejected state and notifications", async () => {
  let createdNotifications = [];
  let createdReminders = [];
  const fakeDatabase = {
    async getProposalById() {
      return createPendingAdminProposal();
    },
    async applyAdminDecision(decisionInput) {
      return createPendingAdminProposal({
        status: decisionInput.nextStatus,
        admin_remarks: decisionInput.remarks,
        admin_decided_at: decisionInput.decidedAt,
        admin_decided_by: decisionInput.reviewerId
      });
    },
    async getAdvisorProfileIdsByClubId() {
      return ["advisor-1"];
    },
    async getPresidentProfileIdsByClubId() {
      return [];
    },
    async createNotifications(notifications) {
      createdNotifications = notifications;
      return notifications;
    },
    async createEventReminders(reminders) {
      createdReminders = reminders;
      return reminders;
    }
  };

  const proposal = await submitAdminDecision({
    actor: {
      id: "admin-1",
      role: "admin"
    },
    proposalId: "proposal-1",
    payload: {
      decision: "reject",
      remarks: "Venue documentation is incomplete."
    },
    database: fakeDatabase
  });

  assert.equal(proposal.status, "admin_rejected");
  assert.equal(createdNotifications.length, 2);
  assert.ok(createdNotifications.every((notification) => notification.type === "admin_rejected"));
  assert.equal(createdReminders.length, 0);
});

test("admin approval queues reminders and missing-report prompt when async jobs are enabled", async () => {
  let createdReminders = [];
  const queuedReminderJobs = [];
  const queuedMissingReportJobs = [];
  const fakeDatabase = {
    async getProposalById() {
      return createPendingAdminProposal();
    },
    async applyAdminDecision(decisionInput) {
      return createPendingAdminProposal({
        status: decisionInput.nextStatus,
        admin_remarks: decisionInput.remarks,
        admin_decided_at: decisionInput.decidedAt,
        admin_decided_by: decisionInput.reviewerId
      });
    },
    async getAdvisorProfileIdsByClubId() {
      return ["advisor-1"];
    },
    async getPresidentProfileIdsByClubId() {
      return ["president-1"];
    },
    async createNotifications(notifications) {
      return notifications;
    },
    async createEventReminders(reminders) {
      createdReminders = reminders;
      return reminders;
    }
  };

  const proposal = await submitAdminDecision({
    actor: {
      id: "admin-1",
      role: "admin"
    },
    proposalId: "proposal-1",
    payload: {
      decision: "approve",
      remarks: "Final approval granted."
    },
    database: fakeDatabase,
    queueService: {
      areAsyncJobsEnabled() {
        return true;
      },
      async enqueueEventReminderGeneration(payload) {
        queuedReminderJobs.push(payload);
      },
      async enqueueMissingReportPrompt(payload) {
        queuedMissingReportJobs.push(payload);
      }
    }
  });

  assert.equal(proposal.status, "approved");
  assert.equal(createdReminders.length, 0);
  assert.deepEqual(queuedReminderJobs, [{
    proposalId: "proposal-1",
    recipientUserIds: ["executive-1", "advisor-1", "president-1"],
    eventDate: "2026-05-20"
  }]);
  assert.deepEqual(queuedMissingReportJobs, [{
    proposalId: "proposal-1",
    clubId: "club-1",
    eventDate: "2026-05-20"
  }]);
});

test("admin decision blocks invalid or duplicate transitions", async () => {
  const fakeDatabase = {
    async getProposalById() {
      return createPendingAdminProposal({
        status: "approved"
      });
    }
  };

  await assert.rejects(
    () =>
      submitAdminDecision({
        actor: {
          id: "admin-1",
          role: "admin"
        },
        proposalId: "proposal-1",
        payload: {
          decision: "reject"
        },
        database: fakeDatabase
      }),
    (error) => error.statusCode === 409 && error.code === "INVALID_PROPOSAL_STATE"
  );
});

test("non-admin role is blocked from admin decision", async () => {
  await assert.rejects(
    () =>
      submitAdminDecision({
        actor: {
          id: "advisor-1",
          role: "advisor"
        },
        proposalId: "proposal-1",
        payload: {
          decision: "approve"
        },
        database: {}
      }),
    (error) => error.statusCode === 403 && error.code === "FORBIDDEN"
  );
});

test("admin cannot review a proposal they submitted themselves", async () => {
  const fakeDatabase = {
    async getProposalById() {
      return createPendingAdminProposal({
        submitted_by: "admin-1"
      });
    }
  };

  await assert.rejects(
    () =>
      submitAdminDecision({
        actor: {
          id: "admin-1",
          role: "admin"
        },
        proposalId: "proposal-1",
        payload: {
          decision: "approve"
        },
        database: fakeDatabase
      }),
    (error) => error.statusCode === 403 && error.code === "SELF_REVIEW_FORBIDDEN"
  );
});

function createRouteTestDatabase() {
  const profiles = {
    "admin-1": {
      id: "admin-1",
      full_name: "Club Services Admin",
      role: "admin",
      club_id: null
    }
  };

  return {
    async getUserByAccessToken(accessToken) {
      if (accessToken !== "admin-token") {
        return null;
      }

      return {
        id: "admin-1",
        email: "admin@nilehive.test"
      };
    },
    async getProfileById(profileId) {
      return profiles[profileId] ?? null;
    },
    async getProposalById() {
      return createPendingAdminProposal();
    },
    async applyAdminDecision(decisionInput) {
      return createPendingAdminProposal({
        status: decisionInput.nextStatus
      });
    },
    async getAdvisorProfileIdsByClubId() {
      return [];
    },
    async getPresidentProfileIdsByClubId() {
      return [];
    },
    async createNotifications(notifications) {
      return notifications;
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

test("admin decision route requires valid decision input", async (t) => {
  const server = await createTestServer(createRouteTestDatabase());
  t.after(() => server.close());

  const response = await fetch(`${server.baseUrl}/api/v1/proposals/admin/proposal-1/decision`, {
    method: "POST",
    headers: {
      Authorization: "Bearer admin-token",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      decision: "maybe"
    })
  });
  const payload = await response.json();

  assert.equal(response.status, 400);
  assert.equal(payload.error.code, "VALIDATION_ERROR");
});
