const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/app");

function createProposal(overrides = {}) {
  return {
    id: "proposal-1",
    club_id: "club-1",
    submitted_by: "president-1",
    title: "Leadership Summit",
    description: "A leadership event.",
    event_date: "2026-05-20",
    event_time: "10:00:00",
    location: "Main Hall",
    proposed_activity: "Leadership Summit 2026",
    status: "pending_advisor_review",
    admin_decided_at: null,
    created_at: "2026-04-01T10:00:00.000Z",
    updated_at: "2026-04-01T10:00:00.000Z",
    ...overrides
  };
}

function createFakeDatabase() {
  const profiles = {
    "executive-1": {
      id: "executive-1",
      full_name: "Amina Executive",
      role: "executive",
      club_id: "club-1"
    },
    "president-1": {
      id: "president-1",
      full_name: "Tomi President",
      role: "president",
      club_id: "club-1"
    },
    "advisor-1": {
      id: "advisor-1",
      full_name: "Daniel Advisor",
      role: "advisor",
      club_id: null
    },
    "admin-1": {
      id: "admin-1",
      full_name: "Club Services Admin",
      role: "admin",
      club_id: null
    }
  };
  const proposals = [
    createProposal(),
    createProposal({
      id: "proposal-2",
      title: "Approved Event",
      status: "approved",
      admin_decided_at: "2026-04-04T10:00:00.000Z",
      updated_at: "2026-04-04T10:00:00.000Z"
    }),
    createProposal({
      id: "proposal-3",
      title: "Rejected Event",
      status: "admin_rejected",
      updated_at: "2026-04-03T10:00:00.000Z"
    })
  ];

  return {
    async getUserByAccessToken(accessToken) {
      const tokenProfiles = {
        "executive-token": "executive-1",
        "president-token": "president-1",
        "advisor-token": "advisor-1",
        "admin-token": "admin-1"
      };
      const profileId = tokenProfiles[accessToken];

      return profileId
        ? {
            id: profileId,
            email: `${profileId}@nilehive.test`
          }
        : null;
    },
    async getProfileById(profileId) {
      return profiles[profileId] ?? null;
    },
    async getClubById(clubId) {
      assert.equal(clubId, "club-1");
      return {
        id: "club-1",
        name: "Nile Innovators Club",
        code: "NIC",
        advisor_id: "advisor-1",
        created_at: "2026-04-01T10:00:00.000Z"
      };
    },
    async listClubs() {
      return [
        {
          id: "club-1",
          name: "Nile Innovators Club",
          code: "NIC",
          advisor_id: "advisor-1",
          created_at: "2026-04-01T10:00:00.000Z"
        },
        {
          id: "club-2",
          name: "Arts Society",
          code: "ART",
          advisor_id: null,
          created_at: "2026-04-01T10:00:00.000Z"
        }
      ];
    },
    async listExecutiveProposals(submittedBy) {
      assert.equal(submittedBy, "executive-1");
      return proposals.filter((proposal) => proposal.submitted_by === submittedBy);
    },
    async listProposalsByClubId(clubId) {
      assert.equal(clubId, "club-1");
      return proposals;
    },
    async listAdminProposals() {
      return [
        ...proposals,
        createProposal({
          id: "proposal-4",
          club_id: "club-2",
          title: "Draft Proposal",
          status: "draft"
        })
      ];
    },
    async listApprovedProposals(filters = {}) {
      if (filters.clubIds) {
        assert.deepEqual(filters.clubIds, ["club-1"]);
      }

      return proposals.filter((proposal) => proposal.status === "approved");
    },
    async listEventRemindersByUserId(userId) {
      return [
        {
          id: "reminder-1",
          user_id: userId,
          proposal_id: "proposal-2",
          message: "Approved event reminder.",
          remind_at: "2026-05-20T09:00:00.000Z",
          delivery_status: "stored",
          created_at: "2026-04-04T10:00:00.000Z"
        }
      ];
    },
    async listNotificationsByUserId(userId) {
      return [
        {
          id: "notification-1",
          user_id: userId,
          proposal_id: "proposal-2",
          type: "admin_approved",
          message: "Proposal approved.",
          delivery_status: "stored",
          created_at: "2026-04-04T10:00:00.000Z"
        }
      ];
    },
    async listProfilesByClubId(clubId, filters = {}) {
      assert.equal(clubId, "club-1");
      assert.equal(filters.role, "executive");
      return [profiles["executive-1"]];
    },
    async listClubMembers() {
      return [
        {
          id: "member-1",
          club_id: "club-1",
          profile_id: "student-1",
          full_name: "Ada Student",
          student_id: "020232255",
          membership_status: "active"
        },
        {
          id: "member-2",
          club_id: "club-1",
          profile_id: "student-2",
          full_name: "Bola Student",
          student_id: "020303344",
          membership_status: "inactive"
        }
      ];
    },
    async listDuePayments() {
      return [
        {
          id: "dues-1",
          club_id: "club-1",
          member_id: "member-1",
          amount: 5000,
          status: "paid",
          created_at: "2026-04-07T10:00:00.000Z",
          updated_at: "2026-04-07T10:00:00.000Z"
        },
        {
          id: "dues-2",
          club_id: "club-1",
          member_id: "member-2",
          amount: 5000,
          status: "submitted",
          created_at: "2026-04-08T10:00:00.000Z",
          updated_at: "2026-04-08T10:00:00.000Z"
        }
      ];
    },
    async listMembershipRequests() {
      return [
        {
          id: "request-1",
          club_id: "club-1",
          profile_id: "student-3",
          status: "pending",
          created_at: "2026-04-09T10:00:00.000Z",
          updated_at: "2026-04-09T10:00:00.000Z"
        }
      ];
    },
    async listEventReports() {
      return [];
    },
    async listTasks(filters = {}) {
      const tasks = [
        {
          id: "task-1",
          club_id: "club-1",
          assigned_by: "president-1",
          assigned_to: "executive-1",
          title: "Book hall",
          description: "Reserve the main hall before the event.",
          priority: "high",
          status: "pending",
          due_date: "2026-04-18",
          created_at: "2026-04-06T10:00:00.000Z",
          updated_at: "2026-04-06T10:00:00.000Z"
        }
      ];

      return tasks.filter((task) => {
        if (filters.assignedTo && task.assigned_to !== filters.assignedTo) {
          return false;
        }

        if (filters.clubId && task.club_id !== filters.clubId) {
          return false;
        }

        if (filters.status && task.status !== filters.status) {
          return false;
        }

        return true;
      });
    },
    async listFeedback() {
      return [
        {
          id: "feedback-1",
          club_id: "club-1",
          proposal_id: "proposal-2",
          rating: 5,
          status: "open",
          created_at: "2026-04-11T10:00:00.000Z",
          updated_at: "2026-04-11T10:00:00.000Z"
        }
      ];
    },
    async listEventRsvps() {
      return [
        {
          id: "rsvp-1",
          club_id: "club-1",
          proposal_id: "proposal-2",
          user_id: "student-1",
          status: "going",
          created_at: "2026-04-12T10:00:00.000Z",
          updated_at: "2026-04-12T10:00:00.000Z"
        }
      ];
    },
    async listEventAttendance() {
      return [
        {
          id: "attendance-1",
          club_id: "club-1",
          proposal_id: "proposal-2",
          user_id: "student-1",
          attended: true,
          created_at: "2026-04-13T10:00:00.000Z",
          updated_at: "2026-04-13T10:00:00.000Z"
        }
      ];
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

async function getDashboard(baseUrl, path, token = "") {
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method: "GET",
    headers
  });
  const payload = await response.json();

  return { response, payload };
}

test("executive can fetch task-focused dashboard data", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const { response, payload } = await getDashboard(
    server.baseUrl,
    "/api/v1/dashboard/executive",
    "executive-token"
  );

  assert.equal(response.status, 200);
  assert.equal(payload.data.role, "executive");
  assert.equal(payload.data.summary.total_tasks, 1);
  assert.equal(payload.data.summary.pending_tasks, 1);
  assert.equal(payload.data.assigned_tasks.length, 1);
  assert.equal(payload.data.assigned_tasks[0].assigned_to, "executive-1");
  assert.equal(payload.data.upcoming_events.length, 1);
  assert.equal(payload.data.recent_proposals, undefined);
  assert.ok(payload.data.action_items.some((action) => action.type === "task_start"));
});

