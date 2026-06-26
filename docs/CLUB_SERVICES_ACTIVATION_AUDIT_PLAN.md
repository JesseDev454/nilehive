# Club Services Activation and Retention Audit Plan

Date: 2026-06-21

## Scope

This audit covers the existing CampusOne-connected Club Services app without proposing a rebuild. The goal is to improve activation, retention, clarity, and role-specific UX through small, reviewable changes that preserve existing routing, permissions, database shape, and CampusOne SSO behavior.

No schema change is required for the first implementation sprints. The only likely schema/data additions are for interest-based discovery and richer club metadata, and those should be deferred until the current student journey is clearer.

## Current Architecture Summary

The app is split into a Vite React frontend and an Express/Supabase backend.

Frontend:

- `frontend/src/App.tsx` defines public auth routes and protected app routes.
- `frontend/src/contexts/AuthContext.tsx` owns session loading, CampusOne/cookie auth redirection, local Supabase auth fallback, profile recovery, inactivity timeout, and effective role exposure.
- `frontend/src/contexts/RoleContext.tsx` derives role from `AuthContext`; it does not support client-side role switching.
- `frontend/src/components/AppLayout.tsx` wraps protected pages with sidebar, header, guided onboarding, and footer.
- `frontend/src/components/AppSidebar.tsx` defines role-specific navigation for student, president, executive, advisor, admin, and feedback_manager.
- `frontend/src/pages/Dashboard.tsx` contains role-specific dashboard renderers for student, president, executive, advisor, and admin.
- `frontend/src/lib/api.ts` is the central typed API client for profile, clubs, proposals, dashboards, membership, dues, events, announcements, feedback, notifications, tasks, reports, storage, and users.

Backend:

- `backend/src/app.js` mounts all API modules under `/api/v1`.
- `backend/src/middleware/auth.js` supports local bearer auth, portal cookie auth, and CampusOne OIDC session auth.
- `backend/src/shared/portalAccess.js` resolves effective app role from portal role, app role, and custom roles.
- `backend/src/middleware/requireRole.js` provides route-level guards where used.
- Most fine-grained authorization is enforced inside service modules, especially membership, dues, events, communications, tasks, reports, proposals, and dashboards.
- Supabase migrations define the data model and RLS policies. The backend uses the service role client and still performs app-level permission checks.

Core data already present:

- Profiles with app role, portal id/email bridge, student id, phone, department, student type, join reason, and account status.
- Clubs with public signup visibility, descriptions, dues amount, shared payment settings, and WhatsApp onboarding notes.
- Membership requests linked to due payments and pending club member records.
- Due payments with proof URL, payment account name, paid date, status, verification metadata, and academic session.
- Approved event proposals, event RSVPs, event attendance, QR self check-in, and event feedback.
- Announcements, announcement reads, notifications, push subscriptions, reminders, tasks, reports, advisor assignments, leadership applications, and audit logs.

## Routing and Role Workspace Logic

Protected routing:

- Unauthenticated users are redirected to `/login`.
- Users without a profile go to profile recovery/setup.
- `feedback_manager` users are redirected to `/feedback` and only see the feedback inbox nav.
- All app routes live under `AppLayout`, except `/events/:proposalId/check-in`, which is protected but presented as a focused QR flow.

Role navigation:

- Student: Home, Discover Clubs, Events, Announcements, Feedback.
- President: Dashboard, Create Proposal, Club Proposals, Task Delegation, Members, Announcements, Events, Reports Archive, Feedback, Notifications.
- Executive: Dashboard, My Tasks, Announcements, Events, Feedback, Notifications.
- Advisor: Dashboard, Pending Approvals, Announcements, Events, Reports Archive, Feedback, Notifications.
- Admin: Dashboard, User Management, Clubs, Final Review, Membership, Members, Tasks, Dues, Announcements, Events, Reports Archive, Feedback, Notifications.
- Feedback manager: App Feedback.

Gap:

- Route access is partly enforced by UI nav and partly by backend service checks. Some pages render restricted states, but page-level role gates are not centralized.
- `canViewProposalDetails` only allows president/advisor/admin; executive can see events but not event proposal details.

