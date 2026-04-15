const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/app");
const {
  createMembershipRequest,
  decideMembershipRequest
} = require("../src/modules/membership-requests/membership-requests.service");
const { updateDuePayment } = require("../src/modules/dues/dues.service");

function createRequest(overrides = {}) {
  return {
    id: "request-1",
    profile_id: "student-1",
    club_id: "club-1",
    requested_role: "executive",
    status: "pending",
    remarks: "I want to help run events.",
    decision_remarks: null,
    reviewed_by: null,
    reviewed_at: null,
    member_id: null,
    due_payment_id: null,
    dues_amount: null,
    academic_session: null,
    created_at: "2026-04-15T10:00:00.000Z",
    updated_at: "2026-04-15T10:00:00.000Z",
    ...overrides
  };
}

function createProfile(overrides = {}) {
  return {
    id: "student-1",
    full_name: "Ada Student",
    role: "student",
    club_id: "club-1",
    student_id: "NUN-001",
    requested_role: "executive",
    created_at: "2026-04-15T10:00:00.000Z",
    updated_at: "2026-04-15T10:00:00.000Z",
    ...overrides
  };
}

function createMember(overrides = {}) {
  return {
    id: "member-1",
    club_id: "club-1",
    profile_id: "student-1",
    full_name: "Ada Student",
    student_id: "NUN-001",
    email: null,
    phone_number: null,
    club_role: "executive",
    membership_status: "inactive",
    created_at: "2026-04-15T10:00:00.000Z",
    updated_at: "2026-04-15T10:00:00.000Z",
    ...overrides
  };
}

function createPayment(overrides = {}) {
  return {
    id: "payment-1",
    club_id: "club-1",
    member_id: "member-1",
    amount: 5000,
    academic_session: "2025/2026",
    payment_reference: null,
    proof_url: null,
    status: "unpaid",
    verified_by: null,
    verified_at: null,
    created_at: "2026-04-15T10:00:00.000Z",
    updated_at: "2026-04-15T10:00:00.000Z",
    ...overrides
  };
}

test("student can create a membership request", async () => {
  let createdRequest;
  const fakeDatabase = {
    async getClubById(clubId) {
      assert.equal(clubId, "club-1");
      return { id: "club-1", name: "Nile Innovators Club" };
    },
    async getClubMemberByProfileAndClub() {
      return null;
    },
    async getOpenMembershipRequest() {
      return null;
    },
    async createMembershipRequest(request) {
      createdRequest = request;
      return createRequest(request);
    }
  };

  const request = await createMembershipRequest({
    actor: {
      id: "student-1",
      role: "student",
      clubId: "club-1"
    },
    payload: {
      club_id: "club-1",
      requested_role: "executive",
      remarks: "I want to help run events."
    },
    database: fakeDatabase
  });

  assert.equal(createdRequest.profile_id, "student-1");
  assert.equal(createdRequest.status, "pending");
  assert.equal(request.requested_role, "executive");
});

test("president approval creates inactive member and unpaid dues record", async () => {
  let createdMember;
  let createdPayment;
  let requestUpdate;
  const fakeDatabase = {
    async getMembershipRequestById(requestId) {
      assert.equal(requestId, "request-1");
      return createRequest();
    },
    async getProfileById(profileId) {
      assert.equal(profileId, "student-1");
      return createProfile();
    },
    async getClubMemberByProfileAndClub() {
      return null;
    },
    async createClubMember(member) {
      createdMember = member;
      return createMember(member);
    },
    async createDuePayment(payment) {
      createdPayment = payment;
      return createPayment(payment);
    },
    async updateMembershipRequest(requestId, update) {
      requestUpdate = update;
      return createRequest({
        id: requestId,
        ...update
      });
    }
  };

  const result = await decideMembershipRequest({
    actor: {
      id: "president-1",
      role: "president",
      clubId: "club-1"
    },
    requestId: "request-1",
    payload: {
      decision: "approve",
      dues_amount: 5000,
      academic_session: "2025/2026",
      remarks: "Pay dues to complete membership."
    },
    database: fakeDatabase
  });

  assert.equal(createdMember.membership_status, "inactive");
  assert.equal(createdMember.club_role, "executive");
  assert.equal(createdPayment.status, "unpaid");
  assert.equal(createdPayment.amount, 5000);
  assert.equal(requestUpdate.status, "approved_pending_dues");
  assert.equal(result.request.status, "approved_pending_dues");
});

