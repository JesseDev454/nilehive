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
    requested_role: "member",
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
    student_id: "020232255",
    requested_role: "member",
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
    student_id: "020232255",
    email: null,
    phone_number: null,
    club_role: "member",
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

test("student can create a paid membership request", async () => {
  let createdMember;
  let createdPayment;
  let createdRequest;
  const fakeDatabase = {
    async getClubById(clubId) {
      assert.equal(clubId, "club-1");
      return { id: "club-1", name: "Nile Innovators Club", dues_amount: 5000 };
    },
    async getClubMemberByProfileAndClub() {
      return null;
    },
    async getOpenMembershipRequest() {
      return null;
    },
    async getProfileById() {
      return createProfile();
    },
    async getClubPaymentSettings() {
      return null;
    },
    async updateProfile() {
      // no profile fields in this payload — should not be called, but harmless if it is
    },
    async createClubMember(member) {
      createdMember = member;
      return createMember(member);
    },
    async createDuePayment(payment) {
      createdPayment = payment;
      return createPayment({
        ...payment,
        status: "submitted",
        payment_account_name: "Ada Student",
        payment_reference: "JOIN-001"
      });
    },
    async createMembershipRequest(request) {
      createdRequest = request;
      return createRequest({
        ...request,
        due_payment: createPayment({
          id: request.due_payment_id,
          member_id: request.member_id,
          amount: request.dues_amount,
          academic_session: request.academic_session,
          status: "submitted",
          payment_account_name: "Ada Student",
          payment_reference: "JOIN-001"
        })
      });
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
      requested_role: "member",
      remarks: "I want to help run events.",
      payment_account_name: "Ada Student",
      payment_reference: "JOIN-001",
      payment_paid_at: "2026-04-18",
      proof_url: "https://example.com/proof.png",
      payer_note: "Paid this morning."
    },
    database: fakeDatabase
  });

  assert.equal(createdRequest.profile_id, "student-1");
  assert.equal(createdRequest.status, "pending");
  assert.equal(createdMember.membership_status, "inactive");
  assert.equal(createdPayment.status, "submitted");
  assert.equal(createdRequest.dues_amount, 5000);
  assert.equal(request.requested_role, "member");
});

test("join form fields are saved back to the user profile", async () => {
  let savedProfileUpdates;
  const fakeDatabase = {
    async getClubById() {
      return { id: "club-1", name: "Nile Innovators Club", dues_amount: 5000 };
    },
    async getClubMemberByProfileAndClub() {
      return null;
    },
    async getOpenMembershipRequest() {
      return null;
    },
    async getProfileById() {
      return createProfile({ student_id: null, phone_number: null, department: null });
    },
    async getClubPaymentSettings() {
      return null;
    },
    async updateProfile(profileId, updates) {
      savedProfileUpdates = { profileId, updates };
    },
    async createClubMember(member) {
      return createMember(member);
    },
    async createDuePayment(payment) {
      return createPayment({ ...payment, status: "submitted" });
    },
    async createMembershipRequest(request) {
      return createRequest({ ...request });
    }
  };

  await createMembershipRequest({
    actor: { id: "student-1", role: "student", clubId: "club-1" },
    payload: {
      club_id: "club-1",
      student_id: "020232255",
      phone_number: "08012345678",
      department: "Computer Science",
      payment_account_name: "Ada Student",
      payment_reference: "JOIN-002",
      proof_url: "receipts/club-1/proof.png"
    },
    database: fakeDatabase
  });

  assert.ok(savedProfileUpdates, "updateProfile should have been called");
  assert.equal(savedProfileUpdates.profileId, "student-1");
  assert.equal(savedProfileUpdates.updates.student_id, "020232255");
  assert.equal(savedProfileUpdates.updates.phone_number, "08012345678");
  assert.equal(savedProfileUpdates.updates.department, "Computer Science");
});

test("membership request creation rejects a missing effective student id", async () => {
  const fakeDatabase = {
    async getClubById() {
      return { id: "club-1", name: "Nile Innovators Club", dues_amount: 5000 };
    },
    async getClubMemberByProfileAndClub() {
      return null;
    },
    async getOpenMembershipRequest() {
      return null;
    },
    async getProfileById() {
      return createProfile({ student_id: null });
    }
  };

  await assert.rejects(
    () =>
      createMembershipRequest({
        actor: { id: "student-1", role: "student", clubId: "club-1" },
        payload: {
          club_id: "club-1",
          payment_account_name: "Ada Student",
          payment_reference: "JOIN-003",
          proof_url: "receipts/club-1/proof.png"
        },
        database: fakeDatabase
      }),
    (error) =>
      error.statusCode === 400 &&
      error.code === "VALIDATION_ERROR" &&
      error.details?.field === "student_id"
  );
});

test("membership request creation rejects an invalid submitted student id", async () => {
  const fakeDatabase = {
    async getClubById() {
      return { id: "club-1", name: "Nile Innovators Club", dues_amount: 5000 };
    },
    async getClubMemberByProfileAndClub() {
      return null;
    },
    async getOpenMembershipRequest() {
      return null;
    },
    async getProfileById() {
      return createProfile({ student_id: "020232255" });
    }
  };

  await assert.rejects(
    () =>
      createMembershipRequest({
        actor: { id: "student-1", role: "student", clubId: "club-1" },
        payload: {
          club_id: "club-1",
          student_id: "12345",
          payment_account_name: "Ada Student",
          payment_reference: "JOIN-004",
          proof_url: "receipts/club-1/proof.png"
        },
        database: fakeDatabase
      }),
    (error) =>
      error.statusCode === 400 &&
      error.code === "VALIDATION_ERROR" &&
      error.details?.field === "student_id"
  );
});

