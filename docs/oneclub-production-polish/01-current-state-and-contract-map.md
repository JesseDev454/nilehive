# Phase 1: Current-State and Contract Map

## 1. Occurrences of "Clubly"
- Found throughout frontend pages, `index.html`, `manifest.json`, component titles, strings, test files (`e2e/`, `staging/`), `README.md`, and navigation code.
- Examples include page titles (e.g., `Clubly - Notification Inbox`), toast messages, loading screens (`Opening your Clubly workspace`), app manifest references, text strings (`Welcome to Clubly`).

## 2. Role Navigation
- Defined in `frontend/src/lib/appNavigation.ts` (`getRoleNavItems`) and `frontend/src/components/AppSidebar.tsx`.
- **Student**: Home, Discover Clubs, Events, Updates, Profile.
- **President**: Home, My Club, Proposals, Events, Updates, Profile.
- **Executive**: Home, My Tasks, My Club, Events, Updates, Profile.
- **Advisor**: Home, Review Queue, Events, Updates, Profile.
- **Admin**: Operations Queue (Queue), Clubs & People, Events, Analytics, Updates, Profile.
- **Feedback Manager**: App Feedback, Notifications, Profile.

## 3. Analytics Routes
- **Nav Entry**: Admin has `Analytics` (icon: `BarChart3`) pointing to `/analytics`.
- **Route**: `frontend/src/App.tsx` maps `/analytics` to the `Analytics` component.

## 4. Help Center
- **Nav Entry**: Located in the sidebar footer (`frontend/src/components/AppSidebar.tsx`), linking to a generic `mailto:clubservices@nileuniversity.edu.ng`. No separate `/help` route found, just a link labelled "Help Center".

## 5. Feedback Manager
- **Routes**: `/feedback`, `/notifications`, `/profile` are permitted for `feedback_manager` in `frontend/src/App.tsx`.
- **Role Guards**: Users with this role are redirected to `/feedback`.
- **Assignment**: Checked in User Management (`frontend/src/pages/UserManagement.tsx`) and `stagingRoles`.
- **Database**: `feedback_manager` exists in `public.app_role` enum and is granted read access to global feedback in migration `0046_feedback_manager_role.sql`.

## 6. Feedback Behavior
- Students submit feedback (category-based).
- `feedback_manager` can read global feedback (except club-specific operational feedback).

## 7. Admin User-Management
- **Screen**: `frontend/src/pages/UserManagement.tsx` maps to `/user-management`.
- Allows viewing user directory, modifying `Local Clubly Role`, and club assignment.

## 8. Proposal Lifecycle
- **Transitions**: 
  - `pending_advisor_review` -> `advisor_rejected` or `pending_admin_review`
  - `pending_admin_review` -> `admin_rejected` or `approved`
- Handled via backend endpoints in `backend/src/modules/proposals/proposals.routes.js`.

## 9. Admin Proposal-Review Route
- Admin currently goes to `/approvals` (mapped to `Approvals.tsx`).
- `Approvals.tsx` hardcodes the UI title as "Advisor Review".
- It calls `useAdvisorPendingProposals`, which fetches `/api/v1/proposals/pending-advisor`.
- This endpoint enforces `requireRole("advisor")` in the backend. Since the Admin doesn't have the `advisor` role, it returns a 403.

## 10. Advisor Proposal-Review Route
- Same as above: `/approvals` mapped to `Approvals.tsx`, correctly working for Advisor.

## 11. Existing Onboarding
- `frontend/src/components/GuidedOnboarding.tsx` exists, configured for some roles (e.g., student, president).
- Will need to update it with the requested specific steps for each active role and versioning (e.g., `oneclub-onboarding-v1`).

## Root Cause of Admin Advisor Review Bug
- `frontend/src/App.tsx` permits `/approvals` for Admin.
- `frontend/src/lib/appNavigation.ts` defines "Operations Queue" with URL `/` for Admin, but does not include `/approvals`. However, if they navigate to `/approvals`, the `Approvals.tsx` page is rendered.
- `Approvals.tsx` fetches `getPendingAdvisorProposals` (which hits the `advisor` protected route).
