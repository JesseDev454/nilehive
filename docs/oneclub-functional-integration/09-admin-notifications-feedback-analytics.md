# OneClub STEP 3G — Admin Notifications, Feedback, and Analytics

**Status:** implemented on `codex/oneclub-functional-integration`.

This document records how the existing Admin Notifications, Admin Feedback, and Admin Analytics workspaces were connected to the live backend.

Admin Activity Log and remaining Admin Home data remain unconnected. Feedback Manager was not restored. Admin Tasks were not added. Production and `main` were not changed.

No secrets, tokens, notification private content, feedback private data, or real student records are included.

---

## Files changed

Frontend:

- `frontend/src/lib/api/notifications.ts` — list and mark-read
- `frontend/src/lib/api/feedback.ts` — Admin inbox list
- `frontend/src/lib/api/analytics.ts` — Admin summary
- `frontend/src/lib/notifications/*` — types, adapters, deep-link sanitizer, unread store, mocks
- `frontend/src/lib/feedback/*` — types, adapters, mocks
- `frontend/src/lib/analytics/*` — types, adapters, mocks
- `frontend/src/components/admin/notifications/*`
- `frontend/src/components/admin/feedback/*`
- `frontend/src/components/admin/analytics/*`
- `frontend/src/app/WorkspaceShell.tsx` — Admin unread badge
- `frontend/src/data/adminNotificationsData.ts`
- `frontend/src/data/adminFeedbackData.ts`
- `frontend/src/data/adminAnalyticsData.ts`
- `frontend/scripts/run-unit-tests.mjs`

Backend:

- `backend/src/modules/notifications/notifications.routes.js` — `PATCH /:notificationId/read`
- `backend/src/modules/notifications/notifications.controller.js`
- `backend/src/modules/notifications/notifications.service.js`
- `backend/src/config/db.js` — `read_at` on notification select; `markNotificationRead`; feedback submitter/club joins
- `backend/src/modules/communications/communications.service.js` — global inbox is Admin-only
- `backend/src/modules/dashboard/dashboard.service.js` — unread counts use `read_at`
- `backend/tests/notifications.test.js`
- `backend/tests/communications.test.js`
- `backend/tests/analytics.test.js`
- `backend/tests/csrf.test.js`

Tests / docs:

- `tests/e2e/helpers.ts`
- `tests/e2e/notifications.spec.ts`
- `tests/e2e/feedback.spec.ts`
- `tests/e2e/analytics.spec.ts`
- `playwright.config.ts`
- `docs/oneclub-functional-integration/09-admin-notifications-feedback-analytics.md`

Unrelated ZIPs, `.claude/`, Stitch exports, and `__codex_tmp/` were not staged.

Approved layouts were preserved.

---

## Notification endpoints

```http
GET   /api/v1/notifications?page=&page_size=&sort=created_at&order=desc
PATCH /api/v1/notifications/:notificationId/read
```

List is available to any authenticated user and is always scoped to `actor.id`. Admin Notifications uses that list for the signed-in Admin only.

There is no GET-by-id, mark-unread, mark-all-read, or delete endpoint. Push-subscription routes were not connected from this screen.

---

## Mark-read contract

```http
PATCH /api/v1/notifications/:notificationId/read
```

- Cookie sessions require CSRF (`X-CSRF-Token`).
- Sets `read_at` to the server timestamp.
- Idempotent if already read.
- Returns the persisted notification.
- Unknown or non-owned IDs return `404 NOTIFICATION_NOT_FOUND` without revealing another user’s record.
- The request body does not accept a recipient ID.

`read_at` is now included in the notification select list. Dashboard `GET /api/v1/dashboard/nav-counts` unread counts use `read_at` instead of `delivery_status`.

---

## Notification ownership

The authenticated session determines ownership. Service-role database access is filtered with `user_id = actor.id` on both list and mark-read. The browser cannot supply another recipient ID.

---

## Deep-link safety

Notifications have no `action_url` column. The Admin UI maps `type` plus `proposal_id` / `announcement_id` to canonical Admin routes:

- proposal types → `/admin/approvals` or `/admin/events`
- announcement_published → `/admin/announcements`
- event reminder/report types → `/admin/events`
- dues_proof_rejected → `/admin/approvals`

`sanitizeAdminDeepLink` rejects external origins, `javascript:` URLs, protocol-relative URLs, `..` traversal, and routes outside the Admin allowlist. Unsafe destinations are not rendered as links.

Mark-read runs when the Admin opens the related record, matching the approved UX.

---

## Feedback endpoints

```http
GET  /api/v1/communications/feedback
POST /api/v1/communications/feedback
```

Admin Feedback uses GET only. Students may still submit through the Student workflow (`POST`). There is no GET-by-id, PATCH, delete, reply, assign, or export endpoint.