test("president can fetch live club dashboard data", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const { response, payload } = await getDashboard(
    server.baseUrl,
    "/api/v1/dashboard/president",
    "president-token"
  );

  assert.equal(response.status, 200);
  assert.equal(payload.data.role, "president");
  assert.equal(payload.data.club.name, "Nile Innovators Club");
  assert.equal(payload.data.summary.executive_count, 1);
  assert.equal(payload.data.recent_activity.length, 3);
  assert.equal(payload.data.pending_proposals.length, 1);
});

test("wrong-role dashboard access is blocked", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const { response, payload } = await getDashboard(
    server.baseUrl,
    "/api/v1/dashboard/president",
    "advisor-token"
  );

  assert.equal(response.status, 403);
  assert.equal(payload.error.code, "FORBIDDEN");
});

test("admin can fetch operations dashboard data", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const { response, payload } = await getDashboard(
    server.baseUrl,
    "/api/v1/dashboard/admin-operations",
    "admin-token"
  );

  assert.equal(response.status, 200);
  assert.equal(payload.data.role, "admin");
  assert.equal(payload.data.summary.total_clubs, 2);
  assert.equal(payload.data.summary.total_members, 2);
  assert.equal(payload.data.summary.pending_admin_proposals, 0);
  assert.equal(payload.data.summary.pending_membership_requests, 1);
  assert.equal(payload.data.summary.submitted_dues_payments, 1);
  assert.equal(payload.data.summary.attendance_rate, 100);
  assert.equal(payload.data.club_performance.length, 2);
  assert.equal(payload.data.club_performance[0].club_name, "Nile Innovators Club");
  assert.ok(payload.data.proposal_bottlenecks.length > 0);
  assert.ok(payload.data.pending_actions.some((action) => action.type === "membership_requests"));
  assert.ok(payload.data.recent_activity.length > 0);
});

