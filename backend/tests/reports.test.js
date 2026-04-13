const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/app");
const {
  createEventReport,
  listEventReports
} = require("../src/modules/reports/reports.service");

function createApprovedProposal(overrides = {}) {
  return {
    id: "proposal-1",
    club_id: "club-1",
    submitted_by: "executive-1",
    title: "Leadership Summit",
    proposed_activity: "Leadership Summit 2026",
    event_date: "2026-05-20",
    event_time: "10:00:00",
    location: "Main Hall",
    status: "approved",
    ...overrides
  };
}

function createReport(overrides = {}) {
  return {
    id: "report-1",
    proposal_id: "proposal-1",
    club_id: "club-1",
    submitted_by: "executive-1",
    attendance_count: 75,
    summary: "The event was completed successfully.",
    challenges: null,
    outcomes: "Members received handover guidance.",
    budget_used: 200000,
    media_urls: ["https://example.com/photo.jpg"],
    report_file_url: null,
    status: "submitted",
    submitted_at: "2026-05-21T10:00:00.000Z",
    created_at: "2026-05-21T10:00:00.000Z",
    updated_at: "2026-05-21T10:00:00.000Z",
    proposal: createApprovedProposal(),
    ...overrides
  };
}

test("executive can submit a post-event report for an approved club proposal", async () => {
  let createdReport;
  const fakeDatabase = {
    async getProposalById(proposalId) {
      assert.equal(proposalId, "proposal-1");
      return createApprovedProposal();
    },
    async getEventReportByProposalId(proposalId) {
      assert.equal(proposalId, "proposal-1");
      return null;
    },
    async createEventReport(report) {
      createdReport = report;
      return createReport(report);
    }
  };

  const report = await createEventReport({
    actor: {
      id: "executive-1",
      role: "executive",
      clubId: "club-1"
    },
    payload: {
      proposal_id: "proposal-1",
      attendance_count: 75,
      summary: "The event was completed successfully.",
      outcomes: "Members received handover guidance.",
      budget_used: 200000,
      media_urls: ["https://example.com/photo.jpg"]
    },
    database: fakeDatabase
  });

  assert.equal(createdReport.club_id, "club-1");
  assert.equal(createdReport.submitted_by, "executive-1");
  assert.equal(createdReport.status, "submitted");
  assert.equal(report.attendance_count, 75);
  assert.equal(report.proposal.title, "Leadership Summit");
});

test("post-event report requires an approved proposal", async () => {
  const fakeDatabase = {
    async getProposalById() {
      return createApprovedProposal({
        status: "pending_admin_review"
      });
    }
  };

  await assert.rejects(
    () =>
      createEventReport({
        actor: {
          id: "executive-1",
          role: "executive",
          clubId: "club-1"
        },
        payload: {
          proposal_id: "proposal-1",
          attendance_count: 75,
          summary: "The event was completed successfully."
        },
        database: fakeDatabase
      }),
    (error) => error.statusCode === 409 && error.code === "INVALID_PROPOSAL_STATE"
  );
});

test("duplicate post-event reports are blocked", async () => {
  const fakeDatabase = {
    async getProposalById() {
      return createApprovedProposal();
    },
    async getEventReportByProposalId() {
      return createReport();
    }
  };

  await assert.rejects(
    () =>
      createEventReport({
        actor: {
          id: "executive-1",
          role: "executive",
          clubId: "club-1"
        },
        payload: {
          proposal_id: "proposal-1",
          attendance_count: 75,
          summary: "The event was completed successfully."
        },
        database: fakeDatabase
      }),
    (error) => error.statusCode === 409 && error.code === "REPORT_ALREADY_EXISTS"
  );
});

test("advisor can list event reports for assigned clubs", async () => {
  const fakeDatabase = {
    async getAdvisorClubIds(advisorId) {
      assert.equal(advisorId, "advisor-1");
      return ["club-1"];
    },
    async listEventReports(filters) {
      assert.deepEqual(filters, {
        clubId: null,
        clubIds: ["club-1"],
        proposalId: undefined
      });
      return [createReport()];
    }
  };

  const reports = await listEventReports({
    actor: {
      id: "advisor-1",
      role: "advisor",
      clubId: null
    },
    database: fakeDatabase
  });

  assert.equal(reports.length, 1);
  assert.equal(reports[0].club_id, "club-1");
});

test("president cannot list reports for another club", async () => {
  await assert.rejects(
    () =>
      listEventReports({
        actor: {
          id: "president-1",
          role: "president",
          clubId: "club-1"
        },
        filters: {
          club_id: "club-2"
        },
        database: {}
      }),
    (error) => error.statusCode === 403 && error.code === "FORBIDDEN"
  );
});

function createRouteDatabase() {
  const profiles = {
    "executive-1": {
      id: "executive-1",
      full_name: "Amina Executive",
      role: "executive",
      club_id: "club-1"
    }
  };

  return {
    async getUserByAccessToken(accessToken) {
      if (accessToken !== "executive-token") {
        return null;
      }

      return {
        id: "executive-1",
        email: "executive@nilehive.test"
      };
    },
    async getProfileById(profileId) {
      return profiles[profileId] ?? null;
    },
    async listEventReports() {
      return [createReport()];
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

test("missing-token access is blocked for event reports", async (t) => {
  const server = await createTestServer(createRouteDatabase());
  t.after(() => server.close());

  const response = await fetch(`${server.baseUrl}/api/v1/reports`);
  const payload = await response.json();

  assert.equal(response.status, 401);
  assert.equal(payload.error.code, "AUTH_REQUIRED");
});
