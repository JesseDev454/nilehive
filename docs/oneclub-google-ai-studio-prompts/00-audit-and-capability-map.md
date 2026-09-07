# 00 — Audit and capability map

Inspected 2026-08-19. Sources: backend routes/services, current placeholder frontend, OneClub Google Design TSX, UX psychology transcript. Old 220 KB prompt package used only as a negative example.

Instruction priority used: product decisions in the request → backend authorization → honesty/accessibility → simplicity → ethical psychology → visual direction.

Current frontend at `frontend/` is a placeholder (theme toggle, tokens, no routes, no API client). Do not trust deleted Clubly screens. Recoverable old frontend: branch `backup/pre-oneclub-frontend-rebuild`.

---

## Official 14 clubs

From `backend/supabase/bootstrap_clubs.sql`:

1. Nile Book Club
2. Nile Business Club
3. Nile Charity Club
4. Nile Climate Initiatives Club
5. Nile Creative Arts Club
6. Nile Debate Club
7. Nile Games Club
8. Nile Google Developers
9. Nile Model United Nations Club
10. Nile Photography Club
11. Nile Startup Campus
12. Nile Toastmaster's Club
13. TEDx Nile Club
14. Women in Tech Club

Student onboarding TSX uses different names (Enactus, Sports Club, AI & Data Science, etc.). **Do not use those.**

---

## Navigation (exact)

| Role | Nav |
|---|---|
| Admin | Home · Approvals · Clubs · People · More |
| Student | Home · Discover · Events · My clubs · More |
| President | Home · Proposals · Events · Members · More |
| Executive | Home · Club · Events · My work · More |
| Advisor | Home · Reviews · Clubs · Reports · More |

Feedback Manager is removed everywhere.

---

## Screens retained / merged / removed

### Retained (backend + product both allow)

**Admin:** Home, Approvals (proposals + join requests + payment proofs), Clubs, People, Events, Announcements, Notifications, Feedback (read), Analytics, More, Profile, shared system screens.

**Student:** Home, Discover (includes public club details + join), Events (includes details + RSVP), QR check-in, My clubs (includes member club home + own request status), Dues (includes submit proof), Announcements, Notifications, Feedback submit, More, Profile, optional skippable onboarding.

**President:** Home, Proposals (directory + five-step builder + details + resubmit), Events (approved proposals, organizer QR, attendance, report entry), Members (read-only), Announcements, Reports, Club details (own-club profile/media), Club work (assign tasks to executives), Notifications, More, Profile.

**Executive:** Home, Club, Events (view), My work, Notifications, More, Profile.

**Advisor:** Home, Reviews (includes details + decide), Clubs, Reports, Notifications, More, Profile.

### Merged

- Student public club details + join → Discover.
- Student event details + RSVP → Events.
- Student member club home → My clubs.
- Student proof upload → Dues.
- Admin proposal / membership / dues review → Approvals.
- President builder + details + resubmit → Proposals.
- Advisor proposal details → Reviews.

### Removed (no API, or product forbids)

| Removed | Why |
|---|---|
| Admin Tasks | Product removed; not an Admin workspace |
| Admin Settings app | Product removed; theme lives on Profile |
| Admin Exports | No export-job route |
| Admin Activity log | `createAuditLog` only; no list route |
| Admin announcement edit/duplicate | POST create only |
| Admin feedback status workflow | GET list + POST create only; no review PATCH |
| Admin Add Club / Delete Club in UI | Official set is fixed at 14; do not invent clubs |
| Feedback Manager anything | Product removed |
| Student My Feedback history | Students cannot GET `/communications/feedback` |
| Student leave-club | No leave/withdraw route |
| Student personal QR | Wrong check-in model |
| Student payment checkout | Proof upload only |
| Club Discovery Preferences as a permanent screen | Product removed |
| Leadership applications | POST returns 403 `LEADERSHIP_SELF_SERVICE_DISABLED` |
| Role picker / club claiming | Product + Campus One boundary |
| President membership requests | `listMembershipRequests` is Admin-only |
| President Approve/Reject join | Admin-only |
| President dues / proof verify | `listDuePayments` / update is Admin-only |
| President add/remove/promote members | Product: Members is read-only (even though `PATCH` members exists for presidents) |
| President event complete/cancel | No complete/cancel event route; lifecycle is date-based |
| Separate event entity | Events are approved proposals |
| Executive attendance management | `assertCanManageEvent` is Admin or President |
| Advisor final approval | Admin-only |
| Advisor editing proposal text | Read-only body; decide only |
| Notification mark-as-read | GET list and push subscribe only; announcements have mark-read |
| Fake progress, fake urgency, System theme | Product + ethics |

