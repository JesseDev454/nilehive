const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/app");
const {
  createProposal,
  submitExecutiveProposalRevision,
  updateExecutiveProposal
} = require("../src/modules/proposals/proposals.service");

function createFakeDatabase() {
  const profiles = {
    "executive-1": {
      id: "executive-1",
      full_name: "Amina Executive",
      role: "executive",
      club_id: "club-1"
    },
    "executive-2": {
      id: "executive-2",
      full_name: "Other Executive",
      role: "executive",
      club_id: "club-2"
    },
    "advisor-1": {
      id: "advisor-1",
      full_name: "Daniel Advisor",
      role: "advisor",
      club_id: null
    }
  };

  const proposals = [
    {
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
      created_at: "2026-04-05T10:00:00.000Z",
      updated_at: "2026-04-06T10:00:00.000Z"
    },
    {
      id: "proposal-2",
      club_id: "club-1",
      submitted_by: "executive-1",
      title: "Budget Revision",
      description: "A revised budget proposal.",
      event_date: "2026-05-25",
      location: "Conference Room",
      status: "advisor_rejected",
      advisor_remarks: "Please revise the venue budget.",
      advisor_decided_at: "2026-04-07T10:00:00.000Z",
      advisor_decided_by: "advisor-1",
      created_at: "2026-04-06T10:00:00.000Z",
      updated_at: "2026-04-07T10:00:00.000Z"
    },
    {
      id: "proposal-4",
      club_id: "club-1",
      submitted_by: "executive-1",
      title: "Draft Proposal",
      description: "Saved draft.",
      event_date: "2026-06-01",
      location: "Main Hall",
      status: "draft",
      advisor_remarks: null,
      advisor_decided_at: null,
      advisor_decided_by: null,
      created_at: "2026-04-08T10:00:00.000Z",
      updated_at: "2026-04-08T10:00:00.000Z"
    },
    {
      id: "proposal-3",
      club_id: "club-2",
      submitted_by: "executive-2",
      title: "Other Club Proposal",
      description: "Should not be visible to another executive.",
      event_date: "2026-05-26",
      location: "Auditorium",
      status: "pending_advisor_review",
      advisor_remarks: null,
      advisor_decided_at: null,
      advisor_decided_by: null,
      created_at: "2026-04-07T10:00:00.000Z",
      updated_at: "2026-04-07T10:00:00.000Z"
    }
  ];

  const latestApprovals = {
    "proposal-1": {
      proposal_id: "proposal-1",
      reviewer_id: "advisor-1",
      reviewer_role: "advisor",
      decision: "approve",
      remarks: "Ready for admin review.",
      decided_at: "2026-04-06T10:00:00.000Z"
    },
    "proposal-2": {
      proposal_id: "proposal-2",
      reviewer_id: "advisor-1",
      reviewer_role: "advisor",
      decision: "reject",
      remarks: "Please revise the venue budget.",
      decided_at: "2026-04-07T10:00:00.000Z"
    }
  };

  const tokens = {
    "executive-token": {
      id: "executive-1",
      email: "executive@nilehive.test"
    },
    "advisor-token": {
      id: "advisor-1",
      email: "advisor@nilehive.test"
    }
  };

  return {
    async getUserByAccessToken(accessToken) {
      return tokens[accessToken] ?? null;
    },
    async getProfileById(profileId) {
      return profiles[profileId] ?? null;
    },
    async listExecutiveProposals(submittedBy) {
      return proposals.filter((proposal) => proposal.submitted_by === submittedBy);
    },
    async getProposalById(proposalId) {
      return proposals.find((proposal) => proposal.id === proposalId) ?? null;
    },
    async getLatestApprovalByProposalId(proposalId) {
      return latestApprovals[proposalId] ?? null;
    },
    async getLatestApprovalsByProposalIds(proposalIds) {
      return proposalIds.reduce((approvalsByProposal, proposalId) => {
        if (latestApprovals[proposalId]) {
          approvalsByProposal[proposalId] = latestApprovals[proposalId];
        }

        return approvalsByProposal;
      }, {});
    }
  };
}

