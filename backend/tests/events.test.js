const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/app");

function getRelativeDate(daysFromToday) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().slice(0, 10);
}

function createApprovedProposal(overrides = {}) {
  return {
    id: "proposal-1",
    club_id: "club-1",
    submitted_by: "executive-1",
    title: "Leadership Summit",
    description: "A planning summit for executive handover.",
    event_date: getRelativeDate(7),
    event_time: "10:00:00",
    location: "Main Hall",
    proposed_activity: "Leadership Summit 2026",
    number_of_participants: 80,
    budget_estimate: 250000,
    status: "approved",
    admin_decided_at: "2026-04-10T10:00:00.000Z",
    created_at: "2026-04-05T10:00:00.000Z",
    updated_at: "2026-04-10T10:00:00.000Z",
    ...overrides
  };
}

function createRsvp(overrides = {}) {
  return {
    id: "rsvp-1",
    proposal_id: "proposal-1",
    club_id: "club-1",
    user_id: "student-1",
    status: "going",
    profile: {
      id: "student-1",
      full_name: "Ada Student",
      student_id: "020232255",
      role: "student"
    },
    created_at: "2026-04-15T10:00:00.000Z",
    updated_at: "2026-04-15T10:00:00.000Z",
    ...overrides
  };
}

function createAttendance(overrides = {}) {
  return {
    id: "attendance-1",
    proposal_id: "proposal-1",
    club_id: "club-1",
    user_id: "student-1",
    attended: true,
    checked_in_by: "executive-1",
    checked_in_at: "2026-04-15T10:00:00.000Z",
    profile: {
      id: "student-1",
      full_name: "Ada Student",
      student_id: "020232255",
      role: "student"
    },
    created_at: "2026-04-15T10:00:00.000Z",
    updated_at: "2026-04-15T10:00:00.000Z",
    ...overrides
  };
}

