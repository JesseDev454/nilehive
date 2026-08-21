# Step 3I — Admin E2E, staging verification, and release gate

This document records the Admin functional-integration release gate. It is not a production-go-live certificate. A mocked Playwright pass does not prove staging. Production and `main` were not touched.

## Commits tested

Local verification was run on the Step 3I working tree before the gate commit. After push, the GitHub commit for this step is:

```text
test(admin): complete end-to-end staging gate
```

on `codex/oneclub-functional-integration`. Starting commit was `5884af68832e2438c5355d15ebf9c5240547a950` (Step 3H).

## Environment tested

| Layer | Target |
|---|---|
| Local / PR | Mocked Campus One session, backend-shaped `/api/v1` responses, Vite `VITE_ONECLUB_MODE=integrated` |
| Backend unit | Node test runner against in-memory fakes |
| Staging workflow | GitHub Environment `staging`; deployed frontend + Render backend + isolated staging Supabase |
| Production | Not used |

Documented staging variable names (values never printed):

- `E2E_STAGING_BASE_URL`
- `E2E_STAGING_API_BASE_URL`
- `E2E_STAGING_PROJECT_REF`
- `E2E_STAGING_STORAGE_BUCKETS`
- `E2E_STAGING_SUPABASE_URL`
- `E2E_STAGING_SUPABASE_SERVICE_ROLE_KEY`
- `E2E_STAGING_ACTORS_JSON`
- `E2E_STAGING_AUTH_BRIDGE_SECRET`
- `E2E_STAGING_ENABLED`
- `E2E_STAGING_ALLOW_RESET`
- `E2E_STAGING_ENABLE_MUTATIONS`
- `E2E_STAGING_RUN_ID`

Password-style `E2E_STAGING_*_EMAIL` / `*_PASSWORD` variables are not required. The suite uses the staging session bridge, not interactive Campus One MFA.

Safety checks in `backend/scripts/e2e-staging.js`:

- Refuses to run unless `E2E_STAGING_ENABLED=true` and `E2E_STAGING_ALLOW_RESET=reset-e2e-staging`
- Requires project-ref match against the staging Supabase hostname
- Refuses known production hosts (`clubs.campusone.com.ng`, `clubs-api.campusone.com.ng`, `auth.campusone.com.ng`)
- Deletes only `e2e+` profiles’ related rows and `E2E-` clubs
- Does not require a Feedback Manager actor

The staging session bridge remains unavailable unless `APP_ENV=staging` and `E2E_STAGING_AUTH_BRIDGE_ENABLED=true`. Production reports 404 for that route.

## Run ID / seed ID

CI sets `E2E_STAGING_RUN_ID=gh-<run_id>-<attempt>`. Local seed uses `run-<timestamp>` when unset. Seeded club codes are `E2E-<runId>-A|B|C`. Official 14 clubs are not modified.

## Account roles used

Product roles only:

- `admin`
- `student`
- `president`
- `executive`
- `advisor`

Feedback Manager is not seeded and is not required in `E2E_STAGING_ACTORS_JSON`.

## Route / action coverage matrix

Legend: **L** = local mocked Playwright, **B** = backend unit/API, **S** = staging Playwright (requires GitHub `staging` Environment).

