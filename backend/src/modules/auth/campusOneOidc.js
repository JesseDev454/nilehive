const crypto = require("crypto");
const ApiError = require("../../shared/ApiError");
const { appendSetCookie, buildCookie, parseCookies } = require("../../shared/cookies");
const {
  CAMPUS_ONE_SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createCampusOneSessionToken
} = require("../../shared/campusOneSession");
const { getEnv } = require("../../config/env");
const { isAllowedEmail } = require("../../config/emailPolicy");
const { logger: baseLogger } = require("../../config/logger");
const { resolveEffectiveRole } = require("../../shared/portalAccess");
const { isValidStudentId, normalizeStudentId } = require("../../shared/studentId");

const OIDC_STATE_COOKIE = "nilehive_oidc_state";
const OIDC_VERIFIER_COOKIE = "nilehive_oidc_verifier";
const OIDC_NONCE_COOKIE = "nilehive_oidc_nonce";
const OIDC_COOKIE_PATH = "/api/v1/auth/campus-one";
const OIDC_COOKIE_MAX_AGE_SECONDS = 10 * 60;
const JWKS_CACHE_TTL_MS = 10 * 60 * 1000;

let jwksCache = {
  fetchedAt: 0,
  keys: []
};

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

function randomToken(byteLength = 32) {
  return base64UrlEncode(crypto.randomBytes(byteLength));
}

function getIssuer() {
  return getEnv().CAMPUS_ONE_ISSUER.replace(/\/+$/, "");
}

function getAuthorizationEndpoint() {
  return `${getIssuer()}/api/auth/oauth2/authorize`;
}

function getTokenEndpoint() {
  return `${getIssuer()}/api/auth/oauth2/token`;
}

function getJwksEndpoint() {
  return `${getIssuer()}/api/auth/jwks`;
}

function getOidcCookieOptions(maxAge = OIDC_COOKIE_MAX_AGE_SECONDS) {
  return {
    httpOnly: true,
    secure: getEnv().NODE_ENV === "production",
    sameSite: "Lax",
    path: OIDC_COOKIE_PATH,
    maxAge
  };
}

function getSessionCookieOptions(maxAge = SESSION_MAX_AGE_SECONDS) {
  return {
    httpOnly: true,
    secure: getEnv().NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    maxAge
  };
}

function clearCampusOneOidcCookies(res) {
  for (const cookieName of [OIDC_STATE_COOKIE, OIDC_VERIFIER_COOKIE, OIDC_NONCE_COOKIE]) {
    appendSetCookie(res, buildCookie(cookieName, "", getOidcCookieOptions(0)));
  }
}

function clearCampusOneSessionCookie(res) {
  appendSetCookie(res, buildCookie(CAMPUS_ONE_SESSION_COOKIE, "", getSessionCookieOptions(0)));
}

function getFrontendLoginUrl(searchParams = {}) {
  const loginUrl = new URL(`${getEnv().FRONTEND_APP_URL.replace(/\/+$/, "")}/login`);

  for (const [key, value] of Object.entries(searchParams)) {
    if (value) {
      loginUrl.searchParams.set(key, value);
    }
  }

  return loginUrl.toString();
}

async function fetchJwks() {
  if (Date.now() - jwksCache.fetchedAt < JWKS_CACHE_TTL_MS && jwksCache.keys.length > 0) {
    return jwksCache.keys;
  }

  const response = await fetch(getJwksEndpoint(), { method: "GET" });

  if (!response.ok) {
    throw new ApiError(502, "CampusOne keys could not be loaded", "CAMPUS_ONE_JWKS_FAILED");
  }

  const jwks = await response.json();
  jwksCache = {
    fetchedAt: Date.now(),
    keys: Array.isArray(jwks.keys) ? jwks.keys : []
  };

  return jwksCache.keys;
}

function decodeJwtSegment(token, index) {
  const segment = String(token || "").split(".")[index];

  if (!segment) {
    throw new ApiError(401, "CampusOne returned an invalid sign-in token", "INVALID_ID_TOKEN");
  }

  try {
    return JSON.parse(base64UrlDecode(segment).toString("utf8"));
  } catch {
    throw new ApiError(401, "CampusOne returned an invalid sign-in token", "INVALID_ID_TOKEN");
  }
}

