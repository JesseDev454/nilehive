# Clubly User Test Results and E2E Template

Source: `CLUBLY_USER_TESTING_QA_PLAN.md`

Purpose: record real user-testing outcomes and convert the highest-risk Clubly workflows into Playwright E2E coverage.

## 1. Test Session Info

| Field | Value |
| --- | --- |
| Date |  |
| Tester name or label |  |
| Role tested |  |
| Device used |  |
| Browser |  |
| Screen size if known |  |
| Tester familiarity with CampusOne/Clubly |  |
| Test observer |  |

## 2. Manual Task Result Table

Use this table for any ad hoc task or copy it into each role section.

| Task | Completed? | Help Needed? | Difficulty 1-5 | Time Taken | Where They Hesitated | Confusing Words/Labels | Wrong Clicks | Notes |
| ---- | ---------- | ------------ | -------------- | ---------- | -------------------- | ---------------------- | ------------ | ----- |
|  |  |  |  |  |  |  |  |  |

## 3. Pass / Warning / Fail Rules

Pass:

- User completes task without help.
- Difficulty rating is 1-2.
- No restricted page reached.
- User can explain what happens next.

Warning:

- User completes task but hesitates.
- Difficulty rating is 3.
- User asks one clarification question.
- User eventually recovers from wrong click.

Fail:

- User needs help.
- Difficulty rating is 4-5.
- User clicks wrong route repeatedly.
- User cannot explain current status or next step.
- User reaches a restricted page unexpectedly.

## 4. Role-Specific Manual Result Sections

### Student

| Task | Completed? | Help Needed? | Difficulty 1-5 | Time Taken | Where They Hesitated | Confusing Words/Labels | Wrong Clicks | Notes |
| ---- | ---------- | ------------ | -------------- | ---------- | -------------------- | ---------------------- | ------------ | ----- |
| Join club with dues required |  |  |  |  |  |  |  |  |
| Join club with no dues required |  |  |  |  |  |  |  |  |
| Upload payment proof after initial request |  |  |  |  |  |  |  |  |
| View approval status |  |  |  |  |  |  |  |  |
| RSVP for event |  |  |  |  |  |  |  |  |
| Check notifications |  |  |  |  |  |  |  |  |
| Submit feedback |  |  |  |  |  |  |  |  |

### President

| Task | Completed? | Help Needed? | Difficulty 1-5 | Time Taken | Where They Hesitated | Confusing Words/Labels | Wrong Clicks | Notes |
| ---- | ---------- | ------------ | -------------- | ---------- | -------------------- | ---------------------- | ------------ | ----- |
| Create Event Proposal |  |  |  |  |  |  |  |  |
| Save proposal draft |  |  |  |  |  |  |  |  |
| Submit proposal |  |  |  |  |  |  |  |  |
| Track proposal status |  |  |  |  |  |  |  |  |
| Assign task to executive |  |  |  |  |  |  |  |  |
| Handle no-executives state |  |  |  |  |  |  |  |  |
| Manage members |  |  |  |  |  |  |  |  |
| Submit event report |  |  |  |  |  |  |  |  |

### Executive

| Task | Completed? | Help Needed? | Difficulty 1-5 | Time Taken | Where They Hesitated | Confusing Words/Labels | Wrong Clicks | Notes |
| ---- | ---------- | ------------ | -------------- | ---------- | -------------------- | ---------------------- | ------------ | ----- |
| View assigned tasks |  |  |  |  |  |  |  |  |
| Update task status |  |  |  |  |  |  |  |  |
| Read announcements |  |  |  |  |  |  |  |  |
| View events |  |  |  |  |  |  |  |  |
| Use Discover Clubs |  |  |  |  |  |  |  |  |
| Use Members with view-only expectations |  |  |  |  |  |  |  |  |
| Submit feedback |  |  |  |  |  |  |  |  |

### Advisor