### Designs that contradict backend or product

| TSX | Contradiction | Prompt rule |
|---|---|---|
| Admin More | Tasks + Settings destinations | Omit both |
| Admin Home passes 1–5 | Historical | Use Pass 6 visual only |
| Student onboarding clubs | Wrong 14 names | Use bootstrap names |
| Student My clubs leave flow | No API | Omit leave |
| Student Feedback history | No student list API | Success receipt only |
| President Home | Join requests + payment proofs to review | Remove those attention items |
| President Events complete/cancel | No API | Omit |
| President Members (no file yet) | Old ideas assumed President manages members | Read-only directory |
| QA inspectors in ~20 files | Debug chrome | Never generate |

### Missing designs to generate

President: Members, Announcements, Reports, Club details, Club work, More, Profile.  
All Executive. All Advisor. Shared auth/system screens beyond the Admin shared-screens gallery.

---

## Backend uncertainties

| Topic | Finding | UI rule |
|---|---|---|
| `POST /profile/onboarding` requires `club_id` and allows `requested_role` student\|advisor | Contradicts no club-claim / no role picker | Do not expose those fields. Optional onboarding is skippable interests only (`PUT /profile/club-preferences`). Users whose profile is already `onboarding_status: complete` skip it. |
| Student events visibility | `GET /events/approved` scopes students to **active membership clubs**, not all 14 | Events = “your clubs’ events”, not a campus-wide public calendar |
| Join requires `proof_url` | Membership create requires receipt upload | Join is one flow: details → form + proof → submit. Dues workspace is for later unpaid/rejected records |
| Organizer QR | No QR-image API; `POST /events/:proposalId/check-in` exists | UI may encode the event check-in URL as a QR. Student scans it. |
| Notification read state | No mark-read route | List only. Do not add Mark all read |
| President `updateMember` | Backend allows president to change club roles | **Hidden in UI** by product decision. Members is read-only |
| Feedback `club` category | Allowed; `event` category returns 410 | Do not offer event feedback |
| Account suspend action | `account_status` is returned; no suspend route found | Display if present; no Suspend button |
| Reminders `GET /reminders` | Own reminders exist | Surface on Executive/President Home if useful; no Reminders app |

---

## Capability table

Supported = backend allows **and** this product prompt allows. Include only Yes rows in generated UI.

