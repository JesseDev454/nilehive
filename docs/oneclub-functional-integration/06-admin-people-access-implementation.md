# OneClub STEP 3D — Admin People and access management

**Status:** implemented on `codex/oneclub-functional-integration`.

This document records how the existing Admin People workspace was connected to the live backend for:

1. User directory
2. Search, filters and pagination
3. Person details
4. OneClub role assignment
5. President and Executive club assignment
6. Advisor club assignments
7. Campus One identity as read-only information
8. Account-status display

Admin Clubs creation/editing, Events, Announcements, Notifications, Feedback, Analytics, Activity Log, and Admin Home were not connected. Feedback Manager was not restored. Admin Tasks were not added. Production and `main` were not changed.

No secret values, tokens, cookies, or real student data are included.

`docs/oneclub-functional-integration/03-session-and-route-implementation.md` was not present. Step 3A–3C behaviour was confirmed from `02-admin-auth-implementation-map.md`, `04-csrf-and-proposal-contract.md`, `05-admin-approvals-implementation.md`, and current source.

---

## Files changed

Frontend:

- `frontend/src/lib/api/people.ts` — typed People API functions
- `frontend/src/lib/people/*` — types, adapters, mock seeds, error mapping
- `frontend/src/components/admin/people/*` — connected directory, inspector, role dialog, queue states
- `frontend/scripts/run-unit-tests.mjs`

Backend:

- `backend/src/modules/admin-users/admin-users.service.js` — expose authorized identity fields already stored on `profiles`
- `backend/src/config/db.js` — People search `q` also matches institutional email
- `backend/tests/admin-users.test.js`
- `backend/tests/csrf.test.js`

Tests / docs:

- `tests/e2e/helpers.ts`
- `tests/e2e/people.spec.ts`
- `playwright.config.ts`
- `docs/oneclub-functional-integration/06-admin-people-access-implementation.md`

Unrelated ZIPs, `.claude/`, Stitch exports, and `__codex_tmp/` were not staged.

---

## Endpoints connected

```http
GET  /api/v1/admin/users?q=&role=&club_id=&page=&page_size=&sort=&order=
GET  /api/v1/admin/users/:profileId
POST /api/v1/admin/users/:profileId/role
POST /api/v1/admin/users/:profileId/advisor-assignment
GET  /api/v1/clubs
```

`GET /api/v1/clubs` is used only to populate assignment and filter options. Club create/edit remains outside this task.

Admin-only in `admin-users.service.js` (`actor.role === "admin"`). CSRF is required for cookie-authenticated mutations (Step 3B). There is no dedicated People rate-limit code; 429 is still handled if a gateway returns it.

---

## Request / response contracts

Pagination envelope:

```json
{ "data": { "items": [], "page": 1, "page_size": 20, "total": 0, "has_next": false } }
```

Allowed list sorts: `created_at`, `full_name`, `updated_at`. Directory uses `sort=full_name&order=asc&page_size=20`.

Search `q` matches `full_name`, `student_id`, and `email` server-side. Role filter uses `role`. Club filter uses `club_id` (the club UUID from `GET /clubs`). `account_status` is not a list query parameter.

Person record (formatted):

- Identity: `id`, `full_name`, `email`, `portal_user_id`, `student_id`, `department`, `student_type`
- OneClub: `role` / `app_role`, `club_id`, `club`, `advisor_assignments`, `requested_role`, `onboarding_status`
- Status: `account_status` (`active` or `suspended`)
- `portal_role` and `custom_roles` only for the signed-in Admin viewing themselves
- `effective_role` is the target’s `profiles.role`, except when the row is the signed-in Admin

Role update body:

```json
{ "role": "student" | "executive" | "president" | "advisor", "club_id": "uuid?", "remarks": "optional", "replace_existing_president": false }
```

Advisor assignment body:

```json
{ "club_id": "uuid", "remarks": "optional" }
```

Frontend functions: `listAdminUsers` / `listAdminUserViews`, `getAdminUser` / `getAdminUserView`, `assignOneClubRole`, `updateAdvisorAssignment`, `listClubsForAssignment`. They use the shared `apiRequest` client.

---

## Status transitions

