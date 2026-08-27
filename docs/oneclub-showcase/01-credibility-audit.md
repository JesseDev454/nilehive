# Phase 1: OneClub Showcase Credibility Audit

## 1. Executive Summary
This audit investigates the visual defects, stale loading states, aggregation discrepancies, and test residue visible in the OneClub reference screenshots. It identifies the verified root cause for each issue across the frontend, backend, database schema, routing, and environment configurations.

---

## 2. Detailed Audit Findings

### 1. Leadership Screen Displays `E2E Club gh-32926890037-1`
- **Visible Symptom:** The President Dashboard header displays the club title `E2E Club gh-32926890037-1` instead of an official Nile University club.
- **Root Cause:** Automated GitHub Actions E2E tests run `backend/scripts/e2e-staging.js`, which generates ephemeral clubs with names `E2E Club ${runId}` and assigns the test president account (`president@...`) to that club in the shared staging database. When a showcase session logs into the test president account in that environment, `Dashboard.tsx` faithfully displays `dashboard?.club?.name`.
- **Resolution Strategy:** Maintain E2E test isolation and keep E2E fixtures separate. Build a dedicated portfolio demo seed that links the fictional President persona (`Daniel Okafor`) strictly to an official Nile University club (`Nile Google Developers`).

---

### 2. Student Home Displays `Welcome back, New`
- **Visible Symptom:** Student Dashboard greeting reads `Welcome back, New`.
- **Root Cause:** In `frontend/src/pages/Dashboard.tsx` (line 1954), the first name was derived as:
  ```ts
  const firstName = profile?.full_name?.trim().split(/\s+/).filter(Boolean)[0] || "student";
  ```
  When accounts were provisioned in test environments with the full name `"New Student"` or `"New User"`, splitting on whitespace produced `"New"`.
- **Resolution Strategy:** Implement a robust `getStudentDisplayName(profile, user)` utility that prefers dedicated `preferred_name` or `first_name` fields, falls back to the full name if available, and gracefully falls back to a neutral `"Welcome back"` without an awkward placeholder name.

---

### 3. Student Toast Says `Welcome back to Club Services`
- **Visible Symptom:** Successful login displays a toast notification stating `"Welcome back to Club Services"`.
- **Root Cause:** Hardcoded in `frontend/src/pages/Login.tsx` (line 172):
  ```tsx
  toast.success("Welcome back to Club Services");
  ```
- **Resolution Strategy:** Update toast copy to the institutional product name: `"Welcome back to OneClub"`.

---

### 4. Student Home Remains on `Loading events` / `Loading updates`
- **Visible Symptom:** The right-hand sidebar of Student Home permanently displays skeleton cards with `"Loading events"` and `"Loading updates"`.
- **Root Cause:** `StudentDashboard` in `frontend/src/pages/Dashboard.tsx` grouped all four student queries into a single boolean:
  ```tsx
  isLoading={membershipsLoading || duesLoading || eventsLoading || announcementsLoading}
  ```
  If any query stalled, failed, or was pending, both the Events and Announcements cards remained trapped in skeleton loading states. Furthermore, loading and empty state messages contained outdated `"Club Services"` copy.
- **Resolution Strategy:** Decouple `eventsLoading` and `announcementsLoading` in `StudentStitchHome`. Render loaded items, empty states, or error states with retry buttons independently for each card. Modernize loading strings to OneClub.

---

### 5. Executive Home Highlights Profile While on Home
- **Visible Symptom:** On `/` (Executive Home), the desktop sidebar highlights the `Profile` item instead of `Home`.
- **Root Cause:** In `frontend/src/components/AppSidebar.tsx` and `MobileBottomNavigation.tsx`, route matching was done via fragmented string checks and lacked centralized handling for exact root matches, trailing slashes, subpaths, and query strings.
- **Resolution Strategy:** Create a pure, centralized `isNavItemActive(itemUrl, pathname, search)` helper in `frontend/src/lib/appNavigation.ts` and apply it consistently across desktop and mobile navigation.

---

### 6. Executive and Advisor Dashboards Completely Empty
- **Visible Symptom:** Executive and Advisor dashboards showed zero content (0 tasks, 0 proposals, 0 reports, 0% progress).
- **Root Cause:** In the staging environment, the test executive persona had no assigned tasks in `public.tasks`, and the test advisor persona had no proposals in `pending_advisor_review` for their assigned clubs in `public.club_advisors`.
- **Resolution Strategy:** Populate deterministic portfolio demo records representing a real connected workflow:
  - 6 executive tasks for `Zainab Musa` (2 pending, 3 in progress, 1 completed);
  - 2 reviewable proposals and 2 recent event reports for `Dr. Sarah Bello`.

---

### 7. Admin `Open Items: 41` vs `4 items need Club Services`
- **Visible Symptom:** One metric card reported `41` open items while the dark action card reported `4 items need Club Services`.
- **Root Cause:** `PolishedAdminDashboard` computes `todayQueueTotal` as:
  ```ts
  todayQueueTotal = pending_admin_proposals + pending_membership_requests + submitted_dues_payments + missing_reports + openFeedback.length;
  ```
  In earlier or unaligned screens, cumulative all-time records (e.g. 41 total items) were shown alongside actionable queue items (e.g. 4 pending items), causing visual inconsistency.
- **Resolution Strategy:** Standardize metric labels and cards across the Admin dashboard so hero metric cards and dark action cards agree on the exact count of pending actionable items.

---

### 8. Admin Displays 16 Active Clubs vs Expected 14
- **Visible Symptom:** Admin dashboard reports 16 active clubs when the official Nile University club set is 14.
- **Root Cause:** The database contained:
  - 14 official clubs (from `bootstrap_clubs.sql`);
  - 1 legacy test club (`Nile Innovators Club` from `seed.sql`);
  - 1 CI test fixture (`E2E Club gh-...` from `e2e-staging.js`).
  Because `listClubs()` returned all rows from `public.clubs` without environment segregation, the total counted 16.
- **Resolution Strategy:** The isolated demo database will contain exactly the 14 official clubs because its scoped seed/reset prevents test-club contamination. Production counts remain honest and un-doctored.

---

### 9. Nature of Additional Clubs
- Verified: The additional clubs are **not** duplicates or new official clubs. They are legacy test records (`NIC`) and automated CI test fixtures (`E2E-*`).

---

### 10. Dashboard Count Authority
- Verified: Dashboard metrics and queue items must derive from the same authoritative database filters. Counts must never be hardcoded on frontend or backend.

---

### 11. Loading State Transitions
- Verified: Queries with network errors or empty responses should transition cleanly into respective error states with retry buttons or compact empty states, never hanging indefinitely.

---

### 12. Console Errors and Failed Requests
- Verified: Eliminate uncaught promise rejections, missing React keys, and repeated failed query polling loops by configuring appropriate query retry limits (`retry: false` for auth-dependent dashboard queries).

---

### 13. Active Navigation Across Roles
- Verified: All 5 roles (Student, President, Executive, Advisor, Admin) must have unambiguous 1-to-1 route highlighting across desktop sidebar and mobile bottom nav.

---

### 14. Role-Inappropriate Copy
- Verified: Clean up all remnants of `"Club Services"` in toasts, loading states, and descriptions to `"OneClub"`.

---

### 15. Light / Dark Contrast
- Verified: Ensure secondary text, badge backgrounds, and muted icons meet WCAG AA contrast guidelines across light and dark modes.