| Route | Screen | Control | Expected request | Expected response | Database result | Cross-workspace | Role | L | B | S | Known limitation |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `/login` | Campus One login | Continue | none until IdP | login UI | none | none | public | Y | Y | Y | CI uses bridge, not MFA |
| `/` | Role home | effective_role routing | `GET /profile/me` | Admin → `/admin/home` | none | landing | session | Y | Y | Y | |
| `/admin/home` | Home | Greeting + 4 counts | `GET /dashboard/admin-operations` | real counts | none | nav badges | admin | Y | Y | Y | counts load collections in memory |
| `/admin/home` | Home | Quiet state | same, zeros | “Nothing needs your attention” | none | none | admin | Y | Y | Y | |
| `/admin/home` | Home | Attention Inspect | client navigation | `/admin/approvals` or `/admin/events` | none | Approvals/Events | admin | Y | n/a | Y | |
| `/admin/home` | Home | Refresh | same GET | updated counts | none | nav | admin | Y | Y | Y | |
| `/admin/home` | Home | New announcement | same composer as Announcements | composer dialog | none | Announcements | admin | Y | Y | Y | |
| `/admin/home` | Home | 401/403/500/Retry | dashboard GET | session / no-access / retry | none | none | mixed | Y | Y | partial | 429 covered in unit |
| `/admin/approvals` | Proposals | Approve | `POST /proposals/admin/:id/decision` + CSRF | `approved` | proposal + audit + notifications | Home count down | admin | Y | Y | Y | |
| `/admin/approvals` | Proposals | Reject + remarks | same, `decision=reject` | `admin_rejected` | proposal + audit | President-visible status | admin | Y | Y | Y | |
| `/admin/approvals` | Membership | Approve / reject | `POST /membership-requests/:id/decision` + CSRF | active / rejected | membership + dues + **audit** | Home count | admin | Y | Y | Y | audit write added in 3I |
| `/admin/approvals` | Dues | Verify / reject | `POST /dues/:id/review` + CSRF | paid / rejected | due_payments + audit | Home count | admin | Y | Y | Y | |
| `/admin/approvals` | All queues | 401/403/404/409/429/500 | as above | normalized errors | none | none | mixed | Y | Y | partial | duplicate-click covered locally |
| `/admin/people` | Directory | Search / filter / details | `GET /admin/users` | paginated users | none | none | admin | Y | Y | Y | |
| `/admin/people` | Inspector | Role + club assignment | `PATCH /admin/users/:id` + CSRF | persisted role | profiles + audit | Clubs leadership | admin | Y | Y | restore via seed | Admin / Feedback Manager not assignable |
| `/admin/people` | Inspector | Advisor assignment | `POST /admin/users/:id/advisor-assignments` + CSRF | assignment | club_advisors + audit | Clubs | admin | Y | Y | restore via seed | |
| `/admin/people` | Inspector | President conflict | same PATCH | 409 | unchanged | none | admin | Y | Y | Y | |
| `/admin/clubs` | Directory | Search / category / details | `GET /clubs` | official 14 + E2E | none | none | admin | Y | Y | Y | E2E clubs extra in staging |
| `/admin/clubs` | Settings | Public signup / dues | `PATCH /clubs/:id` + CSRF | persisted | clubs + audit | Discover | admin | Y | Y | restore via seed | |
| `/admin/clubs` | Unsupported | Create / archive / delete / logo | none | inactive | none | none | admin | Y | n/a | Y | |
| `/admin/events` | Directory | Search / details / rosters | `GET /events` family | event id = proposal id | none | none | admin | Y | Y | Y | |
| `/admin/events` | Attendance | Manual check-in | `POST /events/:id/attendance` + CSRF | idempotent | event_attendance | Engagement | admin | Y | Y | Y | Student QR scan is Student work |
| `/admin/events` | QR | Organizer QR | generate URL only | no secret persistence | none | none | admin | Y | Y | Y | |
| `/admin/announcements` | Directory | Filters / details | `GET /communications/announcements` | live list | none | Notifications fan-out | admin | Y | Y | Y | |
| `/admin/announcements` | Publish | all users / clubs / role | `POST /communications/announcements` + CSRF | one create | announcements + notifications + audit | Home composer | admin | Y | Y | mutations flag | titles include run ID |
| `/admin/notifications` | Inbox | Unread / mark read | `GET /notifications`, `POST .../read` + CSRF | own rows only | notifications.read_at | nav badge | admin | Y | Y | Y | no mark-all/delete |
| `/admin/feedback` | Inbox | Filters / details | `GET /communications/feedback` | Admin-only list | none | none | admin | Y | Y | Y | read-only status |
| `/admin/analytics` | Dashboard | 7 / 30 / 90 | `GET /analytics?range=` | mapped series | none | none | admin | Y | Y | Y | no fabricated trends |
| `/admin/activity` | Audit log | Search / filters / details | `GET /admin/audit-logs` | newest first, redacted | none | none | admin | Y | Y | Y | immutable; no export |
| `/admin/profile` | Identity | Copy / theme / sign out | `GET /profile/me`, `POST /auth/campus-one/logout` + CSRF | read-only Campus One | session cleared | login | admin | Y | Y | Y | department/student_type often “Not provided.” |
| `/admin/more` | Launcher | Canonical destinations | client navigation | `/admin/*` only | none | all workspaces | admin | Y | n/a | Y | |
| `/admin/tasks` | Not Found | leftover Tasks | none | unavailable | none | none | admin | Y | n/a | Y | must stay absent |
| unknown Admin | Not Found | garbage path | none | unavailable | none | none | admin | Y | n/a | Y | |
| legacy aliases | Redirect | `/user-management` | none | `/admin/people` | none | People | admin | Y | n/a | n/a | local only |

