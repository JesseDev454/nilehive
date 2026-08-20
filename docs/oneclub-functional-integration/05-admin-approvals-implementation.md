# OneClub STEP 3C — Admin Approvals backend connection

**Status:** implemented on `codex/oneclub-functional-integration`.

This document records how the existing Admin Approvals workspace was connected to the live backend for three queues only:

1. Proposal final decisions
2. Membership-request decisions
3. Dues-proof verification and rejection

People, Clubs, Events, Announcements, Feedback, Analytics, Notifications, Activity Log, and Admin Home were not connected. Feedback Manager was not restored. Admin Tasks were not added. Production and `main` were not changed.

No secret values, tokens, cookies, private proof URLs, or real student data are included.

The session document listed as `docs/oneclub-functional-integration/03-session-and-route-implementation.md` was not present in the repository. Step 3A/3B behaviour was confirmed from `02-admin-auth-implementation-map.md`, `04-csrf-and-proposal-contract.md`, and current source.

---

## Files changed

Frontend:

- `frontend/src/lib/api/client.ts` — optional `Retry-After` on `ApiClientError`
- `frontend/src/lib/api/approvals.ts` — typed Admin Approvals API functions
- `frontend/src/lib/approvals/*` — types, adapters, mock seeds, error mapping
- `frontend/src/lib/membershipStatus.ts`
- `frontend/src/lib/duesStatus.ts`
- `frontend/src/contexts/AuthContext.tsx` — `reportAuthFailure` for 401 during queue use
- `frontend/src/components/admin/approvals/*` — connected workspace, lists, dialogs, queue states
- `frontend/scripts/run-unit-tests.mjs`

Backend:

- `backend/src/modules/dues/dues.service.js` — duplicate paid/rejected decisions return `409 INVALID_PAYMENT_STATE`
- `backend/tests/dues.test.js`
- `backend/tests/membership-requests.test.js`
- `backend/tests/csrf.test.js`

Tests / docs:

- `tests/e2e/helpers.ts`
- `tests/e2e/approvals.spec.ts`
- `tests/e2e/auth.spec.ts`
- `playwright.config.ts`
- `docs/oneclub-functional-integration/05-admin-approvals-implementation.md`

Unrelated Vitest/lockfile leftovers, ZIPs, `.claude/`, Stitch exports, and `__codex_tmp/` were not staged.

---

## Endpoints connected

### Proposals

```http
GET  /api/v1/proposals/admin?status=pending_admin_review&page=1&page_size=100
GET  /api/v1/proposals/admin/:proposalId
POST /api/v1/proposals/admin/:proposalId/decision
```

Admin-only (`requireRole("admin")`). Decision rate limit: 20 / 5 minutes, `ADMIN_DECISION_RATE_LIMITED`.

### Membership requests

```http
GET  /api/v1/membership-requests?status=pending&page=1&page_size=100
POST /api/v1/membership-requests/:requestId/decision
POST /api/v1/membership-requests/:requestId/whatsapp-added
```

Admin-only in the service layer. Decision rate limit: 20 / 5 minutes. WhatsApp rate limit: 30 / 5 minutes.

### Dues

```http
GET  /api/v1/dues?status=submitted&page=1&page_size=100
POST /api/v1/dues/:paymentId
```

There is no `/decision` suffix. Admin-only in `dues.service.js`. Decision rate limit: 20 / 5 minutes, `DUES_DECISION_RATE_LIMITED`.

---

## Request / response contracts

Pagination envelope:

```json
{ "data": { "items": [], "page": 1, "page_size": 20, "total": 0, "has_next": false } }
```

Dues list envelope:

```json
{ "data": { "summary": {}, "payments": { "items": [], "page": 1, "page_size": 20, "total": 0, "has_next": false } } }
```

Proposal decision body:

```json
{ "decision": "approve" | "reject", "remarks": "optional string, trimmed, max 2000" }
```

Membership decision body:

```json
{ "decision": "approve" | "reject", "remarks": "optional, stored as decision_remarks" }
```

Dues decision body:

```json
{ "status": "paid" | "rejected" }
```

Frontend API functions:

- `listAdminProposals()` / `listAdminProposalViews()`
- `getAdminProposal()`
- `submitAdminProposalDecision()`
- `listMembershipRequests()` / `listMembershipRequestViews()`
- `submitMembershipDecision()`
- `markMembershipWhatsAppAdded()`
- `listAdminDues()` / `listAdminDuesViews()`
- `submitDuesDecision()`

They use the shared `apiRequest` client (`credentials: "include"`, automatic `X-CSRF-Token`, one CSRF retry, `AbortSignal`).

---

## Status transitions

Proposals:

- `pending_admin_review` + approve → `approved`
- `pending_admin_review` + reject → `admin_rejected`
- `advisor_rejected` / `admin_rejected` + approve + remarks → `approved` (Directorate Override)
- Invalid/duplicate transitions → `409 INVALID_PROPOSAL_STATE`

The Approvals queue loads `pending_admin_review` only. Override remains visible but disabled on those records because returned proposals are not in this queue.

Membership:

- `pending` + approve → `active`, linked dues marked `paid`, WhatsApp status `ready`
- `pending` + reject → `rejected`, linked dues marked `rejected` when present
- Non-pending → `409 INVALID_REQUEST_STATE`

Dues:

- `submitted` + `{ status: "paid" }` → `paid`
- `submitted` + `{ status: "rejected" }` → `rejected`
- Second identical paid/rejected decision → `409 INVALID_PAYMENT_STATE`

Live statuses used by the UI:

