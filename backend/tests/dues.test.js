const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/app");
const {
  applyClubPaymentProfileToAllClubs,
  applyPaymentSettingsToAllClubs,
  applyDuesAmountToAllClubs,
  createDuePayment,
  getPaymentSettings,
  listDuePayments,
  listMyDuePayments,
  submitDuePaymentConfirmation,
  summarizeDues,
  upsertPaymentSettings,
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
    payment_account_name: null,
    payment_paid_at: null,
    payer_note: null,
    submitted_at: null,
    status: "unpaid",
    verified_by: null,
    verified_at: null,
    created_at: "2026-04-12T10:00:00.000Z",
    updated_at: "2026-04-12T10:00:00.000Z",
    ...overrides
  };
}

test("dues records are created automatically during signup or club join", async () => {
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
        database: {}
      }),
    (error) => error.statusCode === 409 && error.code === "DUES_CREATED_AUTOMATICALLY"
  );
});

test("executive cannot list club due payments", async () => {
  await assert.rejects(
    () =>
      listDuePayments({
        actor: {
          id: "executive-1",
          role: "executive",
          clubId: "club-1"
        },
        database: {}
      }),
    (error) => error.statusCode === 403 && error.code === "FORBIDDEN"
  );
});

test("paginated dues listing keeps full summary totals", async () => {
  let summaryQueryCount = 0;
  let paginatedQueryCount = 0;
  const payments = [
    createPayment({ id: "payment-1", status: "paid", amount: 5000 }),
    createPayment({ id: "payment-2", status: "submitted", amount: 6000 }),
    createPayment({ id: "payment-3", status: "unpaid", amount: 7000 })
  ];
  const fakeDatabase = {
    async listDuePayments(filters) {
      if (filters.pagination) {
        paginatedQueryCount += 1;
        assert.equal(filters.pagination.page, 2);
        assert.equal(filters.pagination.pageSize, 1);

        return {
          items: [payments[1]],
          page: 2,
          page_size: 1,
          total: 3,
          has_next: true
        };
      }

      summaryQueryCount += 1;
      return payments;
    }
  };

  const result = await listDuePayments({
    actor: {
      id: "president-1",
      role: "president",
      clubId: "club-1"
    },
    filters: {},
    pagination: {
      page: 2,
      pageSize: 1,
      page_size: 1,
      from: 1,
      to: 1,
      sort: "created_at",
      order: "desc"
    },
    database: fakeDatabase
  });

  assert.equal(summaryQueryCount, 1);
  assert.equal(paginatedQueryCount, 1);
  assert.equal(result.summary.total_records, 3);
  assert.equal(result.summary.paid, 1);
  assert.equal(result.summary.submitted, 1);
  assert.equal(result.summary.unpaid, 1);
  assert.equal(result.payments.items.length, 1);
  assert.equal(result.payments.items[0].id, "payment-2");
  assert.equal(result.payments.page, 2);
  assert.equal(result.payments.total, 3);
  assert.equal(result.payments.has_next, true);
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

test("paid current-session dues activate an inactive member", async () => {
  let memberUpdate;
  let historyEntry;
  const fakeDatabase = {
    async getDuePaymentById() {
      return createPayment({
        status: "submitted",
        academic_session: "2025/2026"
      });
    },
    async updateDuePayment(paymentId, update) {
      return createPayment({
        id: paymentId,
        academic_session: "2025/2026",
        ...update
      });
    },
    async getClubMemberById() {
      return createMember({
        id: "member-1",
        membership_status: "inactive"
      });
    },
    async updateClubMember(memberId, update) {
      assert.equal(memberId, "member-1");
      memberUpdate = update;
      return createMember({
        id: memberId,
        ...update
      });
    },
    async createClubMemberStatusHistory(entry) {
      historyEntry = entry;
      return entry;
    }
  };

  await updateDuePayment({
    actor: {
      id: "president-1",
      role: "president",
      clubId: "club-1"
    },
    paymentId: "payment-1",
    payload: {
      status: "paid"
    },
    database: fakeDatabase
  });

  assert.deepEqual(memberUpdate, {
    membership_status: "active"
  });
  assert.equal(historyEntry.previous_status, "inactive");
  assert.equal(historyEntry.new_status, "active");
});

test("paid dues activate a member even while the linked join request is pending", async () => {
  let memberUpdate;
  const fakeDatabase = {
    async getDuePaymentById() {
      return createPayment({
        status: "submitted",
        academic_session: "2025/2026"
      });
    },
    async updateDuePayment(paymentId, update) {
      return createPayment({
        id: paymentId,
        academic_session: "2025/2026",
        ...update
      });
    },
    async getClubMemberById() {
      return createMember({
        id: "member-1",
        membership_status: "inactive"
      });
    },
    async getMembershipRequestByMemberId() {
      return {
        id: "request-1",
        member_id: "member-1",
        status: "pending"
      };
    },
    async updateClubMember(memberId, update) {
      assert.equal(memberId, "member-1");
      memberUpdate = update;
      return createMember({
        id: memberId,
        ...update
      });
    }
  };

  await updateDuePayment({
    actor: {
      id: "admin-1",
      role: "admin",
      clubId: null
    },
    paymentId: "payment-1",
    payload: {
      status: "paid"
    },
    database: fakeDatabase
  });

  assert.deepEqual(memberUpdate, {
    membership_status: "active"
  });
});

test("unpaid or rejected current-session dues keep a member inactive", async () => {
  let memberUpdate;
  const fakeDatabase = {
    async getDuePaymentById() {
      return createPayment({
        status: "paid",
        academic_session: "2025/2026"
      });
    },
    async updateDuePayment(paymentId, update) {
      return createPayment({
        id: paymentId,
        academic_session: "2025/2026",
        ...update
      });
    },
    async getClubMemberById() {
      return createMember({
        id: "member-1",
        membership_status: "active"
      });
    },
    async updateClubMember(memberId, update) {
      assert.equal(memberId, "member-1");
      memberUpdate = update;
      return createMember({
        id: memberId,
        ...update
      });
    }
  };

  await updateDuePayment({
    actor: {
      id: "admin-1",
      role: "admin",
      clubId: null
    },
    paymentId: "payment-1",
    payload: {
      status: "rejected"
    },
    database: fakeDatabase
  });

  assert.deepEqual(memberUpdate, {
    membership_status: "inactive"
  });
});

test("student can list own dues payments", async () => {
  const fakeDatabase = {
    async listDuePaymentsForProfile(profileId) {
      assert.equal(profileId, "student-1");
      return [createPayment()];
    }
  };

  const result = await listMyDuePayments({
    actor: {
      id: "student-1",
      role: "student"
    },
    database: fakeDatabase
  });

  assert.equal(result.payments.length, 1);
  assert.equal(result.summary.unpaid, 1);
});

test("student can submit payment confirmation for own unpaid dues", async () => {
  let updatePayload;
  const fakeDatabase = {
    async getDuePaymentById(paymentId) {
      assert.equal(paymentId, "payment-1");
      return createPayment();
    },
    async getClubMemberById(memberId) {
      assert.equal(memberId, "member-1");
      return createMember({
        profile_id: "student-1"
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

  const payment = await submitDuePaymentConfirmation({
    actor: {
      id: "student-1",
      role: "student"
    },
    paymentId: "payment-1",
    payload: {
      payment_account_name: "Ada Student",
      payment_paid_at: "2026-04-15",
      proof_url: "https://example.com/receipt.png"
    },
    database: fakeDatabase
  });

  assert.equal(updatePayload.status, "submitted");
  assert.equal(updatePayload.payment_account_name, "Ada Student");
  assert.equal(updatePayload.payment_reference, null);
  assert.equal(updatePayload.payer_note, null);
  assert.ok(updatePayload.submitted_at);
  assert.equal(payment.status, "submitted");
});

test("student cannot submit payment confirmation for another member", async () => {
  const fakeDatabase = {
    async getDuePaymentById() {
      return createPayment();
    },
    async getClubMemberById() {
      return createMember({
        profile_id: "someone-else"
      });
    }
  };

  await assert.rejects(
    () =>
      submitDuePaymentConfirmation({
        actor: {
          id: "student-1",
          role: "student"
        },
        paymentId: "payment-1",
        payload: {
          payment_account_name: "Ada Student",
          payment_reference: "NUE-12345"
        },
        database: fakeDatabase
      }),
    (error) => error.statusCode === 403 && error.code === "FORBIDDEN"
  );
});

test("admin can save and fetch the shared Club Services payment profile", async () => {
  let savedSettings;
  const fakeDatabase = {
    async upsertAllClubPaymentSettings(settings) {
      savedSettings = settings;
      return [{
        id: "settings-1",
        club_id: "club-1",
        created_at: "2026-04-15T10:00:00.000Z",
        updated_at: "2026-04-15T10:00:00.000Z",
        ...settings
      }];
    },
    async listClubs() {
      return [{ id: "club-1", name: "Nile Innovators Club" }];
    },
    async getClubPaymentSettings(clubId) {
      assert.equal(clubId, "club-1");
      return {
        id: "settings-1",
        club_id: "club-1",
        bank_name: "Zenith Bank",
        account_number: "1234567890",
        account_name: "Nile Innovators Club",
        payment_instructions: "Use your student ID as narration.",
        fresher_dues_amount: 10000,
        returning_student_dues_amount: 5000,
        created_at: "2026-04-15T10:00:00.000Z",
        updated_at: "2026-04-15T10:00:00.000Z"
      };
    }
  };

  const actor = {
    id: "admin-1",
    role: "admin",
    clubId: null
  };

  const settings = await upsertPaymentSettings({
    actor,
    payload: {
      bank_name: "Zenith Bank",
      account_number: "1234567890",
      account_name: "Nile Innovators Club",
      payment_instructions: "Use your student ID as narration.",
      fresher_dues_amount: 10000,
      returning_student_dues_amount: 5000
    },
    database: fakeDatabase
  });

  const fetchedSettings = await getPaymentSettings({
    actor,
    database: fakeDatabase
  });

  assert.equal(settings.bank_name, "Zenith Bank");
  assert.equal(settings.fresher_dues_amount, 10000);
  assert.equal(fetchedSettings.account_number, "1234567890");
});

test("admin can apply one dues amount to all clubs", async () => {
  let appliedAmount;
  const fakeDatabase = {
    async updateAllClubDuesAmounts(duesAmount) {
      appliedAmount = duesAmount;
      return [{ id: "club-1" }, { id: "club-2" }];
    }
  };

  const result = await applyDuesAmountToAllClubs({
    actor: {
      id: "admin-1",
      role: "admin",
      clubId: null
    },
    payload: {
      dues_amount: 5000
    },
    database: fakeDatabase
  });

  assert.equal(appliedAmount, 5000);
  assert.equal(result.clubs_updated, 2);
});

test("admin can apply one payment account to all clubs", async () => {
  let savedSettings;
  const fakeDatabase = {
    async upsertAllClubPaymentSettings(settings) {
      savedSettings = settings;
      return [{ id: "settings-1" }, { id: "settings-2" }];
    }
  };

  const result = await applyPaymentSettingsToAllClubs({
    actor: {
      id: "admin-1",
      role: "admin",
      clubId: null
    },
    payload: {
      bank_name: "Zenith Bank",
      account_number: "1234567890",
      account_name: "Club Services Account",
      payment_instructions: "Use your student ID as payment reference."
    },
    database: fakeDatabase
  });

  assert.equal(savedSettings.bank_name, "Zenith Bank");
  assert.equal(savedSettings.account_number, "1234567890");
  assert.equal(result.clubs_updated, 2);
});

test("admin can apply one dues amount and payment account profile to all clubs", async () => {
  let savedSettings;
  const fakeDatabase = {
    async upsertAllClubPaymentSettings(settings) {
      savedSettings = settings;
      return [{ id: "settings-1" }, { id: "settings-2" }];
    }
  };

  const result = await applyClubPaymentProfileToAllClubs({
    actor: {
      id: "admin-1",
      role: "admin",
      clubId: null
    },
    payload: {
      fresher_dues_amount: 10000,
      returning_student_dues_amount: 5000,
      bank_name: "Zenith Bank",
      account_number: "1234567890",
      account_name: "Club Services Account",
      payment_instructions: "Use your student ID as payment reference."
    },
    database: fakeDatabase
  });

  assert.equal(savedSettings.account_name, "Club Services Account");
  assert.equal(savedSettings.fresher_dues_amount, 10000);
  assert.equal(savedSettings.returning_student_dues_amount, 5000);
  assert.equal(result.clubs_updated, 2);
});

test("president cannot update dues for another club", async () => {
  const fakeDatabase = {
    async getDuePaymentById() {
      return createPayment({
        club_id: "club-2"
      });
    }
  };

  await assert.rejects(
    () =>
      updateDuePayment({
        actor: {
          id: "president-1",
          role: "president",
          clubId: "club-1"
        },
        paymentId: "payment-1",
        payload: {
          status: "paid"
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