test("president cannot approve president membership requests", async () => {
  const fakeDatabase = {
    async getMembershipRequestById() {
      return createRequest({
        requested_role: "president"
      });
    }
  };

  await assert.rejects(
    () =>
      decideMembershipRequest({
        actor: {
          id: "president-1",
          role: "president",
          clubId: "club-1"
        },
        requestId: "request-1",
        payload: {
          decision: "approve",
          dues_amount: 5000,
          academic_session: "2025/2026"
        },
        database: fakeDatabase
      }),
    (error) => error.statusCode === 403 && error.code === "FORBIDDEN"
  );
});

test("dues payment verification activates membership and requested role", async () => {
  let memberUpdate;
  let profileUpdate;
  let requestUpdate;
  const fakeDatabase = {
    async getDuePaymentById() {
      return createPayment({
        status: "submitted"
      });
    },
    async updateDuePayment(paymentId, update) {
      return createPayment({
        id: paymentId,
        ...update
      });
    },
    async getMembershipRequestByMemberId(memberId) {
      assert.equal(memberId, "member-1");
      return createRequest({
        status: "approved_pending_dues",
        member_id: "member-1",
        due_payment_id: "payment-1"
      });
    },
    async updateClubMember(memberId, update) {
      memberUpdate = update;
      return createMember({
        id: memberId,
        ...update
      });
    },
    async updateProfile(profileId, update) {
      profileUpdate = update;
      return createProfile({
        id: profileId,
        ...update
      });
    },
    async updateMembershipRequest(requestId, update) {
      requestUpdate = update;
      return createRequest({
        id: requestId,
        ...update
      });
    }
  };

  const payment = await updateDuePayment({
    actor: {
      id: "president-1",
      role: "president",
      clubId: "club-1"
    },
    paymentId: "payment-1",
    payload: {
      status: "paid",
      payment_reference: "DUES-001"
    },
    database: fakeDatabase
  });

  assert.equal(payment.status, "paid");
  assert.equal(memberUpdate.membership_status, "active");
  assert.equal(profileUpdate.role, "executive");
  assert.equal(profileUpdate.club_id, "club-1");
  assert.equal(requestUpdate.status, "active");
});

function createRouteDatabase() {
  const profiles = {
    "student-1": createProfile(),
    "president-1": {
      id: "president-1",
      full_name: "Club President",
      role: "president",
      club_id: "club-1"
    }
  };

  return {
    async getUserByAccessToken(accessToken) {
      const tokenProfiles = {
        "student-token": "student-1",
        "president-token": "president-1"
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
    async listMembershipRequests(filters = {}) {
      if (filters.profileId === "student-1") {
        return [createRequest()];
      }

      if (filters.clubId === "club-1") {
        return [createRequest()];
      }

      return [];
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

test("student can list own membership requests", async (t) => {
  const server = await createTestServer(createRouteDatabase());
  t.after(() => server.close());

  const response = await fetch(`${server.baseUrl}/api/v1/membership-requests/me`, {
    headers: {
      Authorization: "Bearer student-token"
    }
  });
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.data.length, 1);
  assert.equal(payload.data[0].profile_id, "student-1");
});

test("missing-token access is blocked for membership requests", async (t) => {
  const server = await createTestServer(createRouteDatabase());
  t.after(() => server.close());

  const response = await fetch(`${server.baseUrl}/api/v1/membership-requests/me`);
  const payload = await response.json();

  assert.equal(response.status, 401);
  assert.equal(payload.error.code, "AUTH_REQUIRED");
});
