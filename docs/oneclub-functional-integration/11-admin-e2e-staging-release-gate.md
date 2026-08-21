# Step 3I — Admin E2E, staging verification, and release gate

This document records the Admin functional-integration release gate. It is not a production-go-live certificate. A mocked Playwright pass does not prove staging. Production and `main` were not touched.

## Commits tested

Local verification was run on the Step 3I working tree before the gate commit. After push, the GitHub commit for this step is:

```text
test(admin): complete end-to-end staging gate
```

on `codex/oneclub-functional-integration`. Starting commit was `5884af68832e2438c5355d15ebf9c5240547a950` (Step 3H).

Gate commits:

- `c36c0717fe5da2c056922a184724610737845a36` — `test(admin): complete end-to-end staging gate`
- `ece6218739a039eb810361f2fffdbd15c871978b` — seed membership_status fix
- `fcb2d387338f2c8bb385f315ff977c13f33a462f` — seed proposal responsible_members fix
- follow-up commit on this branch — staging environment probes and blocker reporting

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

CI sets `E2E_STAGING_RUN_ID=gh-<run_id>-<attempt>`. The successful seed used `gh-32489829536-1`. Local seed uses `run-<timestamp>` when unset. Seeded club codes are `E2E-<runId>-A|B|C`. Official 14 clubs are not modified.

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

## Step 3J — Staging deploy attempt (2026-08-21)

Repository HEAD remained `ee1fc940e8d895cc21fc9331e8cd47ec8ffd7b50` on `codex/oneclub-functional-integration`, matching origin. No unexpected tracked modifications. Local 3I results were not re-run; they already passed.

### Identified staging frontend (Vercel)

| Field | Value |
|---|---|
| Project used by GitHub `E2E_STAGING_BASE_URL` | `nilehive-615d` |
| Stable non-production URL | `https://nilehive-615d.vercel.app` |
| Frontend root / install / build / output | repo root; `npm --prefix frontend install`; `npm --prefix frontend run build`; `frontend/dist` (`vercel.json`) |
| Staging API rewrite | `/api/:path*` → `https://nilehive-test.onrender.com/api/:path*` |
| API base URL variable (frontend) | `VITE_API_BASE_URL` (browser still uses same-origin `/api` via the rewrite) |
| Deployment Protection | **Preview deployments: yes** (Vercel SSO login). **Stable `nilehive-615d.vercel.app` alias: no** (public Clubly page) |
| Resulting type | Vercel **Production** environment of the *staging* project `nilehive-615d`, not `clubs.campusone.com.ng` |
| Last Production SHA for `nilehive-615d` | `66091d851cc9a92897fd86ffa363b37c77fd5931` (2026-08-13, “Fix Campus One custom role resolution”) — **before** `77ca764` OneClub UI rebuild |
| Auto preview for this branch | `https://nilehive-615d-q8nt92n1g-jesses-projects-ad8e7086.vercel.app` at `ee1fc94` — **SSO-protected**, not usable by GitHub Actions |
| Separate project | `nilehive` also received a protected preview; do not promote that project (likely production) |

Stable URL still returns HTTP 200 with `<title>Clubly</title>` and Clubly metadata. It does not show “Continue with Campus One”.

This workspace has **no Vercel CLI login and no `VERCEL_TOKEN`**. `vercel --prod` was not used. Staging GitHub secrets include no `VERCEL_AUTOMATION_BYPASS` name.

**Required dashboard action (staging project only):** in Vercel project `nilehive-615d`, promote the existing preview for `ee1fc94` to that project’s Production alias (`nilehive-615d.vercel.app`), or set that project’s Production Branch to `codex/oneclub-functional-integration` and redeploy. Do not change project `nilehive` or `clubs.campusone.com.ng`. Do not disable Deployment Protection globally; keep the stable staging alias public so CI can run, as it already is.

### Identified staging backend (Render)

| Field | Value |
|---|---|
| Public service host | `nilehive-test.onrender.com` |
| Health payload `service` | `nilehive-backend` |
| Root / build / start / health | `backend`; `npm install`; `npm start`; `/api/v1/ready` (`render.yaml`) |
| Deployed commit | **not this branch** (audit-logs missing) |