| Task | Completed? | Help Needed? | Difficulty 1-5 | Time Taken | Where They Hesitated | Confusing Words/Labels | Wrong Clicks | Notes |
| ---- | ---------- | ------------ | -------------- | ---------- | -------------------- | ---------------------- | ------------ | ----- |
| Review pending proposal |  |  |  |  |  |  |  |  |
| Approve proposal without remarks |  |  |  |  |  |  |  |  |
| Try rejecting without remarks |  |  |  |  |  |  |  |  |
| Reject proposal with remarks |  |  |  |  |  |  |  |  |
| View reports archive |  |  |  |  |  |  |  |  |
| Check notifications |  |  |  |  |  |  |  |  |

### Admin

| Task | Completed? | Help Needed? | Difficulty 1-5 | Time Taken | Where They Hesitated | Confusing Words/Labels | Wrong Clicks | Notes |
| ---- | ---------- | ------------ | -------------- | ---------- | -------------------- | ---------------------- | ------------ | ----- |
| Use Needs Action Today queues |  |  |  |  |  |  |  |  |
| Review final proposal |  |  |  |  |  |  |  |  |
| Reject final proposal without remarks |  |  |  |  |  |  |  |  |
| Review dues proof from Membership Review |  |  |  |  |  |  |  |  |
| Verify dues proof |  |  |  |  |  |  |  |  |
| Reject dues proof |  |  |  |  |  |  |  |  |
| Use `/members?club_id=...` from club dashboard |  |  |  |  |  |  |  |  |
| Apply shared payment profile and confirm modal |  |  |  |  |  |  |  |  |
| Review feedback |  |  |  |  |  |  |  |  |
| Export reports or feedback |  |  |  |  |  |  |  |  |

### Feedback Manager

| Task | Completed? | Help Needed? | Difficulty 1-5 | Time Taken | Where They Hesitated | Confusing Words/Labels | Wrong Clicks | Notes |
| ---- | ---------- | ------------ | -------------- | ---------- | -------------------- | ---------------------- | ------------ | ----- |
| Open feedback inbox |  |  |  |  |  |  |  |  |
| Filter by status |  |  |  |  |  |  |  |  |
| Filter by role/category/date |  |  |  |  |  |  |  |  |
| Clear filters |  |  |  |  |  |  |  |  |
| Export CSV |  |  |  |  |  |  |  |  |
| Open notifications and confirm role-safe links |  |  |  |  |  |  |  |  |

## 5. Bug / UX Issue Log

Severity:

- Critical: blocks task completion.
- High: user completes task only with help.
- Medium: causes hesitation or wrong click.
- Low: polish/copy issue.

Status:

- New
- Confirmed
- In Progress
- Fixed
- Retest Needed
- Closed

| Issue ID | Role | Page | Severity | What Happened | Expected Behavior | Evidence | Suggested Fix | Owner | Status |
| -------- | ---- | ---- | -------- | ------------- | ----------------- | -------- | ------------- | ----- | ------ |
| CLUBLY-UX-001 |  |  |  |  |  |  |  |  | New |

## 6. Playwright E2E Coverage Plan

### Existing Playwright Setup Found

Primary frontend setup:

- Config: `frontend/playwright.config.ts`
- Test directory: `frontend/tests/e2e`
- Helpers: `frontend/tests/e2e/helpers/auth.ts`, `frontend/tests/e2e/helpers/mock-api.ts`, `frontend/tests/e2e/helpers/push.ts`
- Fixture re-export: `frontend/playwright-fixture.ts`
- Package scripts from `frontend/package.json`:
  - `npm run test:e2e`
  - `npm run test:e2e:ui`
  - `npm run test:e2e:headed`
  - `npm run test:e2e:debug`
  - `npm run e2e`
  - `npm run e2e:headed`
  - `npm run e2e:ui`

Root-level setup also exists:

- Config: `playwright.config.ts`
- Test directory: `tests/e2e`
- Root config currently matches only `smoke.spec.ts` and starts the frontend dev server from `frontend`.

