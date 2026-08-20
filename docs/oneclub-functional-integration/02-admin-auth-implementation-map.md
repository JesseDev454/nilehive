# OneClub STEP 2 — Admin + shared-auth implementation map

**Status:** evidence-based audit only. No API wiring and no behaviour changes were made.

| Field | Value |
|---|---|
| Repository | `C:\Users\goodl\Documents\NileHive` |
| GitHub | https://github.com/JesseDev454/nilehive |
| Approved UI baseline | tag `oneclub-ui-preview-v1` → `d1df55d1c20d785f3e3f5f3fc27cee3a699be26c` |
| Integration branch | `codex/oneclub-functional-integration` (remote hash `d1df55d1c20d785f3e3f5f3fc27cee3a699be26c`) |
| Working tree at audit | same commit `d1df55d` |
| Product | OneClub (Nile University club management) |
| Roles in scope | Student, President, Executive, Advisor, Club Services Admin |
| Removed | Feedback Manager (must not be restored) |
| Official clubs | 14 names from `backend/supabase/bootstrap_clubs.sql` |

**Branch checkout note:** `git switch codex/oneclub-functional-integration` failed locally with `unable to update HEAD` because `.git/HEAD` has inherited DENY-write ACLs for sandbox identities. The integration branch ref and the current tree both point at `d1df55d`. No merge of `main` was performed. Untracked ZIP / Stitch / prompt files were not staged.

**Vercel Preview:** https://nilehive-psgo7bi33-jesses-projects-ad8e7086.vercel.app is SSO-protected. This audit used source + local frontend. Deployment Protection was not changed.

---

## 0. How to read this map

Capability labels (exact):

| Label | Meaning |
|---|---|
| `SUPPORTED` | Backend endpoint + permission exist; UI can call them without inventing APIs |
| `SUPPORTED_BUT_RESPONSE_MISMATCH` | Endpoint exists, but mock UI fields/status names/payloads do not match |
| `SUPPORTED_BUT_PERMISSION_GAP` | Endpoint exists, but role rules differ from the product decision |
| `PARTIALLY_SUPPORTED` | Some of the UI outcome exists; a piece is missing |
| `BACKEND_MISSING` | No implemented endpoint for the UI outcome |
| `FRONTEND_MOCK_ONLY` | UI mutates local mock state; no HTTP client in `frontend/src` |
| `UI_ONLY` | Presentational / theme / navigation with no backend write |
| `REMOVE_FROM_UI` | Product forbids it, or it is leftover Clubly behaviour |
| `UNVERIFIED` | Not proven from this repository without live Campus One |

Priorities: `P0` safe large-scale use, `P1` core workflow, `P2` useful, `P3` optional.

**Global frontend fact:** `rg fetch\|axios\|supabase` under `frontend/src` returns **no matches**. Every Admin control below is currently `FRONTEND_MOCK_ONLY` or `UI_ONLY` until an API client is added. Backend columns describe what *should* be wired, not what the UI already calls.

**Global frontend auth fact:** `PreviewAuthProvider` (`frontend/src/contexts/AuthContext.tsx`) hardcodes a student mock profile and a no-op `signOut`. Role is the first path segment (`/admin/...`) or a DEV `<select>`. There is **no frontend route guard**. Backend `requireRole` / service checks independently enforce permissions **if** APIs are called with a session.

---

## 1. Authoritative answer

**For every shared authentication action and every visible Admin control:**

1. **What should happen** is defined by product decisions in this brief + `docs/oneclub-google-ai-studio-prompts/00-audit-and-capability-map.md` + `docs/CAMPUSONE_ADMIN_ROLE_TROUBLESHOOTING.md`.
2. **What currently supports it** is the backend at `backend/src` (OIDC, sessions, Admin endpoints, tests) plus the mock Admin UI at `frontend/src/components/admin` and `AdminHomeView.tsx`.
3. **What is missing** is the entire frontend session client, workspace selection from `effective_role`, Admin API wiring, CSRF protection, notification mark-read, and a `revisions_requested` proposal status (product intent vs actual enum).
4. **How it will be tested** is: keep existing `backend/tests/*` (OIDC, portal-access, admin-users, admin-decision, dues, membership-requests, analytics) and add frontend Playwright that uses the staging session bridge — not the current `tests/e2e/smoke.spec.ts`, which still expects a Clubly “Club Services” shell.

P0 before any large-scale Admin use:

| ID | Gap | Why it is P0 |
|---|---|---|
| P0-1 | Frontend has no Campus One login, callback, session cookie, or `GET /profile/me` | Anyone can open `/admin/*` in the preview; production would have no Admin session |
| P0-2 | Frontend route protection is visual only | Wrong URL prefix shows another role’s workspace |
| P0-3 | Keyword routing can open the wrong Admin screen | `/user-management` → Approvals; `/archive` → Events |
| P0-4 | Local `profiles.role = admin` still grants `effective_role = admin` | Conflicts with “Campus One custom role is the intended Admin grant”; still documented in troubleshooting |
| P0-5 | No CSRF on cookie-authenticated mutating APIs | Staging uses `SameSite=None` |
| P0-6 | Advisor reject remarks are not required in the API | Product requires remarks; `validateAdvisorDecisionPayload` allows `null` |
| P0-7 | Mock proposal status `pending_admin` ≠ API `pending_admin_review` | Wiring would send invalid filters/payloads |

---

## 2. Route and workspace inventory

Source: `frontend/src/app/App.tsx`. There is **no** `<Route path>` table. `WorkspaceRouter` uses `pathname.toLowerCase()` + `includes` / `startsWith`. Role comes from `roleFromPath` (first segment) else DEV `previewRole`.

