const test = require("node:test");
const assert = require("node:assert/strict");
const { createEmailService, createGraphProvider } = require("../src/modules/email/email.service");

test("email service logs skipped recipients when email is missing", async () => {
  const logs = [];
  const database = {
    async createEmailDeliveryLog(log) {
      logs.push(log);
      return { id: "log-1", ...log };
    }
  };
  const emailService = createEmailService({
    database,
    env: {
      EMAIL_DELIVERY_ENABLED: "true",
      EMAIL_PROVIDER: "microsoft_graph"
    },
    provider: {
      async sendEmail() {
        throw new Error("Provider should not be called without a recipient");
      }
    }
  });

  const result = await emailService.sendEmail({
    to: null,
    subject: "Missing recipient",
    text: "Body",
    metadata: {
      recipient_user_id: "student-1",
      announcement_id: "announcement-1"
    }
  });

  assert.equal(result.status, "skipped");
  assert.equal(logs.length, 1);
  assert.equal(logs[0].status, "skipped");
  assert.equal(logs[0].error_message, "Recipient email is missing");
});

test("email service logs sent and failed delivery states", async () => {
  const createdLogs = [];
  const updatedLogs = [];
  const database = {
    async createEmailDeliveryLog(log) {
      const savedLog = { id: `log-${createdLogs.length + 1}`, ...log };
      createdLogs.push(savedLog);
      return savedLog;
    },
    async updateEmailDeliveryLog(logId, update) {
      updatedLogs.push({ logId, update });
      return { id: logId, ...update };
    }
  };
  let shouldFail = false;
  const emailService = createEmailService({
    database,
    env: {
      EMAIL_DELIVERY_ENABLED: "true",
      EMAIL_PROVIDER: "microsoft_graph"
    },
    provider: {
      async sendEmail() {
        if (shouldFail) {
          throw new Error("Graph failed");
        }
      }
    }
  });

  await emailService.sendEmail({
    to: "student@nileuniversity.edu.ng",
    subject: "Sent message",
    text: "Body"
  });
  shouldFail = true;
  const failed = await emailService.sendEmail({
    to: "student@nileuniversity.edu.ng",
    subject: "Failed message",
    text: "Body"
  });

  assert.equal(createdLogs.length, 2);
  assert.equal(updatedLogs[0].update.status, "sent");
  assert.equal(failed.status, "failed");
  assert.equal(updatedLogs[1].update.status, "failed");
  assert.equal(updatedLogs[1].update.error_message, "Graph failed");
});

test("Microsoft Graph provider requests token and sends mail", async () => {
  const requests = [];
  const fetchImpl = async (url, options) => {
    requests.push({ url: String(url), options });

    if (String(url).includes("login.microsoftonline.com")) {
      return {
        ok: true,
        async json() {
          return { access_token: "graph-token" };
        }
      };
    }

    return {
      ok: true,
      async text() {
        return "";
      }
    };
  };
  const provider = createGraphProvider({
    fetchImpl,
    env: {
      MICROSOFT_TENANT_ID: "tenant-id",
      MICROSOFT_CLIENT_ID: "client-id",
      MICROSOFT_CLIENT_SECRET: "client-secret",
      MICROSOFT_SENDER_EMAIL: "clubservices@nileuniversity.edu.ng"
    }
  });

  await provider.sendEmail({
    to: "student@nileuniversity.edu.ng",
    subject: "Graph test",
    text: "Hello"
  });

  assert.equal(requests.length, 2);
  assert.ok(requests[0].url.includes("/tenant-id/oauth2/v2.0/token"));
  assert.ok(requests[1].url.includes("/users/clubservices%40nileuniversity.edu.ng/sendMail"));
  assert.equal(requests[1].options.headers.Authorization, "Bearer graph-token");
  assert.equal(JSON.parse(requests[1].options.body).message.subject, "Graph test");
});
