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
    SUPABASE_SERVICE_ROLE_KEY: readEnv("SUPABASE_SERVICE_ROLE_KEY", { required: true })
  };

  return cachedEnv;
}

module.exports = { getEnv };