## Existing Student Activation Flow

Current student path:

1. CampusOne sign-in creates or links a profile as `student`.
2. Student lands on `/` and sees a student dashboard.
3. Student uses `/membership` to discover public clubs.
4. Student opens `/membership/clubs/:clubId` for club details and a join form.
5. Join form captures student id, phone, department, student type, join reason, payment account name, paid date, and receipt/proof.
6. Submitting creates a pending club member, submitted due payment, and membership request.
7. Student sees request/payment status in `/membership` and dashboard.
8. Admin reviews dues/payment from `/dues` and/or membership queue.
9. Payment approval activates the member and request; WhatsApp onboarding can be marked by admin.
10. Student sees approved club events under `/events`.
11. Student can RSVP before/present event date and self check in with `/events/:proposalId/check-in` on the event day.
12. Attended students can submit event feedback after the event.
13. Students can read announcements and submit app feedback from `/communications` or `/feedback`.

Strengths:

- The student path is real and end-to-end.
- Paid join requests are linked to dues proof and activation state.
- Loading, empty, error, and restricted states exist in many pages.
- QR self check-in already exists and is protected to students.

Gaps:

- Dashboard and discovery do not yet feel like a guided first-session experience.
- Discover Clubs only supports text search over name/code/description; no interest tags, categories, schedule hints, or "recommended for you" logic.
- Club detail is functional but not yet persuasive: limited rich club identity, benefits, recent activity, upcoming events, officers, and expected dues/checklist explanation.
- Payment proof state exists, but the language and dashboard prompts could better explain "what happens next."
- Student notifications are present, but reminders and push opt-in are not surfaced early enough in the first-five-minute flow.
- Invite/share is not a first-class flow yet.
- No analytics instrumentation is visible for activation funnel drop-off.

## Existing Role Dashboards and Gaps

Student dashboard:

- Uses membership requests, dues, approved events, event engagement, and reminders.
- Shows membership/dues status, events, reminders, and quick links.
- Gap: needs stronger next-best-action logic, clearer activation checklist, and better fallback states when the student has no club, no events, or pending payment.

President dashboard:

- Uses `/api/v1/dashboard/president`.
- Shows club health score, pending proposals, upcoming events, executive team, and recent proposal activity.
- Gap: does not yet guide incomplete club setup, payment settings, member activation, announcement cadence, or reports due.

Admin dashboard:

- Uses `/api/v1/dashboard/admin-operations`.
- Shows pending actions, proposal bottlenecks, dues queue, membership requests, missing reports, club performance matrix, institution snapshot, and recent activity.
- Gap: strong operational view, but should link more directly to review queues and include clearer "today's work" prioritization.

Advisor dashboard:

- Uses `useAdvisorPendingProposals`.
- Shows pending review count and pending proposal list.
- Gap: narrow view; should include assigned clubs, upcoming events, report gaps, recent activity, and unanswered comments.

Executive dashboard:

- Uses tasks, notifications, and approved events.
- Shows task progress, priority tasks, upcoming events, and latest notifications.
- Gap: good task start, but should include club context, president announcements, event duties, and blocked task escalation.

Feedback manager flow:

- Redirected to `/feedback`, backed by `Communications` default feedback tab.
- Can filter app feedback categories/status and download CSV.
- Gap: no dedicated triage states, owner/status workflow in UI, or trend summaries beyond CSV export.

## Safe UX/Product Changes

These should be implemented before schema changes:

1. Student next-action panel.
   - Show the most important action: discover club, finish dues proof, wait for review, RSVP, check in, read announcement, or submit feedback.
   - Likely files: `frontend/src/pages/Dashboard.tsx`, optional helper in `frontend/src/lib`.

2. Student first-five-minute checklist.
   - Steps: choose club, submit paid join request, dues verified, RSVP/check in, read announcements, enable notifications, submit feedback.
   - Use existing membership, dues, events, engagement, announcements, and notification APIs.