function getJwtHashAlgorithm(alg) {
  switch (alg) {
    case "RS256":
    case "PS256":
    case "ES256":
      return "SHA256";
    case "RS384":
    case "PS384":
    case "ES384":
      return "SHA384";
    case "RS512":
    case "PS512":
    case "ES512":
      return "SHA512";
    default:
      return null;
  }
}

function isSupportedJwtAlgorithm(alg) {
  return ["RS256", "RS384", "RS512", "PS256", "PS384", "PS512", "ES256", "ES384", "ES512", "EdDSA"].includes(alg);
}

function findSigningKey(keys, header) {
  if (header.kid) {
    return keys.find((key) => key.kid === header.kid);
  }

  return keys.find((key) => key.alg === header.alg) || keys.find((key) => {
    if (header.alg?.startsWith("RS") || header.alg?.startsWith("PS")) {
      return key.kty === "RSA";
    }

    if (header.alg?.startsWith("ES")) {
      return key.kty === "EC";
    }

    if (header.alg === "EdDSA") {
      return key.kty === "OKP";
    }

    return false;
  });
}

function verifyJwtSignature({ alg, publicKey, signingInput, signature }) {
  if (!isSupportedJwtAlgorithm(alg)) {
    throw new ApiError(401, "CampusOne used an unsupported token signature", "UNSUPPORTED_ID_TOKEN_ALG", {
      alg
    });
  }

  if (alg === "EdDSA") {
    return crypto.verify(null, Buffer.from(signingInput), publicKey, signature);
  }

  const hashAlgorithm = getJwtHashAlgorithm(alg);

  if (!hashAlgorithm) {
    throw new ApiError(401, "CampusOne used an unsupported token signature", "UNSUPPORTED_ID_TOKEN_ALG", {
      alg
    });
  }

  if (alg.startsWith("PS")) {
    return crypto.verify(hashAlgorithm, Buffer.from(signingInput), {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST
    }, signature);
  }

  if (alg.startsWith("ES")) {
    return crypto.verify(hashAlgorithm, Buffer.from(signingInput), {
      key: publicKey,
      dsaEncoding: "ieee-p1363"
    }, signature);
  }

  return crypto.verify(hashAlgorithm, Buffer.from(signingInput), publicKey, signature);
}

async function verifyCampusOneIdToken(idToken, expectedNonce) {
  const [encodedHeader, encodedPayload, encodedSignature] = String(idToken || "").split(".");

  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new ApiError(401, "CampusOne returned an invalid sign-in token", "INVALID_ID_TOKEN");
  }

  const header = decodeJwtSegment(idToken, 0);
  const payload = decodeJwtSegment(idToken, 1);

  const keys = await fetchJwks();
  const jwk = findSigningKey(keys, header);

  if (!jwk) {
    throw new ApiError(401, "CampusOne sign-in key was not recognized", "UNKNOWN_ID_TOKEN_KEY");
  }

  const publicKey = crypto.createPublicKey({ key: jwk, format: "jwk" });
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = base64UrlDecode(encodedSignature);

  if (!verifyJwtSignature({ alg: header.alg, publicKey, signingInput, signature })) {
    throw new ApiError(401, "CampusOne sign-in token could not be verified", "INVALID_ID_TOKEN_SIGNATURE");
  }

  const now = Math.floor(Date.now() / 1000);
  const env = getEnv();

  if (payload.iss !== getIssuer()) {
    throw new ApiError(401, "CampusOne sign-in token has an invalid issuer", "INVALID_ID_TOKEN_ISSUER");
  }

  const audienceMatches = Array.isArray(payload.aud)
    ? payload.aud.includes(env.CAMPUS_ONE_CLIENT_ID)
    : payload.aud === env.CAMPUS_ONE_CLIENT_ID;

  if (!audienceMatches) {
    throw new ApiError(401, "CampusOne sign-in token is for a different app", "INVALID_ID_TOKEN_AUDIENCE");
  }

  if (!payload.exp || Number(payload.exp) <= now) {
    throw new ApiError(401, "CampusOne sign-in token has expired", "EXPIRED_ID_TOKEN");
  }

  if (payload.nonce && payload.nonce !== expectedNonce) {
    throw new ApiError(401, "CampusOne sign-in could not be verified", "INVALID_OIDC_NONCE");
  }

  return payload;
}