Auth and mock strategy:

- Tests use `loginAs(page, role)` from `frontend/tests/e2e/helpers/auth.ts`.
- `loginAs` writes a role-specific E2E profile to `localStorage` under `club-services:e2e-auth`.
- The Vite dev server is started with `VITE_ENABLE_E2E_AUTH=true`.
- Tests call `mockClubServicesApi(page, state)` from `frontend/tests/e2e/helpers/mock-api.ts`.
- API calls to `/api/v1/**` are fulfilled by Playwright route mocks.
- `createE2EState()` provides clubs, proposals, dues, membership requests, tasks, notifications, feedback, users, events, RSVP/attendance maps, and push notification state.

Current E2E test files:

- `frontend/tests/e2e/smoke.spec.ts`
- `frontend/tests/e2e/student-flows.spec.ts`
- `frontend/tests/e2e/admin-flows.spec.ts`
- `frontend/tests/e2e/president-dashboard.spec.ts`
- `frontend/tests/e2e/executive-flow.spec.ts`
- `frontend/tests/e2e/advisor-flow.spec.ts`
- `frontend/tests/e2e/feedback-export.spec.ts`
- `frontend/tests/e2e/notifications.spec.ts`
- `frontend/tests/e2e/push-notifications.spec.ts`
- `frontend/tests/e2e/event-check-in.spec.ts`
- `frontend/tests/e2e/mobile-viewport.spec.ts`
- `frontend/tests/e2e/error-states.spec.ts`
- `frontend/tests/e2e/analytics.spec.ts`
- `frontend/tests/e2e/design-shell.spec.ts`

Important current test drift to address before expanding coverage:

- `frontend/tests/e2e/president-dashboard.spec.ts` still asserts older president labels such as `Create event`, `Create proposal`, and `Assign task`.
- `frontend/tests/e2e/mobile-viewport.spec.ts` still asserts `Assign task` on the president dashboard.
- Some admin smoke expectations reference older dashboard queue labels and should be checked against `Needs Action Today`.

### Coverage Matrix

