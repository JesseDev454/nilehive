const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/app");
const {
  createDuePayment,
  listDuePayments,
  summarizeDues,
  updateDuePayment
} = require("../src/modules/dues/dues.service");

function createMember(overrides = {}) {
  return {
    id: "member-1",
    club_id: "club-1",
    full_name: "Amina Member",
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
    created_at: "2026-04-12T10:00:00.000Z",
    updated_at: "2026-04-12T10:00:00.000Z",
    ...overrides
  };
}

test("president can create a due payment record for a club member", async () => {
  let createdPayment;
  const fakeDatabase = {
    async getClubMemberById(memberId) {
      assert.equal(memberId, "member-1");
      return createMember();
    },
    async createDuePayment(payment) {
      createdPayment = payment;
      return createPayment(payment);
    }
  };

  const payment = await createDuePayment({
    actor: {
      id: "president-1",
      role: "president",
      clubId: "club-1"
    },
    payload: {
      member_id: "member-1",
      amount: 5000,
      academic_session: "2025/2026"
    },
    database: fakeDatabase
  });

  assert.equal(createdPayment.club_id, "club-1");
  assert.equal(createdPayment.status, "unpaid");
  assert.equal(payment.amount, 5000);
});

test("executive can list club due payments with summary", async () => {
  const fakeDatabase = {
    async listDuePayments(filters) {
      assert.deepEqual(filters, {
        clubId: "club-1",
        status: undefined,
        memberId: undefined
      });
      return [
        createPayment({ id: "payment-1", status: "paid" }),
        createPayment({ id: "payment-2", status: "unpaid" })
      ];
    }
  };

  const result = await listDuePayments({
    actor: {
      id: "executive-1",
      role: "executive",
      clubId: "club-1"
    },
    database: fakeDatabase
  });

  assert.equal(result.summary.total_records, 2);
  assert.equal(result.summary.paid, 1);
  assert.equal(result.summary.unpaid, 1);
  assert.equal(result.payments.length, 2);
});

test("president can verify a submitted payment as paid", async () => {
  let updatePayload;
  const fakeDatabase = {
    async getDuePaymentById(paymentId) {
      assert.equal(paymentId, "payment-1");
      return createPayment({
        status: "submitted"
      });
    },
    async updateDuePayment(paymentId, update) {
      updatePayload = update;
      return createPayment({
        id: paymentId,
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
      payment_reference: "RECEIPT-001"
    },
    database: fakeDatabase
  });

  assert.equal(updatePayload.status, "paid");
  assert.equal(updatePayload.verified_by, "president-1");
  assert.ok(updatePayload.verified_at);
  assert.equal(payment.status, "paid");
});

test("president cannot manage dues for another club", async () => {
  const fakeDatabase = {
    async getClubMemberById() {
      return createMember({
        club_id: "club-2"
      });
    }
  };

  await assert.rejects(
    () =>
      createDuePayment({
        actor: {
          id: "president-1",
          role: "president",
          clubId: "club-1"
        },
        payload: {
          member_id: "member-1",
          amount: 5000,
          academic_session: "2025/2026"
        },
        database: fakeDatabase
      }),
    (error) => error.statusCode === 403 && error.code === "FORBIDDEN"
  );
});

test("advisor cannot view dues tracking", async () => {
  await assert.rejects(
    () =>
      listDuePayments({
        actor: {
          id: "advisor-1",
          role: "advisor"
        },
        database: {}
      }),
    (error) => error.statusCode === 403 && error.code === "FORBIDDEN"
  );
});

test("dues summary calculates collection rate and amounts", () => {
  const summary = summarizeDues([
    createPayment({ status: "paid", amount: 5000 }),
    createPayment({ status: "paid", amount: 5000 }),
    createPayment({ status: "unpaid", amount: 5000 }),
    createPayment({ status: "submitted", amount: 5000 })
  ]);

  assert.equal(summary.total_records, 4);
  assert.equal(summary.paid, 2);
  assert.equal(summary.expected_amount, 20000);
  assert.equal(summary.collected_amount, 10000);
  assert.equal(summary.collection_rate, 50);
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
    async listDuePayments() {
      return [createPayment()];
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

test("missing-token access is blocked for dues", async (t) => {
  const server = await createTestServer(createRouteDatabase());
  t.after(() => server.close());

  const response = await fetch(`${server.baseUrl}/api/v1/dues`);
  const payload = await response.json();

  assert.equal(response.status, 401);
  assert.equal(payload.error.code, "AUTH_REQUIRED");
});