### 2.1 Admin primary nav (desktop rail + mobile bar)

From `NAVIGATION.admin` in `App.tsx` and `WorkspaceShell.tsx`.

| Route | Component | Nav exposure | Mock data | Required role (intended) | Other-role behaviour today |
|---|---|---|---|---|---|
| `/admin/home` | `AdminHomeView` | Primary | inline queues in `AdminHomeView.tsx` | admin | Path `/student/...` never reaches this branch |
| `/admin/approvals` | `AdminApprovalsWorkspace` | Primary | `INITIAL_*` in workspace | admin | Same |
| `/admin/clubs` | `AdminClubsWorkspace` | Primary | `OFFICIAL_14_CLUBS_DATA` | admin | Same |
| `/admin/people` | `AdminPeopleWorkspace` | Primary | `INITIAL_CAMPUS_USERS` | admin | Same |
| `/admin/more` | `AdminMoreWorkspace` | Primary | `ADMIN_LAUNCHER_DESTINATIONS` | admin | Same |

Topbar (all roles): `/{role}/notifications`, theme toggle, `/{role}/profile`.

### 2.2 Admin More / direct destinations

`frontend/src/data/adminMoreData.ts` uses **unprefixed** URLs. With role `/admin`, `WorkspaceRouter` still matches keywords. **Without** `/admin` (if `previewRole` is student), the same URL renders the **student** workspace.

| Launcher URL | Intended Admin component | Keyword that wins under `/admin` | Risk if opened unprefixed |
|---|---|---|---|
| `/events` | `AdminEventsWorkspace` | `event` | Student Events |
| `/communications` | `AdminAnnouncementsWorkspace` | starts with `/communications` | Student Announcements |
| `/notifications` | `AdminNotificationsWorkspace` | `notification` | Student Notifications |
| `/feedback` | `AdminFeedbackWorkspace` | `feedback` | Student Feedback **submit** form |
| `/analytics` | `AdminAnalyticsWorkspace` | `analytics` | Student Home (no match) |
| `/profile` | `AdminProfileWorkspace` | `profile` | Student Profile |

Recommended later (do not change in this task): `/admin/events`, `/admin/announcements`, `/admin/notifications`, `/admin/feedback`, `/admin/analytics`, `/admin/profile`.

### 2.3 Shared system / auth screens

Exact paths only (`App.tsx` 192–194): `/system`, `/shared-screens`, `/admin/shared-screens` → `SharedScreensWorkspace` gallery. **Not** production routing.

Gallery ids in `frontend/src/components/shared/system/`: `campusone_login`, `campusone_callback`, `session_expired`, `account_suspended`, `unauthorized_role`, `not_found`, `offline_retry`, `recoverable_error`, `unsupported_domain`, `receipt_error`, `sign_out_dialog`, `skeletons_empty`. All callbacks are toasts. Classification: `FRONTEND_MOCK_ONLY`.

**Dead target:** Admin sign-out navigates to `/login`, which is **not** in `App.tsx`. Backend `getFrontendLoginUrl` also expects `{FRONTEND_APP_URL}/login`.

### 2.4 Routing defects (document only)

| Issue | Evidence | Classification |
|---|---|---|
| `/user-management` → Approvals, not People | `App.tsx` 177 before 178 | wrong workspace |
| `/dues` → Approvals | `App.tsx` 177 | no dedicated dues screen; tab lives inside Approvals |
| `/archive` → Admin Events | `App.tsx` 184 `includes("archive")` | Home attention `url: "/archive"` unused, would be Events if linked |
| `/admin/tasks` → Admin Home | no admin `task` branch | Tasks are president/executive only (`REMOVE_FROM_UI` for Admin) |
| Unprefixed More URLs | `adminMoreData.ts` | depends on current `previewRole` |
| Keyword `includes("club")` after `people` | `/admin/people` OK; `/admin/club-people` would be Clubs | fragile matcher |
| No 404 workspace | unknown `/admin/foo` → Home | missing `not_found` |
| Feedback Manager routes | none in frontend | already removed |
| Admin Tasks wording | none under `frontend/src/components/admin` | already absent |
| Legacy `frontend/src/lib/appNavigation.ts` | still has Clubly URLs (`/approvals`, `/user-management`) | unused by Admin More |

### 2.5 Duplicate / placeholder

| Item | Evidence |
|---|---|
| Two announcement composers | `AdminAnnouncementComposer.tsx` (Home) vs `AdminAnnouncementComposerDialog.tsx` (Announcements) |
| Home attention `url` field | set but never used by `AdminAttentionGrid` (only `onInspect`) |
| `hasError` / Retry Connection | UI exists; `hasError` never set true in `AdminHomeView` |
| Student profile overlay on Admin Profile | `AuthContext` always Amina Bello; Admin profile data is `DETERMINISTIC_ADMIN_PROFILE` |

---

## 3. Campus One and session audit

**Live Campus One login was not performed.** IdP behaviour is `UNVERIFIED`. Backend + tests are proven.

### 3.1 Eighteen steps