async function exchangeCodeForTokens({ code, codeVerifier }) {
  const env = getEnv();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: env.CAMPUS_ONE_REDIRECT_URI,
    client_id: env.CAMPUS_ONE_CLIENT_ID,
    client_secret: env.CAMPUS_ONE_CLIENT_SECRET,
    code_verifier: codeVerifier
  });

  const response = await fetch(getTokenEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json"
    },
    body
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.id_token) {
    throw new ApiError(401, "CampusOne sign-in could not be completed", "CAMPUS_ONE_TOKEN_EXCHANGE_FAILED", {
      status: response.status,
      error: payload?.error
    });
  }

  return payload;
}

function resolveCampusOnePortalRole(claims = {}) {
  const role = String(claims.role || "").trim().toLowerCase();
  return ["student", "staff", "admin"].includes(role) ? role : "student";
}

function getCampusOneCustomRoles(claims = {}) {
  const customRoleClaims = [
    ...(Array.isArray(claims.custom_roles) ? claims.custom_roles : []),
    ...(Array.isArray(claims.customRoles) ? claims.customRoles : []),
    // Campus One documents custom_roles, but some tokens may only merge
    // app roles into roles. Only trust our exact admin custom role here.
    ...(Array.isArray(claims.roles) && claims.roles.includes("club_services_admin")
      ? ["club_services_admin"]
      : [])
  ];

  return [...new Set(
    customRoleClaims
      .map((role) => String(role || "").trim().toLowerCase())
      .filter(Boolean)
  )];
}

function getProfileDefaultsFromClaims(claims) {
  const env = getEnv();
  const portalUserId = String(claims.sub || "").trim();
  const email = String(claims.email || "").trim().toLowerCase();
  const fullName = String(claims.name || claims.preferred_username || email || "Campus One User").trim();
  const claimedStudentId = normalizeStudentId(claims.student_id);
  const studentId = isValidStudentId(claimedStudentId) ? claimedStudentId : null;

  if (!portalUserId || !email) {
    throw new ApiError(401, "CampusOne sign-in did not include required profile details", "INVALID_CAMPUS_ONE_PROFILE");
  }

  if (env.CAMPUS_ONE_ENFORCE_EMAIL_DOMAIN === "true" && !isAllowedEmail(email)) {
    throw new ApiError(403, "Please use your Nile University email address", "UNSUPPORTED_EMAIL_DOMAIN", {
      field: "email"
    });
  }

  return {
    portalUserId,
    email,
    fullName,
    studentId,
    emailVerified: claims.email_verified !== false,
    portalRole: resolveCampusOnePortalRole(claims),
    customRoles: getCampusOneCustomRoles(claims)
  };
}

function getUniqueProfileMatches(matches) {
  const matchesById = new Map();

  for (const match of matches) {
    if (match?.profile?.id) {
      const existing = matchesById.get(match.profile.id) || {
        profile: match.profile,
        matchedBy: []
      };
      existing.matchedBy.push(match.matchedBy);
      matchesById.set(match.profile.id, existing);
    }
  }

  return [...matchesById.values()];
}