No visible active Admin button is left without a local test. Staging mutation coverage runs only when `E2E_STAGING_ENABLE_MUTATIONS=true`.

## Local frontend results

- `npm run typecheck` — pass
- `npm run lint` — 0 errors (existing react-refresh warnings only)
- `npm test` — **50/50**
- `npm run build` — pass

## Full backend results

- Targeted Admin / CSRF / audit / membership / staging-bridge tests — pass
- Full suite — **381/381** (was 380; +1 membership audit regression)

## Full Admin Playwright results

- `npx playwright test --workers=1` — **109/109 passed** (8.6m)
- Includes Home, Approvals, People, Clubs, Events, Announcements, Notifications, Feedback, Analytics, Activity, Profile, More, auth, smoke
- Desktop + 390×844 light/dark checks on primary Admin routes

## Staging workflow

Workflow: `.github/workflows/staging-e2e.yml`  
Trigger: `workflow_dispatch` and nightly `30 2 * * *`  
Environment: `staging`  
Concurrency group: `clubly-staging-e2e` (serial; does not cancel in-progress)

URL after dispatch is recorded in the GitHub Actions run for this branch. Secrets are referenced by name only.

## Staging run result

Recorded after the post-push workflow dispatch. If GitHub Environment secrets, Vercel Deployment Protection, or Render lag block the run, that exact blocker is listed in the final Step 3I response and this gate is **not** marked “ready for production.”

## Campus One / session result

- Local: `effective_role=admin` via mocked `/profile/me`; student/president/executive/advisor denied Admin routes; expired session and suspended account screens covered
- Bridge: `POST /api/v1/auth/e2e/staging-session` requires staging env + secret + `e2e+` / allow-listed profile; production → 404
- `club_services_admin` remains the custom-role Admin grant; `unit_admin`, `app_role=admin` alone, and Feedback Manager do not grant Admin (auth map from Step 3A)
- CI does not depend on interactive Campus One MFA

## Direct API permission matrix

Covered in backend tests plus staging `admin-mutations.spec.ts`:

| Family | Unauth | Student | President | Executive | Advisor | Admin | Missing CSRF | Notes |
|---|---|---|---|---|---|---|---|---|
| Approvals | 401 | 403 | 403 | 403 | 403 | 200 | rejected | stale → 409 |
| People | 401 | 403 | 403 | 403 | 403 | 200 | rejected | president conflict 409 |
| Clubs (admin edits) | 401 | 403 | 403 | 403 | 403 | 200 | rejected | duplicate 409 |
| Events / attendance | 401 | 403 Admin UI | scoped | scoped | scoped | 200 | rejected | duplicate attendance idempotent |
| Announcements | 401 | 403 publish | 403 | 403 | 403 | 200 | rejected | invalid audience 400 |
| Notification mark-read | 401 | own only | own only | own only | own only | own only | rejected | non-owned 404 |
| Feedback inbox | 401 | 403 | 403 | 403 | 403 | 200 | n/a GET | Feedback Manager 403 |
| Analytics | 401 | 403 | 403 | 403 | 403 | 200 | n/a GET | |
| Audit logs | 401 | 403 | 403 | 403 | 403 | 200 | n/a GET | POST 404; secrets redacted |