| Role | Workspace | Visible action | Route | Auth | Supported | Include | Notes |
|---|---|---|---|---|---|---|---|
| All | Profile | View identity | `GET /profile/me` | auth | Yes | Include | Campus One fields read-only |
| All | Theme | Light/dark | client | — | Yes | Include | No System |
| All | Auth | Continue with Campus One | `GET /auth/campus-one/login` | public | Yes | Include | No local password |
| All | Auth | Sign out | `POST /auth/campus-one/logout` | session | Yes | Include | Confirm |
| All | Notifications | List own | `GET /notifications` | auth | Yes | Include | No mark-read API |
| All | Announcements | List / mark read | `GET/POST .../announcements` + read | auth | Yes | Include | Create limited by role |
| All | Storage | Upload proof/media | `POST /storage/upload` | auth | Yes | Include | Proof and club media |
| Student | Discover | List clubs | `GET /clubs` or `/clubs/public` | auth/public | Yes | Include | 14 clubs |
| Student | Discover | Club details | `GET /clubs/:clubId` | auth | Yes | Include | |
| Student | Discover | Join + proof | `POST /membership-requests` | student/exec/pres | Yes | Include | `requested_role` always member; proof required |
| Student | My clubs | Own requests | `GET /membership-requests/me` | auth | Yes | Include | Status only |
| Student | Events | List / RSVP | `GET /events/approved`, `POST .../rsvp` | student RSVP | Yes | Include | Own clubs only |
| Student | QR | Self check-in | `POST /events/:proposalId/check-in` | student | Yes | Include | Event-day only |
| Student | Dues | List / submit proof | `GET /dues/me`, `POST /dues/:id/submit-confirmation` | student | Yes | Include | Status unpaid/submitted/paid/rejected |
| Student | Dues | Bank details | `GET /dues/payment-settings` | student/admin | Yes | Include | Read |
| Student | Feedback | Submit | `POST /communications/feedback` | auth | Yes | Include | No history list |
| Student | Onboarding | Optional interests | `PUT /profile/club-preferences` | student | Yes | Include | Skippable; not a Profile section |
| Student | Discover | Recommendations | `GET /clubs/recommendations` | student | Uncertain | Remove as required | Only if preferences completed; do not require |
| Student | My clubs | Leave | — | — | No | Remove | |
| Student | Feedback | My history | `GET /communications/feedback` | not student | No | Remove | Receipt after submit only |
| President | Home | Dashboard | `GET /dashboard/president` | president | Yes | Include | Hide membership/dues attention even if payload has related data |
| President | Proposals | CRUD/submit | `POST/GET /proposals`, `POST .../edit`, `POST .../submit` | president | Yes | Include | Own club |
| President | Events | List / engagement / attendance | `GET /events/approved`, `GET .../engagement`, `POST .../attendance` | president | Yes | Include | Approved proposals |
| President | Events | Display event QR | client encoding of check-in URL | — | Yes | Include | Not a new entity |
| President | Events | Complete/cancel | — | — | No | Remove | Date lifecycle only |
| President | Members | List | `GET /members` | president | Yes | Include | Read-only UI |
| President | Members | Update role/status | `POST /members/:id` | president | Yes in API | **Remove** | Product: read-only |
| President | Members | Review joins | `GET /membership-requests` | admin | No | Remove | |
| President | Dues | Verify proofs | `GET/POST /dues` | admin | No | Remove | |
| President | Club | Update profile/media | `PATCH /clubs/:id/profile`, media routes | president own club | Yes | Include | |
| President | Announcements | Create club/role | `POST /communications/announcements` | president | Yes | Include | Club or student/executive |
| President | Reports | Create/list | `POST/GET /reports` | president create | Yes | Include | One per approved event |
| President | Club work | Assign/list tasks | `POST/GET /tasks` | president | Yes | Include | Executives in same club |
| Executive | Home | Dashboard | `GET /dashboard/executive` | executive | Yes | Include | |
| Executive | Club | View club | `GET /clubs/:id` | executive | Yes | Include | Own club |
| Executive | Club | List members | `GET /members` | executive | Yes | Include | View only |
| Executive | Events | View | `GET /events/approved`, engagement (no roster) | executive | Yes | Include | No attendance POST |
| Executive | My work | List/update own tasks | `GET /tasks`, `GET /tasks/:id`, `POST .../status` | executive | Yes | Include | Keep My work |
| Executive | Attendance | Manual check-in | `POST .../attendance` | no | No | Remove | |
| Advisor | Reviews | List/detail/decide | `GET /proposals/pending-advisor`, `GET /advisor/:id`, `POST .../advisor-decision` | advisor | Yes | Include | UI label Return for changes = `reject` + required remarks |
| Advisor | Clubs | Assigned clubs | `GET /clubs` | advisor | Yes | Include | |
| Advisor | Events | View assigned | `GET /events/approved` | advisor | Yes | Include | Inside club/event details, not a fifth nav item |
| Advisor | Reports | List/detail | `GET /reports`, `GET /reports/:id` | advisor | Yes | Include | |
| Advisor | Final approve | Admin decision | `POST /proposals/admin/:id/decision` | admin | No | Remove | |
| Admin | Home | Ops dashboard | `GET /dashboard/admin-operations` | admin | Yes | Include | Few attention items |
| Admin | Approvals | Proposals | `GET /proposals/admin`, `POST .../decision` | admin | Yes | Include | Can override rejected with remarks |
| Admin | Approvals | Joins | `GET/POST /membership-requests` | admin | Yes | Include | WhatsApp-added after paid |
| Admin | Approvals | Proofs | `GET /dues`, `POST /dues/:id` | admin | Yes | Include | paid / rejected |
| Admin | Clubs | List/update/media | clubs routes | admin | Yes | Include | Edit the 14; no Add Club |
| Admin | Clubs | Payment settings | `GET/POST /dues/payment-settings*` | admin | Yes | Include | Proof instructions, not checkout |
| Admin | People | List/assign | `GET /admin/users`, `POST .../role`, `POST .../advisor-assignment` | admin | Yes | Include | Roles: student, executive, president, advisor |
| Admin | Events | View + attendance | events routes | admin | Yes | Include | |
| Admin | Announcements | Create any audience | POST announcements | admin | Yes | Include | No edit route |
| Admin | Feedback | List | `GET /communications/feedback` | admin | Yes | Include | Read-only |
| Admin | Analytics | Summary | `GET /analytics/admin` | admin | Yes | Include | 7/30/90; few numbers |
| Admin | Exports | Jobs | — | — | No | Remove | |
| Admin | Activity log | Query | — | — | No | Remove | |
| Any | Leadership apply | Create | `POST /leadership-applications` | 403 | No | Remove | |
| Any | Preferences app | Permanent UI | `GET/PUT /profile/club-preferences` | student | Partial | Onboarding only | |