| # | Step | Frontend | Backend | Endpoint | Cookie | Env names (not values) | Errors | Tests | Gap |
|---|---|---|---|---|---|---|---|---|---|
| 1 | User opens OneClub | `App.tsx` `OneClubPreview` — no auth gate | — | — | — | — | — | none FE | P0: always preview |
| 2 | Choose Campus One sign-in | `CampusOneLoginScreen` toast only | — | should `GET /api/v1/auth/campus-one/login` | — | `FRONTEND_APP_URL` | — | none FE | `FRONTEND_MOCK_ONLY` |
| 3 | Frontend requests authorization | **missing client** | `createCampusOneAuthRouter` login | `GET /api/v1/auth/campus-one/login?return_to=` | sets `nilehive_oidc_state`, `_verifier`, `_nonce` | `CAMPUS_ONE_CLIENT_ID`, `CAMPUS_ONE_CLIENT_SECRET`, `CAMPUS_ONE_REDIRECT_URI`, `CAMPUS_ONE_SCOPES`, `CAMPUS_ONE_ISSUER`, `NODE_ENV`, `FRONTEND_APP_URL` | `CAMPUS_ONE_NOT_CONFIGURED` 500 | `campus-one-oidc-auth.test.js` | FE never calls it |
| 4 | Campus One redirects back | gallery `CampusOneCallbackScreen` | callback handler | `GET /api/v1/auth/campus-one/callback?code&state` | reads OIDC cookies | same | IdP `auth_error=cancelled\|failed` | OIDC tests | FE unused |
| 5 | Code exchange | — | `exchangeCodeForTokens` | POST `{ISSUER}/api/auth/oauth2/token` | — | `CAMPUS_ONE_*` | `CAMPUS_ONE_TOKEN_EXCHANGE_FAILED` | mocked | IdP `UNVERIFIED` |
| 6 | Verify ID token | — | `verifyCampusOneIdToken` | JWKS `{ISSUER}/api/auth/jwks` | — | `CAMPUS_ONE_CLIENT_ID`, `CAMPUS_ONE_ISSUER` | `INVALID_ID_TOKEN*`, `EXPIRED_ID_TOKEN`, `INVALID_OIDC_NONCE`, … | OIDC tests | — |
| 7 | `/userinfo` | — | `fetchCampusOneUserInfo` | GET `{ISSUER}/api/auth/oauth2/userinfo` | — | issuer | `CAMPUS_ONE_USERINFO_FAILED`, `CAMPUS_ONE_USERINFO_SUBJECT_MISMATCH` | OIDC L487+ | **Proven:** `sub` must match id_token |
| 8 | Subject match / profile link | — | `resolveCampusOneProfile` | DB | — | `CAMPUS_ONE_ENFORCE_EMAIL_DOMAIN` | `INVALID_CAMPUS_ONE_PROFILE`, `UNSUPPORTED_EMAIL_DOMAIN`, `CAMPUS_ONE_PROFILE_LINK_CONFLICT` | OIDC link tests | — |
| 9 | Role fields normalized | — | `getCampusOneCustomRoles` + `normalize*` in `portalAccess.js` | — | — | — | — | `portal-access.test.js` | — |
| 10 | Local OneClub role | — | `profiles.role` as `app_role` | — | — | — | — | profile tests | — |
| 11 | Effective role | — | `resolveEffectiveRole` | — | — | — | — | portal-access + OIDC admin override | See §3.2 |
| 12 | Session created | — | `createCampusOneSessionToken` | payload `profileId`, `portalUserId`, `portalRole`, `customRoles`, `email`, `iat`, `exp` | sets `nilehive_campus_one_session` | `CAMPUS_ONE_SESSION_SECRET` (fallback `CAMPUS_ONE_CLIENT_SECRET` / `SUPABASE_SERVICE_ROLE_KEY`) | — | OIDC | secret fallback risk |
| 13 | Cookie returned | — | `getSessionCookieOptions` | 302 `{FRONTEND_APP_URL}{returnTo}` | Path `/`; HttpOnly; Secure if prod **or** staging; SameSite `Lax` or staging `None`; Domain `.campusone.com.ng` when FE host matches | `NODE_ENV`, `APP_ENV`, `FRONTEND_APP_URL` | — | cookie domain tests | 7 days: `SESSION_MAX_AGE_SECONDS` |
| 14 | Frontend fetches profile | **missing** | `getMe` | `GET /api/v1/profile/me` | session | — | `AUTH_REQUIRED`, `INVALID_SESSION`, `SESSION_EXPIRED`, `PROFILE_NOT_FOUND`, `ACCOUNT_SUSPENDED` | `profile.test.js`, OIDC | P0 |
| 15 | Workspace selected | path prefix / DEV select | should use `effective_role` | — | — | — | — | none FE | P0 |
| 16 | Unauthorized routes rejected | **not implemented** | `requireRole` / service `FORBIDDEN` | protected APIs | — | — | 401/403 | many BE tests | FE visual only |
| 17 | Sign out | `AdminSignOutDialog` → no-op `signOut` → `/login` | `POST/GET /api/v1/auth/campus-one/logout` | clears session cookie only | `FRONTEND_APP_URL` | — | logout route has **no dedicated test file hit** in inventory | no RP-logout of Campus One SSO |
| 18 | Session expired | gallery screen only | `SESSION_EXPIRED` on API | — | — | 401 | OIDC/session tests | FE does not intercept 401 |

OIDC txn cookies: path `/api/v1/auth/campus-one`, Max-Age 600s, HttpOnly, Secure in production, SameSite Lax.

### 3.2 Role fields (proven)

`backend/src/shared/portalAccess.js`:

- `portal_role` ∈ `student | staff | admin` (else student)
- `app_role` ∈ `student | executive | president | advisor | admin | feedback_manager` (else student)
- `custom_roles` normalized lower-case unique array
- `club_services_admin` in custom roles **or** `portal_role === "admin"` → `effective_role = "admin"`
- Otherwise `effective_role = app_role`
- `accessPending` is **always `false`** (README “unassigned staff pending” is **not implemented**)

`req.user.role` after Campus One auth is **effective_role** (`backend/src/middleware/auth.js`). All `requireRole("admin")` checks use that.