async function resolveCampusOneProfile(database, claims) {
  const profileDefaults = getProfileDefaultsFromClaims(claims);
  const [portalProfile, emailProfile, studentIdProfile] = await Promise.all([
    database.getProfileByPortalUserId
      ? database.getProfileByPortalUserId(profileDefaults.portalUserId)
      : null,
    database.getProfileByEmail
      ? database.getProfileByEmail(profileDefaults.email)
      : null,
    profileDefaults.studentId && database.getProfileByStudentId
      ? database.getProfileByStudentId(profileDefaults.studentId)
      : null
  ]);
  const uniqueMatches = getUniqueProfileMatches([
    { profile: portalProfile, matchedBy: "portal_user_id" },
    { profile: emailProfile, matchedBy: "email" },
    { profile: studentIdProfile, matchedBy: "student_id" }
  ]);

  if (uniqueMatches.length > 1) {
    throw new ApiError(
      409,
      "Your Campus One account matches more than one Club Services profile. Please contact Club Services to link your account safely.",
      "CAMPUS_ONE_PROFILE_LINK_CONFLICT",
      {
        matched_by: uniqueMatches.flatMap((match) => match.matchedBy)
      }
    );
  }

  let profile = uniqueMatches[0]?.profile ?? null;

  if (profile) {
    const updates = {};
    const matchedBy = uniqueMatches[0].matchedBy;
    const profileEmail = String(profile.email || "").trim().toLowerCase();
    const canRefreshPortalLinkByVerifiedEmail =
      profileDefaults.emailVerified &&
      matchedBy.includes("email") &&
      profileEmail === profileDefaults.email;

    if (
      profile.portal_user_id &&
      profile.portal_user_id !== profileDefaults.portalUserId &&
      !canRefreshPortalLinkByVerifiedEmail
    ) {
      throw new ApiError(
        409,
        "This Club Services profile is already linked to another Campus One account. Please contact Club Services.",
        "CAMPUS_ONE_PROFILE_LINK_CONFLICT",
        {
          matched_by: matchedBy
        }
      );
    }

    if (!profile.portal_user_id || profile.portal_user_id !== profileDefaults.portalUserId) {
      updates.portal_user_id = profileDefaults.portalUserId;
    }

    if (!profile.email) {
      updates.email = profileDefaults.email;
    }

    if (!profile.full_name && profileDefaults.fullName) {
      updates.full_name = profileDefaults.fullName;
    }

    if (!profile.student_id && profileDefaults.studentId) {
      updates.student_id = profileDefaults.studentId;
    }

    if (Object.keys(updates).length > 0) {
      profile = await database.updateProfile(profile.id, updates);
    }

    return {
      profile,
      portalRole: profileDefaults.portalRole,
      customRoles: profileDefaults.customRoles
    };
  }

  profile = await database.createProfile({
    id: crypto.randomUUID(),
    portal_user_id: profileDefaults.portalUserId,
    email: profileDefaults.email,
    full_name: profileDefaults.fullName,
    role: "student",
    club_id: null,
    student_id: profileDefaults.studentId,
    requested_role: "student",
    onboarding_status: "complete",
    account_status: "active"
  });

  return {
    profile,
    portalRole: profileDefaults.portalRole,
    customRoles: profileDefaults.customRoles
  };
}