## CSRF result

Mutations continue to require a valid `X-CSRF-Token` plus Origin validation (Step 3B). Staging mutation probe without CSRF is rejected. Local Playwright asserts the token on Admin writes. No CSRF token is placed in URLs.

## Responsive / theme result

- Laptop + large desktop via Chromium desktop project
- Mobile 390×844 (local) and Pixel 7 (staging mobile spec)
- Light and dark on all primary Admin routes
- Theme toggle on Profile uses `aria-pressed`; no System option

## Accessibility result

Automated Playwright uses roles, labels, and headings. Skip link exists in `WorkspaceShell`. Dialogs use Radix focus trap. Status is not color-only on approvals/activity. Charts have text metric inspectors. Remaining P2: no dedicated axe CI job.

## Console / network / privacy result

Local suite fails on unexpected UI errors and mock fallbacks (`data-*-source='integrated'`). Artifacts are failure-only traces/screenshots. Seed metadata may contain a placeholder nested token solely to prove API redaction; the API must not return the raw value. Do not attach real student records, receipt URLs, QR tokens, cookies, or CSRF tokens to this document.

## Performance smoke result

No destructive load test was run.

Known limitation (not P0/P1 at current staging scale): `GET /dashboard/admin-operations` and `GET /dashboard/nav-counts` still load full collections in memory. Representative local/backend responses for dashboard, nav-counts, clubs, and paginated audit (`page_size` max 50) completed without timeout. A broad analytics rewrite was not performed.

## Defects found and fixed

1. **Membership decisions wrote no audit rows** (security-relevant). Added `membership_request_reviewed` audit writes on approve and reject, Activity label, backend + frontend regression tests.
2. **Staging Playwright suite and scripts were missing** after the OneClub frontend rebuild. Restored `frontend/tests/staging/*`, `playwright.staging.config.ts`, and npm scripts. Workflow now installs root Playwright and runs from the repository root.
3. **Seed required Feedback Manager and did not create Admin-gate records.** Product roles only; three `E2E-` clubs; pending Admin proposal; pending membership + submitted dues; approved event; RSVP; attendance; announcement; unread Admin notification; feedback; audit row. Production hosts refused.
4. **Profile and More lacked dedicated local E2E.** Added `tests/e2e/profile.spec.ts` and `tests/e2e/more.spec.ts`.

## Open P2 / P3 limitations

- Dashboard / nav-counts still load full tables in memory (P2)
- Membership audit was missing historically; now written, but older production rows remain unaudited (P3)
- `/profile/me` has no department / student_type → “Not provided.” (P3)
- Home “recent activity” is the dashboard operational feed, not `audit_logs` (P3)
- Activity Log has no export (P3)
- No axe CI job (P2)
- Real Campus One IdP MFA smoke is manual and not part of CI (P3)
- Staging mutation suite is serial and depends on GitHub Environment secrets (operational, not a product defect)

## P0 / P1 count

- Open P0: **0**
- Open P1: **0**

## Final Admin gate decision

**Local Admin gate: PASS** (zero open P0/P1; typecheck/lint/unit/build; backend 381/381; Playwright 109/109).

**Staging Admin gate:** recorded from the GitHub Actions dispatch after this commit is pushed. Do not treat mocked Playwright as staging proof. Do not mark “ready for production” until that run is green or an exact external blocker is documented.

**Not started:** President, Advisor, Student, or Executive frontend functional integration.

## Rollback considerations

- Revert the Step 3I commit on `codex/oneclub-functional-integration` if the membership audit write or seed expansion misbehaves in staging
- Seed/reset only touch `E2E-` clubs and `e2e+` profiles
- Seeded join-request members use `membership_status=inactive` (the enum has no `pending` value)
- Do not roll back by mutating production

## Next recommended role

President (proposal creation and club-scoped operations), after this Admin gate is accepted.