function createFakeDatabase(overrides = {}) {
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
    },
    "student-1": {
      id: "student-1",
      full_name: "Ada Student",
      role: "student",
      club_id: "club-1"
    },
    "student-2": {
      id: "student-2",
      full_name: "Bola Student",
      role: "student",
      club_id: "club-2"
    },
    ...(overrides.profiles || {})
  };
  const proposals = overrides.proposals || [
    createApprovedProposal(),
    createApprovedProposal({
      id: "proposal-2",
      club_id: "club-2",
      title: "Cultural Night",
      proposed_activity: "Cultural Night"
    })
  ];
  const tokenProfiles = {
    "executive-token": "executive-1",
    "advisor-token": "advisor-1",
    "president-token": "president-1",
    "admin-token": "admin-1",
    "student-token": "student-1",
    "student-2-token": "student-2",
    ...(overrides.tokenProfiles || {})
  };
  const activeClubIdsByProfileId = {
    "student-1": ["club-1"],
    "student-2": ["club-2"],
    "executive-1": [],
    "president-1": [],
    ...(overrides.activeClubIdsByProfileId || {})
  };
  const rsvpsByProposalId = overrides.rsvpsByProposalId || {
    "proposal-1": [
      createRsvp(),
      createRsvp({
        id: "rsvp-2",
        user_id: "student-2",
        status: "interested",
        profile: {
          id: "student-2",
          full_name: "Bola Student",
          student_id: "020303344",
          role: "student"
        }
      })
    ]
  };
  const attendanceByProposalId = overrides.attendanceByProposalId || {
    "proposal-1": [createAttendance()]
  };

  return {
    async getUserByAccessToken(accessToken) {
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
    async getAdvisorClubIds(advisorId) {
      assert.equal(advisorId, "advisor-1");
      return ["club-2"];
    },
    async getActiveClubIdsByProfileId(profileId) {
      return activeClubIdsByProfileId[profileId] || [];
    },
    async listApprovedProposals(filters = {}) {
      if (!filters.clubIds) {
        return proposals;
      }

      return proposals.filter((proposal) => filters.clubIds.includes(proposal.club_id));
    },
    async getApprovedProposalById(proposalId) {
      return proposals.find((proposal) => proposal.id === proposalId && proposal.status === "approved") ?? null;
    },
    async upsertEventRsvp(rsvp) {
      if (overrides.upsertEventRsvp) {
        return overrides.upsertEventRsvp(rsvp);
      }

      return createRsvp(rsvp);
    },
    async listEventRsvps(filters = {}) {
      return rsvpsByProposalId[filters.proposalId] || [];
    },
    async upsertEventAttendance(attendance) {
      if (overrides.upsertEventAttendance) {
        return overrides.upsertEventAttendance(attendance);
      }

      return createAttendance(attendance);
    },
    async listEventAttendance(filters = {}) {
      const records = attendanceByProposalId[filters.proposalId] || [];

      if (filters.userId) {
        return records.filter((record) => record.user_id === filters.userId);
      }

      return records;
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

async function getApprovedEvents(baseUrl, token = "") {
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}/api/v1/events/approved`, {
    method: "GET",
    headers
  });
  const payload = await response.json();

  return { response, payload };
}

test("admin can fetch all approved events", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const { response, payload } = await getApprovedEvents(server.baseUrl, "admin-token");

  assert.equal(response.status, 200);
  assert.equal(payload.data.total, 2);
  assert.equal(payload.data.items.length, 2);
  assert.ok(payload.data.items.every((event) => event.status === "approved"));
  assert.ok(payload.data.items.every((event) => ["upcoming", "happening_today", "past"].includes(event.event_lifecycle)));
  assert.ok(payload.data.items.every((event) => typeof event.can_rsvp === "boolean"));
  assert.ok(payload.data.items.every((event) => typeof event.can_submit_feedback === "boolean"));
});

test("executive can fetch approved events for their club", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const { response, payload } = await getApprovedEvents(server.baseUrl, "executive-token");

  assert.equal(response.status, 200);
  assert.equal(payload.data.total, 1);
  assert.equal(payload.data.items.length, 1);
  assert.equal(payload.data.items[0].club_id, "club-1");
  assert.equal(payload.data.items[0].proposal_id, "proposal-1");
});

test("executive only sees current club events even with active memberships in other clubs", async (t) => {
  const server = await createTestServer(createFakeDatabase({
    activeClubIdsByProfileId: {
      "executive-1": ["club-1", "club-2"]
    }
  }));
  t.after(() => server.close());

  const { response, payload } = await getApprovedEvents(server.baseUrl, "executive-token");

  assert.equal(response.status, 200);
  assert.equal(payload.data.total, 1);
  assert.equal(payload.data.items.length, 1);
  assert.equal(payload.data.items[0].club_id, "club-1");
});

test("advisor can fetch approved events for assigned clubs", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const { response, payload } = await getApprovedEvents(server.baseUrl, "advisor-token");

  assert.equal(response.status, 200);
  assert.equal(payload.data.total, 1);
  assert.equal(payload.data.items.length, 1);
  assert.equal(payload.data.items[0].club_id, "club-2");
});

test("student can fetch approved events feed", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const { response, payload } = await getApprovedEvents(server.baseUrl, "student-token");

  assert.equal(response.status, 200);
  assert.equal(payload.data.total, 1);
  assert.equal(payload.data.items.length, 1);
  assert.ok(payload.data.items.every((event) => event.status === "approved"));
  assert.ok(payload.data.items.every((event) => event.club_id === "club-1"));
});

test("president only sees current club events even with active memberships in other clubs", async (t) => {
  const server = await createTestServer(createFakeDatabase({
    activeClubIdsByProfileId: {
      "president-1": ["club-1", "club-2"]
    }
  }));
  t.after(() => server.close());

  const { response, payload } = await getApprovedEvents(server.baseUrl, "president-token");

  assert.equal(response.status, 200);
  assert.equal(payload.data.total, 1);
  assert.equal(payload.data.items.length, 1);
  assert.equal(payload.data.items[0].club_id, "club-1");
});

test("president with no current club sees no events even if old active memberships exist", async (t) => {
  const server = await createTestServer(createFakeDatabase({
    profiles: {
      "president-1": {
        id: "president-1",
        full_name: "Tomi President",
        role: "president",
        club_id: null
      }
    },
    activeClubIdsByProfileId: {
      "president-1": ["club-2"]
    }
  }));
  t.after(() => server.close());

  const { response, payload } = await getApprovedEvents(server.baseUrl, "president-token");

  assert.equal(response.status, 200);
  assert.equal(payload.data.total, 0);
  assert.equal(payload.data.items.length, 0);
});

test("executive with no current club sees no events even if old active memberships exist", async (t) => {
  const server = await createTestServer(createFakeDatabase({
    profiles: {
      "executive-1": {
        id: "executive-1",
        full_name: "Amina Executive",
        role: "executive",
        club_id: null
      }
    },
    activeClubIdsByProfileId: {
      "executive-1": ["club-2"]
    }
  }));
  t.after(() => server.close());

  const { response, payload } = await getApprovedEvents(server.baseUrl, "executive-token");

  assert.equal(response.status, 200);
  assert.equal(payload.data.total, 0);
  assert.equal(payload.data.items.length, 0);
});

test("missing-token access is blocked for approved events", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const { response, payload } = await getApprovedEvents(server.baseUrl);

  assert.equal(response.status, 401);
  assert.equal(payload.error.code, "AUTH_REQUIRED");
});

test("student can RSVP to an approved event", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const response = await fetch(`${server.baseUrl}/api/v1/events/proposal-1/rsvp`, {
    method: "POST",
    headers: {
      Authorization: "Bearer student-token",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status: "going" })
  });
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.data.status, "going");
  assert.equal(payload.data.user_id, "student-1");
});

test("student cannot RSVP to a past approved event", async (t) => {
  const server = await createTestServer(createFakeDatabase({
    proposals: [
      createApprovedProposal({
        event_date: "2000-01-01"
      })
    ]
  }));
  t.after(() => server.close());

  const response = await fetch(`${server.baseUrl}/api/v1/events/proposal-1/rsvp`, {
    method: "POST",
    headers: {
      Authorization: "Bearer student-token",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status: "going" })
  });
  const payload = await response.json();

  assert.equal(response.status, 409);
  assert.equal(payload.error.code, "EVENT_RSVP_CLOSED");
});

test("non-students cannot RSVP to an approved event", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const response = await fetch(`${server.baseUrl}/api/v1/events/proposal-1/rsvp`, {
    method: "POST",
    headers: {
      Authorization: "Bearer executive-token",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status: "going" })
  });
  const payload = await response.json();

  assert.equal(response.status, 403);
  assert.equal(payload.error.code, "FORBIDDEN");
});

test("president can view engagement and mark attendance", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const engagementResponse = await fetch(`${server.baseUrl}/api/v1/events/proposal-1/engagement`, {
    headers: {
      Authorization: "Bearer president-token"
    }
  });
  const engagementPayload = await engagementResponse.json();
  const attendanceResponse = await fetch(`${server.baseUrl}/api/v1/events/proposal-1/attendance`, {
    method: "POST",
    headers: {
      Authorization: "Bearer president-token",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      user_id: "student-1",
      attended: true
    })
  });
  const attendancePayload = await attendanceResponse.json();

  assert.equal(engagementResponse.status, 200);
  assert.equal(engagementPayload.data.summary.total_rsvps, 2);
  assert.equal(engagementPayload.data.summary.going, 1);
  assert.equal(engagementPayload.data.rsvps.length, 2);
  assert.equal(attendanceResponse.status, 200);
  assert.equal(attendancePayload.data.attended, true);
  assert.equal(attendancePayload.data.checked_in_by, "president-1");
});

test("executive cannot manage event attendance", async (t) => {
  const server = await createTestServer(createFakeDatabase());
  t.after(() => server.close());

  const response = await fetch(`${server.baseUrl}/api/v1/events/proposal-1/attendance`, {
    method: "POST",
    headers: {
      Authorization: "Bearer executive-token",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      user_id: "student-1",
      attended: true
    })
  });
  const payload = await response.json();

  assert.equal(response.status, 403);
  assert.equal(payload.error.code, "FORBIDDEN");
});

test("student can self check in on the event date", async (t) => {
  const recordedAttendance = [];
  const server = await createTestServer(createFakeDatabase({
    proposals: [
      createApprovedProposal({
        event_date: getRelativeDate(0)
      })
    ],
    attendanceByProposalId: {
      "proposal-1": []
    },
    async upsertEventAttendance(attendance) {
      recordedAttendance.push(attendance);
      return createAttendance({
        ...attendance,
        checked_in_by: attendance.checked_in_by
      });
    }
  }));
  t.after(() => server.close());

  const response = await fetch(`${server.baseUrl}/api/v1/events/proposal-1/check-in`, {
    method: "POST",
    headers: {
      Authorization: "Bearer student-token"
    }
  });
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.data.user_id, "student-1");
  assert.equal(payload.data.attended, true);
  assert.equal(payload.data.checked_in_by, "student-1");
  assert.equal(recordedAttendance.length, 1);
});

test("student self check in is idempotent when already attended", async (t) => {
  let upsertCalls = 0;
  const server = await createTestServer(createFakeDatabase({
    proposals: [
      createApprovedProposal({
        event_date: getRelativeDate(0)
      })
    ],
    attendanceByProposalId: {
      "proposal-1": [
        createAttendance({
          checked_in_by: "student-1"
        })
      ]
    },
    async upsertEventAttendance(attendance) {
      upsertCalls += 1;
      return createAttendance(attendance);
    }
  }));
  t.after(() => server.close());

  const response = await fetch(`${server.baseUrl}/api/v1/events/proposal-1/check-in`, {
    method: "POST",
    headers: {
      Authorization: "Bearer student-token"
    }
  });
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.data.user_id, "student-1");
  assert.equal(upsertCalls, 0);
});

test("student cannot self check in before the event date", async (t) => {
  const server = await createTestServer(createFakeDatabase({
    proposals: [
      createApprovedProposal({
        event_date: getRelativeDate(7)
      })
    ],
    attendanceByProposalId: {
      "proposal-1": []
    }
  }));
  t.after(() => server.close());

  const response = await fetch(`${server.baseUrl}/api/v1/events/proposal-1/check-in`, {
    method: "POST",
    headers: {
      Authorization: "Bearer student-token"
    }
  });
  const payload = await response.json();

  assert.equal(response.status, 409);
  assert.equal(payload.error.code, "EVENT_CHECK_IN_CLOSED");
});

test("student without event access cannot self check in", async (t) => {
  const server = await createTestServer(createFakeDatabase({
    proposals: [
      createApprovedProposal({
        event_date: getRelativeDate(-1)
      })
    ],
    attendanceByProposalId: {
      "proposal-1": []
    }
  }));
  t.after(() => server.close());

  const response = await fetch(`${server.baseUrl}/api/v1/events/proposal-1/check-in`, {
    method: "POST",
    headers: {
      Authorization: "Bearer student-2-token"
    }
  });
  const payload = await response.json();

  assert.equal(response.status, 403);
  assert.equal(payload.error.code, "FORBIDDEN");
});

test("non-student cannot self check in", async (t) => {
  const server = await createTestServer(createFakeDatabase({
    proposals: [
      createApprovedProposal({
        event_date: getRelativeDate(-1)
      })
    ]
  }));
  t.after(() => server.close());

  const response = await fetch(`${server.baseUrl}/api/v1/events/proposal-1/check-in`, {
    method: "POST",
    headers: {
      Authorization: "Bearer president-token"
    }
  });
  const payload = await response.json();

  assert.equal(response.status, 403);
  assert.equal(payload.error.code, "FORBIDDEN");
});
