# Clubly Playwright Phase 1 Summary

## Files Changed In This E2E Pass

- `frontend/tests/e2e/helpers/mock-api.ts`
- `frontend/tests/e2e/student-flows.spec.ts`
- `frontend/tests/e2e/president-dashboard.spec.ts`
- `frontend/tests/e2e/admin-flows.spec.ts`
- `frontend/tests/e2e/advisor-flow.spec.ts`
- `frontend/tests/e2e/executive-flow.spec.ts`
- `frontend/tests/e2e/feedback-export.spec.ts`
- `frontend/tests/e2e/mobile-viewport.spec.ts`
- `frontend/tests/e2e/smoke.spec.ts`
- `frontend/tests/e2e/analytics.spec.ts`
- `frontend/tests/e2e/design-shell.spec.ts`
- `frontend/tests/e2e/error-states.spec.ts`
- `frontend/tests/e2e/push-notifications.spec.ts`

Existing Phase 1/Phase 2 app-code changes were already present in the worktree and were not undone.

## Stale Tests Fixed

- Updated president dashboard assertions from old `Create event` / `Create proposal` wording to the current `Create Event Proposal` workflow.
- Scoped president dashboard CTA checks to `main` so the sidebar CTA is not counted as a duplicate dashboard action.
- Updated admin smoke/dashboard tests to expect `Needs Action Today`, `Review Members`, and `Review Payments`.
- Replaced the stale admin inline `Mark Paid` dues action with the current Membership Review -> `Review Payment Proof` -> `Verify Payment` flow.
- Updated admin final-review rejection tests to use the current `Reject` button label and inline remarks validation.
- Updated student smoke feedback navigation to assert the current `Feedback` sidebar link.
- Updated stale analytics/design-shell assertions to match the current operational dashboard and shell controls.
- Stabilized SPA route waits with `waitUntil: "domcontentloaded"` where full `load` was blocked by test media or full-suite worker pressure.

## New / Expanded E2E Coverage

- Student:
  - Notifications appears in student navigation.
  - Discover Clubs opens.
  - Dues-required club detail shows the five-step membership tracker.
  - Membership flow shows a single primary next-action CTA.
  - Student can submit feedback successfully.

- President:
  - Dashboard shows one main `Create Event Proposal` CTA.
  - CTA opens `/proposals/new`.
  - Dashboard avoids duplicate same-route proposal CTAs.
  - No-executives guidance appears and links to Members.
  - Tasks route remains available for assignment workflows.

- Admin:
  - `Needs Action Today` appears before general metrics.
  - Queue cards route to proposals, dues, membership, reports, and feedback.
  - Membership Review rows with proof show `Review Payment Proof`.
  - Dues proof review can verify payment.
  - Dues proof review from Membership Review shows `Back to Membership Review`.
  - `/members?club_id=club-tech` initializes the member club filter and preserves manual filtering.
  - Global dues `Apply to all clubs` confirmation can be canceled without mutation.
  - Admin proposal rejection requires remarks.

- Advisor:
  - Advisor rejection without remarks shows inline validation and does not submit.
  - Advisor approval without remarks still works.
  - Proposal detail opened from approvals shows `Back to Approvals`.

- Executive:
  - Sidebar includes Discover Clubs and Members.
  - Executive can open Discover Clubs without AccessDenied.
  - Executive can open Members without admin controls.
  - Existing task status update coverage remains intact.

- Feedback Manager:
  - Status filters support New / Open, Reviewed, and Archived.
  - Clear filters works.
  - Notification links stay inside `/feedback` or `/notifications`.

- Mobile:
  - Student mobile menu exposes Notifications.
  - Student membership tracker renders on mobile.
  - President mobile dashboard exposes `Create Event Proposal` and `Assign Tasks`.
  - Admin mobile dashboard shows `Needs Action Today`.
  - Feedback Manager mobile sidebar remains limited to feedback tools.

## Mock Data Changes

- Added multi-status feedback records for open, reviewed, and archived filter coverage.
- Added admin final-review proposal routes and decision mutation handling.
- Added dues proof detail route and a deterministic data-image signed URL for proof review.
- Added payment-profile apply-all mutation capture for confirmation/cancel assertions.
- Added business-club member data so admin member filters can prove URL initialization and manual filter changes.
- Added configurable president executive fixtures for no-executives dashboard coverage.
- Set the second public club to no dues for no-dues membership fixture support.

## Selectors / Test IDs

- No `data-testid` attributes were added.
- Tests use accessible selectors first: roles, headings, labels, link text, button text, and visible copy.
- A direct input selector is used only for existing file inputs in club media tests where the visible label is rendered through a styled file-button wrapper.

## Skipped Tests

- None.

## Commands Run

- `npm run lint`
  - Result: passed with 0 errors and 16 existing warnings.
- `npm run build`
  - Result: passed.
  - Notes: existing Browserslist age warning and large chunk warning remain.
- `npm run test:e2e`
  - Result: passed, 78 tests.

## Assumptions

- Executive access to Discover Clubs and Members remains intentional from the prior UX decision.
- Feedback persistence is limited to existing `open`, `reviewed`, and `archived` states.
- The E2E suite should consider SPA screens ready at `domcontentloaded` plus visible page assertions, rather than waiting for the full browser `load` event.
- Prior app-code UX changes in the worktree are part of Phase 1/Phase 2 and were preserved.

## Remaining Gaps / Next Priorities

- Add file-upload proof coverage for more payment edge cases if backend fixtures later support rejected and missing-proof variants.
- Add proposal draft/save mutation coverage if fixtures need stricter draft lifecycle assertions.
- Consider a shared E2E navigation helper for DOM-ready route transitions.
- Consider splitting large, multi-role specs further if suite runtime becomes slow in CI.
