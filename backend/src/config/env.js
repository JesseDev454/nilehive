const dotenv = require("dotenv");

dotenv.config();

let cachedEnv;

function readEnv(name, options = {}) {
  const { required = false, defaultValue } = options;
  const value = process.env[name] ?? defaultValue;

  if (required && !value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getEnv() {
  if (cachedEnv) {
    return cachedEnv;
  }

  cachedEnv = {
    PORT: readEnv("PORT", { defaultValue: "4000" }),
    SUPABASE_URL: readEnv("SUPABASE_URL", { required: true }),
    SUPABASE_ANON_KEY: readEnv("SUPABASE_ANON_KEY", { required: true }),
    SUPABASE_SERVICE_ROLE_KEY: readEnv("SUPABASE_SERVICE_ROLE_KEY", { required: true }),
    EMAIL_DELIVERY_ENABLED: readEnv("EMAIL_DELIVERY_ENABLED", { defaultValue: "false" }),
    EMAIL_PROVIDER: readEnv("EMAIL_PROVIDER", { defaultValue: "microsoft_graph" }),
    MICROSOFT_TENANT_ID: readEnv("MICROSOFT_TENANT_ID", { defaultValue: "" }),
    MICROSOFT_CLIENT_ID: readEnv("MICROSOFT_CLIENT_ID", { defaultValue: "" }),
    MICROSOFT_CLIENT_SECRET: readEnv("MICROSOFT_CLIENT_SECRET", { defaultValue: "" }),
    MICROSOFT_SENDER_EMAIL: readEnv("MICROSOFT_SENDER_EMAIL", { defaultValue: "" }),
    FRONTEND_APP_URL: readEnv("FRONTEND_APP_URL", { defaultValue: "http://localhost:8080" })
  };

  return cachedEnv;
}

module.exports = { getEnv };

