# OneClub STEP 3E — Admin Clubs management

**Status:** implemented on `codex/oneclub-functional-integration`.

This document records how the existing Admin Clubs workspace was connected to the live backend for:

1. Club directory
2. Client-side search, category filtering and the existing card layout
3. Club details
4. Club editing for supported fields
5. Public-signup and dues settings
6. Shared payment-account display and update
7. Leadership and Advisor display
8. Admin member roster
9. Loading, empty, error and conflict states

Admin Events, Announcements, Notifications, Feedback, Analytics, Activity Log, and Admin Home were not connected. Feedback Manager was not restored. Admin Tasks were not added. Production and `main` were not changed.

No secret values, tokens, cookies, private payment credentials, or real student data are included.

`docs/oneclub-functional-integration/03-session-and-route-implementation.md` was not present. Step 3A–3D behaviour was confirmed from `02-admin-auth-implementation-map.md`, `04-csrf-and-proposal-contract.md`, `05-admin-approvals-implementation.md`, `06-admin-people-access-implementation.md`, and current source.

---

## Files changed

Frontend:

- `frontend/src/lib/api/clubs.ts` — typed Clubs API functions
- `frontend/src/lib/clubs/*` — types, adapters, mock seeds, error mapping
- `frontend/src/components/admin/clubs/*` — connected directory, inspector, editor, queue states
- `frontend/scripts/run-unit-tests.mjs`

Backend:

- `backend/src/modules/clubs/clubs.validation.js` — optional `dues_amount` on club create/update payloads (column already existed)
- `backend/src/modules/clubs/clubs.service.js` — duplicate name/code → 409, audit logs on create/update
- `backend/tests/clubs.test.js`
- `backend/tests/members.test.js`
- `backend/tests/csrf.test.js`

Tests / docs:

- `tests/e2e/helpers.ts`
- `tests/e2e/clubs.spec.ts`
- `playwright.config.ts`
- `docs/oneclub-functional-integration/07-admin-clubs-implementation.md`

Unrelated ZIPs, `.claude/`, Stitch exports, and `__codex_tmp/` were not staged.

The approved Admin Clubs layout was preserved. There is no Create Club control in that UI, so create was not added as a new button. `POST /api/v1/clubs` remains available to Admin and is covered by API/backend tests.

---

## Endpoints connected

```http
GET  /api/v1/clubs
GET  /api/v1/clubs/:clubId
PATCH /api/v1/clubs/:clubId
GET  /api/v1/members?club_id=&page=&page_size=&sort=full_name&order=asc
GET  /api/v1/dues/payment-settings?club_id=
POST /api/v1/dues/payment-settings
GET  /api/v1/admin/users?role=president|advisor&page_size=100
```

Not connected as fake UI actions:

- `POST /api/v1/clubs` — supported for Admin, but the approved Clubs screen has no Create control
- `DELETE /api/v1/clubs/:clubId` — supported for Admin, not present in the approved UI
- `POST /api/v1/storage/upload` and club media routes — the UI only had a cover URL field, which is not `logo_path` / `{clubId}/` storage
- Membership-request and dues-verification decisions — remain in Approvals (Step 3C)
- Advisor unassign — still no backend endpoint (Step 3D limitation)

Cookie-authenticated mutations require CSRF (`X-CSRF-Token`) from Step 3B. Club writes are also rate-limited (`CLUB_WRITE_RATE_LIMITED`, 20 / 10 minutes).

---

## Club list / filter contract

`GET /api/v1/clubs` is authenticated. Envelope:

```json
{ "data": [ /* ClubRecord, ordered by name */ ] }
```

There is no server `q`, category, status, sort or pagination query. Admin receives the full visible set, including private WhatsApp notes. Search and category chips filter that loaded set in the browser. This is safe because the official directory is the 14 seeded clubs, not a paged subset.

Role visibility:

- admin: all clubs
- student: all clubs, WhatsApp fields stripped
- president / executive: assigned club only
- advisor: clubs from `club_advisors`

Admin Clubs UI remains Admin-only through existing `effective_role` routing.

---

## Club-details contract

`GET /api/v1/clubs/:clubId` returns the same club fields plus `gallery` when media exists. 404 `CLUB_NOT_FOUND` if the club is missing or not visible to the actor.

