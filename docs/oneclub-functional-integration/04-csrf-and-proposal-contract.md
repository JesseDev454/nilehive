# OneClub STEP 3B — CSRF protection and proposal contract

**Status:** implemented on `codex/oneclub-functional-integration`. Admin Approvals remains mock-only. Feedback Manager and Admin Tasks were not added.

This document records the cookie-authenticated CSRF design, Advisor return-remarks validation, and frontend proposal-status alignment with the live backend state machine.

No secret values, tokens, cookies, authorization codes, or JWTs are included.

---

## Chosen CSRF design

OneClub uses a **signed stateless synchronizer token**.

The backend issues an HMAC-signed token bound to:

- the current Campus One session cookie (`sid` fingerprint of the raw session token)
- the authenticated profile id (`sub`)
- an expiry (`exp`) that is never later than the session expiry

The frontend stores that token **in memory only** and sends it on unsafe cookie-authenticated API requests as:

```http
X-CSRF-Token: <opaque-token>
```

This is appropriate because:

- Campus One sessions are HttpOnly cookies, so the browser cannot read the session secret.
- Staging cookies may use `SameSite=None`, so SameSite is not a complete defence.
- Vercel `/api/*` rewrites are same-origin; Render is a separate API origin. CORS plus Origin checks cover both.
- The existing session secret already signs the session cookie, so a second store such as Redis is unnecessary.

The token is not a second login session. It cannot be minted without a valid Campus One cookie, and it fails if the session cookie rotates or expires.

---

## Token lifecycle

1. User completes Campus One login. The backend sets the HttpOnly session cookie.
2. The frontend loads `GET /api/v1/profile/me` with `credentials: "include"`.
3. After an authenticated profile is resolved, the frontend lazily/eagerly calls `GET /api/v1/auth/csrf`.
4. The opaque token is held in a module-level memory variable. It is never written to `localStorage` or `sessionStorage`.
5. Unsafe same-API requests attach `X-CSRF-Token`.
6. If the backend reports `CSRF_TOKEN_REQUIRED`, `CSRF_TOKEN_INVALID`, or `CSRF_TOKEN_EXPIRED`, the frontend clears the cached token, fetches one new token, and retries the mutation **once**.
7. Logout, `401`, and session-expired flows clear the in-memory token.
8. A new login issues a new session cookie, so a previous CSRF token will not verify.

---

## Token endpoint

```http
GET /api/v1/auth/csrf
```

Authenticated Campus One session required.

Example body:

```json
{
  "data": {
    "csrf_token": "<opaque-token>"
  }
}
```

Requirements implemented:

- `401 AUTH_REQUIRED` without a valid session
- `Cache-Control: no-store`
- rate limited consistently with other auth reads (`CSRF_RATE_LIMITED`, 60/min)
- does not expose cookie contents or profile secrets
- does not mutate application data
- token is not accepted from query strings

---

## Protected methods

CSRF validation runs **after** Campus One cookie authentication resolves the session and **before** business handlers.

Protected methods:

- `POST`
- `PUT`
- `PATCH`
- `DELETE`

Safe methods remain exempt:

- `GET`
- `HEAD`
- `OPTIONS`

Protection applies only to **cookie-authenticated Campus One browser mutations**. Bearer-token / Supabase test auth is unchanged so existing backend suites keep passing.

---

## Middleware ordering

1. Helmet, request context, request timeout
2. CORS allowlist from `FRONTEND_APP_URL` + `CORS_ALLOWED_ORIGINS`
3. Signed Campus One webhook raw-body parser (HMAC route only)
4. JSON body parser
5. Route routers
6. `createAuthMiddleware` / `createAuthUserMiddleware` resolve the Campus One session
7. `protectCookieAuthenticatedMutation` for unsafe methods
8. Role checks and business handlers
9. Shared error handler (stable codes, no stack traces in production)

Logout is special: `POST /api/v1/auth/campus-one/logout` is public to the browser but calls `protectCampusOneLogout` before clearing the cookie. A valid session must present a matching CSRF token. An already expired/invalid session may still be cleared without a token so a dead cookie cannot be stuck.

---

## Explicit exemptions

These routes cannot present a browser CSRF header, or they already have a stronger authenticator. Exemptions are path-exact, not prefix-wide.