---

## Psychology (ethical use)

Transcript principles kept: smart defaults, progress, value before effort, ownership, consequences, contrast.

Transcript patterns **rejected**: fake 20% head start, never-start-at-zero tricks, hostage/blurred results, loss-aversion threats, fake countdowns, “I’ll risk it”, decoy pricing, Mobbin/UX Peak ads.

---

## Visual source map

| Workspace | TSX (visual only) |
|---|---|
| Admin Home | `ADMIN/HOME/oneclub_admin_home PASS 6.tsx` |
| Admin Approvals | `ADMIN/APPROVALS/oneclub_admin_approvals_workspace.tsx` |
| Admin Clubs | `ADMIN/Clubs/oneclub_admin_portal.tsx` |
| Admin People | `ADMIN/People/oneclub_PEOPLE.tsx` |
| Admin Events | `ADMIN/EVENTS/oneclub_admin_events_workspace_pass_6.tsx` |
| Admin Announcements | `ADMIN/ANNOUNEMENTS/oneclub_admin_announcements_workspace.tsx` (create+list only) |
| Admin Notifications | `ADMIN/NOTIFICATIONS/oneclub_admin_notifications_workspace_pass_6.tsx` |
| Admin Feedback | `ADMIN/Feedback/oneclub_admin_workspace.tsx` (read-only) |
| Admin Analytics | `ADMIN/Analytics/oneclub_admin_analytics_workspace.tsx` |
| Admin More | `ADMIN/MORE/...` minus Tasks and Settings |
| Admin Profile | `ADMIN/Profile/oneclub_admin_profile_workspace.tsx` |
| Shared system | `ADMIN/Shared Screens/oneclub_shared_system_screens_pass_6.tsx` |
| Student * | matching `STUDENT/*` files; ignore QA chrome and wrong club names |
| President Home/Proposals/Events | `PRESIDENT/HOME|PROPOSALS|EVENTS` minus join/dues attention and complete/cancel |