Members: `GET /api/v1/members?club_id=:id` with the standard pagination envelope. Admin may pass `club_id`. Presidents/executives are forced to their assigned club. Advisors cannot list members.

Payment: `GET /api/v1/dues/payment-settings?club_id=:id` — student or admin. Admin Clubs uses this for the selected club.

Leadership is not joined on the club row. The directory overlays:

- presidents from `GET /api/v1/admin/users?role=president`
- advisors from `GET /api/v1/admin/users?role=advisor` using `advisor_assignments` and `club_id`

Missing President or Advisor is shown as **Not assigned**.

---

## Create / update contracts

Create (Admin only, not shown in the approved Clubs UI):

```http
POST /api/v1/clubs
```

Validated fields: `name` (required), `description` (required), `code` (uppercased), `is_public_signup`, WhatsApp fields, `categories`, `logo_path`, `website_url`, `social_links`, skills/career/meeting windows. Dues on create remain **₦10,000** regardless of payload. Shared payment settings are copied from an existing club or the Providus default.

Update (Admin only):

```http
PATCH /api/v1/clubs/:clubId
```

Partial payload. Step 3E added optional `dues_amount` (≥ 0) because the column already existed and the approved editor exposes it. Duplicate name/code from Postgres `23505` maps to `409 CLUB_ALREADY_EXISTS`. Empty PATCH is `400`.

---

## Authoritative club fields and the 14-club list

Backend `normalizeClub` / Admin list fields:

`id`, `name`, `code`, `description`, `advisor_id`, `dues_amount`, `is_public_signup`, `whatsapp_group_name`, `whatsapp_onboarding_notes`, `categories`, `skills_offered`, `career_goals`, `meeting_windows`, `weekly_commitment`, `logo_path`, `website_url`, `social_links`, `created_at`.

Bootstrap (`backend/supabase/bootstrap_clubs.sql`) is authoritative:

| Name | Code |
|---|---|
| Nile Book Club | NBC |
| Nile Business Club | NBUC |
| Nile Charity Club | NCC |
| Nile Climate Initiatives Club | NCIC |
| Nile Creative Arts Club | NCAC |
| Nile Debate Club | NDC |
| Nile Games Club | NGC |
| Nile Google Developers | NGD |
| Nile Model United Nations Club | NMUN |
| Nile Photography Club | NPC |
| Nile Startup Campus | NSC |
| Nile Toastmaster's Club | NTC |
| TEDx Nile Club | TEDX |
| Women in Tech Club | WIT |

Mock-only mismatches (kept in `VITE_ONECLUB_MODE=mock` only):

- Mock IDs such as `nile-book-club` instead of UUIDs
- Nile Google Developers mock code `NGDG` vs bootstrap `NGD`
- Women in Tech Club mock code `WITC` vs bootstrap `WIT`
- Mock UI categories (`Technology`, `Arts & Culture`, …) vs backend enums (`Tech`, `Arts`, …)
- Mock per-club dues (e.g. ₦2,500) vs backend default ₦10,000
- Mock presidents, advisors, member counts, locations, schedules, unsplash covers, and per-club bank accounts

Integrated mode never uses that mock list as a fallback.

---

## Public-signup behaviour

Stored on `clubs.is_public_signup`. Admin PATCH updates that club only. Disabling signup shows a confirmation that students can no longer apply through public signup. The toggle is disabled while that club’s save is in flight. Failure leaves the form open.

---

## Dues / settings behaviour

- **Per-club dues amount:** `clubs.dues_amount`, updated with `PATCH /clubs/:clubId`. This is the amount shown on the club. It does not bulk-rewrite outstanding due-payment rows.
- **Shared bank account:** `GET/POST /dues/payment-settings`. POST upserts the same bank profile onto **every** official club. The editor already labelled this as shared; saving bank fields requires an extra confirmation in integrated mode.
- There is no separate narration column. The student-facing `payment_instructions` field is the persisted note. The narration input is disabled with honest copy.
- Location, free-text meeting schedule, freeform tags, and cover URLs are **not** club columns. Those inputs are disabled in integrated mode.

---

## Logo / media behaviour