function createRichProposalPayload(overrides = {}) {
  return {
    title: "Leadership Summit Revised",
    description: "A revised planning summit for executive handover.",
    event_date: "2026-06-20",
    location: "Main Hall",
    aim_objectives: "Plan leadership transition.",
    proposed_activity: "Leadership Summit Revised",
    event_time: "10:00",
    number_of_participants: 80,
    budget_estimate: 100000,
    budget_line_items: [
      {
        item: "Venue",
        quantity: 1,
        description: "Venue support",
        amount: 100000
      }
    ],
    responsible_members: [
      {
        name: "Amina Executive",
        student_id: "24-2120-109",
        phone_number: "08012345678",
        position: "Executive"
      }
    ],
    ...overrides
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

async function getExecutiveProposals(baseUrl, path, token) {
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

test("executive can fetch own proposals list", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await getExecutiveProposals(
    server.baseUrl,
    "/api/v1/proposals",
    "executive-token"
  );

  assert.equal(response.status, 200);
  assert.equal(payload.data.length, 3);
  assert.equal(payload.data[0].submitted_at, payload.data[0].created_at);
  assert.ok(payload.data.every((proposal) => proposal.current_stage));
});

test("executive can fetch own proposal detail", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await getExecutiveProposals(
    server.baseUrl,
    "/api/v1/proposals/proposal-1",
    "executive-token"
  );

  assert.equal(response.status, 200);
  assert.equal(payload.data.id, "proposal-1");
  assert.equal(payload.data.status, "pending_admin_review");
  assert.equal(payload.data.latest_approval.decision, "approve");
  assert.equal(payload.data.advisor_remarks, "Ready for admin review.");
});

test("executive cannot fetch another club's proposal", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await getExecutiveProposals(
    server.baseUrl,
    "/api/v1/proposals/proposal-3",
    "executive-token"
  );

  assert.equal(response.status, 404);
  assert.equal(payload.error.code, "PROPOSAL_NOT_FOUND");
});

test("wrong-role access is blocked", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await getExecutiveProposals(
    server.baseUrl,
    "/api/v1/proposals",
    "advisor-token"
  );

  assert.equal(response.status, 403);
  assert.equal(payload.error.code, "FORBIDDEN");
});

test("missing-token access is blocked", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await getExecutiveProposals(
    server.baseUrl,
    "/api/v1/proposals",
    ""
  );

  assert.equal(response.status, 401);
  assert.equal(payload.error.code, "AUTH_REQUIRED");
});

test("not-found proposal returns correctly", async (t) => {
  const database = createFakeDatabase();
  const server = await createTestServer(database);
  t.after(() => server.close());

  const { response, payload } = await getExecutiveProposals(
    server.baseUrl,
    "/api/v1/proposals/does-not-exist",
    "executive-token"
  );

  assert.equal(response.status, 404);
  assert.equal(payload.error.code, "PROPOSAL_NOT_FOUND");
});

test("executive can save a proposal as draft without notifying advisors", async () => {
  let createdProposal;
  let notificationCount = 0;
  const fakeDatabase = {
    async createProposal(proposal) {
      createdProposal = proposal;
      return {
        id: "proposal-draft",
        created_at: "2026-04-10T10:00:00.000Z",
        updated_at: "2026-04-10T10:00:00.000Z",
        ...proposal
      };
    },
    async getAdvisorProfileIdsByClubId() {
      return ["advisor-1"];
    },
    async createNotifications(notifications) {
      notificationCount += notifications.length;
      return notifications;
    }
  };

  const draft = await createProposal({
    actor: {
      id: "executive-1",
      role: "executive",
      clubId: "club-1"
    },
    payload: createRichProposalPayload({
      save_as_draft: true
    }),
    database: fakeDatabase
  });

  assert.equal(createdProposal.status, "draft");
  assert.equal(createdProposal.submitted_at, null);
  assert.equal(createdProposal.last_edited_by, "executive-1");
  assert.equal(notificationCount, 0);
  assert.equal(draft.status, "draft");
});