List payload is an array in `{ data: Feedback[] }`. Fields used: `id`, `club_id`, `proposal_id`, `submitted_by`, `category`, `rating`, `comment`, `status`, `created_at`, nested `club`, `submitter`, and `proposal` when present.

---

## Feedback permission changes

Global inbox listing now requires `actor.role === "admin"`.

Denied with `403 FORBIDDEN`:

- student
- president
- executive
- advisor
- feedback_manager

Campus One already demotes `feedback_manager` to student. The application service no longer grants that role a global inbox even if a historical profile still has the enum value.

No RLS migration was added. The API uses the service-role client; the frontend never queries `event_feedback` with a user JWT. Historical `0046_feedback_manager_role.sql` SELECT policy remains in the database and is documented below.

---

## Feedback status workflow

The approved Admin UI is read-only. It does not include Mark reviewed, Archive, or Reopen.

The database still stores `open | reviewed | archived`. Status is displayed, not mutated. No PATCH endpoint was added.

---

## Anonymous / privacy behaviour

The backend always stores `submitted_by`. There is no anonymity column and no follow-up email flag.

Admin sees submitter name, role, and student ID when the profile join is present. Email is not returned. The UI does not claim “Anonymous” or “Contact permitted”. Missing names are labelled “Submitter on record”.

---

## Export behaviour

The approved Admin Feedback UI does not include Export. No CSV or PDF export was added.

---

## Analytics endpoint / ranges

```http
GET /api/v1/analytics/admin?days=7|30|90
```

Admin only. Unsupported `days` values fall back to `30`. `POST /api/v1/analytics/activity` was left unused: there is no product convention for Admin-screen activity tracking in this task, and Admin Activity Log is a later workspace.

---

## Metric mappings

Approved cards map to backend aggregates:

| Card | Backend field |
|---|---|
| Active Campus Users | `active_users` |
| Club Join Requests | `operations.join_requests_started` |
| Dues Payment Proofs | `operations.dues_proofs_submitted` |
| Campus Event Attendance | `operations.event_check_ins` |

Inspectors use the same summary: selected range, current total, role breakdown / daily series for active users, and related operation counts. Comparison percentages are not shown.

---

## Chart behaviour

The approved Analytics screen uses metric cards and inspectors, not chart widgets. Daily series are summarised in the Active Users inspector as text so screen readers can use them. Zero and missing series do not crash the page.

---

## CSRF

Mutations use shared `apiRequest`: `credentials: "include"` and automatic `X-CSRF-Token`. Mark-read is the only Admin mutation in this step.

---

## Race handling

- Mark-read is keyed by notification ID; duplicate clicks share one lock.
- Optimistic unread → read rolls back on failure.
- Analytics range changes abort the previous request and ignore stale responses.
- Feedback listing aborts in-flight directory fetches on refresh.

---

## Error states

Independent per workspace:

- 401 → session expired via `reportAuthFailure`
- 403 → no-access empty directory
- 404 → stale notification removed from the list
- 429 → wait-and-retry copy
- 500/network → Retry, filters preserved, no false success

---

## Mock / integrated separation

`VITE_ONECLUB_MODE=mock` keeps deterministic local records.

Integrated mode never falls back to those mocks. Source markers:

- `data-notifications-source="integrated"`
- `data-feedback-source="integrated"`
- `data-analytics-source="integrated"`

---

## Tests / results

- Frontend unit tests: 45 passed
- Frontend typecheck, lint (0 errors), and production build: passed
- Backend targeted notifications / communications / analytics / CSRF tests: 57 passed
- Full backend suite: 368 passed
- Playwright: 91 passed (`notifications.spec.ts`, `feedback.spec.ts`, `analytics.spec.ts` plus existing Admin specs), workers=1

---

## Known limitations

- Notifications have no stored deep-link URL, mark-unread, mark-all-read, or delete.
- Feedback status cannot be changed from Admin because the approved UI is read-only and no mutation API exists.
- Feedback list is not paginated by the backend; the Admin directory loads the full inbox and filters client-side.
- Analytics has no club breakdown, membership totals, proposal totals, or comparison trends in the API response.
- `POST /analytics/activity` is unused.
- Admin Activity Log and remaining Admin Home cards remain mock/unconnected.

---

## Remaining Feedback Manager remnants

- Database enum value `feedback_manager` (do not remove in this task)
- RLS policy in `0046_feedback_manager_role.sql`
- `portalAccess.APP_ROLES` still lists the historical role
- Campus One auth continues to demote it to student
- Admin People still cannot assign it

The application service no longer lists the global inbox for that role.

---

## Staging requirements

- Admin Campus One session with `effective_role = admin`
- At least one notification row for that Admin profile
- Optional unread (`read_at` null) row to exercise mark-read
- Optional `event_feedback` rows with club and submitter profiles
- Usage analytics tables populated enough to show non-zero and zero windows