**Product vs code:** `docs/CAMPUSONE_ADMIN_ROLE_TROUBLESHOOTING.md` states Admin is granted by Campus One `admin`, local `profiles.role = admin`, **or** `club_services_admin`. Code matches the troubleshooting doc. The STEP 2 brief says `club_services_admin` is the **intended** grant. Local `app_role=admin` remaining an elevation path is a **policy risk**, not an unproven guess.

Admin People API cannot assign `admin` or `feedback_manager` (`admin-users.validation.js` `APP_ROLES` = student/executive/president/advisor only).

### 3.3 CORS / CSRF / staging

| Topic | Evidence |
|---|---|
| CORS | `backend/src/app.js`: allowlist `FRONTEND_APP_URL` + `CORS_ALLOWED_ORIGINS`; credentials true; prod unknown Origin → `CORS_ORIGIN_BLOCKED` |
| CSRF | **None** (no token middleware) |
| Staging cookie | `SameSite=None; Secure` so Vercel FE can call Render API |
| Local without Campus One | `AUTH_PROVIDER=supabase` (Bearer JWT) or `portal`; tests use fake DB |
| E2E staging bridge | `POST /api/v1/auth/e2e/staging-session` when `APP_ENV=staging` + `E2E_STAGING_AUTH_BRIDGE_ENABLED` + `E2E_STAGING_AUTH_BRIDGE_SECRET`; 15-minute session. Tests: `e2e-staging-auth-bridge.test.js` |

Frontend `src` does **not** read `VITE_*`. Playwright `playwright.config.ts` still sets `VITE_ENABLE_E2E_AUTH`, `VITE_AUTH_PROVIDER`, `VITE_API_BASE_URL`, `VITE_SUPABASE_*` for a **previous** frontend.

### 3.4 Env var names (no values)

Auth/session: `AUTH_PROVIDER`, `CAMPUS_ONE_CLIENT_ID`, `CAMPUS_ONE_CLIENT_SECRET`, `CAMPUS_ONE_ISSUER`, `CAMPUS_ONE_REDIRECT_URI`, `CAMPUS_ONE_SCOPES`, `CAMPUS_ONE_SESSION_SECRET`, `CAMPUS_ONE_ENFORCE_EMAIL_DOMAIN`, `CAMPUS_ONE_WEBHOOK_SECRET`, `FRONTEND_APP_URL`, `CORS_ALLOWED_ORIGINS`, `NODE_ENV`, `APP_ENV`, `E2E_STAGING_AUTH_BRIDGE_ENABLED`, `E2E_STAGING_AUTH_BRIDGE_SECRET`, `PORTAL_API_BASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ALLOWED_EMAIL_DOMAINS`.