test("executive can save an incomplete proposal as a draft", async () => {
  let createdProposal;
  const fakeDatabase = {
    async createProposal(proposal) {
      createdProposal = proposal;
      return {
        id: "proposal-partial-draft",
        created_at: "2026-04-10T10:00:00.000Z",
        updated_at: "2026-04-10T10:00:00.000Z",
        ...proposal
      };
    },
    async getAdvisorProfileIdsByClubId() {
      throw new Error("drafts should not notify advisors");
    },
    async createNotifications() {
      throw new Error("drafts should not create notifications");
    }
  };

  const draft = await createProposal({
    actor: {
      id: "executive-1",
      role: "executive",
      clubId: "club-1"
    },
    payload: {
      club_id: "club-1",
      proposed_activity: "Freshers Mixer",
      save_as_draft: true
    },
    database: fakeDatabase
  });

  assert.equal(createdProposal.status, "draft");
  assert.equal(createdProposal.title, "Freshers Mixer");
  assert.equal(createdProposal.description, null);
  assert.equal(createdProposal.event_date, null);
  assert.equal(draft.status, "draft");
});

test("executive cannot submit an incomplete draft for advisor review", async () => {
  const fakeDatabase = {
    async getProposalById() {
      return {
        id: "proposal-partial-draft",
        club_id: "club-1",
        submitted_by: "executive-1",
        title: "Freshers Mixer",
        description: null,
        event_date: null,
        location: null,
        aim_objectives: null,
        proposed_activity: "Freshers Mixer",
        status: "draft",
        created_at: "2026-04-10T10:00:00.000Z",
        updated_at: "2026-04-10T10:00:00.000Z"
      };
    }
  };

  await assert.rejects(
    () =>
      submitExecutiveProposalRevision({
        actor: {
          id: "executive-1",
          role: "executive",
          clubId: "club-1"
        },
        proposalId: "proposal-partial-draft",
        database: fakeDatabase
      }),
    (error) => error.statusCode === 400 && error.code === "VALIDATION_ERROR"
  );
});

test("executive can keep editing an incomplete draft", async () => {
  let update;
  const fakeDatabase = {
    async getProposalById(proposalId) {
      assert.equal(proposalId, "proposal-partial-draft");
      return {
        id: "proposal-partial-draft",
        club_id: "club-1",
        submitted_by: "executive-1",
        title: "Untitled draft",
        description: null,
        event_date: null,
        location: null,
        status: "draft",
        created_at: "2026-04-10T10:00:00.000Z",
        updated_at: "2026-04-10T10:00:00.000Z"
      };
    },
    async updateProposal(proposalId, nextUpdate) {
      update = nextUpdate;
      return {
        id: proposalId,
        club_id: "club-1",
        submitted_by: "executive-1",
        status: "draft",
        created_at: "2026-04-10T10:00:00.000Z",
        updated_at: "2026-04-10T10:00:00.000Z",
        ...nextUpdate
      };
    }
  };

  const proposal = await updateExecutiveProposal({
    actor: {
      id: "executive-1",
      role: "executive",
      clubId: "club-1"
    },
    proposalId: "proposal-partial-draft",
    payload: {
      club_id: "club-1",
      proposed_activity: "Freshers Mixer",
      save_as_draft: true
    },
    database: fakeDatabase
  });

  assert.equal(update.title, "Freshers Mixer");
  assert.equal(update.description, null);
  assert.equal(update.last_edited_by, "executive-1");
  assert.equal(proposal.status, "draft");
});

