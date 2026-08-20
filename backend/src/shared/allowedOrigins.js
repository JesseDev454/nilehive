const { getEnv } = require("../config/env");

function normalizeOrigin(origin) {
  return String(origin || "").trim().replace(/\/+$/, "");
}

function getAllowedOrigins(env = getEnv()) {
  return new Set(
    [env.FRONTEND_APP_URL, ...String(env.CORS_ALLOWED_ORIGINS || "").split(",")]
      .map(normalizeOrigin)
      .filter(Boolean)
  );
}

function isAllowedOrigin(origin, env = getEnv()) {
  const normalized = normalizeOrigin(origin);
  return Boolean(normalized) && getAllowedOrigins(env).has(normalized);
}

module.exports = {
  getAllowedOrigins,
  isAllowedOrigin,
  normalizeOrigin
};