Documented for a future frontend (currently unused in `frontend/src`): `VITE_AUTH_PROVIDER`, `VITE_API_BASE_URL`, `VITE_APP_ORIGIN`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ALLOWED_EMAIL_DOMAINS`, `VITE_AUTH_MODE`, `VITE_PORTAL_ORIGIN`, `VITE_PORTAL_API_BASE_URL`, `VITE_ENABLE_E2E_AUTH`.

---

## 4. Admin screen-action inventory

Shared columns for every row:

- **Role:** Club Services Admin (`effective_role=admin`) unless noted
- **Current behaviour:** local React state / toast unless `UI_ONLY`
- **Current data:** mock constants named in the row
- **FE tests:** none
- **Required new tests:** Playwright + keep matching backend tests
- **Unauthorized:** backend 403 if wired; frontend currently shows the screen to anyone who opens `/admin/*`
- **Loading/empty/error:** mock workspaces mostly skip real loading; Home has unused error UI
- **Duplicate-action:** backend admin decision rate limit 20 / 5 min; frontend has no idempotency key

### 4.1 Shared shell (`WorkspaceShell.tsx`) — all Admin routes

| Control | Type | Intended outcome | API | DB | Class | Pri |
|---|---|---|---|---|---|---|
| OneClub brand | link | `/admin/home` | none | — | `UI_ONLY` | P1 |
| Home / Approvals / Clubs / People / More | nav links | role workspaces | none | — | `UI_ONLY` | P0 |
| Bell | link | `/admin/notifications` | `GET /api/v1/notifications/` later | `notifications` | `FRONTEND_MOCK_ONLY` | P1 |
| Theme toggle | button | light/dark | none | local | `UI_ONLY` | P2 |
| Avatar | link | `/admin/profile` | `GET /profile/me` later | `profiles` | `FRONTEND_MOCK_ONLY` | P1 |
| Preview role select | select | DEV-only role switch | none | — | `UI_ONLY` / hide in prod | P2 |
| Skip to content | link | `#workspace-content` | none | — | `UI_ONLY` | P3 |

### 4.2 Home — `/admin/home` — `AdminHomeView.tsx`

| Control | Type | Intended | Required API | Method / payload | Entity | Success | Class | Pri |
|---|---|---|---|---|---|---|---|---|
| New announcement | button | open composer | `POST /api/v1/communications/announcements` | announcement body; admin\|president | `announcements` | list prepend | `SUPPORTED` (BE) / `FRONTEND_MOCK_ONLY` (FE) | P1 |
| Composer publish | form | campus/club broadcast | same | audience `all_users`/`all_clubs`/`club`/`role` | `announcements`, emails, audit | toast | same | P1 |
| Save draft | button | sessionStorage `oneclub_admin_announcement_draft` | none | — | — | local | `UI_ONLY` | P3 |
| Attention Inspect (proposal/join/proof/report) | button | open `AdminRecordDetailModal` | GET admin proposal / membership-requests / dues / reports | ids | those tables | modal | `SUPPORTED` + `SUPPORTED_BUT_RESPONSE_MISMATCH` (`pending_admin`) | P0 |
| Modal Approve / Decline / Revisions | buttons | final Admin decision or membership/dues | `POST /proposals/admin/:id/decision`; `POST /membership-requests/:id/decision`; `POST /dues/:id` | `{decision, remarks?}` | proposals / membership_requests / due_payments | queue shrinks; president/student see status | `SUPPORTED` | P0 |
| “Revisions” on Home modal | button | return to president | **no `revisions_requested` status** | would be `reject` → `admin_rejected` | `proposals` | president can edit+resubmit | `SUPPORTED_BUT_RESPONSE_MISMATCH` | P0 |
| Activity row | button | inspect audit | **Proposed — not implemented:** `GET /api/v1/admin/audit-logs` | — | `audit_logs` (write-only today) | modal | `BACKEND_MISSING` | P2 |
| Retry Connection | button | recover | none | never triggered | — | — | `UI_ONLY` dead | P3 |
| Sync | button | refresh | `GET /dashboard/admin-operations` | — | multi | refresh | `SUPPORTED` unused | P1 |

Home attention `url` values `/approvals`, `/user-management`, `/dues`, `/archive` are **not navigated**.

### 4.3 Approvals — `/admin/approvals` — `AdminApprovalsWorkspace.tsx`

Tabs: proposals / join_requests / payment_proofs. Search + club filter. Expand row. Decision dialog.

| Control | Intended | API | Payload | Entity | Other roles see | Class | Pri |
|---|---|---|---|---|---|---|---|
| Tabs / search / club Select | filter queues | GET admin lists | query filters | proposals, membership_requests, due_payments | no | `SUPPORTED` | P0 |
| Approve proposal | final approve | `POST /api/v1/proposals/admin/:proposalId/decision` | `{decision:"approve", remarks?}` from `pending_admin_review` | `proposals` → `approved`; notifications; audit | president events calendar; students RSVP | `SUPPORTED` | P0 |
| Reject / return proposal | final reject | same | `{decision:"reject", remarks?}` → `admin_rejected` | `proposals` | president can edit+submit | `SUPPORTED_BUT_RESPONSE_MISMATCH` (UI “return”) | P0 |
| Override rejected | approve after reject | same | remarks **required** (`PROPOSAL_OVERRIDE_REMARKS_REQUIRED`) | `proposals` | yes | `SUPPORTED` | P1 |
| Admit join | activate member | `POST /api/v1/membership-requests/:requestId/decision` | approve; **admin only** | request `active`; dues `paid`; `club_members` | student My clubs | `SUPPORTED` | P0 |
| Decline join | reject request | same | reject; remarks optional in API | request `rejected`; dues `rejected` | student | `SUPPORTED` | P0 |
| WhatsApp switch | mark onboarding | `POST /api/v1/membership-requests/:requestId/whatsapp-added` | — | membership_requests | club ops | `SUPPORTED` | P2 |
| Verify proof | mark dues paid | `POST /api/v1/dues/:paymentId` | paid + verified_by | `due_payments` | student dues | `SUPPORTED` | P0 |
| Reject proof | mark rejected | same | rejected | `due_payments` | student | `SUPPORTED` | P0 |
| Zoom receipt | view file | storage signed URL | `proof_url` | storage `dues-receipts` | admin | `PARTIALLY_SUPPORTED` (mock uses `/oneclub.svg`) | P1 |

**Permission:** presidents must **not** get these decision APIs. Backend: membership + dues verify are **admin only**. Product aligned.

### 4.4 Clubs — `/admin/clubs` — `AdminClubsWorkspace.tsx`

| Control | Intended | API | Entity | Class | Pri |
|---|---|---|---|---|---|
| Search / category pills | filter 14 clubs | `GET /api/v1/clubs` | `clubs` | `SUPPORTED` | P1 |
| Inspect | read-only detail | `GET /api/v1/clubs/:id` | `clubs` | `SUPPORTED` | P1 |
| Edit / Save | public signup, bank, WhatsApp notes, description | PATCH club (existing clubs mutate, admin) | `clubs` | `SUPPORTED` | P1 |
| Copy account number | clipboard | none | — | `UI_ONLY` | P3 |
| Public signup Switch | `is_public_signup` | club mutate | `clubs` | `SUPPORTED` | P1 |

Do not invent extra clubs. Official 14 from `bootstrap_clubs.sql`.

### 4.5 People — `/admin/people` — `AdminPeopleWorkspace.tsx`

| Control | Intended | API | Payload | Entity | Class | Pri |
|---|---|---|---|---|---|---|
| Search / role / club filters | directory | `GET /api/v1/admin/users` | query | `profiles` | `SUPPORTED` | P0 |
| Inspect | Campus One identity read-only | `GET /api/v1/admin/users/:profileId` | — | `profiles` | `SUPPORTED` | P0 |
| Assign role | OneClub `app_role` only: student/executive/president/advisor | `POST /api/v1/admin/users/:profileId/role` | `{role, club_id?, remarks?, replace_existing_president?}` | `profiles`, `club_members`, `profile_role_history`, audit | `SUPPORTED` | P0 |
| Incumbent checkbox | replace existing president | `replace_existing_president` | unique president index `0033` | `SUPPORTED` | P0 |
| Advisor club assignment | multi-club | `POST /api/v1/admin/users/:profileId/advisor-assignment` | `{club_id, remarks?}` | `club_advisors` | `SUPPORTED` | P0 |

Cannot assign `admin` or `feedback_manager` via API. Campus One identity fields must stay read-only (product). `club_services_admin` is **not** an assignable OneClub People role.

### 4.6 Events — More `/events` — `AdminEventsWorkspace.tsx`

| Control | Intended | API | Notes | Class | Pri |
|---|---|---|---|---|---|
| Tabs / search / club / Reset | list approved events | `GET /api/v1/events/approved` (events = approved proposals) | no `events` table | `SUPPORTED` | P1 |
| Inspect | detail + engagement | `GET .../engagement` | — | `SUPPORTED` | P1 |
| Display QR | encode check-in URL | client QR (`qrcode`) | not a new entity | `UI_ONLY` | P1 |
| Print QR | `window.print` | none | — | `UI_ONLY` | P2 |
| Manual check-in | organizer fallback | `POST /api/v1/events/:proposalId/attendance` | service `canManage` = admin\|president | `SUPPORTED` | P1 |

Product: students self-scan. Admin manual check-in is supported by backend.

### 4.7 Announcements — `/communications` — `AdminAnnouncementsWorkspace.tsx`

| Control | API | Class | Pri |
|---|---|---|---|
| Compose / `?compose=true` | `POST /communications/announcements` | `SUPPORTED` | P1 |
| Audience tabs / priority / search | `GET` announcements list | `SUPPORTED` | P1 |
| Publish | same POST; rate limited | `SUPPORTED` | P1 |
| Detail action Link | `announcement.actionUrl` mock | `FRONTEND_MOCK_ONLY` | P2 |

Create roles on backend: **admin or president**. Admin UI is in scope.

### 4.8 Notifications — `/admin/notifications` — `AdminNotificationsWorkspace.tsx`

| Control | API | Class | Pri |
|---|---|---|---|
| Category / search / Reset | `GET /api/v1/notifications/` (self inbox) | `SUPPORTED` list | P1 |
| Inspect / mark read | **Proposed — not implemented:** `POST/PATCH /api/v1/notifications/:id/read` | `BACKEND_MISSING` | P2 |
| Open link | mock `/approvals`, `/events`, `/user-management` | `SUPPORTED_BUT_RESPONSE_MISMATCH` (dead aliases) | P1 |

No mark-all-read API. Do not add one unless product asks.

### 4.9 Feedback — `/feedback` — `AdminFeedbackWorkspace.tsx`

| Control | Intended | API | Class | Pri |
|---|---|---|---|---|
| Category / role / search | read-only directory | `GET /api/v1/communications/feedback` | `SUPPORTED` | P1 |
| Read Feedback modal | Close only; no PATCH status | list only | `SUPPORTED` (read) | P1 |
| CSV export | not in UI | none | `REMOVE_FROM_UI` (already absent) | — |

**Permission gap:** `listFeedback` allows admin, **advisor, president, executive, feedback_manager**. Product: Admin read-only directory; other roles should not get a global inbox. `SUPPORTED_BUT_PERMISSION_GAP` for non-admin list. `feedback_manager` remnant in service + RLS `0046`.

### 4.10 Analytics — `/analytics` — `AdminAnalyticsWorkspace.tsx`

| Control | API | Class | Pri |
|---|---|---|---|
| Time range 7/30/90 | `GET /api/v1/analytics/admin?days=` | `SUPPORTED` | P2 |
| Inspect metric modal | same payload | `SUPPORTED_BUT_RESPONSE_MISMATCH` (deterministic mock) | P2 |

`POST /api/v1/analytics/activity` records feature usage — not shown in Admin UI (`UI_ONLY` omission).

### 4.11 More — `/admin/more` — `AdminMoreWorkspace.tsx`

Search / category / Clear / destination cards / Profile text link. Class: `UI_ONLY` navigation. P1 to retarget URLs under `/admin/*`.

### 4.12 Profile — `/admin/profile` — `AdminProfileWorkspace.tsx`

| Control | API | Class | Pri |
|---|---|---|---|
| Copy staff id / email | clipboard; identity from `GET /profile/me` | `SUPPORTED` read / `FRONTEND_MOCK_ONLY` now | P1 |
| Light / Dark | theme context | `UI_ONLY` | P2 |
| Sign Out / Confirm | `POST /api/v1/auth/campus-one/logout` then Campus One login | `SUPPORTED` BE / mock FE; `/login` missing | P0 |

### 4.13 Keyboard / mobile

Mobile primary nav duplicates rail. Sheets/dialogs: Radix/shadcn in Admin modals. No documented Admin keyboard shortcuts beyond skip-link. Theme works. Classification `UI_ONLY`. P2 a11y later.

---

## 5. Backend endpoint inventory (auth + Admin)

Frontend currently uses **none** of these. Middleware: `auth` = `createAuthMiddleware` (cookie session when `AUTH_PROVIDER=campus_one_oidc`). `requireRole` checks `req.user.role` (effective). Some modules (admin-users) check admin in the **service**, not `requireRole` on the route.

### 5.1 Existing

| Method | Path | Route file | Auth | Allowed | UI action | Tests | Risk |
|---|---|---|---|---|---|---|---|
| GET | `/api/v1/auth/campus-one/login` | `campusOneOidc.js` | public | — | Sign in | OIDC | — |
| GET | `/api/v1/auth/campus-one/callback` | same | public | — | Callback | OIDC | — |
| POST | `/api/v1/auth/campus-one/logout` | same | public | — | Sign out | weak | no IdP logout |
| GET | `/api/v1/auth/campus-one/logout` | same | public | — | Sign out redirect | weak | — |
| POST | `/api/v1/auth/e2e/staging-session` | same | staging secret | E2E | Playwright | e2e-bridge | must stay staging |
| POST | `/api/v1/webhooks/campus-one` | webhook | HMAC | Campus One | account suspend/update | delivery tests | — |
| GET | `/api/v1/profile/me` | profile | authUser | any auth | workspace + Profile | profile/OIDC | — |
| GET | `/api/v1/admin/users` | admin-users.routes | auth | admin (service) | People list | admin-users | no `requireRole` on router |
| GET | `/api/v1/admin/users/:profileId` | same | auth | admin | People inspect | admin-users | — |
| POST | `/api/v1/admin/users/:profileId/role` | same | auth | admin | Assign role | admin-users | cannot assign admin |
| POST | `/api/v1/admin/users/:profileId/advisor-assignment` | same | auth | admin | Advisor clubs | admin-users | — |
| GET | `/api/v1/proposals/admin` | proposals.routes | auth + admin | admin | Approvals proposals | admin-proposals | — |
| GET | `/api/v1/proposals/admin/:proposalId` | same | auth + admin | admin | Inspect | admin-proposals | — |
| POST | `/api/v1/proposals/admin/:proposalId/decision` | same | auth + admin + rate limit | admin | Approve/reject | admin-decision | — |
| GET | `/api/v1/dashboard/admin-operations` | dashboard | auth + admin | admin | Home | dashboard | — |
| GET | `/api/v1/dashboard/nav-counts` | dashboard | auth | any | badges | dashboard | — |
| GET/POST/PATCH | `/api/v1/clubs*` | clubs | auth; public GET exception | admin mutate | Clubs | clubs | — |
| GET/POST | `/api/v1/membership-requests*` | membership-requests | auth | create student/exec/pres; **decide admin** | Approvals joins | membership-requests | — |
| POST | `/api/v1/membership-requests/:id/whatsapp-added` | same | auth | admin path | WhatsApp switch | membership-requests | — |
| GET/POST | `/api/v1/dues*` | dues | auth | student self; **admin verify/settings** | Approvals proofs | dues | — |
| GET/POST | `/api/v1/events*` | events | auth | RSVP student; attendance admin\|pres | Events | events | no events table |
| GET/POST | `/api/v1/communications/announcements*` | communications | auth | create admin\|pres | Announcements | communications | — |
| GET/POST | `/api/v1/communications/feedback` | communications | auth | submit auth; list admin+others | Feedback | communications | extra roles + feedback_manager |
| GET | `/api/v1/notifications/` | notifications | auth | self | Notifications | notifications | no mark-read |
| GET | `/api/v1/analytics/admin` | analytics | auth + admin | admin | Analytics | analytics | — |
| POST | `/api/v1/analytics/activity` | analytics | auth | any | not in Admin UI | analytics | — |
| POST | `/api/v1/storage/upload` | storage | auth | admin or club president | receipts/media | — | — |
| GET/POST | `/api/v1/reports*` | reports | auth | president create; scoped list | Home report attention | reports | — |
| GET/POST | `/api/v1/tasks*` | tasks | auth | president/exec | **Admin must not use** | tasks | `REMOVE_FROM_UI` for Admin |
| GET/POST | `/api/v1/leadership-applications*` | leadership | auth | student apply; admin decide | not in current Admin More | leadership | P2 if product wants it |
| GET | `/api/v1/members` | members | auth | admin/pres/exec view; mutate admin/pres | People ≠ members list | members | product: president members **read-only** |

### 5.2 Proposed — not currently implemented

| Proposed | Why |
|---|---|
| `PATCH` or `POST /api/v1/notifications/:id/read` | Admin (and other roles) toggle `read_at`. Column exists (`0033`); no write API |
| `GET /api/v1/admin/audit-logs` | Home activity inspector. `audit_logs` is write-only from services |

Do **not** propose a Feedback Manager API, Admin Tasks workspace, or `revisions_requested` status without a schema migration decision.

---

## 6. Database and state transitions

Backend uses Supabase **service role**, so **RLS is bypassed for API writes**. Authorization is service-layer. RLS still matters for any direct client JWT.

### 6.1 Entities (Admin-relevant)

| Entity | Table | Statuses / notes | Migrations | Enforcement | Cross-club risk |
|---|---|---|---|---|---|
| Profiles | `profiles` | `app_role`, `club_id`, `portal_user_id`, `account_status` | 0001, 0015, 0043, … | service + RLS own-select | Admin is cross-club by design |
| Role history | `profile_role_history` | audit of role/club | 0024 | service | — |
| Clubs | `clubs` | 14 official names unique | 0001 + dues/signup | service | — |
| Advisor assignments | `club_advisors` | unique (club, advisor) | 0036 | service `getAdvisorClubIds` | **RLS often still uses `clubs.advisor_id` only** |
| Members | `club_members` | active/inactive/alumni | 0010, 0030 | service | — |
| Join requests | `membership_requests` | pending, approved_pending_dues, active, rejected, cancelled | 0016, 0040, 0047 | **admin decide**; RLS select self or admin | presidents **cannot** SELECT after 0047 |
| Proposals | `proposals` | see §6.2 | 0001–0014, 0047 RPCs | service + RPC WHERE | — |
| Approvals rows | `approvals` | decision records | 0004 | RPC | — |
| Events | **none** | approved proposals | — | — | RSVP not CHECK-constrained to approved |
| RSVP / attendance | `event_rsvps`, `event_attendance` | — | 0018 | service | — |
| Dues | `due_payments` | unpaid, submitted, paid, rejected | 0011, 0017 | **admin verify**; no INSERT RLS | presidents can still SELECT via RLS |
| Payment settings | `club_payment_settings` | — | 0017, 0040 | admin | — |
| Announcements | `announcements` | audience/priority | — | service | — |
| Notifications | `notifications` | `read_at` | 0033 | own SELECT; no mark-read API | — |
| Feedback | `event_feedback` | open/reviewed/archived | + 0046 FM | list wider than product | FM remnant |
| Reports | `event_reports` | submitted | 0012 | president create | — |
| Audit | `audit_logs` | — | 0033 | admin SELECT RLS; **no list API** | — |
| Uploads | storage buckets | dues-receipts, club-logos, event-media, reports, club-media | 0019, 0048 | storage module | — |

Official 14: NBC, NBUC, NCC, NCIC, NCAC, NDC, NGC, NGD, NMUN, NPC, NSC, NTC, TEDX, WIT (`bootstrap_clubs.sql`).

### 6.2 Proposal state machine (actual code)

`backend/src/modules/proposals/proposals.service.js`

```
draft
  -- president submit --> pending_advisor_review

pending_advisor_review
  -- advisor approve --> pending_admin_review
  -- advisor reject  --> advisor_rejected     (remarks OPTIONAL in API)

pending_admin_review
  -- admin approve --> approved
  -- admin reject  --> admin_rejected

advisor_rejected | admin_rejected
  -- president edit+submit --> pending_advisor_review
  -- admin override approve (remarks REQUIRED) --> approved
```

**Not in the database enum:** `revisions_requested`, generic `rejected`.

**Dead enum value:** `advisor_approved` (notification type name only; live status jumps to `pending_admin_review`).

Intended vs actual:

```
Intended: draft → pending_advisor_review → revisions_requested → pending_advisor_review → pending_admin_review → approved|rejected
Actual:   draft → pending_advisor_review → pending_admin_review → approved
                         ↘ advisor_rejected ──resubmit──↗
                         ↘ admin_rejected  ──resubmit──↗
```

UI mock status `pending_admin` must map to `pending_admin_review`.

Advisor “Return for changes” = `decision: "reject"` → `advisor_rejected`. Admin “Return” on a pending-admin item = `admin_rejected`, not a third status.

### 6.3 Dues / membership (product aligned)

- Students submit proof; cannot verify.
- Presidents do **not** review joins or dues (API + 0047 RLS).
- Admin approve join also marks linked dues `paid`.
- Status `approved_pending_dues` exists but current create path uses `pending` + dues `submitted`.

---

## 7. Test plan (required new vs existing)

### Existing (keep)

- `backend/tests/campus-one-oidc-auth.test.js` — login, userinfo subject, `club_services_admin` → admin
- `backend/tests/portal-access.test.js` — effective_role
- `backend/tests/e2e-staging-auth-bridge.test.js`
- `backend/tests/admin-users.test.js`, `admin-proposals.test.js`, `admin-decision.test.js`
- `backend/tests/advisor-decision.test.js` — add coverage that product-required remarks are currently **not** enforced
- `backend/tests/membership-requests.test.js`, `dues.test.js`, `analytics.test.js`, `communications.test.js`

### Missing (add in later implementation tasks)

| Test | Covers |
|---|---|
| Playwright: unauthenticated `/admin/home` redirects to Campus One login | P0-1, P0-2 |
| Playwright: `effective_role=admin` via staging bridge reaches Admin Home | P0-1 |
| Playwright: student session hitting `/admin/home` → unauthorized screen | P0-2 |
| Playwright: Approvals approve/reject against test API | P0 |
| Playwright: People cannot assign admin | P0 |
| Contract: mock `pending_admin` vs API `pending_admin_review` | P0-7 |
| Backend: CSRF or documented SameSite policy | P0-5 |
| Backend: advisor reject without remarks → 400 **if product is enforced** | P0-6 |
| Replace `tests/e2e/smoke.spec.ts` Clubly assertions | stale |

---

## 8. Implementation order (later tasks — do not start here)

1. Session client: login, callback, cookie, `GET /profile/me`, `effective_role` workspace, unauthorized/expired/sign-out, real `/login` route using existing system screens.
2. Fix Admin URL prefixes and keyword routing (`/user-management`, `/archive`, unprefixed More).
3. Wire Approvals (proposals, joins, dues) with correct statuses and Admin-only permissions.
4. Wire People + Clubs.
5. Wire Events / Announcements / Notifications / Feedback / Analytics as read-or-write per this map.
6. Do not restore Feedback Manager. Do not add Admin Tasks. Do not change visual design except state/a11y required by wiring.

---

## 9. Sources

- `frontend/src/app/App.tsx`, `WorkspaceShell.tsx`, `contexts/AuthContext.tsx`
- `frontend/src/components/admin/**`, `frontend/src/components/AdminHomeView.tsx`, `frontend/src/data/adminMoreData.ts`
- `backend/src/app.js`, `middleware/auth.js`, `middleware/requireRole.js`
- `backend/src/modules/auth/campusOneOidc.js`, `shared/campusOneSession.js`, `shared/portalAccess.js`
- `backend/src/modules/proposals/proposals.service.js`, `proposals.validation.js`, `proposals.routes.js`
- `backend/src/modules/admin-users/*`, `communications.service.js`, `dues.service.js`, `membership-requests/*`
- `backend/supabase/bootstrap_clubs.sql`, migrations `0001`–`0050` as cited
- `docs/ENVIRONMENT_REFERENCE.md`, `docs/CAMPUSONE_ADMIN_ROLE_TROUBLESHOOTING.md`
- `docs/oneclub-google-ai-studio-prompts/00-audit-and-capability-map.md`
