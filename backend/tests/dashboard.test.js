const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/app");
const { calculateClubHealthScore, clampScore } = require("../src/modules/dashboard/dashboard.service");

function getRelativeDate(daysFromToday) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().slice(0, 10);
}

function createProposal(overrides = {}) {
  return {
    id: "proposal-1",
    club_id: "club-1",
    submitted_by: "president-1",
    title: "Leadership Summit",
    description: "A leadership event.",
    event_date: getRelativeDate(7),
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

test("club health score starts new clubs at a neutral baseline", () => {
  const health = calculateClubHealthScore();

  assert.equal(health.score, 50);
  assert.equal(health.label, "Getting Started");
  assert.deepEqual(health.breakdown, {
    dues: 50,
    membership: 50,
    events: 50,
    reports: 50,
    tasks: 50,
    feedback: 50
  });
});

test("club health score rewards excellent clubs without exceeding 100", () => {
  const health = calculateClubHealthScore({
    members: [
      { membership_status: "active" },
      { membership_status: "active" }
    ],
    duePayments: [
      { status: "paid" },
      { status: "paid" }
    ],
    proposals: [
      createProposal({ id: "proposal-excellent-1", status: "approved", event_date: getRelativeDate(-3) }),
      createProposal({ id: "proposal-excellent-2", status: "approved", event_date: getRelativeDate(4) })
    ],
    approvedEvents: [
      createProposal({ id: "proposal-excellent-1", status: "approved", event_date: getRelativeDate(-3) }),
      createProposal({ id: "proposal-excellent-2", status: "approved", event_date: getRelativeDate(4) })
    ],
    reports: [
      { proposal_id: "proposal-excellent-1" }
    ],
    tasks: [
      { status: "completed" },
      { status: "completed" }
    ],
    feedback: [
      { rating: 5, status: "resolved" },
      { rating: 5, status: "closed" }
    ]
  });

  assert.equal(health.score, 100);
  assert.equal(health.label, "Excellent");
});

test("club health score handles weak clubs without dropping below zero", () => {
  const health = calculateClubHealthScore({
    members: [
      { membership_status: "inactive" }
    ],
    duePayments: [
      { status: "submitted" }
    ],
    proposals: [
      createProposal({ id: "proposal-weak-1", status: "admin_rejected", event_date: getRelativeDate(-10) })
    ],
    approvedEvents: [
      createProposal({ id: "proposal-weak-2", status: "approved", event_date: getRelativeDate(-10) })
    ],
    reports: [],
    tasks: [
      { status: "blocked" }
    ],
    feedback: [
      { rating: 1, status: "open" }
    ]
  });

  assert.ok(health.score >= 0);
  assert.ok(health.score < 40);
  assert.equal(health.label, "At Risk");
});

test("club health score uses deterministic weighted inputs and breakdown", () => {
  const health = calculateClubHealthScore({
    members: [
      { membership_status: "active" },
      { membership_status: "active" },
      { membership_status: "inactive" },
      { membership_status: "inactive" }
    ],
    duePayments: [
      { status: "paid" },
      { status: "paid" },
      { status: "submitted" },
      { status: "rejected" }
    ],
    proposals: [
      createProposal({ id: "proposal-weighted-1", status: "approved", event_date: getRelativeDate(-5) }),
      createProposal({ id: "proposal-weighted-2", status: "approved", event_date: getRelativeDate(8) }),
      createProposal({ id: "proposal-weighted-3", status: "pending_admin_review", event_date: getRelativeDate(12) }),
      createProposal({ id: "proposal-weighted-4", status: "admin_rejected", event_date: getRelativeDate(15) })
    ],
    approvedEvents: [
      createProposal({ id: "proposal-weighted-1", status: "approved", event_date: getRelativeDate(-5) }),
      createProposal({ id: "proposal-weighted-2", status: "approved", event_date: getRelativeDate(8) })
    ],
    reports: [
      { proposal_id: "proposal-weighted-1" }
    ],
    tasks: [
      { status: "completed" },
      { status: "pending" },
      { status: "blocked" }
    ],
    feedback: [
      { rating: 5, status: "resolved" },
      { rating: 3, status: "open" }
    ],
    now: new Date()
  });

  assert.deepEqual(health.breakdown, {
    dues: 50,
    membership: 50,
    events: 58,
    reports: 100,
    tasks: 40,
    feedback: 74
  });
  assert.equal(health.score, 59);
  assert.equal(health.label, "Getting Started");
});

test("club health score utilities clamp extreme values", () => {
  assert.equal(clampScore(200), 100);
  assert.equal(clampScore(-20), 0);
  assert.equal(clampScore(Number.NaN), 50);
});

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
      event_date: getRelativeDate(7),
      admin_decided_at: "2026-04-04T10:00:00.000Z",
      updated_at: "2026-04-04T10:00:00.000Z"
    }),
    createProposal({
      id: "proposal-4",
      title: "Past Approved Event",
      status: "approved",
      event_date: getRelativeDate(-7),
      admin_decided_at: "2026-04-21T10:00:00.000Z",
      updated_at: "2026-04-21T10:00:00.000Z"
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
          id: "proposal-5",
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
          academic_session: "2025/2026",
          status: "paid",
          created_at: "2026-04-07T10:00:00.000Z",
          updated_at: "2026-04-07T10:00:00.000Z"
        },
        {
          id: "dues-previous-1",
          club_id: "club-1",
          member_id: "member-1",
          amount: 3000,
          academic_session: "2024/2025",
          status: "paid",
          created_at: "2025-04-07T10:00:00.000Z",
          updated_at: "2025-04-07T10:00:00.000Z"
        },
        {
          id: "dues-2",
          club_id: "club-1",
          member_id: "member-2",
          amount: 5000,
          academic_session: "2025/2026",
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
  assert.equal(payload.data.summary.upcoming_events, 1);
  assert.equal(payload.data.assigned_tasks.length, 1);
  assert.equal(payload.data.assigned_tasks[0].assigned_to, "executive-1");
  assert.equal(payload.data.upcoming_events.length, 1);
  assert.equal(payload.data.upcoming_events[0].proposal_id, "proposal-2");
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
  assert.equal(payload.data.summary.upcoming_events, 1);
  assert.equal(typeof payload.data.summary.club_health_score, "number");
  assert.ok(payload.data.summary.club_health_score >= 0);
  assert.ok(payload.data.summary.club_health_score <= 100);
  assert.equal(typeof payload.data.summary.club_health_label, "string");
  assert.equal(typeof payload.data.summary.club_health_breakdown.dues, "number");
  assert.equal(payload.data.recent_activity.length, 4);
  assert.equal(payload.data.pending_proposals.length, 1);
  assert.equal(payload.data.upcoming_events.length, 1);
  assert.equal(payload.data.upcoming_events[0].proposal_id, "proposal-2");
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
  assert.equal(payload.data.summary.approved_events, 1);
  assert.equal(payload.data.dues_comparison_context.current_academic_session, "2025/2026");
  assert.equal(payload.data.dues_comparison_context.previous_academic_session, "2024/2025");
  assert.equal(payload.data.summary.current_session_dues_collected, 5000);
  assert.equal(payload.data.summary.previous_session_dues_collected, 3000);
  assert.equal(payload.data.summary.dues_change_amount, 2000);
  assert.equal(payload.data.summary.attendance_rate, 100);
  assert.equal(payload.data.club_performance.length, 2);
  assert.equal(payload.data.club_performance[0].club_name, "Nile Innovators Club");
  assert.equal(payload.data.club_performance[0].approved_events, 1);
  assert.equal(typeof payload.data.club_performance[0].club_health_score, "number");
  assert.ok(payload.data.club_performance.every((club) => club.club_health_score >= 0 && club.club_health_score <= 100));
  assert.equal(typeof payload.data.club_performance[0].club_health_label, "string");
  assert.equal(typeof payload.data.club_performance[0].club_health_breakdown.membership, "number");
  assert.equal(payload.data.club_performance[0].current_session_dues_collected, 5000);
  assert.equal(payload.data.club_performance[0].previous_session_dues_collected, 3000);
  assert.equal(payload.data.club_performance[0].dues_change_amount, 2000);
  assert.equal(payload.data.summary.missing_reports, 1);
  assert.equal(payload.data.missing_reports.length, 1);
  assert.equal(payload.data.missing_reports[0].proposal_id, "proposal-4");
  assert.equal(payload.data.queue.status, "not_required");
  assert.equal(payload.data.ops_status.queue.worker_status, "not_required");
  assert.ok(payload.data.proposal_bottlenecks.length > 0);
  assert.ok(payload.data.pending_actions.some((action) => action.type === "membership_requests"));
  assert.ok(payload.data.pending_actions.some((action) => action.type === "missing_reports"));
  assert.ok(payload.data.recent_activity.length > 0);
});