The approved editor has a Cover Image URL text field. Backend logos use `logo_path` and gallery `storage_path` values that must start with `{clubId}/`. Unsplash URLs are not valid storage paths. Integrated mode:

- Displays a public `http(s)` `logo_path` when present
- Otherwise shows a code fallback, not a fabricated cover
- Disables the URL field
- Does not call `POST /storage/upload`

---

## Leadership / Advisor behaviour

Displayed from People/access data. Assignment stays in `/admin/people`. Advisor removal is not simulated. The inspector links to People and states that advisor unassign is unavailable.

---

## Member-roster behaviour

Admin details load `GET /members?club_id=` and show name, student ID, club role and membership status. Count uses the pagination `total`. No membership-request or dues-decision controls. Presidents remain member-view-only on their own club via existing member APIs; they cannot open Admin Clubs.

---

## Unsupported actions

| Control | Classification |
|---|---|
| Search / category chips | CONNECTED (client filter on full `GET /clubs`) |
| Club cards / details / edit | CONNECTED for real fields |
| Public signup | CONNECTED |
| Dues amount | CONNECTED (`PATCH` `dues_amount`) |
| Bank name/number/account/proof note | CONNECTED as **shared** payment settings |
| WhatsApp admin notes | CONNECTED (`whatsapp_onboarding_notes`) |
| Location / schedule / tags / cover URL | DISABLED_PENDING_BACKEND (honest copy) |
| Narration guideline | READ_ONLY (not a separate column) |
| Create Club | Not in approved UI |
| Archive / deactivate / delete | Not in approved UI; no fake local delete |
| Logo file upload | Not fully supported |
| Advisor remove | DISABLED_PENDING_BACKEND |
| Health scores / event counts | Not invented |

---

## CSRF, duplicate/race protection, permissions

Mutations use the shared `apiRequest` client (`credentials: "include"`, automatic CSRF, one retry on CSRF expiry). Club saves are keyed by club ID. Save stays disabled while unchanged or while that club is saving. Duplicate clicks send one request. The server response is authoritative; the directory is refetched after success. Recoverable errors keep the editor open.

Only `effective_role = admin` may create/edit clubs. Students, presidents, executives and advisors receive 403 on Admin club writes. Unauthenticated list/update is 401.

---

## Loading / error / conflict states

Directory: loading skeleton, empty, filtered-empty, 403 no-access, 500 Retry. Details: loading, 404, Retry. Edit: field validation, 409 duplicate/stale copy, 429 wait-and-retry, 500/network keep values. 401 uses existing session-expired handling.

---

## Mock versus integrated mode

`VITE_ONECLUB_MODE=mock` keeps `OFFICIAL_14_CLUBS_DATA` and local save. Integrated mode uses backend clubs/members/payment/leadership only (`data-clubs-source="integrated"`). The DEV role selector is not authorization.

---

## Tests

Frontend unit tests cover adapters, optional/null fields, error mapping, CSRF on create/update/payment, abort, and the 14-club bootstrap codes.

Backend tests cover Admin list/update, create permission, student/president/executive/advisor 403, unauthenticated 401, CSRF cookie club PATCH, duplicate 409, invalid dues, invalid id, public signup, dues, audit metadata without private notes, member list scoping, and president cross-club member 403.

Playwright (`tests/e2e/clubs.spec.ts`) covers Admin load of 14 backend-shaped clubs, search, details/leadership/members, edit + CSRF, duplicate click, public signup, 403/404/409/429/500, unsupported archive/delete/logo, wrong roles, 401, and desktop/mobile light/dark.

---

## Staging-data requirements

Staging should run `backend/supabase/bootstrap_clubs.sql` so the 14 official names/codes exist. Leadership and members appear only when People/member rows are assigned. Payment settings appear after club creation or payment-profile bootstrap. Missing President/Advisor/members/payment is shown honestly.

---

## Known limitations

- No Create button in the approved Clubs UI
- No archive/delete control in the approved UI
- No per-club bank isolation; payment POST updates all clubs
- No location/schedule/cover-URL persistence
- No logo upload pipeline from this screen
- No Advisor unassign
- Club list has no `updated_at` optimistic-concurrency token; conflicts surface as 409 duplicate/relationship errors
- Directory member counts wait until details load (list payload has no member_count)
- Full Analytics remains a later step
