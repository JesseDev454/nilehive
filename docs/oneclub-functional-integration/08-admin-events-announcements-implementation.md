# OneClub STEP 3F — Admin Events and Announcements

**Status:** implemented on `codex/oneclub-functional-integration`.

This document records how the existing Admin Events and Admin Announcements workspaces were connected to the live backend.

Admin Notifications, Feedback, Analytics, Activity Log, and Admin Home remain unconnected, except that the Admin Home announcement composer now uses the same publish API and validation as Admin Announcements. Feedback Manager was not restored. Admin Tasks were not added. Production and `main` were not changed.

No secrets, QR tokens, cookies, or real student data are included.

---

## Files changed

Frontend:

- `frontend/src/lib/api/events.ts` — approved-event list, engagement, attendance, reports
- `frontend/src/lib/api/announcements.ts` — announcement list and publish
- `frontend/src/lib/events/*` — types, adapters, lifecycle, mock seeds, error mapping
- `frontend/src/lib/announcements/*` — types, adapters, mock seeds, error mapping
- `frontend/src/components/admin/events/*` — connected directory, details, QR, manual check-in
- `frontend/src/components/admin/announcements/*` — connected directory, details, composer
- `frontend/src/components/admin/AdminAnnouncementComposer.tsx` — shared publish contract from Admin Home
- `frontend/src/data/adminEventsData.ts`
- `frontend/src/data/adminAnnouncementsData.ts`
- `frontend/scripts/run-unit-tests.mjs`

Backend:

- `backend/src/modules/events/events.service.js` — Admin/president duplicate attendance is idempotent
- `backend/tests/events.test.js`
- `backend/tests/csrf.test.js`

Tests / docs:

- `tests/e2e/helpers.ts`
- `tests/e2e/events.spec.ts`
- `tests/e2e/announcements.spec.ts`
- `playwright.config.ts`
- `docs/oneclub-functional-integration/08-admin-events-announcements-implementation.md`

Unrelated ZIPs, `.claude/`, Stitch exports, and `__codex_tmp/` were not staged.

The approved Events and Announcements layouts were preserved.

---

## Event model

There is no standalone `events` table. **Approved proposals are the event records.**

- Event ID = proposal ID
- `GET /api/v1/events/approved` returns `formatApprovedEvent()` objects with `id` and `proposal_id` both set to the proposal ID
- RSVP (`event_rsvps`) and attendance (`event_attendance`) rows are keyed by `proposal_id`
- Event lifecycle (`upcoming`, `happening_today`, `past`) is derived from `event_date` in Africa/Lagos
- Admin cannot create, edit, cancel, or postpone events independently of proposal approval

---

## Endpoints connected

```http
GET  /api/v1/events/approved?page=&page_size=&sort=event_date&order=asc&lifecycle=
GET  /api/v1/events/:proposalId/engagement
POST /api/v1/events/:proposalId/attendance
GET  /api/v1/reports?page=&page_size=&sort=submitted_at
GET  /api/v1/clubs
GET  /api/v1/admin/users?q=&role=student
GET  /api/v1/communications/announcements?page=&page_size=&sort=created_at&order=desc
POST /api/v1/communications/announcements
```

Not connected as fake UI actions:

- `POST /api/v1/events/:proposalId/rsvp` — students only; Student RSVP is outside this task
- `POST /api/v1/events/:proposalId/check-in` — students only; Student QR check-in is outside this task
- Event create / edit / cancel / postpone — no backend mutation exists
- Announcement edit / delete / pin / schedule / attachments / action links — no backend support
- Announcement GET-by-id — list payload is sufficient
- Admin Notifications, Feedback, Analytics, Activity Log, Home cards

Cookie-authenticated mutations require CSRF (`X-CSRF-Token`) from Step 3B. Announcement writes are rate-limited (`ANNOUNCEMENT_RATE_LIMITED`, 5 / minute).

---

## Event list / detail contracts

List envelope:

```json
{ "data": { "items": [ApprovedEvent], "page": 1, "page_size": 20, "total": 2, "has_next": false } }
```

Approved event fields used:

- `id` / `proposal_id`
- `club_id`
- `title` / `proposal_title` / `description`
- `event_date` / `event_time` / `location`
- `number_of_participants`
- `status` (`approved`)
- `event_lifecycle`
- `can_rsvp`
- `approved_at`

List does **not** return RSVP or attendance totals. Cards show “Open roster” until engagement is loaded. Search, club filter, and Happening Today are client-side on the fully loaded directory (`page_size=100` with extra pages if `has_next`). Backend `lifecycle` accepts only `upcoming` or `past`; the UI does not send invented query parameters.

Club names come from `GET /api/v1/clubs`. Organizer name/email and event end time are not stored on the approved-event payload and are shown as not provided.

Detail uses `GET /api/v1/events/:proposalId/engagement`.

---

## RSVP / attendance contracts

Engagement (Admin and the club president) includes:

- `event`
- `summary.total_rsvps`, `going`, `interested`, `not_going`, `cancelled`, `attended`
- `rsvps[]` with `profile.full_name`, `profile.student_id`, `status`
- `attendance[]` with `attended`, `checked_in_by`, `checked_in_at`, `profile`

Other roles receive summary and their own RSVP/attendance, but empty rosters. Admin Events is Admin-only in the UI.

Manual check-in:

```http
POST /api/v1/events/:proposalId/attendance
{ "user_id": "<profile id>", "attended": true }
```

