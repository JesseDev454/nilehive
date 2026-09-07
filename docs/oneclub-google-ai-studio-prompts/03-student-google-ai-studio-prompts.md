# 03 — Student Google AI Studio prompts

Paste the shared design-system prompt, then this header, then one workspace.

```
ROLE HEADER — Student
Purpose: discover official clubs, join, attend, submit proof, stay informed.
Nav: Home, Discover, Events, My clubs, More.
Allowed: view 14 clubs; request ordinary membership with proof; view own request status; events for clubs the student already belongs to; RSVP; scan the event QR; dues list and submit proof; announcements; notifications; submit feedback; read-only profile; skippable interests onboarding.
Forbidden: role picker; club claiming; leadership applications; leave-club; My Feedback history; payment checkout; personal QR; Discovery Preferences as a lasting screen; event feedback category.
More destinations: Announcements, Notifications, Dues, Feedback, Profile.
Events are “your clubs’ events”, not a public calendar of all 14.
Follow the shared design-system prompt already in this chat.
```


### Student Home

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Student Home.

Visual cue: STUDENT/HOME, tokens from the design system not blue-600.
At most three sections: next event from a joined club, dues/proof that needs attention, latest announcement. One primary next step. No dashboard metrics. No role selection.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### Student Discover and join

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Student Discover and join.

Visual cue: STUDENT/DISCOVER, official 14 club names only.
Directory + search. Club details first (description, category). Then Request to join.
Join is ordinary membership only — hide role. Prefill Campus One name and student ID as read-only. Optional phone, department, student type (fresher/returning), join reason.
Value before effort: details before the form. Proof is required on submit (name on account + receipt upload). Explain that payment happens outside OneClub and Club Services reviews the proof.
Already a member or open request: show that state, do not offer a second join.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### Student Events

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Student Events.

Visual cue: STUDENT/EVENTS.
Upcoming and past events for clubs the student belongs to. Details: date, venue, club. RSVP going / interested / not going (or cancel). Closed RSVP when the event is past.
Check-in is a separate QR workspace, offered only when the event is today.
Students never see attendance rosters or the organizer QR as something they display.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### Student QR check-in

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Student QR check-in.

Visual cue: STUDENT/QR-CheckIn.
Student scans the event QR the organizer displays. Visible text instructions. States: permission, scanning, checked in, already checked in, invalid, not today, not a member of this club, offline.
No personal student QR.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### Student My clubs

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Student My clubs.

Visual cue: STUDENT/MYCLUBS without leave-club.
Clubs the student belongs to, plus own request status (pending, proof awaiting review, verified, rejected). Member club home: updates/announcements for that club, membership details (read-only identity + status).
No leave, no executive tools, no dues verification.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### Student Dues

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Student Dues.

Visual cue: STUDENT/DUES.
Per-club dues records created when joining. Show session, amount, and bank instructions from payment settings. Submit proof when unpaid or rejected. States: unpaid, proof awaiting review (submitted), proof verified (paid), proof rejected + resubmit.
Upload via storage then confirmation. Never “Pay now”.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### Student Announcements

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Student Announcements.

List and read announcements. Mark read. Empty: you’re up to date. Reached from More.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### Student Notifications

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Student Notifications.

Own notification list. No mark-all-read. Reached from More or the bell.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### Student Feedback

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Student Feedback.

One form: category (general, club, onboarding, joining, dues, login/access — not event), comment, optional club. Explain that authorized Club Services admins can read this. Success receipt for this submission only. No history list.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### Student More

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Student More.

Destinations: Announcements, Notifications, Dues, Feedback, Profile. Theme. Sign out. No preferences app. No role switch.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### Student Profile

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Student Profile.

Read-only Campus One identity. Memberships listed. Theme. Sign out. No requested role. No discovery preferences.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### Student optional onboarding

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: Student optional onboarding.

Short skippable welcome. Campus One identity already known (count that as complete context, not fake progress). Optional interest chips. Skip goes to Home. Saving interests may use club preferences once; never become a Profile section. No club picker. No role picker. Official 14 names if any clubs are suggested.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```