test("executive can edit a rejected proposal", async () => {
  let update;
  const fakeDatabase = {
    async getProposalById(proposalId) {
      assert.equal(proposalId, "proposal-2");
      return {
        id: "proposal-2",
        club_id: "club-1",
        submitted_by: "executive-1",
        title: "Budget Revision",
        description: "A revised budget proposal.",
        event_date: "2026-05-25",
        location: "Conference Room",
        status: "advisor_rejected",
        created_at: "2026-04-06T10:00:00.000Z",
        updated_at: "2026-04-07T10:00:00.000Z"
      };
    },
    async updateProposal(proposalId, nextUpdate) {
      update = nextUpdate;
      return {
        id: proposalId,
        club_id: "club-1",
        submitted_by: "executive-1",
        status: "advisor_rejected",
        created_at: "2026-04-06T10:00:00.000Z",
        updated_at: "2026-04-08T10:00:00.000Z",
        ...nextUpdate
      };
    }
  };

  const proposal = await updateExecutiveProposal({
    actor: {
      id: "executive-1",
      role: "executive",
      clubId: "club-1"
    },
    proposalId: "proposal-2",
    payload: createRichProposalPayload(),
    database: fakeDatabase
  });

  assert.equal(update.title, "Leadership Summit Revised");
  assert.equal(update.last_edited_by, "executive-1");
  assert.equal(proposal.status, "advisor_rejected");
});

test("executive can resubmit a rejected proposal for advisor review", async () => {
  let update;
  let notifications = [];
  const fakeDatabase = {
    async getProposalById(proposalId) {
      assert.equal(proposalId, "proposal-2");
      return {
        id: "proposal-2",
        club_id: "club-1",
        submitted_by: "executive-1",
        title: "Budget Revision",
        description: "A revised budget proposal.",
        event_date: "2026-05-25",
        location: "Conference Room",
        aim_objectives: "Revise the event budget.",
        proposed_activity: "Budget Revision",
        event_time: "10:00",
        number_of_participants: 60,
        budget_line_items: [
          {
            item: "Venue",
            quantity: 1,
            description: "Venue support",
            amount: 50000
          }
        ],
        responsible_members: [
          {
            name: "Amina Executive",
            student_id: "24-2120-109",
            phone_number: "08012345678",
            position: "Executive"
          }
        ],
        status: "advisor_rejected",
        revision_count: 1,
        submitted_at: "2026-04-06T10:00:00.000Z",
        created_at: "2026-04-06T10:00:00.000Z",
        updated_at: "2026-04-07T10:00:00.000Z"
      };
    },
    async updateProposal(proposalId, nextUpdate) {
      update = nextUpdate;
      return {
        id: proposalId,
        club_id: "club-1",
        submitted_by: "executive-1",
        title: "Budget Revision",
        description: "A revised budget proposal.",
        event_date: "2026-05-25",
        location: "Conference Room",
        created_at: "2026-04-06T10:00:00.000Z",
        updated_at: "2026-04-08T10:00:00.000Z",
        ...nextUpdate
      };
    },
    async getAdvisorProfileIdsByClubId(clubId) {
      assert.equal(clubId, "club-1");
      return ["advisor-1"];
    },
    async createNotifications(nextNotifications) {
      notifications = nextNotifications;
      return nextNotifications;
    }
  };

  const proposal = await submitExecutiveProposalRevision({
    actor: {
      id: "executive-1",
      role: "executive",
      clubId: "club-1"
    },
    proposalId: "proposal-2",
    database: fakeDatabase
  });

  assert.equal(update.status, "pending_advisor_review");
  assert.equal(update.revision_count, 2);
  assert.ok(update.resubmitted_at);
  assert.equal(notifications[0].type, "proposal_resubmitted");
  assert.equal(proposal.current_owner_role, "advisor");
});

test("executive cannot edit a proposal that is already in review", async () => {
  const fakeDatabase = {
    async getProposalById() {
      return {
        id: "proposal-1",
        club_id: "club-1",
        submitted_by: "executive-1",
        status: "pending_advisor_review"
      };
    }
  };

  await assert.rejects(
    () =>
      updateExecutiveProposal({
        actor: {
          id: "executive-1",
          role: "executive",
          clubId: "club-1"
        },
        proposalId: "proposal-1",
        payload: createRichProposalPayload(),
        database: fakeDatabase
      }),
    (error) => error.statusCode === 409 && error.code === "INVALID_PROPOSAL_STATE"
  );
});