Admin looks up the student with `GET /api/v1/admin/users?q=<matric>&role=student`, then posts `user_id`. Duplicate attended rows are idempotent: the existing record is returned and `upsertEventAttendance` is not called again.

---

## QR / check-in support

The backend does not persist a QR secret or signed attendance token.

Admin Organizer QR encodes the public check-in path:

```text
/check-in?proposal=<proposalId>
```

Students must already be signed in. Self check-in (`POST /events/:proposalId/check-in`) remains a Student workflow and is only available on the event date. Admin QR does not log the URL as a secret token and does not store it in localStorage.

---

## Unsupported event actions

- Create Event
- Edit approved proposal content from Events
- Cancel / postpone
- Export roster
- Invented attendance percentages when totals are not loaded
- Simulated local attendance in integrated mode

---

## Announcement list / publish contracts

List envelope is paginated. Fields:

- `id`, `club_id`, `created_by`, `title`, `message`
- `audience`: `all_users` | `all_clubs` | `club` | `role`
- `priority`: `low` | `normal` | `high` | `urgent`
- `target_role` when audience is `role`
- `created_at` used as published timestamp
- `is_read` / `read_at` are **per current user**, not campus read counts

The Admin UI maps backend `club` ↔ UI `one_club`. Read totals are not fabricated.

Publish:

```http
POST /api/v1/communications/announcements
{
  "title": "...",
  "message": "...",
  "audience": "all_users" | "all_clubs" | "club" | "role",
  "priority": "low" | "normal" | "high" | "urgent",
  "club_id": "<required when audience is club>",
  "target_role": "<required when audience is role>"
}
```

`audience: "all"` is accepted and stored as `all_users`. Admin Home “all campus users” maps to `all_users`. A selected club maps to `club` + `club_id`.

---

## Supported audiences / priorities / club targeting

Audiences: `all_users`, `all_clubs`, `club`, `role`.

Role targets: `student`, `executive`, `president`, `advisor`, `admin`.

Priorities: `low`, `normal`, `high`, `urgent`.

Club announcements require a real `club_id`. Global and all-clubs announcements clear `club_id`. Role announcements require `target_role` and do not keep a club id for Admin global role broadcasts.

Admin may publish institution-wide. Presidents may publish only through President workflows (club-scoped); they cannot use Admin routes. Executives, advisors, and students receive 403 on create.

---

## Notification side effects

`createAnnouncement` already fans out in-app notifications (and optional email/push) on the backend. The Admin UI does **not** create a second notification loop and does not display delivery counts, because the publish payload does not return them.

---

## Local draft behaviour

Composer drafts use `sessionStorage` keys:

- `oneclub_admin_announcement_composer_draft`
- `oneclub_admin_announcement_draft` (Admin Home)

These are labelled as device-local. They are not saved to OneClub. They are cleared after a confirmed publish.

---

## Unsupported announcement actions

- Edit
- Delete
- Pin
- Schedule
- Attachments
- Action URL / button label persistence
- Fabricated recipient or read counts

---

## CSRF

Mutations use the shared `apiRequest` client: `credentials: "include"` and automatic `X-CSRF-Token` with one retry on expired/invalid CSRF.

---

## Role boundaries

Only `effective_role = admin` may open `/admin/events` and `/admin/announcements`.

Students, presidents, executives, and advisors receive the existing “No Access to this Workspace” screen on those Admin routes. Backend engagement/attendance still follows existing club-scoped rules for presidents; this task does not grant presidents Admin UI access.

---

## Error / race handling

- 401 → session expired via `reportAuthFailure`
- 403 → no-access empty directory, no protected cards
- 404 → stale event removed from the list; check-in form kept on recoverable lookup misses
- 409 → duplicate attendance / closed check-in copy
- 400/422 → field errors, composer stays open
- 429 → wait-and-retry, form preserved
- 500/network → Retry, no false success
- Publish and check-in buttons disable while in flight; duplicate clicks share one lock

---

## Mock / integrated behaviour

`VITE_ONECLUB_MODE=mock` keeps deterministic local events/announcements and local check-in/publish.

Integrated mode never falls back to those mocks. Source markers:

- `data-events-source="integrated"`
- `data-announcements-source="integrated"`

---

## Tests / results

- Frontend unit tests: 38 passed
- Frontend typecheck, lint (0 errors), and production build: passed
- Backend targeted events / communications / CSRF tests: 70 passed
- Full backend suite: 362 passed
- Playwright: 71 passed (`events.spec.ts` and `announcements.spec.ts` plus existing Admin specs), workers=1

---

## Known limitations

- Event end time, organizer email, and campus-wide read counts are not stored
- QR is a check-in URL, not a signed secret; Student QR scanning is still a later task
- Post-event reports are listed when `GET /reports` succeeds; Admin cannot submit reports (presidents only)
- Announcement publisher names are resolved from the first page of Admin users when possible
- Admin Home cards and statistics remain mock; only the composer publishes through the shared API
- Advisor club unassign remains a Step 3D limitation and is unrelated to this step

---

## Staging-data requirements

- At least one `proposals` row with `status = approved`, `event_date`, `club_id`
- Matching official club row for club name display
- Optional `event_rsvps` / `event_attendance` rows for roster checks
- Optional `event_reports` row for past-event report display
- Admin Campus One session with `effective_role = admin`
- Student profiles with `student_id` for manual check-in lookup