test("membership request creation rejects leadership roles", async () => {
  const fakeDatabase = {
    async getClubById() {
      return { id: "club-1", name: "Nile Innovators Club" };
    },
    async getClubMemberByProfileAndClub() {
      return null;
    },
    async getOpenMembershipRequest() {
      return null;
    }
  };

  await assert.rejects(
    () =>
      createMembershipRequest({
        actor: {
          id: "student-1",
          role: "student",
          clubId: "club-1"
        },
        payload: {
          club_id: "club-1",
          requested_role: "executive",
          remarks: "I want to help run events.",
          payment_account_name: "Ada Student",
          payment_reference: "JOIN-001"
        },
        database: fakeDatabase
      }),
    (error) => error.statusCode === 400 && error.code === "VALIDATION_ERROR"
  );
});

test("president approval activates membership and verifies the submitted payment", async () => {
  let updatedPayment;
  let memberStatusUpdate;
  let requestUpdate;
  const fakeDatabase = {
    async getMembershipRequestById(requestId) {
      assert.equal(requestId, "request-1");
      return createRequest({
        member_id: "member-1",
        due_payment_id: "payment-1",
        dues_amount: 5000,
        academic_session: "2025/2026"
      });
    },
    async getClubMemberById(memberId) {
      assert.equal(memberId, "member-1");
      return createMember();
    },
    async updateDuePayment(paymentId, update) {
      updatedPayment = update;
      return createPayment({
        id: paymentId,
        status: "paid",
        ...update
      });
    },
    async updateClubMember(memberId, update) {
      memberStatusUpdate = update;
      return createMember({
        id: memberId,
        ...update
      });
    },
    async updateMembershipRequest(requestId, update) {
      requestUpdate = update;
      return createRequest({
        id: requestId,
        member_id: "member-1",
        due_payment_id: "payment-1",
        dues_amount: 5000,
        academic_session: "2025/2026",
        ...update
      });
    },
    async getProfileById() {
      // Profile already has a club_id (old-flow user) — updateProfile must NOT be called.
      return createProfile({ club_id: "club-1" });
    },
    async updateProfile() {
      throw new Error("updateProfile should not be called when club_id is already set");
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
      remarks: "Payment verified."
    },
    database: fakeDatabase
  });

  assert.equal(updatedPayment.status, "paid");
  assert.equal(memberStatusUpdate.membership_status, "active");
  assert.equal(requestUpdate.status, "active");
  assert.equal(result.request.status, "active");
});

test("approving a membership request sets club_id on a profile with no club", async () => {
  let profileUpdateCall;
  const fakeDatabase = {
    async getMembershipRequestById() {
      return createRequest({
        profile_id: "student-1",
        club_id: "club-1",
        member_id: "member-1",
        due_payment_id: "payment-1",
        dues_amount: 5000,
        academic_session: "2025/2026"
      });
    },
    async getClubMemberById() {
      return createMember();
    },
    async updateDuePayment(paymentId, update) {
      return createPayment({ id: paymentId, ...update });
    },
    async updateClubMember(memberId, update) {
      return createMember({ id: memberId, ...update });
    },
    async updateMembershipRequest(requestId, update) {
      return createRequest({ id: requestId, ...update });
    },
    async getProfileById(profileId) {
      // Slim-signup user: club_id is null
      return createProfile({ id: profileId, club_id: null });
    },
    async updateProfile(profileId, updates) {
      profileUpdateCall = { profileId, updates };
    }
  };

  await decideMembershipRequest({
    actor: { id: "president-1", role: "president", clubId: "club-1" },
    requestId: "request-1",
    payload: { decision: "approve", remarks: "Welcome aboard." },
    database: fakeDatabase
  });

  assert.ok(profileUpdateCall, "updateProfile should have been called to set club_id");
  assert.equal(profileUpdateCall.profileId, "student-1");
  assert.equal(profileUpdateCall.updates.club_id, "club-1");
});

test("president cannot review membership requests for another club", async () => {
  const fakeDatabase = {
    async getMembershipRequestById() {
      return createRequest({
        club_id: "club-2"
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
          remarks: "Not allowed"
        },
        database: fakeDatabase
      }),
    (error) => error.statusCode === 403 && error.code === "FORBIDDEN"
  );
});

test("executive cannot review membership requests", async () => {
  const fakeDatabase = {
    async getMembershipRequestById() {
      return createRequest();
    }
  };

  await assert.rejects(
    () =>
      decideMembershipRequest({
        actor: {
          id: "executive-1",
          role: "executive",
          clubId: "club-1"
        },
        requestId: "request-1",
        payload: {
          decision: "approve",
          remarks: "Not allowed"
        },
        database: fakeDatabase
      }),
    (error) => error.statusCode === 403 && error.code === "FORBIDDEN"
  );
});

test("dues payment verification activates membership and updates request state", async () => {
  let memberUpdate;
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