test("admin attendance rate is capped at 100 percent", async (t) => {
  const database = createFakeDatabase();
  database.listEventAttendance = async () => [
    {
      id: "attendance-1",
      club_id: "club-1",
      proposal_id: "proposal-2",
      user_id: "student-1",
      attended: true,
      created_at: "2026-04-13T10:00:00.000Z",
      updated_at: "2026-04-13T10:00:00.000Z"
    },
    {
      id: "attendance-2",
      club_id: "club-1",
      proposal_id: "proposal-2",
      user_id: "student-2",
      attended: true,
      created_at: "2026-04-13T10:00:00.000Z",
      updated_at: "2026-04-13T10:00:00.000Z"
    }
  ];
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await getDashboard(
    server.baseUrl,
    "/api/v1/dashboard/admin-operations",
    "admin-token"
  );

  assert.equal(response.status, 200);
  assert.equal(payload.data.summary.event_attendance_count, 2);
  assert.equal(payload.data.summary.event_rsvp_count, 1);
  assert.equal(payload.data.summary.attendance_rate, 100);
});

test("non-admin cannot fetch operations dashboard data", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const { response, payload } = await getDashboard(
    server.baseUrl,
    "/api/v1/dashboard/admin-operations",
    "president-token"
  );

  assert.equal(response.status, 403);
  assert.equal(payload.error.code, "FORBIDDEN");
});

test("missing-token dashboard access is blocked", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const { response, payload } = await getDashboard(server.baseUrl, "/api/v1/dashboard/executive");

  assert.equal(response.status, 401);
  assert.equal(payload.error.code, "AUTH_REQUIRED");
});
