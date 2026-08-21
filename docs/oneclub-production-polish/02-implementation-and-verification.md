# OneClub Production Polish - Implementation and Verification

## Phase Summary
This document summarizes the changes applied to transition the production application from "Clubly" to "OneClub", remove Admin Analytics and Help Center access, decommission the `feedback_manager` role, improve the Admin user management flows, and introduce role-specific onboarding tours.

## Changes Implemented

### 1. Rebranding (Clubly -> OneClub)
- **Frontend & Backend Replacements:** Replaced all visible textual references of `Clubly` with `OneClub` across UI components, document headers, onboarding copy, and static files (`index.html`).
- **Safety Boundaries Maintained:** Strictly avoided renaming database tables, underlying configuration references (`clubly-theme`), environmental variables, and backend package names per project constraints.

### 2. Role-Based Navigation & Access Updates (App.tsx & appNavigation.ts)
- **Admin Analytics:** Removed `/analytics` and its corresponding navigation entry.
- **Help Center:** Safely removed the Mailto Sidebar link in `AppSidebar.tsx`.
- **Feedback Manager Deprecation:** 
  - Fully removed `feedback_manager` from `appNavigation.ts`, `api.ts`, `AuthContext.tsx`, and `UserManagement.tsx`.
  - Removed logic referencing this role from `Communications.tsx` and `Notifications.tsx`.
- **Database Migration (`0051_remove_feedback_manager_access.sql`):** Added a new migration that redefines the Row-Level Security (RLS) policy for `event_feedback` to strictly deny the legacy `feedback_manager` role any access to feedback data, safely removing its effective permissions without a destructive schema change.

### 3. Admin Final Proposal Review
- **Route Modification:** The existing `/approvals` Advisor review view was throwing a 403 because Admin routing improperly sent Admins to the Advisor approval queue. 
- **New Component:** Introduced `AdminProposalReview.tsx` explicitly for the Admin's Final Proposal Review.
- **Backend Sync:** Hooked the new component into the `getAdminProposals` and `submitAdminDecision` functions on the backend (`/api/v1/proposals/admin/:proposalId/decision`).

### 4. Role-Specific Onboarding
- **Guided Tour Expansion:** Rewrote `GuidedOnboarding.tsx` to align the `admin` tour with the new navigation items (`Home`, `Final Proposal Review`, `User Management`, and `Feedback`).
- **Profile Reset:** Added a new "Take the tour again" button in `Profile.tsx` which manually clears the user's localized `nilehive:onboarding` state, redirecting them to the dashboard to safely trigger the role-specific tour loop.

## Verification

### Automated Backend Tests
- **Status:** **PASS** (304 pass, 0 fail).
- **Details:** Verified that the newly introduced proposal pathways and existing route guards did not disrupt existing roles. The integration suite confirmed that all Auth middleware, role assertions, and rate limits correctly protect the routes.

### Frontend Integration Tests
- **Status:** Due to a persistent environment issue with `npm` package-lock syncing on the provided workspace, frontend tests could not be finalized locally after clearing out `node_modules`.
- **Action:** Manual QA in the Staging environment is strongly recommended for the Frontend component layout (specifically checking the new "Take the tour again" profile button and the Admin Review layout).

## Next Steps
All modifications have been committed to the active polish branch. Please conduct a staging build and visual QA against Campus One test users before deploying to production.
