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
    NODE_ENV: readEnv("NODE_ENV", { defaultValue: "development" }),
    PORT: readEnv("PORT", { defaultValue: "4000" }),
    HOST: readEnv("HOST", { defaultValue: "0.0.0.0" }),
    SUPABASE_URL: readEnv("SUPABASE_URL", { required: true }),
    SUPABASE_ANON_KEY: readEnv("SUPABASE_ANON_KEY", { required: true }),
    SUPABASE_SERVICE_ROLE_KEY: readEnv("SUPABASE_SERVICE_ROLE_KEY", { required: true }),
    AUTH_PROVIDER: readEnv("AUTH_PROVIDER", { defaultValue: "supabase" }),
    PORTAL_API_BASE_URL: readEnv("PORTAL_API_BASE_URL", { defaultValue: "https://api.builtbysalih.com" }),
    PORTAL_ORIGIN: readEnv("PORTAL_ORIGIN", { defaultValue: "https://portal.builtbysalih.com" }),
    CAMPUS_ONE_CLIENT_ID: readEnv("CAMPUS_ONE_CLIENT_ID", { defaultValue: "" }),
    CAMPUS_ONE_CLIENT_SECRET: readEnv("CAMPUS_ONE_CLIENT_SECRET", { defaultValue: "" }),
    CAMPUS_ONE_SESSION_SECRET: readEnv("CAMPUS_ONE_SESSION_SECRET", { defaultValue: "" }),
    CAMPUS_ONE_ISSUER: readEnv("CAMPUS_ONE_ISSUER", { defaultValue: "https://auth.campusone.com.ng" }),
    CAMPUS_ONE_REDIRECT_URI: readEnv("CAMPUS_ONE_REDIRECT_URI", {
      defaultValue: "http://localhost:4000/api/v1/auth/campus-one/callback"
    }),
    CAMPUS_ONE_SCOPES: readEnv("CAMPUS_ONE_SCOPES", {
      defaultValue: "openid profile email academic roles offline_access"
    }),
    CAMPUS_ONE_ENFORCE_EMAIL_DOMAIN: readEnv("CAMPUS_ONE_ENFORCE_EMAIL_DOMAIN", { defaultValue: "false" }),
    REQUEST_TIMEOUT_MS: readEnv("REQUEST_TIMEOUT_MS", { defaultValue: "15000" }),
    ASYNC_JOBS_ENABLED: readEnv("ASYNC_JOBS_ENABLED", { defaultValue: "false" }),
    REDIS_URL: readEnv("REDIS_URL", { defaultValue: "" }),
    REDIS_QUEUE_PREFIX: readEnv("REDIS_QUEUE_PREFIX", { defaultValue: "nilehive" }),
    JOB_CHUNK_SIZE: readEnv("JOB_CHUNK_SIZE", { defaultValue: "250" }),
    JOB_DEFAULT_ATTEMPTS: readEnv("JOB_DEFAULT_ATTEMPTS", { defaultValue: "3" }),
    JOB_BACKOFF_MS: readEnv("JOB_BACKOFF_MS", { defaultValue: "5000" }),
    SENTRY_DSN_BACKEND: readEnv("SENTRY_DSN_BACKEND", { defaultValue: "" }),
    SENTRY_DSN_FRONTEND: readEnv("SENTRY_DSN_FRONTEND", { defaultValue: "" }),
    EMAIL_DELIVERY_ENABLED: readEnv("EMAIL_DELIVERY_ENABLED", { defaultValue: "false" }),
    EMAIL_PROVIDER: readEnv("EMAIL_PROVIDER", { defaultValue: "microsoft_graph" }),
    MICROSOFT_TENANT_ID: readEnv("MICROSOFT_TENANT_ID", { defaultValue: "" }),
    MICROSOFT_CLIENT_ID: readEnv("MICROSOFT_CLIENT_ID", { defaultValue: "" }),
    MICROSOFT_CLIENT_SECRET: readEnv("MICROSOFT_CLIENT_SECRET", { defaultValue: "" }),
    MICROSOFT_SENDER_EMAIL: readEnv("MICROSOFT_SENDER_EMAIL", { defaultValue: "" }),
    FRONTEND_APP_URL: readEnv("FRONTEND_APP_URL", { defaultValue: "http://localhost:8080" }),
    WEB_PUSH_PUBLIC_KEY: readEnv("WEB_PUSH_PUBLIC_KEY", { defaultValue: "" }),
    WEB_PUSH_PRIVATE_KEY: readEnv("WEB_PUSH_PRIVATE_KEY", { defaultValue: "" }),
    WEB_PUSH_SUBJECT: readEnv("WEB_PUSH_SUBJECT", { defaultValue: "mailto:admin@nilehive.test" }),
    CURRENT_ACADEMIC_SESSION: readEnv("CURRENT_ACADEMIC_SESSION", { defaultValue: "2025/2026" }),
    CORS_ALLOWED_ORIGINS: readEnv("CORS_ALLOWED_ORIGINS", {
      defaultValue: "http://localhost:8080,http://localhost:8081,http://127.0.0.1:8080,http://127.0.0.1:8081"
    })
  };

  return cachedEnv;
}

function clearEnvCache() {
  cachedEnv = null;
}

module.exports = { clearEnvCache, getEnv };