| Route | Classification | CSRF | Existing protection |
|---|---|---|---|
| `GET /api/v1/auth/campus-one/login` | Public OIDC navigation | Exempt | Campus One OIDC start |
| `GET /api/v1/auth/campus-one/callback` | Public OIDC callback | Exempt | `state` and `nonce` cookies |
| `POST /api/v1/webhooks/campus-one` | Signed webhook | Exempt | HMAC signature (`CAMPUS_ONE_WEBHOOK_SECRET`) |
| `POST /api/v1/auth/e2e/staging-session` | Staging-only session bridge | Exempt | Bridge secret + `APP_ENV=staging` + allowlisted E2E profiles. Impossible in production |
| Health checks | Read-only | Exempt | Unauthenticated GET |
| Public GET endpoints | Read-only | Exempt | No mutation |
| Bearer / server-to-server calls | Not cookie-authenticated | Not in CSRF path | Existing token auth |

The staging bridge remains disabled unless `APP_ENV=staging` and `E2E_STAGING_AUTH_BRIDGE_ENABLED=true` and a bridge secret is configured.

---

## Origin validation

Unsafe cookie-authenticated mutations also check `Origin` as defence in depth.

- Allowed origins are the existing CORS allowlist: `FRONTEND_APP_URL` plus comma-separated `CORS_ALLOWED_ORIGINS`.
- No new `CSRF_ALLOWED_ORIGINS` variable was added.
- Wildcard origin is not used with credentials.
- An unapproved `Origin` returns `403 CSRF_ORIGIN_REJECTED`.
- A missing `Origin` is allowed when the CSRF token itself is valid, so non-browser tests and some same-origin rewrite clients are not broken.
- Signed webhooks and the staging bridge do not use this Origin check.

Same-origin Vercel `/api/*` rewrites typically send the frontend origin. Direct Render calls from the approved frontend origin are allowed the same way.

---

## CORS requirements

The backend continues to:

- reflect only allowlisted origins
- send `Access-Control-Allow-Credentials: true`
- allow `GET,POST,PUT,PATCH,DELETE,OPTIONS`
- allow headers including `Content-Type`, `Authorization`, `Idempotency-Key`, `X-Request-Id`, and `X-CSRF-Token`

It does **not** send `Access-Control-Allow-Origin: *` together with credentials.

Production still rejects unknown origins with `CORS_ORIGIN_BLOCKED` before the handler runs.

---

## Frontend token handling

`frontend/src/lib/api/client.ts` plus `frontend/src/lib/api/csrf.ts`:

- `getCsrfToken()` after authentication
- in-memory cache with in-flight deduplication
- automatic `X-CSRF-Token` on unsafe **own API** URLs only
- never attached to GET or to third-party absolute URLs
- never placed in query strings
- `credentials: "include"` preserved
- abort signals forwarded
- one CSRF retry after `CSRF_TOKEN_REQUIRED` / `CSRF_TOKEN_INVALID` / `CSRF_TOKEN_EXPIRED`
- no retry loop
- `401` and logout clear the token
- Auth context prefetches the token after `GET /profile/me` succeeds

The only production frontend mutation in this step is **POST logout**. Admin Approvals, Advisor decisions, dues verification, People, club editing, and notification mark-read are **not** connected.

---

## Retry behaviour

1. Unsafe request fails with a CSRF error code.
2. Clear the in-memory token.
3. Fetch one new token.
4. Retry the original request once, with `csrfRetried` set.
5. If that retry fails, return the normalized `ApiClientError`. Stop.

Session `401` does not retry CSRF. It clears auth and CSRF state and uses the existing session-expired / login flow.

---

## Error codes

| Code | When |
|---|---|
| `CSRF_TOKEN_REQUIRED` | Unsafe cookie mutation missing `X-CSRF-Token` |
| `CSRF_TOKEN_INVALID` | Malformed, wrong session, or signature mismatch |
| `CSRF_TOKEN_EXPIRED` | Token `exp` has passed |
| `CSRF_ORIGIN_REJECTED` | `Origin` is present and not allowlisted |
| `CSRF_RATE_LIMITED` | Too many CSRF token reads |
| `AUTH_REQUIRED` | CSRF endpoint called without a session |

Error bodies and logs do not include token values.

---

## Logout behaviour

| Method | Behaviour |
|---|---|
| `POST /api/v1/auth/campus-one/logout` | Requires CSRF when a valid session cookie is present. Clears the OneClub session cookie. Returns `{ data: { signed_out: true } }`. |
| `GET /api/v1/auth/campus-one/logout` | Does **not** change session state. Redirects to the frontend login page. |

The frontend uses POST logout only. After the request, it clears in-memory profile and CSRF state and routes to `/login`.

Campus One OIDC login and callback are unchanged.

---

## Environment-variable names

Reused. No new variable was added.