3. Discover Clubs clarity pass.
   - Improve empty states, search results, existing-request badges, "what happens after joining," and due amount visibility.
   - Likely files: `frontend/src/pages/Membership.tsx`, `frontend/src/lib/publicClubsQuery.ts`.

4. Club detail polish without schema changes.
   - Reuse club description, code, dues, payment settings, existing request, upcoming events if accessible, and current request status.
   - Avoid adding rich media or tags until data model is agreed.

5. Join flow copy and validation polish.
   - Clarify receipt upload requirements, file size, required fields, and post-submit state.
   - Preserve `createMembershipRequest` contract.

6. Dues status explanation.
   - Student-facing status should explain whether payment is submitted, rejected, paid, or awaiting proof.
   - Admin dues table should make "mark paid activates membership" explicit.

7. Events retention pass.
   - Highlight upcoming events for active members.
   - Surface RSVP status and QR check-in availability.
   - Show feedback prompt after attended past events.
   - Likely files: `frontend/src/pages/EventCalendar.tsx`, `frontend/src/pages/EventCheckIn.tsx`, `frontend/src/lib/eventLifecycle.ts`.

8. Announcements and notifications visibility.
   - Surface unread announcements and push opt-in on the student dashboard.
   - Preserve existing `/notifications` push flow.

9. Role-specific dashboard action cards.
   - President: setup checklist, pending member/dues/report/event actions.
   - Advisor: assigned-club activity and review queue.
   - Executive: task due-soon, blocked tasks, event duties.
   - Admin: today's review queue and direct links.

10. Feedback CTA improvements.
    - Add contextual feedback links from membership, dues, events, and dashboard.
    - Keep feedback_manager inbox behavior unchanged.

## Missing Data or Possible Future Data Additions

No new data is needed for the first UX pass. Existing tables can power a useful activation layer.

Potential future additions:

- Club interests/categories/tags for interest-based discovery.
- Club meeting cadence, membership expectations, and onboarding instructions.
- Club cover image/logo/gallery asset metadata.
- Student interest preferences for recommendations.
- Invite/referral events if invite tracking matters beyond a copyable link.
- Dashboard analytics/funnel events for sign-in, discovery view, club detail open, join submit, proof upload, dues approved, RSVP, check-in, feedback submit.
- Announcement delivery/read summary by role/club.
- Event QR session metadata if QR codes need expiry windows or per-event rotating tokens beyond proposal id/date checks.
- Notification preference model if students need per-channel or per-topic controls.

Schema-change guidance:

- Start with nullable columns or additive tables only.
- Avoid changing existing enum values unless necessary.
- Preserve current RLS and service-layer authorization.
- Add migrations with backfill-safe defaults.
- Add backend tests for any new permission rule.

## Proposed Sprint-by-Sprint Implementation Order

Sprint 0: Baseline QA and guardrails

- Run current manual checklist below.
- Record existing broken checks and known TypeScript/test blockers.
- Confirm no SSO, role routing, or admin review regression before UX work.
- Files likely touched: docs only, test notes.

Sprint 1: Student dashboard activation

- Add next-best-action logic and first-five-minute checklist using existing APIs.
- Improve loading/empty/error states for dashboard student sections.
- Surface "enable notifications" and "read announcements" as return hooks.
- Tests: pure helper tests for next-action logic; React smoke tests if current Vitest config is unblocked.
- Files likely touched: `frontend/src/pages/Dashboard.tsx`, optional `frontend/src/lib/studentActivation.ts`, `frontend/src/lib/*.test.ts`.

Sprint 2: Discover Clubs and club detail clarity

- Improve `/membership` discovery cards, status badges, and search/empty states.
- Improve `/membership/clubs/:clubId` join page copy and status explanations.
- Make dues amount/payment requirements clear before submit.
- Tests: membership helper/status tests; backend tests only if API behavior changes.
- Files likely touched: `frontend/src/pages/Membership.tsx`, `frontend/src/lib/joinFormDraftStorage.ts`, `frontend/src/lib/storage.ts`.

Sprint 3: Dues proof and membership status loop

