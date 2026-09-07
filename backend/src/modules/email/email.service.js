const { db } = require("../../config/db");
const { getEnv } = require("../../config/env");

function getEmailEnv() {
  return {
    EMAIL_DELIVERY_ENABLED: process.env.EMAIL_DELIVERY_ENABLED ?? "false",
    EMAIL_PROVIDER: process.env.EMAIL_PROVIDER ?? "microsoft_graph",
    MICROSOFT_TENANT_ID: process.env.MICROSOFT_TENANT_ID ?? "",
    MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID ?? "",
    MICROSOFT_CLIENT_SECRET: process.env.MICROSOFT_CLIENT_SECRET ?? "",
    MICROSOFT_SENDER_EMAIL: process.env.MICROSOFT_SENDER_EMAIL ?? "",
    FRONTEND_APP_URL: process.env.FRONTEND_APP_URL ?? "http://localhost:8080"
  };
}

function isEnabled(value) {
  return String(value).toLowerCase() === "true";
}

function createGraphProvider(options = {}) {
  const {
    env = getEnv(),
    fetchImpl = globalThis.fetch
  } = options;

  async function getAccessToken() {
    const required = [
      ["MICROSOFT_TENANT_ID", env.MICROSOFT_TENANT_ID],
      ["MICROSOFT_CLIENT_ID", env.MICROSOFT_CLIENT_ID],
      ["MICROSOFT_CLIENT_SECRET", env.MICROSOFT_CLIENT_SECRET]
    ];
    const missing = required.filter(([, value]) => !value).map(([name]) => name);

    if (missing.length) {
      throw new Error(`Missing Microsoft Graph email config: ${missing.join(", ")}`);
    }

    const body = new URLSearchParams({
      client_id: env.MICROSOFT_CLIENT_ID,
      client_secret: env.MICROSOFT_CLIENT_SECRET,
      grant_type: "client_credentials",
      scope: "https://graph.microsoft.com/.default"
    });

    const response = await fetchImpl(
      `https://login.microsoftonline.com/${env.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body
      }
    );
    const payload = await response.json().catch(() => ({}));

    if (!response.ok || !payload.access_token) {
      throw new Error(payload.error_description || payload.error || "Unable to get Microsoft Graph token");
    }

    return payload.access_token;
  }

  return {
    async sendEmail({ to, subject, text, html }) {
      if (!env.MICROSOFT_SENDER_EMAIL) {
        throw new Error("Missing Microsoft sender email");
      }

      const accessToken = await getAccessToken();
      const response = await fetchImpl(
        `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(env.MICROSOFT_SENDER_EMAIL)}/sendMail`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: {
              subject,
              body: {
                contentType: html ? "HTML" : "Text",
                content: html || text
              },
              toRecipients: [
                {
                  emailAddress: {
                    address: to
                  }
                }
              ]
            },
            saveToSentItems: false
          })
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(errorBody || "Microsoft Graph sendMail failed");
      }

      return { provider_message_id: null };
    }
  };
}

function createEmailService(options = {}) {
  const {
    database = db,
    env = getEmailEnv(),
    provider = isEnabled(env.EMAIL_DELIVERY_ENABLED) ? createGraphProvider({ env }) : null
  } = options;

  async function createLog(entry) {
    if (typeof database.createEmailDeliveryLog !== "function") {
      return null;
    }

    try {
      return await database.createEmailDeliveryLog(entry);
    } catch (error) {
      console.warn("Unable to create email delivery log", error);
      return null;
    }
  }

  async function updateLog(logId, update) {
    if (!logId || typeof database.updateEmailDeliveryLog !== "function") {
      return null;
    }

    try {
      return await database.updateEmailDeliveryLog(logId, update);
    } catch (error) {
      console.warn("Unable to update email delivery log", error);
      return null;
    }
  }

  return {
    isDeliveryEnabled() {
      return isEnabled(env.EMAIL_DELIVERY_ENABLED);
    },

    async sendEmail({ to, subject, text, html, metadata = {} }) {
      const baseLog = {
        provider: env.EMAIL_PROVIDER || "microsoft_graph",
        recipient_user_id: metadata.recipient_user_id ?? null,
        recipient_email: to ?? null,
        subject,
        status: "skipped",
        announcement_id: metadata.announcement_id ?? null,
        notification_id: metadata.notification_id ?? null,
        proposal_id: metadata.proposal_id ?? null,
        error_message: null,
        sent_at: null
      };

      if (!to) {
        await createLog({
          ...baseLog,
          error_message: "Recipient email is missing"
        });
        return { status: "skipped" };
      }

      if (!isEnabled(env.EMAIL_DELIVERY_ENABLED)) {
        return { status: "skipped" };
      }

      const log = await createLog(baseLog);

      try {
        const emailProvider = provider ?? createGraphProvider({ env: getEnv() });
        await emailProvider.sendEmail({ to, subject, text, html, metadata });
        const sentAt = new Date().toISOString();
        await updateLog(log?.id, {
          status: "sent",
          sent_at: sentAt,
          error_message: null
        });

        return { status: "sent", sent_at: sentAt };
      } catch (error) {
        await updateLog(log?.id, {
          status: "failed",
          error_message: error instanceof Error ? error.message : "Email delivery failed"
        });

        return {
          status: "failed",
          error: error instanceof Error ? error.message : "Email delivery failed"
        };
      }
    }
  };
}

module.exports = {
  createEmailService,
  createGraphProvider
};