| Area | Existing Coverage | Missing Coverage | Recommended Test File | Priority |
| ---- | ----------------- | ---------------- | --------------------- | -------- |
| Student sidebar and notifications | Notification center and student role-safe notification data are covered. | Sidebar explicitly includes Notifications with badge count. | `frontend/tests/e2e/student-flows.spec.ts` or `notifications.spec.ts` | High |
| Student club discovery | Search/filter, club detail, join, proof upload, club links, sharing, error states. | Phase 2 membership progress tracker and one primary CTA assertions. | `frontend/tests/e2e/student-flows.spec.ts` | Critical |
| Student dues/no-dues journey | Dues-required join is covered. | No-dues club tracker behavior and proof steps marked not required. | `frontend/tests/e2e/student-flows.spec.ts` | High |
| Student RSVP | Upcoming event RSVP is covered. | Mobile RSVP layout and event detail controls. | `frontend/tests/e2e/mobile-viewport.spec.ts` | Medium |
| Student feedback | Submission error state covered. | Successful feedback submit path. | `frontend/tests/e2e/student-flows.spec.ts` | Medium |
| President dashboard | Dashboard cards and task route covered, but assertions are stale. | Single `Create Event Proposal` CTA, no duplicate `/proposals/new` CTAs, no-executives dashboard state. | `frontend/tests/e2e/president-dashboard.spec.ts` | Critical |
| President proposal workflow | Some dashboard route coverage. | Start/save draft, open proposals, track status, detail back link. | `frontend/tests/e2e/president-dashboard.spec.ts` or new `president-proposals.spec.ts` | High |
| President tasks | Route to tasks covered. | Assign task when executives exist and no-executives empty state link. | `frontend/tests/e2e/president-dashboard.spec.ts` | High |
| Executive dashboard/tasks | Dashboard and task status update covered. | Sidebar Discover Clubs/Members, Discover Clubs without AccessDenied, Members without admin controls. | `frontend/tests/e2e/executive-flow.spec.ts` | High |
| Advisor approvals | Dashboard and approve-with-remarks path covered. | Reject without remarks validation, approve without remarks, detail back link. | `frontend/tests/e2e/advisor-flow.spec.ts` | Critical |
| Admin dashboard | Admin smoke and analytics/matrix coverage exists. | `Needs Action Today` before metrics and all queue card destinations. | `frontend/tests/e2e/admin-flows.spec.ts` | Critical |
| Admin membership/dues | Membership queue and dues mark-paid covered. | `Review Payment Proof`, `Back to Membership Review`, reject dues proof. | `frontend/tests/e2e/admin-flows.spec.ts` | Critical |
| Admin members filter | Member table covered. | `/members?club_id=...` initializes club filter and manual filter still works. | `frontend/tests/e2e/admin-flows.spec.ts` | High |
| Admin proposal decisions | Not clearly covered in current admin specs. | Reject without remarks validation and final-review route behavior. | `frontend/tests/e2e/admin-flows.spec.ts` | Critical |
| Admin dues global apply | Not found in current coverage. | Confirmation dialog and cancel no-mutation behavior. | `frontend/tests/e2e/admin-flows.spec.ts` | High |
| Feedback Manager inbox | Inbox and CSV export covered. | Status filter labels, Clear filters, notification link safety. | `frontend/tests/e2e/feedback-export.spec.ts` and `notifications.spec.ts` | High |
| Mobile flows | Student dashboard/notifications/check-in and president dashboard smoke covered. | Mobile membership tracker, proof upload, RSVP, proposal form, admin queues, dues proof, feedback filters, sidebar/menu. | `frontend/tests/e2e/mobile-viewport.spec.ts` | High |
| Access control | Student analytics restriction and feedback manager redirect covered. | Broader role restricted routes and new `AccessDenied` pattern across pages. | `frontend/tests/e2e/error-states.spec.ts` or new `access-control.spec.ts` | Medium |

## 7. Critical Playwright Tests To Add

### Student E2E Tests

Recommended tests:

- Student can see Notifications in sidebar.
- Student can open Discover Clubs.
- Student can open a dues-required club detail page.
- Student sees membership progress tracker with Choose Club, Submit Details, Pay Dues, Upload Proof, Await Approval.
- Student sees one clear primary next-action CTA in the membership flow.
- Student can upload payment proof if the current `mockClubServicesApi` upload route remains available.
- Student can open Events and RSVP.
- Student can submit feedback successfully.

Suggested assertions:

```ts
await expect(page.getByRole("link", { name: /Notifications/i })).toBeVisible();
await expect(page.getByRole("heading", { name: /Discover Clubs/i })).toBeVisible();
await expect(page.getByRole("heading", { name: /Membership Progress/i })).toBeVisible();
await expect(page.getByText("Choose Club")).toBeVisible();
await expect(page.getByText("Await Approval")).toBeVisible();
await expect(page.getByRole("link", { name: /Continue Membership Setup|Upload Payment Proof|View Approval Status|Explore Events/i })).toHaveCount(1);
```

### President E2E Tests

Recommended tests:

- President dashboard shows one `Create Event Proposal` CTA.
- `Create Event Proposal` opens `/proposals/new`.
- President can save or start proposal draft if current test setup supports proposal mutations.
- President can open Proposals and track status.
- President sees no-executives empty state when fixture has no executives.
- President can open Members from no-executives guidance.
- President can open Tasks and assign task when executives exist.

Suggested assertions:

```ts
await expect(page.getByRole("link", { name: /Create Event Proposal/i })).toHaveCount(1);
await page.getByRole("link", { name: /Create Event Proposal/i }).click();
await expect(page).toHaveURL(/\/proposals\/new/);
await expect(page.getByText(/No executives linked yet|No executives available yet/i)).toBeVisible();
```

