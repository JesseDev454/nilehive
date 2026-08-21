# OneClub STEP 3H — Admin Home, Activity Log, Profile, and More

**Status:** implemented on `codex/oneclub-functional-integration`.

This document records how Admin Home, Admin Activity Log, Admin Profile, and Admin More were connected to live backend data. This is the final Admin implementation step before the complete Admin E2E and staging-verification phase.

Feedback Manager was not restored. Admin Tasks were not added. Production and `main` were not changed.

No secrets, tokens, raw private audit metadata, or real student records are included.

---

## Files changed

Frontend:

- `frontend/src/lib/api/dashboard.ts` — Admin operations dashboard and nav-counts
- `frontend/src/lib/api/audit.ts` — Admin audit-log list
- `frontend/src/lib/dashboard/*` — types, adapters, errors, mocks, Home hook
- `frontend/src/lib/audit/*` — types, adapters, errors, mocks, Activity hook
- `frontend/src/lib/admin/opsStore.ts` — shared Admin nav-count invalidation
- `frontend/src/components/AdminHomeView.tsx`
- `frontend/src/components/admin/AdminHomeHeader.tsx`
- `frontend/src/components/admin/AdminAttentionGrid.tsx`
- `frontend/src/components/admin/AdminRecentActivity.tsx`
- `frontend/src/components/admin/AdminRecordDetailModal.tsx`
- `frontend/src/components/admin/activity/*`
- `frontend/src/components/admin/profile/*`
- `frontend/src/components/admin/more/AdminMoreCard.tsx`
- `frontend/src/data/adminMoreData.ts`
- `frontend/src/data/adminProfileData.ts`
- `frontend/src/lib/workspaceRoutes.ts` — `/admin/activity`
- `frontend/src/lib/notifications/deepLinks.ts`
- `frontend/src/app/App.tsx`
- `frontend/src/app/WorkspaceShell.tsx`
- `frontend/src/styles/global.css`
- `frontend/src/components/admin/approvals/useAdminApprovalsData.ts`
- `frontend/src/components/admin/notifications/useAdminNotificationsData.ts`
- `frontend/scripts/run-unit-tests.mjs`
- `tests/e2e/home.spec.ts`
- `tests/e2e/activity.spec.ts`
- `tests/e2e/auth.spec.ts`
- `tests/e2e/helpers.ts`
- `playwright.config.ts`

Backend:

- `backend/src/shared/auditRedaction.js`
- `backend/src/modules/admin-audit-logs/*`
- `backend/src/config/db.js` — `listAuditLogs`
- `backend/src/app.js` — `GET /api/v1/admin/audit-logs`
- `backend/src/modules/dashboard/dashboard.service.js` — `membership_requests` nav-count
- `backend/tests/admin-audit-logs.test.js`
- `backend/tests/audit-redaction.test.js`
- `backend/tests/dashboard.test.js`

---

## Dashboard endpoints

| Method | Path | Access |
|--------|------|--------|
| GET | `/api/v1/dashboard/admin-operations` | Admin only |
| GET | `/api/v1/dashboard/nav-counts` | Authenticated; Admin receives operational counts |

Envelope: `{ data: … }`.

Admin operations fields used by Home:

- `generated_at`
- `summary.total_clubs`
- `summary.pending_admin_proposals`
- `summary.pending_membership_requests`
- `summary.submitted_dues_payments`
- `summary.missing_reports`
- `recent_activity` (real operational records, top 12; `task` items are omitted in the UI)
- `missing_reports[]` (capped at 10)

Not shown on Home, because they are not in the approved layout or would fabricate product claims:

- `club_health_score` / labels
- `dues_change_amount` and comparison percentages
- `open_tasks` / Admin Tasks
- invented user-growth trends

---

## Home data mapping

