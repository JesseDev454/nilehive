const crypto = require("crypto");
const ApiError = require("./ApiError");
const { parseCookies } = require("./cookies");
const {
  CAMPUS_ONE_SESSION_COOKIE,
  getSessionSecret,
  verifyCampusOneSessionToken
} = require("./campusOneSession");
const { isAllowedOrigin, normalizeOrigin } = require("./allowedOrigins");

const CSRF_HEADER_NAME = "x-csrf-token";
const CSRF_TYP = "csrf";
const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(input) {
  const normalized = String(input).replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return Buffer.from(padded, "base64");
}

function signCsrfPayload(encodedPayload) {
  return base64UrlEncode(
    crypto.createHmac("sha256", getSessionSecret()).update(`csrf-v1:${encodedPayload}`).digest()
  );
}

function sessionBinding(rawSessionToken) {
  return base64UrlEncode(
    crypto.createHmac("sha256", getSessionSecret()).update(`csrf-sid:${rawSessionToken}`).digest().subarray(0, 16)
  );
}

function timingSafeEqualString(left, right) {
  const provided = Buffer.from(String(left || ""));
  const expected = Buffer.from(String(right || ""));
  return provided.length === expected.length && crypto.timingSafeEqual(provided, expected);
}

function createCsrfToken(sessionPayload, rawSessionToken, options = {}) {
  const now = options.now ?? Math.floor(Date.now() / 1000);
  const sessionExp = Number(sessionPayload?.exp);
  const exp = options.exp ?? sessionExp;

  if (!sessionPayload?.profileId || !sessionExp) {
    throw new ApiError(401, "Please sign in again", "INVALID_SESSION");
  }

  const encodedPayload = base64UrlEncode(JSON.stringify({
    typ: CSRF_TYP,
    sub: sessionPayload.profileId,
    iat: now,
    exp,
    sid: sessionBinding(rawSessionToken)
  }));

  return `${encodedPayload}.${signCsrfPayload(encodedPayload)}`;
}

function verifyCsrfToken(token, sessionPayload, rawSessionToken, options = {}) {
  const now = options.now ?? Math.floor(Date.now() / 1000);
  const [encodedPayload, signature] = String(token || "").split(".");

  if (!encodedPayload || !signature) {
    throw new ApiError(403, "A valid security token is required", "CSRF_TOKEN_INVALID");
  }

  const expectedSignature = signCsrfPayload(encodedPayload);
  if (!timingSafeEqualString(signature, expectedSignature)) {
    throw new ApiError(403, "A valid security token is required", "CSRF_TOKEN_INVALID");
  }

  let payload;
  try {
    payload = JSON.parse(base64UrlDecode(encodedPayload).toString("utf8"));
  } catch {
    throw new ApiError(403, "A valid security token is required", "CSRF_TOKEN_INVALID");
  }

  if (payload.typ !== CSRF_TYP || !payload.sub || !payload.sid || !payload.exp) {
    throw new ApiError(403, "A valid security token is required", "CSRF_TOKEN_INVALID");
  }

  if (Number(payload.exp) <= now) {
    throw new ApiError(403, "Your security token has expired", "CSRF_TOKEN_EXPIRED");
  }

  if (Number(payload.exp) > Number(sessionPayload.exp)) {
    throw new ApiError(403, "A valid security token is required", "CSRF_TOKEN_INVALID");
  }

  if (!timingSafeEqualString(payload.sub, sessionPayload.profileId)) {
    throw new ApiError(403, "A valid security token is required", "CSRF_TOKEN_INVALID");
  }

  if (!timingSafeEqualString(payload.sid, sessionBinding(rawSessionToken))) {
    throw new ApiError(403, "A valid security token is required", "CSRF_TOKEN_INVALID");
  }

  return payload;
}

function readRawCampusOneSessionToken(req) {
  const cookies = parseCookies(req.headers.cookie || "");
  return cookies[CAMPUS_ONE_SESSION_COOKIE] || null;
}

function isUnsafeMethod(method) {
  return UNSAFE_METHODS.has(String(method || "").toUpperCase());
}

function requestPath(req) {
  const raw = String(req.originalUrl || req.url || "");
  return raw.split("?")[0];
}

function isCsrfExemptPath(pathname) {
  return pathname === "/api/v1/auth/e2e/staging-session"
    || pathname === "/api/v1/webhooks/campus-one"
    || pathname === "/api/v1/auth/campus-one/login"
    || pathname === "/api/v1/auth/campus-one/callback";
}

function assertTrustedMutationOrigin(req) {
  const origin = normalizeOrigin(req.headers.origin);
  if (!origin) {
    return;
  }

  if (!isAllowedOrigin(origin)) {
    throw new ApiError(403, "This request origin is not allowed", "CSRF_ORIGIN_REJECTED");
  }
}

function readCsrfHeader(req) {
  return String(req.get(CSRF_HEADER_NAME) || req.get("X-CSRF-Token") || "").trim();
}

function protectCookieAuthenticatedMutation(req, sessionPayload, rawSessionToken) {
  if (!isUnsafeMethod(req.method) || isCsrfExemptPath(requestPath(req))) {
    return;
  }

  assertTrustedMutationOrigin(req);

  const header = readCsrfHeader(req);
  if (!header) {
    throw new ApiError(403, "A security token is required", "CSRF_TOKEN_REQUIRED");
  }

  verifyCsrfToken(header, sessionPayload, rawSessionToken);
}

function protectCampusOneLogout(req) {
  const rawSessionToken = readRawCampusOneSessionToken(req);
  if (!rawSessionToken) {
    return { hadSession: false };
  }

  let sessionPayload;
  try {
    sessionPayload = verifyCampusOneSessionToken(rawSessionToken);
  } catch (error) {
    if (error instanceof ApiError && (error.code === "SESSION_EXPIRED" || error.code === "INVALID_SESSION" || error.code === "AUTH_REQUIRED")) {
      return { hadSession: true, expired: true };
    }
    throw error;
  }

  protectCookieAuthenticatedMutation(req, sessionPayload, rawSessionToken);
  return { hadSession: true, expired: false };
}

module.exports = {
  CSRF_HEADER_NAME,
  createCsrfToken,
  isCsrfExemptPath,
  isUnsafeMethod,
  protectCampusOneLogout,
  protectCookieAuthenticatedMutation,
  readRawCampusOneSessionToken,
  verifyCsrfToken
};
