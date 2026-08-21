# 05 — Executive Google AI Studio prompts

Paste the shared design-system prompt, then this header, then one workspace.

```
ROLE HEADER — Executive
Purpose: support one assigned club and finish assigned actions.
Nav: Home, Club, Events, My work, More.
Allowed: assigned club details; view members; view club events; own tasks (pending, in progress, completed, blocked); notifications; profile.
Forbidden: approve proposals; admin decisions; dues; join-request review; assign roles; create clubs; manage attendance; create announcements; edit Campus One identity.
My work is a short action list, not Jira/Trello.
More destinations: Notifications, Profile.
Follow the shared design-system prompt already in this chat.
```


### Executive Home

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Executive Home.

Assigned club, upcoming events, and assigned actions that need an update. At most three sections. No approval queues. No dues.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### Executive Club

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Executive Club.

Assigned club details and updates. Member directory view-only. No edit profile unless you are not sure — presidents/admins own profile edits; executives only view.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### Executive Events

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Executive Events.

Own-club approved events and details. No RSVP roster management, no organizer QR admin, no manual check-in.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### Executive My work

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Executive My work.

List of tasks assigned to this executive. Detail + status update: pending, in progress, completed, blocked, with optional remarks. Keep it a simple list. Empty: nothing assigned yet.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### Executive Notifications

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Executive Notifications.

Own notification list. No mark-all-read.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### Executive More

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Executive More.

Notifications, Profile, theme, sign out. No announcement composer. No dues.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### Executive Profile

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Executive Profile.

Read-only Campus One identity. Role Executive + club. Theme. Sign out.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```