test("admin can fetch one club operations dashboard", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const { response, payload } = await getDashboard(
    server.baseUrl,
    "/api/v1/dashboard/admin-operations/clubs/club-1",
    "admin-token"
  );

  assert.equal(response.status, 200);
  assert.equal(payload.data.role, "admin");
  assert.equal(payload.data.club.id, "club-1");
  assert.equal(payload.data.summary.total_members, 2);
  assert.equal(payload.data.summary.open_tasks, 1);
  assert.equal(payload.data.summary.approved_events, 1);
  assert.equal(typeof payload.data.summary.club_health_score, "number");
  assert.ok(payload.data.summary.club_health_score >= 0);
  assert.ok(payload.data.summary.club_health_score <= 100);
  assert.equal(payload.data.summary.club_health_score, payload.data.performance.club_health_score);
  assert.equal(payload.data.summary.club_health_label, payload.data.performance.club_health_label);
  assert.equal(payload.data.summary.current_session_dues_collected, 5000);
  assert.equal(payload.data.summary.previous_session_dues_collected, 3000);
  assert.equal(payload.data.summary.dues_change_amount, 2000);
  assert.equal(payload.data.dues_comparison.current_academic_session, "2025/2026");
  assert.equal(payload.data.dues_comparison.previous_academic_session, "2024/2025");
  assert.equal(payload.data.summary.missing_reports, 1);
  assert.equal(payload.data.tasks.length, 1);
  assert.equal(payload.data.recent_proposals.length, 4);
  assert.equal(payload.data.approved_events.length, 1);
  assert.equal(payload.data.approved_events[0].proposal_id, "proposal-2");
  assert.equal(payload.data.missing_reports.length, 1);
  assert.equal(payload.data.missing_reports[0].proposal_id, "proposal-4");
  assert.equal(payload.data.recent_activity.length > 0, true);
});

test("non-admin cannot fetch one club operations dashboard", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const { response, payload } = await getDashboard(
    server.baseUrl,
    "/api/v1/dashboard/admin-operations/clubs/club-1",
    "president-token"
  );

  assert.equal(response.status, 403);
  assert.equal(payload.error.code, "FORBIDDEN");
});

test("missing club operations dashboard returns 404", async (t) => {
  const database = createFakeDatabase();
  database.getClubById = async (clubId) => {
    assert.equal(clubId, "missing-club");
    return null;
  };
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await getDashboard(
    server.baseUrl,
    "/api/v1/dashboard/admin-operations/clubs/missing-club",
    "admin-token"
  );

  assert.equal(response.status, 404);
  assert.equal(payload.error.code, "CLUB_NOT_FOUND");
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
