# 02 — Admin Google AI Studio prompts

Paste `01-shared-oneclub-design-system.md`, then this role header, then one workspace block.

```
ROLE HEADER — Admin (Club Services)
Purpose: campus-wide club operations. Calm command surface, not a metric wall.
Nav: Home, Approvals, Clubs, People, More.
Allowed: final proposal decisions; join-request decisions; payment-proof review; edit the 14 clubs and payment instructions; assign OneClub roles student/executive/president/advisor; assign advisors to clubs; campus event visibility and attendance; create announcements; read feedback; analytics summary; notifications; profile; theme.
Forbidden: Feedback Manager; Admin Tasks; Settings app; export jobs; activity log; adding extra clubs; local password login; editing Campus One identity; marking event feedback; fake live data.
More destinations: Events, Announcements, Notifications, Feedback, Analytics, Profile.
Home attention (max four): proposals waiting, join requests waiting, proofs waiting, reports submitted — only if counts are genuine.
Follow the shared design-system prompt already in this chat.
```


### Admin Home

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Admin Home.

Visual cue: ADMIN/HOME/oneclub_admin_home PASS 6.tsx without QA chrome.
A quiet home: greeting, at most four attention counts (proposals, join requests, proofs, reports) with labels and what to do next, then a short recent-activity list. Primary action: New announcement (opens composer later in Announcements; from Home it can deep-link). Notifications in the top bar.
Do not show Tasks, Settings, health-score walls, or “operational queue”.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### Admin Approvals

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Admin Approvals.

Visual cue: ADMIN/APPROVALS workspace, minus unauthorized extras.
One workspace with three filters (not competing homes): Proposals, Join requests, Payment proofs.
Proposals: list awaiting admin review; detail shows full proposal plus advisor remarks; actions Approve or Return/reject with required remarks. Override a previously rejected proposal requires override remarks. Do not edit proposal text.
Join requests: pending list; detail shows student identity (read-only), club, join reason, proof. Approve or reject. After verified/paid, optional “Mark added to WhatsApp group”.
Payment proofs: list submitted proofs; Verify or Reject with reason. Wording is proof review, not payment processing.
Never preselect Approve, Verify, or Reject.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### Admin Clubs

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Admin Clubs.

Visual cue: ADMIN/Clubs portal.
Directory of the 14 official clubs only. Search. Club details: public profile, media, advisor/president names, dues amount and bank instructions for proof uploads.
Admin may edit profile, media, and shared payment instructions for those clubs.
Do not add a 15th club. Do not delete clubs. WhatsApp group notes are Admin-only, never public.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### Admin People

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Admin People.

Visual cue: ADMIN/People.
Directory of Nile University users. Separate Campus One identity (read-only) from OneClub role and club assignment.
Assign: student, executive, president, advisor. President and executive require a club. If a club already has a president, confirm replacement — do not precheck the confirm box.
Assign an advisor to a club. Never offer Feedback Manager or Admin as assignable OneClub roles here.
No Suspend control (no suspend route). Show account status if the record includes it.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### Admin Events

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Admin Events.

Visual cue: ADMIN/EVENTS pass 6.
Campus-wide approved proposals as events. Details: schedule, club, RSVP summary, attendance roster, organizer QR (students scan this). Manual check-in fallback. Report submitted or missing.
Lifecycle is upcoming / happening today / past from the event date. No complete/cancel buttons.
Reached from More.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### Admin Announcements

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Admin Announcements.

Create and list announcements. Audience: all users, all clubs, one club, or a role. Priority: low, normal, high, urgent — use calmly, not as fake urgency.
No edit or duplicate (no update route). Recipients mark read on their side.
Reached from More or Home primary action.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### Admin Notifications

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Admin Notifications.

Own notification list from GET /notifications. Plain titles. No mark-all-read (no API). Opening a related record is enough.
Reached from More or the top-bar bell.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### Admin Feedback

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Admin Feedback.

Read-only directory of student feedback (general, club, onboarding, joining, dues, login/access). No event category. No status workflow (no PATCH). Explain that students were told Club Services can read this.
Reached from More.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### Admin Analytics

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Admin Analytics.

GET /analytics/admin for 7 / 30 / 90 days. At most four labelled counts with period context (for example active use, join requests, proofs, attendance). No decorative charts. No export job.
Reached from More.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### Admin More

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Admin More.

Launcher only: Events, Announcements, Notifications, Feedback, Analytics, Profile.
Search destinations. No Tasks. No Settings. No Exports. No Activity log. Theme toggle lives on Profile.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### Admin Profile

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Admin Profile.

Campus One name, email, ID read-only. OneClub role: Admin. Theme Moon/Sun. Sign out confirmation. No role switcher.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```