- `student` / `advisor` → `president` or `executive` requires a valid `club_id`
- `president` on a club that already has a president → `409 PRESIDENT_ALREADY_EXISTS` unless `replace_existing_president: true` (incumbent is demoted to `student`)
- Changing away from `advisor` clears `club_advisors` rows
- Advisor assignment adds one club, sets `role=advisor`, and records `profiles.club_id` as that club
- Duplicate advisor club → `409 ADVISOR_ALREADY_ASSIGNED`
- There is no unassign-advisor endpoint

Assignable OneClub roles: `student`, `president`, `executive`, `advisor`.

Rejected: `admin`, `feedback_manager`, `club_services_admin`.

---

## Campus One versus OneClub ownership

Campus One (read-only in People):

- Name, email, Campus One user ID (`portal_user_id`), student/staff ID, department, student type, account status
- Portal role and custom roles, when the backend returns them for the current actor only

OneClub (mutable through People):

- Application role
- President/Executive `club_id`
- Advisor many-to-many assignments

Faculty is not stored on `profiles` and is shown as “Not provided”. Executive titles are not stored and are preview-only in mock mode.

---

## Account-status behaviour

`account_status` is displayed. There is no suspend, reactivate, invite, reset, or force-logout endpoint. The inspector states that account status is managed through Campus One. No fake mutation is sent.

---

## Session-effect timing

Each authenticated request reloads `profiles.role` and recalculates `effective_role`. A OneClub role change therefore applies on the person’s next OneClub request. The UI says the role applies the next time they use OneClub. It does not claim they must sign in again, and it does not terminate another session. Campus One admin access (`club_services_admin`) remains in the Campus One session and cannot be granted here.

---

## CSRF, duplicate and error handling

Mutations use automatic `X-CSRF-Token` from Step 3B. Components do not attach tokens.

Mutation locks are keyed by profile ID. Unrelated rows stay enabled. The dialog cannot close during save. Decisions are not optimistic.

401 clears session. 403 removes protected rows. 404 treats the person as gone and refreshes the directory. 409 president conflict keeps the dialog and shows replacement confirmation. 429 respects `Retry-After`. 500/network preserve form selections.

---

## Control classification

| Control | Class |
|---|---|
| Search | CONNECTED (`q`) |
| Role filter | CONNECTED (`role`) |
| Club filter | CONNECTED (`club_id` from `GET /clubs`) |
| Pagination | CONNECTED |
| Person inspect | CONNECTED |
| Assign role | CONNECTED |
| President/Executive club | CONNECTED (`club_id`) |
| Advisor add club | CONNECTED (`/advisor-assignment`) |
| Advisor remove club | DISABLED_PENDING_BACKEND — no unassign endpoint |
| Executive title | UI_ONLY in mock; hidden in integrated mode |
| Account status | READ_ONLY |
| Suspend / invite / reset | not present; not connected |

---

## Mock versus integrated

`VITE_ONECLUB_MODE=mock` keeps deterministic local records. Integrated mode loads and mutates the backend only. Development diagnostic: `data-people-source="integrated"`.

---

## Known limitations

- Admin Home counts remain mock.
- Faculty is not returned.
- `portal_role` / `custom_roles` are not stored per other users.
- Club filter matches `profiles.club_id`, not every advisor assignment.
- Advisor clubs can be added, not removed.
- Executive title is not persisted.
- Membership counts are not returned.
- Search does not query club name server-side.
- No new People rate-limit was added.

## Tests and results

Frontend:

- `npm run typecheck` passed
- `npm run lint` passed (0 errors; existing warnings only)
- `npm run build` passed
- `npm test` (`scripts/run-unit-tests.mjs`) 28/28
- Playwright `tests/e2e/{smoke,auth,approvals,people}.spec.ts` 38/38 (`--workers=1`; desktop/mobile light/dark People included)

Backend:

- Targeted admin-users, CSRF, clubs-read, and portal-access tests passed
- Full suite `npm test` 345/345

Browser verification used Playwright against the local Vite app with a mock session and mock API. No production traffic was sent.

Integrated staging needs at least:

- several Campus One-linked profiles across student, president, executive, and advisor
- one club with an existing president (to exercise replacement confirmation)
- one advisor with at least one `club_advisors` row

Do not run these mutations against production.

## Rollback

Revert the Step 3D commit on `codex/oneclub-functional-integration`. The extra identity fields on the Admin user formatter are additive. Mock mode remains isolated for other Admin workspaces.