- Improve student payment proof states and rejected-proof recovery.
- Improve admin dues review table language and direct membership links.
- Add clear "mark paid activates member" warnings.
- Tests: existing `backend/tests/dues.test.js`, `backend/tests/membership-requests.test.js`; frontend helper tests.
- Files likely touched: `frontend/src/pages/Dues.tsx`, `frontend/src/pages/Membership.tsx`, possibly backend tests only.

Sprint 4: Events, RSVP, check-in, and feedback retention

- Make upcoming events and RSVP state more prominent for active students.
- Clarify check-in availability and already-checked-in states.
- Surface post-event feedback prompts.
- Tests: `backend/tests/events.test.js`, frontend event helper tests.
- Files likely touched: `frontend/src/pages/EventCalendar.tsx`, `frontend/src/pages/EventCheckIn.tsx`, `frontend/src/lib/eventLifecycle.ts`.

Sprint 5: Announcements, notifications, and return reasons

- Add unread announcement summary to student dashboard.
- Improve push opt-in placement and copy.
- Ensure mark-read and notification states are easy to understand.
- Tests: `backend/tests/communications.test.js`, `backend/tests/notifications.test.js`.
- Files likely touched: `frontend/src/pages/Dashboard.tsx`, `frontend/src/pages/Communications.tsx`, `frontend/src/pages/Notifications.tsx`, `frontend/src/lib/pushNotifications.ts`.

Sprint 6: Role-specific dashboard refinement

- President setup and operations checklist.
- Advisor assigned-club activity and report/review queue.
- Executive task/event duties and blocked work.
- Admin "today's work" queue and clearer direct links.
- Tests: `backend/tests/dashboard.test.js`, role dashboard UI tests where practical.
- Files likely touched: `frontend/src/pages/Dashboard.tsx`, `backend/src/modules/dashboard/dashboard.service.js` only if existing summary data is insufficient.

Sprint 7: Interest-based discovery data model

- Only after UX pass validates what students need.
- Add club categories/tags and optional student interests.
- Add migrations, admin club editing UI, and search/filter support.
- Tests: clubs API tests, migration review, RLS review.
- Files likely touched: `backend/supabase/migrations/*`, `backend/src/modules/clubs/*`, `frontend/src/pages/Clubs.tsx`, `frontend/src/pages/Membership.tsx`.

## Risks and Areas to Avoid Touching

Avoid in early sprints:

- CampusOne OIDC flow in `backend/src/modules/auth/campusOneOidc.js`.
- Cookie/session handling in `frontend/src/contexts/AuthContext.tsx` and `backend/src/middleware/auth.js`.
- Role resolution in `backend/src/shared/portalAccess.js`.
- Existing enums and RLS policies unless a migration is explicitly required.
- Dues activation side effects in membership/dues services without backend tests.
- QR check-in server rules; the event-date guard is important.
- Broad visual redesign of the app shell/sidebar.
- `Portal-main/` unless explicitly working on CampusOne itself.

Known implementation risks:

- Frontend pages often combine data fetching, status resolution, and rendering in one file. Keep changes small or extract pure helpers.
- Some authorization is UI-driven and some is service-driven; always verify backend response behavior.
- Student event visibility depends on active club membership, so empty event states may be correct even if events exist globally.
- Public club discovery is cached in backend database adapter for five minutes.
- Push notifications depend on service worker/browser support and environment keys.
- Current full frontend build/test may be blocked by existing TypeScript/config issues; record blockers separately from sprint regressions.

## Likely Files and Modules to Touch

Frontend:

- `frontend/src/App.tsx`
- `frontend/src/components/AppSidebar.tsx`
- `frontend/src/components/AppLayout.tsx`
- `frontend/src/components/GuidedOnboarding.tsx`
- `frontend/src/components/NeoBrutal.tsx`
- `frontend/src/pages/Dashboard.tsx`
- `frontend/src/pages/Membership.tsx`
- `frontend/src/pages/Dues.tsx`
- `frontend/src/pages/EventCalendar.tsx`
- `frontend/src/pages/EventCheckIn.tsx`
- `frontend/src/pages/Communications.tsx`
- `frontend/src/pages/Notifications.tsx`
- `frontend/src/pages/Clubs.tsx`
- `frontend/src/lib/api.ts`
- `frontend/src/lib/eventLifecycle.ts`
- `frontend/src/lib/eventCheckIn.ts`
- `frontend/src/lib/publicClubsQuery.ts`
- `frontend/src/lib/pushNotifications.ts`
- `frontend/src/lib/storage.ts`
- `frontend/src/lib/joinFormDraftStorage.ts`
- `frontend/src/test/*`

Backend:

- `backend/src/modules/dashboard/*`
- `backend/src/modules/clubs/*`
- `backend/src/modules/membership-requests/*`
- `backend/src/modules/dues/*`
- `backend/src/modules/events/*`
- `backend/src/modules/communications/*`
- `backend/src/modules/notifications/*`
- `backend/src/modules/reminders/*`
- `backend/src/modules/storage/*`
- `backend/src/config/db.js`
- `backend/supabase/migrations/*` only for later data additions.

Tests:

- `backend/tests/dashboard.test.js`
- `backend/tests/clubs.test.js`
- `backend/tests/membership-requests.test.js`
- `backend/tests/dues.test.js`
- `backend/tests/events.test.js`
- `backend/tests/communications.test.js`
- `backend/tests/notifications.test.js`
- `backend/tests/campus-one-oidc-auth.test.js`
- New focused frontend tests for pure helpers where practical.

## Manual Test Checklist Before Changes

Authentication and routing:

- CampusOne student sign-in creates/loads profile and lands on `/`.
- CampusOne admin/staff/custom-role users resolve to expected effective roles.
- Signing out clears session and returns to login.
- Profile recovery still appears when profile is missing.
- `feedback_manager` is redirected to `/feedback`.

Student:

- New student sees dashboard without crashing.
- `/membership` loads public clubs and search works.
- Empty club search shows a useful empty state.
- `/membership/clubs/:clubId` opens a club detail/join form.
- Invalid club id shows "Club not found."
- Join form validates student id and required payment details.
- Receipt upload accepts supported file and rejects oversized files.
- Submitting paid join request creates membership request and due payment.
- Existing request shows status and prevents duplicate open request.
- Rejected payment lets student resubmit proof.
- Active membership appears as active.
- `/events` shows only accessible approved events.
- Student can RSVP to upcoming event.
- QR check-in page blocks non-student role.
- QR check-in only succeeds on event date.
- Attended past event allows feedback once.
- `/communications` shows announcements and lets student submit app feedback.
- `/notifications` loads notification list and push opt-in state.

Admin:

- Admin dashboard loads operations summary.
- Pending proposal queue opens.
- Membership queue loads and filters.
- Dues page loads, filters by club, displays receipt proof links, marks paid/rejected.
- Marking dues paid activates linked membership.
- Club management can create/edit public club details.
- Feedback view filters and exports CSV.
- User management role assignment still works.

President:

- Dashboard loads only assigned club data.
- Can create proposal and see own club proposals.
- Can create announcements for own club/role group.
- Can see approved club events and QR dialog.
- Can manage tasks and members for own club.
- Can view reports archive.

Advisor:

- Dashboard pending approval count loads.
- `/approvals` shows assigned club proposals.
- Approve/reject proposal with remarks works.
- Can view assigned club events/reports/feedback.
- Cannot access admin-only operations.

Executive:

- Dashboard loads assigned tasks, notifications, and club events.
- Can update task status.
- Can view announcements/events/feedback.
- Cannot access admin dues/membership review pages.

Feedback manager:

- Lands on `/feedback`.
- Sees app feedback only.
- Can filter by category/status and export CSV.
- Cannot navigate into normal admin/student workspaces.

Regression checks:

- Backend tests for changed modules pass.
- Frontend build/test status is recorded; if blocked, blocker is documented with exact error.
- No migration is created unless a sprint explicitly requires it.
- No role permissions are widened without backend tests.