### Executive E2E Tests

Recommended tests:

- Executive sidebar includes Discover Clubs and Members.
- Executive can open My Tasks.
- Executive can update task status if fixture supports mutation.
- Executive can open Discover Clubs without AccessDenied.
- Executive can open Members without admin controls.

Suggested assertions:

```ts
await expect(page.getByRole("link", { name: /Discover Clubs/i })).toBeVisible();
await expect(page.getByRole("link", { name: /^Members$/i })).toBeVisible();
await page.goto("/membership");
await expect(page.getByText(/access is restricted/i)).toHaveCount(0);
await page.goto("/members");
await expect(page.getByRole("heading", { name: /Member/i })).toBeVisible();
await expect(page.getByRole("button", { name: /Replace President|Update Status/i })).toHaveCount(0);
```

### Advisor E2E Tests

Recommended tests:

- Advisor can open Approvals.
- Advisor cannot reject without remarks.
- Inline validation appears.
- Advisor can approve without remarks if fixture supports mutation.
- Proposal detail opened from Approvals shows `Back to Approvals`.

Suggested assertions:

```ts
await page.goto("/approvals");
await page.getByRole("button", { name: "Reject" }).click();
await expect(page.getByText(/Add rejection remarks/i)).toBeVisible();
await page.getByRole("link", { name: /View details/i }).click();
await expect(page.getByRole("link", { name: /Back to Approvals/i })).toBeVisible();
```

### Admin E2E Tests

Recommended tests:

- Admin dashboard shows `Needs Action Today` before general metrics.
- Queue cards route to expected pages.
- Admin can open Membership Review.
- Rows with proof show `Review Payment Proof`.
- Dues proof review opened from Membership Review shows `Back to Membership Review`.
- Admin cannot reject proposal without remarks.
- `Apply to all clubs` opens confirmation dialog.
- Canceling the dialog does not run mutation if route call counting/mocking supports it.
- `/members?club_id=...` initializes the member club filter.

Suggested assertions:

```ts
await expect(page.getByText("Needs Action Today")).toBeVisible();
await page.getByRole("link", { name: /Review Members/i }).click();
await expect(page).toHaveURL(/\/membership\?status=pending/);
await expect(page.getByRole("link", { name: /Review Payment Proof/i })).toBeVisible();
await page.getByRole("link", { name: /Review Payment Proof/i }).click();
await expect(page.getByRole("link", { name: /Back to Membership Review/i })).toBeVisible();
```

### Feedback Manager E2E Tests

Recommended tests:

- Feedback Manager lands on `/feedback`.
- Sidebar only shows App Feedback and Notifications.
- Feedback status filter supports New / Open, Reviewed, Archived.
- Clear filters works.
- Notification links only route to `/feedback` or `/notifications`.

Suggested assertions:

```ts
await expect(page).toHaveURL(/\/feedback$/);
await expect(page.getByRole("link", { name: /App Feedback|Feedback/i })).toBeVisible();
await expect(page.getByRole("link", { name: /Notifications/i })).toBeVisible();
await page.getByRole("combobox", { name: /Status/i }).click();
await expect(page.getByRole("option", { name: /New \/ Open/i })).toBeVisible();
await expect(page.getByRole("option", { name: /Reviewed/i })).toBeVisible();
await expect(page.getByRole("option", { name: /Archived/i })).toBeVisible();
```

## 8. Suggested Playwright Test Structure

The repo already uses `frontend/tests/e2e` with role-oriented files and shared helpers. Keep that style instead of creating a parallel `frontend/e2e` tree.

Recommended structure:

```txt
frontend/tests/e2e/
  student-flows.spec.ts
  president-dashboard.spec.ts
  executive-flow.spec.ts
  advisor-flow.spec.ts
  admin-flows.spec.ts
  feedback-export.spec.ts
  notifications.spec.ts
  mobile-viewport.spec.ts
  error-states.spec.ts
  access-control.spec.ts        # add only if access coverage grows beyond error-states
  helpers/
    auth.ts
    mock-api.ts
    push.ts
```