function createCampusOneAuthRouter(options = {}) {
  const { database, logger = baseLogger } = options;
  const router = require("express").Router();

  router.get("/campus-one/login", (req, res) => {
    const env = getEnv();

    if (!env.CAMPUS_ONE_CLIENT_ID || !env.CAMPUS_ONE_CLIENT_SECRET || !env.CAMPUS_ONE_REDIRECT_URI) {
      throw new ApiError(500, "CampusOne sign-in is not configured yet", "CAMPUS_ONE_NOT_CONFIGURED");
    }

    const state = randomToken();
    const nonce = randomToken();
    const codeVerifier = randomToken(48);
    const codeChallenge = base64UrlEncode(crypto.createHash("sha256").update(codeVerifier).digest());
    const returnTo = typeof req.query.return_to === "string" && req.query.return_to.startsWith("/")
      ? req.query.return_to
      : "/";
    const stateValue = base64UrlEncode(JSON.stringify({ state, returnTo }));
    const authorizationUrl = new URL(getAuthorizationEndpoint());

    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set("client_id", env.CAMPUS_ONE_CLIENT_ID);
    authorizationUrl.searchParams.set("redirect_uri", env.CAMPUS_ONE_REDIRECT_URI);
    authorizationUrl.searchParams.set("scope", env.CAMPUS_ONE_SCOPES);
    authorizationUrl.searchParams.set("state", stateValue);
    authorizationUrl.searchParams.set("nonce", nonce);
    authorizationUrl.searchParams.set("code_challenge", codeChallenge);
    authorizationUrl.searchParams.set("code_challenge_method", "S256");

    appendSetCookie(res, buildCookie(OIDC_STATE_COOKIE, state, getOidcCookieOptions()));
    appendSetCookie(res, buildCookie(OIDC_VERIFIER_COOKIE, codeVerifier, getOidcCookieOptions()));
    appendSetCookie(res, buildCookie(OIDC_NONCE_COOKIE, nonce, getOidcCookieOptions()));

    res.redirect(authorizationUrl.toString());
  });

  router.get("/campus-one/callback", async (req, res, next) => {
    try {
      const code = typeof req.query.code === "string" ? req.query.code : "";
      const encodedState = typeof req.query.state === "string" ? req.query.state : "";
      const oidcError = typeof req.query.error === "string" ? req.query.error : "";
      const cookies = parseCookies(req.headers.cookie || "");

      if (oidcError || !code) {
        const authError = oidcError ? (oidcError === "access_denied" ? "cancelled" : "failed") : "cancelled";
        clearCampusOneOidcCookies(res);
        res.redirect(getFrontendLoginUrl({ auth_error: authError }));
        return;
      }

      if (!code || !encodedState) {
        throw new ApiError(400, "CampusOne did not return the required sign-in details", "INVALID_OIDC_CALLBACK");
      }

      let statePayload;

      try {
        statePayload = JSON.parse(base64UrlDecode(encodedState).toString("utf8"));
      } catch {
        throw new ApiError(400, "CampusOne sign-in state could not be verified", "INVALID_OIDC_STATE");
      }

      if (!statePayload?.state || statePayload.state !== cookies[OIDC_STATE_COOKIE]) {
        throw new ApiError(400, "CampusOne sign-in state could not be verified", "INVALID_OIDC_STATE");
      }

      const codeVerifier = cookies[OIDC_VERIFIER_COOKIE];
      const nonce = cookies[OIDC_NONCE_COOKIE];

      if (!codeVerifier || !nonce) {
        throw new ApiError(400, "CampusOne sign-in expired. Please try again.", "OIDC_COOKIE_EXPIRED");
      }

      const tokens = await exchangeCodeForTokens({ code, codeVerifier });
      const claims = await verifyCampusOneIdToken(tokens.id_token, nonce);
      let profile;
      let portalRole;
      let customRoles;

      try {
        const resolvedProfile = await resolveCampusOneProfile(database, claims);
        profile = resolvedProfile.profile;
        portalRole = resolvedProfile.portalRole;
        customRoles = resolvedProfile.customRoles;
      } catch (error) {
        logger.warn("campus_one.profile_link.failed", {
          code: error?.code ?? "UNKNOWN",
          portal_user_id: claims.sub ?? null,
          email: claims.email ?? null
        });
        clearCampusOneOidcCookies(res);
        res.redirect(getFrontendLoginUrl({
          auth_error: error?.code === "CAMPUS_ONE_PROFILE_LINK_CONFLICT" ? "account_link_conflict" : "failed"
        }));
        return;
      }

      logger.info("campus_one.profile_link.succeeded", {
        profile_id: profile.id,
        portal_user_id: profile.portal_user_id,
        portal_role: portalRole,
        custom_roles: customRoles
      });

      const roleContext = resolveEffectiveRole({
        portalRole,
        appRole: profile.role,
        customRoles
      });
      const sessionToken = createCampusOneSessionToken({
        profileId: profile.id,
        portalUserId: profile.portal_user_id,
        portalRole: roleContext.portalRole,
        customRoles: roleContext.customRoles,
        email: profile.email
      });
      const returnTo = typeof statePayload.returnTo === "string" && statePayload.returnTo.startsWith("/")
        ? statePayload.returnTo
        : "/";

      clearCampusOneOidcCookies(res);
      appendSetCookie(res, buildCookie(CAMPUS_ONE_SESSION_COOKIE, sessionToken, getSessionCookieOptions()));
      res.redirect(`${getEnv().FRONTEND_APP_URL.replace(/\/+$/, "")}${returnTo}`);
    } catch (error) {
      clearCampusOneOidcCookies(res);
      next(error);
    }
  });

  router.post("/campus-one/logout", (req, res) => {
    clearCampusOneSessionCookie(res);
    res.status(200).json({ data: { signed_out: true } });
  });

  router.get("/campus-one/logout", (req, res) => {
    clearCampusOneSessionCookie(res);
    res.redirect(getFrontendLoginUrl({ signed_out: "1" }));
  });

  return router;
}

module.exports = {
  createCampusOneAuthRouter,
  resolveCampusOneProfile,
  resolveCampusOnePortalRole,
  getCampusOneCustomRoles,
  verifyCampusOneIdToken
};