Read-only probes after wake-up:

- `GET /api/v1/ready` → 200, database reachable
- `GET /api/v1/profile/me` → **401** (route exists)
- `GET /api/v1/auth/campus-one/login` → 200 body `CAMPUS_ONE_NOT_CONFIGURED` (route exists; OIDC not configured on this service)
- `GET /api/v1/admin/audit-logs` → **404** (route still absent)
- `POST /api/v1/auth/e2e/staging-session` → route exists (not 404)
- CORS `Origin: https://nilehive-615d.vercel.app` → `access-control-allow-origin` echoes that origin; `access-control-allow-credentials: true`

This workspace has **no Render CLI and no Render API token**. Production Render was not modified.

**Required dashboard action (staging service only):** on the Render web service that serves `nilehive-test.onrender.com`, set the Git branch to `codex/oneclub-functional-integration` (commit `ee1fc94`) and manually deploy. Keep `APP_ENV=staging` and the existing staging bridge flags. Do not change the production API service or `clubs-api.campusone.com.ng`. After deploy, unauthenticated `GET /api/v1/admin/audit-logs` must become **401**, not 404.

### Alignment

- Frontend rewrite already targets staging Render.
- Staging Render already allows the staging Vercel origin.
- Staging Supabase seed/reset already succeeds and refuses production hosts.
- Campus One callback / OIDC on this Render service currently reports `CAMPUS_ONE_NOT_CONFIGURED`. CI uses the staging session bridge, not interactive MFA. Do not change production Campus One apps. If staging OIDC must be configured later, that is a separate non-production dashboard change.

### Workflow not re-run

GitHub Actions was **not** dispatched again: the deployed frontend and backend are still the stale services that failed run `32489829536`. Re-running would repeat that failure. No tag `oneclub-admin-integration-v1` was created.

Production and `main` were not touched.

## Staging run result (Step 3I)

Dispatched after push from `codex/oneclub-functional-integration`.

| Run | Result |
|---|---|
| https://github.com/JesseDev454/nilehive/actions/runs/32489240789 | Seed failed: invalid `membership_status=pending` (fixed) |
| https://github.com/JesseDev454/nilehive/actions/runs/32489509912 | Seed failed: proposal `responsible_members` 9-digit check (fixed) |
| https://github.com/JesseDev454/nilehive/actions/runs/32489829536 | Seed passed (`E2E_STAGING_RUN_ID=gh-32489829536-1`). Playwright failed |

Exact staging blockers (not hidden by mocked fallbacks):

1. **Staging Vercel frontend is still Clubly.** `E2E_STAGING_BASE_URL` served the leftover Clubly “Access Portal / Sign In / Create an account” login, not OneClub “Continue with Campus One”. Session-bridge UI tests therefore remained on `/login`. This is not Vercel Deployment Protection; the page loaded publicly.
2. **Staging Render backend has not been deployed from this branch.** `GET /api/v1/admin/audit-logs` on `E2E_STAGING_API_BASE_URL` returned 404, so Step 3H/3I Admin APIs are not live there yet.

GitHub `staging` secrets/variables are present (reset + seed succeeded). Production was not used as a substitute.

**Staging Admin gate: BLOCKED** until the dashboard actions in Step 3J are completed. Local Admin gate remains PASS.

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

**Staging Admin gate: BLOCKED (Step 3J).** Vercel project `nilehive-615d` Production alias still serves Clubly at `66091d8`. Render `nilehive-test.onrender.com` still 404s audit-logs. This agent cannot promote those services (no Vercel/Render credentials). Local Admin gate remains PASS. Do not mark “ready for production.” No `oneclub-admin-integration-v1` tag.

**Not started:** President, Advisor, Student, or Executive frontend functional integration.

## Rollback considerations

- Revert the Step 3I commit on `codex/oneclub-functional-integration` if the membership audit write or seed expansion misbehaves in staging
- Seed/reset only touch `E2E-` clubs and `e2e+` profiles
- Seeded join-request members use `membership_status=inactive` (the enum has no `pending` value)
- Do not roll back by mutating production

## Next recommended role

President (proposal creation and club-scoped operations), after this Admin gate is accepted.