Recommended helper evolution:

```txt
frontend/tests/e2e/helpers/
  auth.ts          # keep loginAs role helper
  mock-api.ts      # keep createE2EState and mockClubServicesApi
  roles.ts         # optional only if role setup grows
  selectors.ts     # optional only for repeated selectors that cannot use accessible roles
  testData.ts      # optional only if mock-api state becomes too large
```

Do not split helpers until repeated setup becomes painful. Today, `auth.ts` and `mock-api.ts` are enough for most additions.

## 9. Selector Strategy

Prefer selectors in this order:

1. Accessible roles.
2. Button/link text.
3. Labels.
4. Headings.
5. Visible status text.
6. `data-testid` only when text/role selectors are unreliable.

Good examples:

```ts
page.getByRole("button", { name: /Create Event Proposal/i });
page.getByRole("link", { name: /Notifications/i });
page.getByRole("heading", { name: /Membership Progress/i });
page.getByText(/Needs Action Today/i);
page.getByLabel(/Upload dues proof/i);
```

Places where `data-testid` may help if selectors become flaky:

- Membership progress tracker container and current step.
- Admin `Needs Action Today` section and each queue card.
- President dashboard quick-action group.
- Dues proof viewer frame/container, especially PDF/document fallback.
- Feedback filter panel and Clear filters action.
- Notification cards with safe/unsupported target behavior.

Only add `data-testid` after text/role selectors prove unstable. Adding test IDs is an app-code change, so batch it intentionally.

## 10. Mobile Playwright Tests

Current config only defines Desktop Chrome. Existing mobile tests use `test.use({ viewport: { width: 390, height: 844 } })` inside `mobile-viewport.spec.ts`. Keep that pattern unless the team adds Playwright device projects.

Recommended mobile viewports:

- `390 x 844` for modern iPhone-style testing.
- `360 x 740` for smaller Android-style testing.
- `768 x 1024` for tablet testing if admin dashboards are important.

Recommended mobile E2E checks:

| Mobile Area | Recommended E2E Check | Priority |
| --- | --- | --- |
| Student membership flow | Open `/membership`, use Menu/sidebar, open club detail, verify tracker and CTA fit. | Critical |
| Payment proof upload | Upload proof on `/membership/clubs/club-tech` and verify ready state is visible. | Critical |
| Event RSVP | Open `/events`, RSVP, verify button state updates without overflow. | High |
| President proposal creation | Open `/proposals/new`, verify first step/form and main actions fit. | High |
| Admin Needs Action Today | Open admin dashboard, verify queue cards stack and action buttons are visible. | Critical |
| Dues proof review | Open proof review route and verify back/action buttons are reachable. | High |
| Feedback inbox filtering | Open `/feedback`, use status filter, verify Clear filters in no-results state. | High |
| Sidebar/menu behavior | For student, president, admin, feedback manager, verify Menu opens and role links are visible. | Critical |

If mobile coverage grows, add device projects to `frontend/playwright.config.ts` later, for example Desktop Chrome plus Mobile Chrome, but do not change config just for this documentation task.

## 11. Test Data Checklist

- [ ] Student with no memberships.
- [ ] Student with pending payment.
- [ ] Student with proof under review.
- [ ] Student with active membership.
- [ ] Club with dues required.
- [ ] Club with no dues required.
- [ ] President with executives.
- [ ] President with no executives.
- [ ] Pending advisor proposal.
- [ ] Pending admin final-review proposal.
- [ ] Submitted dues proof.
- [ ] Rejected dues proof.
- [ ] Approved event.
- [ ] Event needing report.
- [ ] Executive with tasks.
- [ ] Executive with no tasks.
- [ ] Feedback manager account.
- [ ] Feedback items with statuses `open`, `reviewed`, and `archived`.