| UI | Backend field |
|----|----------------|
| Greeting | Authenticated `full_name` |
| Club count copy | `summary.total_clubs` |
| Last updated | `generated_at` formatted in Africa/Lagos |
| Proposals waiting | `pending_admin_proposals` |
| Join requests waiting | `pending_membership_requests` |
| Proofs waiting | `submitted_dues_payments` |
| Reports card | `missing_reports` |
| Recent activity | `recent_activity` excluding `task` |
| Create announcement | Reuses the Step 3F composer (`publishAdminAnnouncement` + CSRF) |

Integrated mode never falls back to mock Home records.

---

## Summary cards / attention queue

The approved Home has four attention cards, not a separate metric-card row.

| Card | Destination |
|------|-------------|
| Proposals waiting | `/admin/approvals` |
| Join requests waiting | `/admin/approvals` |
| Proofs waiting | `/admin/approvals` |
| Reports | `/admin/events` |

Inspect/action links are canonical Admin routes, not arbitrary backend URLs. Zero on all four cards shows “Nothing needs your attention”. Home no longer performs local mock approve/reject.

---

## Navigation-count behaviour

`GET /api/v1/dashboard/nav-counts` is fetched once in `WorkspaceShell` for both desktop rail and mobile navigation.

Admin badges:

- Notifications unread: `counts.notifications` (also mirrored into the existing unread store)
- Approvals waiting: `final_review + membership_requests + dues`

`tasks` is returned by the backend for Admin but is not displayed. There is no Admin Tasks destination.

Counts refresh after:

- successful Home load/refresh (`notifyAdminOpsChanged`)
- proposal, membership, and dues decisions
- notification mark-read

---

## Audit-log endpoint

```http
GET /api/v1/admin/audit-logs
```

Admin only. Authenticated session required. Read-only GET. Rate-limited. Cache-Control: no-store.

There is no POST/PATCH/DELETE mutation endpoint.

---

## Audit filters / pagination

Query parameters:

- `page`, `page_size` (max 50)
- `q` (action, entity_type, remarks; sanitized)
- `actor_id`, `action`, `entity_type`, `entity_id`, `club_id` (UUIDs)
- `date_from`, `date_to` (invalid ranges rejected)
- `sort=created_at`, `order=asc|desc`

Default: newest first, stable by `created_at` then `id`.

---

## Metadata-redaction behaviour

Redaction happens at API serialization only. Stored rows are not rewritten.

Case-insensitive recursive redaction of keys matching password, secret, token, authorization, cookie, session, csrf, code_verifier, authorization_code, client_secret, service_role, access_token, refresh_token, id_token, signed_url, proof_url, and storage_path.

Redacted values are `{ "redacted": true }`. Nested objects/arrays are walked with bounded depth and size. Malformed metadata becomes `{}`.

---

## Activity details

The details dialog shows actor, action, resource, club, timestamp, remarks, and safe metadata. Redacted fields display “Protected field”. IDs can be copied. Deleted/unavailable actors show honest wording. The UI has no delete, clear, edit, reassign, or replay controls.

---

## Profile data source

Integrated Admin Profile uses `/api/v1/profile/me` through `AuthContext` (`sessionProfile`, `portal_role`, `custom_roles`, `app_role`, `effective_role`, `account_status`).

Mock mode keeps the deterministic Directorate preview profile.

Missing optional fields, including department (not returned by `/profile/me`), show “Not provided.” Email is never fabricated from the display name.

---

## Campus One / OneClub separation

Campus One Identity (read-only): name, staff/student ID, email, portal user ID, account status, department.

OneClub access: `portal_role`, `app_role`, `effective_role`, `custom_roles`. There is no Edit Identity, Grant Admin, or Campus One role editor.

---

## Profile actions

- Copy staff/student ID and institutional email, with an accessible announcement
- Explicit Light / Dark only (`aria-pressed`; no System option)
- Sign out uses the connected CSRF-protected Campus One logout
- Session expiry follows the existing auth shell