- Proposals: `draft`, `pending_advisor_review`, `pending_admin_review`, `advisor_rejected`, `admin_rejected`, `approved`
- Membership: `pending`, `approved_pending_dues`, `active`, `rejected`, `cancelled`
- Dues: `unpaid`, `submitted`, `paid`, `rejected`

Not used: `pending_admin`, `revisions_requested`, generic `rejected` for proposals, mock `verified` for dues, mock membership `approved`.

---

## Frontend types and adapters

Adapters are deterministic and do not invent President names, Advisor names, emails, or payment channels.

| UI field | Backend source | If missing |
|---|---|---|
| Proposal club | `club.name` | Club id / "Club unavailable" |
| Proposal submitter name | not returned | "the club President" |
| Advisor name | not returned | label only, no fabricated name |
| Advisor remarks | `advisor_remarks` | honest empty wording |
| Join email | not returned on membership profile | "Not returned by the membership record" |
| Join statement | `join_reason` or `remarks` | honest empty wording |
| Dues payment channel | `payment_account_name` | "Not provided" |
| Dues proof | authorized `proof_url` only | missing/expired copy, no service-role URLs |

---

## CSRF behaviour

Step 3B CSRF is reused. Components do not fetch or attach tokens themselves.

Mutations send `X-CSRF-Token`. Missing/invalid/expired tokens fail with the Step 3B codes. The client retries CSRF errors once. 401 clears the in-memory token and `reportAuthFailure` clears the session so approval data is not left on screen.

---

## Loading, error and conflict handling

Each queue independently supports:

- initial loading
- refreshing after a decision
- empty
- filtered empty
- recoverable error + Retry
- 403 no-access (protected rows removed)
- 401 session expired / login via existing auth flow
- 404 stale/deleted record
- 409 already changed, then refresh
- 429 wait-and-retry using `Retry-After` when present
- 500/network with form data preserved
- validation on remarks fields

Decisions are not optimistic. Success toasts appear only after the server accepts the request.

---

## Duplicate / race protection

- Mutation lock is keyed by backend record id
- Unrelated queue rows stay enabled
- Dialog cannot close in a way that repeats a submit
- Double-click / concurrent approve+reject is rejected as in-progress
- Server remains authoritative: invalid transitions 409
- Dues now also 409 on a second paid/rejected decision

---

## Cache refresh rules

After a successful decision the current queue refetches. Membership and dues also refresh each other because approving a join marks linked dues paid. Admin Home stays mock and is not synchronized. Navigation counts on Approvals tabs use the connected queues.

---

## Permission boundaries

| Actor | List/decide proposals (Admin final) | Membership decide | Dues verify |
|---|---|---|---|
| Admin | yes | yes | yes |
| Advisor | 403 (can only use Advisor APIs) | 403 | 403 |
| President | 403 | 403 | 403 |
| Executive | 403 | 403 | 403 |
| Student | 403 | 403 | 403 |
| Unauthenticated | 401 | 401 | 401 |

Frontend `/admin/approvals` remains an Admin-only route from Step 3A.

---

## Mock versus integrated

`VITE_ONECLUB_MODE=mock` keeps deterministic local records and local decisions.

Integrated mode loads and mutates the backend only. It never substitutes mock records on error. Development diagnostic: `data-approvals-source="integrated"` on the workspace.

---

## Control classification

| Control | Class |
|---|---|
| Tabs, search, club filter | CONNECTED (client filter; club filter matches official names or ids) |
| Authorize proposal | CONNECTED |
| Return/reject proposal | CONNECTED, remarks required in UI |
| Directorate Override | CONNECTED for returned statuses; disabled on `pending_admin_review` |
| Admit / decline join | CONNECTED |
| WhatsApp added | CONNECTED after admission + paid dues; one-way `added`; mock preview can still toggle |
| Verify / reject dues | CONNECTED |
| Receipt expand | CONNECTED to authorized `proof_url` |

---

## Known limitations

- Admin Home counts remain mock.
- Proposal list does not include returned proposals, so Override is present but disabled in the default queue.
- Admin proposal reject remarks are required in the UI; backend validation still treats them as optional except for override approve.
- Membership reject remarks are required in the UI; backend stores them optionally.
- Dues rejection remarks are required in the UI but **are not persisted**. The dues update payload has no remarks field. The student notification is a fixed backend message.
- Membership records do not return institutional email.
- Proposal records do not return President or Advisor display names.
- WhatsApp added cannot be unmarked through the existing endpoint.
- Club filter still uses the official 14 names; mock slug ids such as `nile-google-developers` match by club name, not by those slugs.
- No new backend endpoint was added for dues remarks or proposal submitter names.

## Tests and results

Frontend:

- `npm run typecheck` passed
- `npm run lint` passed (0 errors; existing warnings only)
- `npm run build` passed
- `npm test` (`scripts/run-unit-tests.mjs`) 24/24
- Playwright `tests/e2e/{smoke,auth,approvals}.spec.ts` 26/26 (desktop/mobile light/dark Approvals included)

Backend:

- Targeted Admin proposal, membership, dues, CSRF, and portal-access tests passed
- Full suite `npm test` 336/336

Browser verification used Playwright against the local Vite app with a mock session and mock API. No production traffic was sent. Dialogs, CSRF headers, duplicate-click protection, 403/409/500, and role denial were checked in that environment.

Integrated staging needs at least:

- one `pending_admin_review` proposal
- one `pending` membership request with a linked submitted dues proof
- one `submitted` dues proof with an authorized `proof_url`

Do not run these mutations against production.

## Rollback

Revert the Step 3C commit on `codex/oneclub-functional-integration`. Mock mode is unchanged for other Admin workspaces. The dues `INVALID_PAYMENT_STATE` guard is the only backend behaviour change and is safe to keep.