| Name | Role |
|---|---|
| `FRONTEND_APP_URL` | Primary frontend origin for redirects, CORS, and CSRF Origin allowlist |
| `CORS_ALLOWED_ORIGINS` | Extra comma-separated browser origins |
| `CAMPUS_ONE_SESSION_SECRET` | Signs the session cookie and CSRF token (falls back to `CAMPUS_ONE_CLIENT_SECRET`) |
| `CAMPUS_ONE_CLIENT_SECRET` | OIDC client secret; CSRF signing fallback |
| `CAMPUS_ONE_WEBHOOK_SECRET` | Webhook HMAC; CSRF is not used |
| `APP_ENV` | Must be `staging` for the E2E session bridge |
| `E2E_STAGING_AUTH_BRIDGE_ENABLED` | Staging-only bridge flag |
| `E2E_STAGING_AUTH_BRIDGE_SECRET` | Staging-only bridge secret |
| `E2E_STAGING_ALLOWED_PROFILE_IDS` | Optional extra E2E profile allowlist |
| `AUTH_PROVIDER` | `campus_one_oidc` enables cookie CSRF |

`docs/ENVIRONMENT_REFERENCE.md` was not changed because no new name was introduced.

---

## Advisor remarks validation

Advisor decision body:

```json
{
  "decision": "approve" | "reject",
  "remarks": "..."
}
```

- `decision: "reject"` is the API value for the UI action **Return for changes**.
- `remarks` is required, must be a string, must contain non-whitespace text, is trimmed, and is capped at 2000 characters.
- Missing, `null`, empty, or whitespace-only remarks return `400 VALIDATION_ERROR` and do not mutate the proposal, create an approval row, write audit history, or send notifications.
- Advisor approval remarks stay optional.
- Resulting status for reject: `advisor_rejected`.
- Resulting status for approve: `pending_admin_review`.

Frontend Inspector validation remains, but it is no longer the sole enforcement.

---

## Actual proposal state machine

```text
draft
  → pending_advisor_review

pending_advisor_review
  → pending_admin_review
  → advisor_rejected

pending_admin_review
  → approved
  → admin_rejected

advisor_rejected
  → pending_advisor_review after President resubmission

admin_rejected
  → pending_advisor_review after President resubmission
```

The following are **not** valid persisted statuses and were not added to the database enum:

- `pending_admin`
- `revisions_requested`
- generic `rejected`
- `advisor_approved` as a live approval state

User-facing labels:

| API status | Label |
|---|---|
| `draft` | Draft |
| `pending_advisor_review` | Waiting for Advisor |
| `pending_admin_review` | Waiting for Admin |
| `advisor_rejected` | Returned by Advisor |
| `admin_rejected` | Returned by Admin |
| `approved` | Approved |

Frontend mock queues (Admin Approvals, Advisor inspector, President pipeline) now use the API statuses. Admin decision buttons still mutate local mock state only.

---

## Tests and results

Recorded after the Step 3B verification run in this change:

- Backend: `backend/tests/csrf.test.js`, Campus One OIDC, portal-access, Advisor decision, Admin decision, webhook signature, staging-bridge, and the practical backend suite.
- Frontend: API-client CSRF unit tests, proposal-status unit tests, `npm run typecheck`, `npm run lint`, `npm run build`.
- Playwright: existing Step 3A auth tests plus Admin Approvals mock-only, Advisor remarks, status labels, and mobile light/dark smoke.

Exact pass/fail counts belong in the Step 3B commit response, not in this file as stale numbers.

---

## Known limitations

- CSRF applies to Campus One cookie sessions. Local Bearer/Supabase tests do not send `X-CSRF-Token` and are intentionally exempt.
- Admin Approvals, Advisor API decisions, dues verification, People role assignment, club editing, and notification mark-read are still mock UI. CSRF infrastructure is ready for those mutations later.
- GET logout remains as a non-mutating redirect for compatibility; browsers must use POST.
- Missing `Origin` is allowed when the CSRF token is valid. Origin checks are defence in depth, not the only control.
- Live Campus One IdP login is not exercised in unit tests; OIDC login/callback routes are covered as HTTP redirects.

---

## Deployment considerations

- Frontend and backend allowlists must include every real browser origin, including Vercel preview URLs that call the API with credentials.
- Staging `SameSite=None` cookies still require HTTPS and the CSRF header.
- Do not enable the staging session bridge in production.
- After deploy, confirm `GET /api/v1/auth/csrf` returns `Cache-Control: no-store` for an authenticated session.

---

## Rollback considerations

- Reverting this commit removes CSRF middleware, the `/auth/csrf` endpoint, frontend header attachment, and Advisor reject-remarks enforcement.
- Session cookies themselves do not change format.
- No database migration is included, so rollback does not require a schema undo.
- Frontend status strings would revert to the older mock aliases (`pending_admin`, `revisions_requested`) which must not be sent to the live API.
