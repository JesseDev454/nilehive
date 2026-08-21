# 04 — President Google AI Studio prompts

Paste the shared design-system prompt, then this header, then one workspace.

```
ROLE HEADER — President
Purpose: run one assigned club’s proposals, events, reports, and announcements.
Nav: Home, Proposals, Events, Members, More.
Allowed: proposals (draft, submit, edit returned, resubmit); approved proposals as events; organizer QR; attendance including manual check-in; post-event reports; club announcements (club, or students/executives); read-only member directory; own-club profile/media; assign tasks to executives; notifications; profile.
Forbidden: review join requests; approve/decline membership; add/remove/promote members; dues review; another club; final admin approval; complete/cancel event as a separate status; editing Campus One identity.
Home attention only: returned proposal, unfinished draft, upcoming approved event, report due. Never membership requests or payment proofs.
Members is read-only. Hide position and status controls completely.
More destinations: Announcements, Reports, Club details, Club work, Notifications, Profile.
Follow the shared design-system prompt already in this chat.
```


### President Home

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: President Home.

Visual cue: PRESIDENT/HOME with membership and dues attention removed.
Assigned club name. At most four genuine items: returned proposal, draft to finish, upcoming event, report due. Short activity list. Primary action: New proposal.
Do not show join requests or payment proofs.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### President Proposals

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: President Proposals.

Visual cue: PRESIDENT/PROPOSALS.
Directory of own-club proposals. Status labels: Draft, Awaiting advisor review, Awaiting admin review, Approved, Returned by advisor, Returned by admin. Never raw codes.
Five-step builder: 1 Basic information 2 Event plan 3 Budget (line items) 4 Logistics / responsible members 5 Review and submit. Truthful step state only when fields exist. Save draft anytime. Autosave if shown must be real.
Returned proposals show remarks first, then the same builder. Cannot edit while under review. Prefill assigned club. Do not preselect Submit.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### President Events

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: President Events.

Visual cue: PRESIDENT/EVENTS minus complete/cancel.
Approved proposals are events. List/calendar optional if it stays simple. Details, RSVP summary, attendance roster, organizer QR (students scan this), manual check-in. Happening-today vs upcoming vs past from the date.
Entry to write a post-event report when past and none exists. No complete/cancel. No student-personal QR.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### President Members

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: President Members.

Read-only directory of the assigned club. Search. Member details: name, student ID, club role, membership status.
No approve, decline, add, remove, promote, assign executive, or dues controls — omit them, do not disable them.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### President Announcements

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: President Announcements.

Create an announcement for the assigned club, or for students / executives in that club. List past ones. No campus-wide audience. No edit route.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### President Reports

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: President Reports.

Submit one report per approved past event: attendance count, summary, challenges, outcomes, budget used, optional media. Prefill event title, date, venue. Duplicate = already submitted. Advisors and Admin will read it.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### President Club details

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: President Club details.

Own-club public profile and media. President may update profile and gallery. Payment instructions are not a President dues-admin tool; do not add verify-proof UI here.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### President Club work

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: President Club work.

Lightweight delegation: assign a task to an executive in this club (title, description, optional due date, priority). List club tasks. Not a board. Empty: no assigned work yet.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### President Notifications

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: President Notifications.

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



### President More

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: President More.

Destinations: Announcements, Reports, Club details, Club work, Notifications, Profile. No Dues. No Membership requests. No Settings app.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```



### President Profile

Copy everything in the fenced block into Google AI Studio after the shared design-system prompt and this role’s header.

```
Generate only the OneClub workspace: President Profile.

Read-only Campus One identity. Role President + assigned club. Theme. Sign out. Optional skippable first-run welcome that does not claim a club.

Cover these six passes in one generation. Do not skip a relevant pass. Do not invent a write workflow for a read-only screen.

PASS 1 — CORE: Normal populated screen. Role navigation. Header. One purpose. One dominant action if this workspace has a supported write. Desktop light, desktop dark, tablet, mobile light, mobile dark.

PASS 2 — WORKFLOW: Only the supported primary journey (forms, steps, sheets, validation, save). Safe defaults. Context before action. Preserve input after errors.

PASS 3 — DETAILS: Record details, related supported records, contextual actions, privacy and read-only boundaries.

PASS 4 — INTERACTIONS: Hover, keyboard focus, pressed, selected, menus, dialogs, confirmations, sheets, panels, success check, restrained motion (~180ms), reduced-motion alternatives.

PASS 5 — STATES: Include only states that apply: loading (skeletons), background refresh, empty, no search results, recoverable error, partial-section error, success, disabled, offline, no access, not found, session expired, uploading, upload failed, saving, saved, save failed, submitting, submission failed, confirmation, destructive confirmation.

PASS 6 — AUDIT: 1440 / 1024 / 768 / 390 / 360. Light and dark contrast. Accessibility. Plain wording. Permission boundaries. Backend support. Cognitive load. Answer the 12 psychology questions from the shared design-system prompt. Component inventory. Animation inventory. TSX export readiness (reusable pieces, mock data separate conceptually, no secrets).

Studio rules: Generate only this workspace. Keep the shared OneClub design system. Do not generate another role. Deterministic mock data for supported records only. Do not invent APIs or features. No QA inspector, pass labels, or debug chrome in the product UI. Visible result should look finished, not a wireframe. Prepare reusable React/TypeScript thinking; do not dump the whole role into one file.
```
