# Clubly UX Fixes Summary

## Files Changed

- `frontend/src/components/AccessDenied.tsx`
- `frontend/src/components/GuidedOnboarding.tsx`
- `frontend/src/lib/appNavigation.ts`
- `frontend/src/pages/AdminClubDashboard.tsx`
- `frontend/src/pages/Analytics.tsx`
- `frontend/src/pages/Approvals.tsx`
- `frontend/src/pages/Clubs.tsx`
- `frontend/src/pages/Dashboard.tsx`
- `frontend/src/pages/Dues.tsx`
- `frontend/src/pages/DuesProofReview.tsx`
- `frontend/src/pages/MediaArchive.tsx`
- `frontend/src/pages/Members.tsx`
- `frontend/src/pages/Membership.tsx`
- `frontend/src/pages/NewProposal.tsx`
- `frontend/src/pages/Notifications.tsx`
- `frontend/src/pages/ProposalDetail.tsx`
- `frontend/src/pages/Proposals.tsx`
- `frontend/src/pages/ReportSubmission.tsx`
- `frontend/src/pages/Tasks.tsx`

## Fixes Implemented

- Added reusable `AccessDenied` for restricted Clubly pages. It shows the restriction title, reason, current role, suggested destination, and a dashboard button.
- Updated admin members filtering so `/members?club_id=...` initializes the club filter while preserving manual filter changes.
- Renamed president event-creation CTAs that route to `/proposals/new` to `Create Event Proposal` or equivalent event-proposal wording, and removed duplicate same-route quick actions.
- Required advisor rejection remarks in `Approvals.tsx` with inline validation before submission.
- Required admin proposal rejection remarks in `ProposalDetail.tsx` with inline validation before submission. Approval remarks remain optional except existing rejected-proposal override behavior.
- Added confirmation dialog before applying the shared dues payment profile to all clubs, including affected club count when loaded.
- Added `Review Payment Proof` CTA on admin membership review rows when a dues proof exists, plus explicit no-proof/no-payment status messages.
- Allowed dues proof review to safely return to `/membership` when opened from membership review.
- Constrained Feedback Manager notification links to `/feedback` or `/notifications`, with clear copy when an unsupported actionable notification opens the feedback workspace instead.
- Added `Notifications` to the student sidebar with the existing notification badge key.
- Exposed existing executive access to `Discover Clubs` and `Members` in sidebar navigation.
- Added president task assignment empty state when no executives exist, linked to `/members`, and disabled task submission until an executive is available.

## Assumptions Made

- Executive access to `/membership` and `/members` is intentional because the page permission logic already allows executives.
- Feedback Managers should not deep-link into dues, membership, proposals, tasks, events, or communications from notifications.
- `due_payment_id` plus `due_payment.proof_url` is the reliable signal for showing the payment-proof review CTA.
- Existing API contracts and mutation payloads should remain unchanged.

## Still Needs Product Decision

- Whether Feedback Managers should see announcement previews at all, or only app-feedback notifications.
- Whether `Create Event Proposal` should replace every remaining generic proposal wording in help text, not just CTAs and high-visibility labels.
- Whether membership review should expose payment proof status for non-admin reviewer roles if those roles are added later.

## Manual Test Checklist

### Student

- Confirm sidebar shows `Notifications`.
- Confirm notification badge appears when `navigation-counts.notifications` is positive.
- Open notifications and verify student-visible notification cards still work.

### Advisor

- Open pending approvals.
- Try rejecting without remarks and confirm inline validation appears and no submission happens.
- Approve without remarks and confirm approval still submits.

### President

- Confirm dashboard quick actions show one `Create Event Proposal` CTA for `/proposals/new`.
- Confirm proposal list/new proposal pages still open normally.
- With no executives, confirm task assignment shows: `No executives available yet. Assign an executive from Members before creating tasks.`
- Confirm task submit is disabled until an executive is available.

### Executive

- Confirm sidebar includes `Discover Clubs` and `Members`.
- Confirm `/membership` and `/members` remain usable.

### Admin

- From `/clubs/:clubId/dashboard`, click `View members` and confirm `/members?club_id=...` initializes the matching club filter.
- Manually change the members club filter and confirm it still works.
- Reject a final-review proposal without remarks and confirm inline validation blocks submission.
- Approve a final-review proposal without remarks and confirm it still submits.
- Click `Apply to all clubs`, cancel the confirmation, and confirm no mutation runs.
- Click `Apply to all clubs`, confirm, and verify existing success/error behavior.
- In Membership Review, confirm rows with uploaded proof show `Review Payment Proof`.
- Confirm rows without proof or payment show explicit status text.

### Feedback Manager

- Confirm sidebar remains limited to `App Feedback` and `Notifications`.
- Confirm notification cards only link to `/feedback` or remain on `/notifications`.
- Confirm unsupported actionable notifications display clear app-feedback access copy.

## Verification

- `npm run lint` completed with 0 errors and existing warnings in shared UI/Auth/Dashboard files.
- `npm run build` completed successfully.
