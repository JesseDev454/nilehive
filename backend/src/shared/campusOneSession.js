const crypto = require("crypto");
const ApiError = require("./ApiError");
const { parseCookies } = require("./cookies");
const { getEnv } = require("../config/env");

const CAMPUS_ONE_SESSION_COOKIE = "nilehive_campus_one_session";
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlJson(input) {
  return base64UrlEncode(JSON.stringify(input));
}

function base64UrlDecode(input) {
  const normalized = String(input).replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return Buffer.from(padded, "base64");
}

function getSessionSecret() {
  const env = getEnv();
  return env.CAMPUS_ONE_SESSION_SECRET || env.CAMPUS_ONE_CLIENT_SECRET || env.SUPABASE_SERVICE_ROLE_KEY;
}

function signPayload(encodedPayload) {
  return base64UrlEncode(crypto.createHmac("sha256", getSessionSecret()).update(encodedPayload).digest());
}

function createCampusOneSessionToken(payload, options = {}) {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + (options.maxAgeSeconds || SESSION_MAX_AGE_SECONDS);
  const encodedPayload = base64UrlJson({
    ...payload,
    iat: now,
    exp: expiresAt
  });
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

function verifyCampusOneSessionToken(token) {
  const [encodedPayload, signature] = String(token || "").split(".");

  if (!encodedPayload || !signature) {
    throw new ApiError(401, "Please sign in to continue", "AUTH_REQUIRED");
  }

  const expectedSignature = signPayload(encodedPayload);
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    throw new ApiError(401, "Please sign in again", "INVALID_SESSION");
  }

  let payload;

  try {
    payload = JSON.parse(base64UrlDecode(encodedPayload).toString("utf8"));
  } catch {
    throw new ApiError(401, "Please sign in again", "INVALID_SESSION");
  }

  if (!payload.exp || Number(payload.exp) <= Math.floor(Date.now() / 1000)) {
    throw new ApiError(401, "Your session has expired", "SESSION_EXPIRED");
  }

  if (!payload.profileId) {
    throw new ApiError(401, "Please sign in again", "INVALID_SESSION");
  }

  return payload;
}

function readCampusOneSessionFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie || "");
  const token = cookies[CAMPUS_ONE_SESSION_COOKIE];

  if (!token) {
    throw new ApiError(401, "Please sign in to continue", "AUTH_REQUIRED");
  }

  return verifyCampusOneSessionToken(token);
}

module.exports = {
  CAMPUS_ONE_SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createCampusOneSessionToken,
  readCampusOneSessionFromRequest,
  verifyCampusOneSessionToken
};
