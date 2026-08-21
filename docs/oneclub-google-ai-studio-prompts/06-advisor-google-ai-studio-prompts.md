# 06 — Advisor Google AI Studio prompts

Paste the shared design-system prompt, then this header, then one workspace.

```
ROLE HEADER — Advisor
Purpose: review proposals for assigned clubs and read reports.
Nav: Home, Reviews, Clubs, Reports, More.
Allowed: pending proposal queue; read-only proposal body; Approve (sends to Admin); Return for changes with mandatory remarks (backend decision=reject); assigned clubs; view those events; read reports; notifications; profile.
Forbidden: final admin decision; editing president text; membership; dues; role assignment; unrelated clubs; attendance management; editing Campus One identity.
Follow the shared design-system prompt already in this chat.
```


### Advisor Home

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Advisor Home.

Pending reviews for assigned clubs, plus reports recently submitted. Primary action: open the next review. No admin metrics.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### Advisor Reviews

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Advisor Reviews.

Pending advisor proposals. Detail is read-only (full proposal context before deciding). Actions: Approve (goes to Admin) or Return for changes. Return requires remarks. Never preselect a decision. Cannot edit the text. Unassigned clubs never appear.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### Advisor Clubs

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Advisor Clubs.

Assigned clubs only. Club details and those clubs’ events, view-only. No membership or dues tools.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### Advisor Reports

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Advisor Reports.

Post-event reports for assigned clubs. Read-only detail.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### Advisor Notifications

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Advisor Notifications.

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



### Advisor More

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Advisor More.

Notifications, Profile, theme, sign out. No feedback-manager tools.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### Advisor Profile

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Advisor Profile.

Read-only Campus One identity. Role Advisor. Assigned clubs listed. Theme. Sign out. No role picker.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```