Current mock data already includes:

- Student, admin, president, advisor, executive, and feedback manager role auth.
- One dues-required club and one business club.
- Submitted dues proof.
- Pending membership request.
- Pending advisor proposal.
- Approved event and today check-in event.
- Executive task.
- Open feedback item.

Mock data gaps to add for stronger E2E:

- No-dues club fixture.
- President dashboard with zero executives.
- Pending admin final-review proposal.
- Rejected dues proof.
- Feedback items with `reviewed` and `archived` statuses.
- Event needing report.
- Student pending payment/proof-under-review/active membership variants.

## 12. Prioritization Rules

1. Fix or test anything that blocks Student joining/payment flow.
2. Fix or test anything that blocks Admin review/payment verification.
3. Fix or test anything that blocks President proposal creation/submission.
4. Fix role-access bugs or restricted-page wrong routes.
5. Fix mobile layout issues that affect core tasks.
6. Fix copy/label confusion.
7. Fix polish last.

## 13. Final Summary Section

Fill this out after each manual test cycle.

| Field | Notes |
| --- | --- |
| Biggest blocker found |  |
| Most confusing workflow |  |
| Most successful workflow |  |
| Mobile issues found |  |
| Role with highest difficulty rating |  |
| Top 5 fixes before launch |  |
| Top 5 Playwright tests to implement first |  |
| Launch readiness verdict | Not ready / Ready for limited pilot / Ready for wider rollout |

## 14. Output Summary

### Summary of What Was Created

- A reusable manual testing results tracker.
- Role-specific task result tables.
- Pass/warning/fail rules.
- Bug and UX issue log template.
- Playwright E2E coverage inventory.
- Critical E2E test recommendations by role.
- Suggested Playwright structure matching the existing repo.
- Selector, mobile, test data, and prioritization guidance.

### Existing Playwright Coverage Found

- Basic app smoke and student dashboard.
- Student club discovery, dues-required join, proof upload, RSVP, sharing, and error states.
- Admin dashboard smoke, membership queue, dues mark-paid, members table, club management, user access.
- President dashboard/profile/task route coverage, with known stale label assertions.
- Advisor dashboard and approval queue approve path.
- Executive dashboard and task status update.
- Feedback Manager inbox and CSV export.
- Notifications, push-notification UI, QR check-in, analytics, error states, design shell, and mobile smoke.

### Highest-Risk Workflows To Test Manually

1. Student joins a dues-required club and uploads proof.
2. Admin reviews payment proof from Membership Review.
3. President creates, saves, submits, and tracks an event proposal.
4. Advisor rejects a proposal with required remarks.
5. Admin uses Needs Action Today to clear queues.
6. Feedback Manager filters feedback and opens notifications safely.
7. Mobile student membership and mobile president proposal creation.

### Highest-Value Playwright Tests To Automate First

1. Student membership progress tracker and one primary CTA.
2. Admin Needs Action Today queue routing.
3. Membership Review to Review Payment Proof to Back to Membership Review.
4. Advisor/admin rejection remarks validation.
5. President single Create Event Proposal CTA and no-executives state.

### Recommended Order For Live User Testing

1. Student membership/payment flow.
2. Admin review queues and payment proof review.
3. President proposal, task, member, and report flows.
4. Advisor proposal review.
5. Executive task, event, Discover Clubs, and Members access.
6. Feedback Manager inbox, filters, export, and notifications.

### Recommended Order For Playwright Implementation

1. Update stale president/admin smoke assertions to match Phase 2 labels and dashboard layout.
2. Add student membership tracker and CTA assertions.
3. Add admin Needs Action Today and dues-proof bridge assertions.
4. Add advisor/admin rejection-validation assertions.
5. Add feedback-manager status filter and notification safety assertions.
6. Add executive Discover Clubs/Members access assertions.
7. Expand mobile viewport tests for the highest-risk role flows.