---

## More destinations

Canonical Admin routes only:

- `/admin/events`
- `/admin/announcements`
- `/admin/notifications`
- `/admin/feedback`
- `/admin/analytics`
- `/admin/activity`
- `/admin/profile`

No unprefixed `/feedback` or `/profile`, no `/user-management`, no `/archive`, no `/admin/tasks`, and no Feedback Manager destination. Unknown Admin paths remain Not Found.

---

## Cross-workspace refresh behaviour

A small generation store (`notifyAdminOpsChanged`) triggers a shared nav-count refetch. Home refresh uses the dashboard endpoint. Announcement publication refreshes Home; it does not fabricate a Home metric. Club edits do not insert fake activity rows; Activity Log only shows backend audit records.

No hidden polling loop.

---

## Mock / integrated behaviour

`VITE_ONECLUB_MODE=mock` retains deterministic Home, Activity, and Profile data.

Integrated mode uses backend dashboard data, backend audit logs, and the authenticated profile. It never falls back to mock records and never treats the DEV role selector as authorization.

---

## Error / race handling

Home: 401 clears session; 403 no access; 429 Retry-After; 500/network Retry; abort on unmount/refresh.

Activity: 401/403 remove protected content; 400 invalid-filter feedback; 429 Retry-After; 500/network Retry with filters preserved.

Profile: missing optional fields do not crash; copy failures stay silent except for the accessible live region; logout follows existing safe behaviour.

---

## Permission boundaries

Only `effective_role = admin` may open `/admin/home`, `/admin/activity`, `/admin/profile`, and `/admin/more`.

Backend Admin access remains Campus One `portal_role === "admin"` or exact custom role `club_services_admin`, resolved to `effective_role = admin`.

Student, president, executive, advisor, and feedback_manager receive 403 on the audit-log list. Unauthenticated callers receive 401.

---

## Tests / results

Frontend (`frontend/`):

- `npm run typecheck` — passed
- `npm run lint` — passed (pre-existing warnings only)
- `node scripts/run-unit-tests.mjs` — 50/50 passed
- `npm run build` — passed

Backend (`backend/`):

- Targeted dashboard + audit-log + redaction tests — passed
- Full suite `npm test` — **380/380 passed**, 0 failed

Playwright (`npx playwright test --workers=1` from repo root):

- Full Admin e2e set: **103 tests**. First run 99 passed / 4 failed on locators (hidden `<option>` text, non-exact Home `aria-label`, loading heading substring).
- After locator and loading-copy fixes: Home + Activity **12/12 passed**. The other 91 tests had already passed in the full run and do not depend on those Activity/Home locator changes.

Browser verification:

- Playwright covered Admin Home and Activity on desktop and mobile, light and dark, with backend-shaped mocked payloads.
- A live authenticated session against a local API was not exercised in this step (no production mutation).

---

## Known limitations

- `/profile/me` does not return department or student_type, so Admin Profile shows “Not provided.” rather than inventing a directorate title.
- Dashboard `recent_activity` is operational (proposals, membership, dues, reports, feedback), not the audit-log table. The Activity Log is the audit source of truth.
- `club_name` is often null on non-proposal/membership dashboard activity items.
- Membership request decisions are not currently written to `audit_logs` (existing writer gap); they still change Home/nav counts.
- Nav-counts and the operations dashboard still load full collections in memory on the backend.
- No IP/user-agent is stored on audit rows.
- Export of the Activity Log is not available.

---

## Staging requirements

- Confirm dashboard counts against live pending proposals, membership requests, submitted dues, and missing reports.
- Confirm at least one audited mutation appears in `/admin/activity` with redacted metadata.
- Confirm Admin Profile shows the signed-in Campus One identity.
- Confirm More → Activity Log and Profile use `/admin` prefixes.
- Confirm wrong roles cannot open Admin Home or Activity Log.
- Do not mutate production.
