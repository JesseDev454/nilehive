# OneClub Google AI Studio Prompt Package

**Audience:** UI/UX generation in Google AI Studio, then later frontend rebuild on `codex/oneclub-ui-rebuild`.
**Status:** Design-generation package. Do not treat this file as code to execute.
**Inspected:** 2026-08-19 · Repository `C:\Users\goodl\Documents\NileHive` · Design refs `C:\Users\goodl\Documents\OneClub Google Design`

---

## How to use this package

Work **role by role**. Do not paste the whole document into one Studio chat.

**Recommended order**

1. Paste **Shared OneClub design-system prompt** into a new Studio chat. Keep that chat as the visual source of truth.
2. For each workspace in that role, open a **new Studio chat**, paste the design-system prompt first, then paste the workspace prompt.
3. After all workspaces of a role exist, paste the **TSX export prompt** for that role.
4. After all five roles exist, run the **cross-role consistency-audit prompt**.
5. Keep the **new-branch UI integration prompt** for Cursor later. It is not a Studio generation prompt.

**Per workspace:** copy only the fenced block under “COPY-READY PROMPT”.

Canonical Admin Home visual: `ADMIN/HOME/oneclub_admin_home PASS 6.tsx` (passes 1–5 are historical). Ignore QA Inspector chrome when matching visuals.

---

## 1. Product summary

OneClub is Nile University’s club-management application. **Campus One** authenticates people and owns institutional identity. **OneClub** owns club work: membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, and notifications.

Students discover the 14 official clubs, request to join, submit dues payment proof, RSVP, and scan the **event** QR to check in. Presidents run one assigned club: proposals, events, members, and announcements. Executives support that club with assigned work and visibility, not approval power. Advisors review proposals for assigned clubs and read reports. Admins (Club Services) make final proposal decisions, review join requests and dues proofs, assign presidents/advisors, and oversee campus-wide communications and records.

The new UI must feel like **one Google-quality product** across all five roles: calm, spacious, Material 3 Expressive, Roboto Flex, light/dark only.

---

## 2. Confirmed roles

| Role | Scope | Primary navigation (exactly) |
|---|---|---|
| **Student** | Discover, join, events, dues proof, announcements, feedback submit, profile | Home · Discover · Events · My clubs · More |
| **President** | One assigned club only | Home · Proposals · Events · Members · More |
| **Executive** | One assigned club; no approvals | Home · Club · Events · My work · More |
| **Advisor** | Assigned clubs only; no final Admin decision | Home · Reviews · Clubs · Reports · More |
| **Admin** | Campus-wide Club Services | Home · Approvals · Clubs · People · More |

**Removed from UI:** Feedback Manager (navigation, screens, permissions, routes, onboarding, placeholders, “Select Feedback Manager”). Student feedback is handled by **Admin**.

Campus One portal roles (`student` / `staff` / `admin`) are not OneClub app roles. Admin access in OneClub comes from Campus One admin or custom role `club_services_admin`.

---

## 3. Design principles

- One coherent product, not five templates.
- Extremely clean, simple, modern, Google-like, Material 3 Expressive.
- Strong whitespace, restrained rounded surfaces, soft elevation, purposeful color.
- One dominant action per screen where practical.
- Progressive disclosure. Plain-language labels.
- No overcrowded dashboards, decorative charts, glassmorphism everywhere, neon, heavy gradients, tiny grey text, excessive pills, competing primary buttons, corporate or backend jargon, raw status codes, or fake features.

---

## 4. Shared tokens and motion

**Type:** Roboto Flex.

**Light:** primary `#0B57D0`, hover `#0842A0`, on-primary `#FFFFFF`, primary container `#D3E3FD`, background `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`, success `#0F7B48`, warning `#B06000`, error `#B3261E`.

**Dark:** primary `#A8C7FA`, hover `#8AB4F8`, on-primary `#041E49`, background `#111318`, surface `#1B1D22`, surface-2 `#25272D`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.

**Radius:** 12 / 16 / 24. **Shadows:** small and medium only.

**Theme control:** light/dark only. Moon → “Switch to dark mode”. Sun → “Switch to light mode”. Persist. No System option.

**Motion:** page enter fade + short vertical (~180ms); nav indicator slide; panels slide; mobile sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; status color/opacity only; success check; expand height/opacity; theme color transition without flash. Fast, calm, non-blocking. Reduce/remove when `prefers-reduced-motion`.

**Do not use as production tokens:** Tailwind `blue-600` (`#2563EB`) or `slate-950` from older Student files. Match Admin Home Pass 6.

---

## 5. Complete screen inventory by role

### Authoritative TSX references (34 files)

Inspected at `C:\Users\goodl\Documents\OneClub Google Design`.

**Admin (use Pass 6 / latest workspace file; ignore HOME passes 1–5 except as history)**

| Workspace | File | Contained UI (not 1:1 file=screen) |
|---|---|---|
| Home | `ADMIN/HOME/oneclub_admin_home PASS 6.tsx` | Home, attention list, notifications panel, create-announcement dialog, confirm/discard, sign out, component-state gallery, empty/error overlays |
| Approvals | `ADMIN/APPROVALS/oneclub_admin_approvals_workspace.tsx` | Queue, proposal detail, membership detail, dues-proof verify, approve/reject/request-changes dialogs, history |
| Clubs | `ADMIN/Clubs/oneclub_admin_portal.tsx` | 14-club directory, club detail, profile/media, payment settings copy, empty/error |
| People | `ADMIN/People/oneclub_PEOPLE.tsx` | People directory, person detail, manage access drawer, OneClub status, advisor assignment |
| Events | `ADMIN/EVENTS/oneclub_admin_events_workspace_pass_6.tsx` | Campus events, event detail, RSVP/attendance visibility, reports overdue |
| Announcements | `ADMIN/ANNOUNEMENTS/oneclub_admin_announcements_workspace.tsx` | Directory, composer (create/edit/duplicate), targeting, priority |
| Notifications | `ADMIN/NOTIFICATIONS/oneclub_admin_notifications_workspace_pass_6.tsx` | Inbox, filters, read/unread, detail |
| Feedback | `ADMIN/Feedback/oneclub_admin_workspace.tsx` | Feedback directory, review, export drawer (simulated) |
| Analytics | `ADMIN/Analytics/oneclub_admin_analytics_workspace.tsx` | Participation summary, range control, export drawer |
| Exports | `ADMIN/EXPORTS/oneclub_admin_EXPORTS.tsx` | Export jobs UI (client-side / mocked) |
| Activity log | `ADMIN/ACTIVITY LOG/oneclub_admin_activity_log_workspace.tsx` | Change log, filters, append-note (mocked) |
| More | `ADMIN/MORE/oneclub_admin_more_workspace.tsx` | Launcher to secondary workspaces |
| Profile | `ADMIN/Profile/oneclub_admin_profile_workspace.tsx` | Read-only Campus One identity, theme, sessions, sign out |
| Shared system | `ADMIN/Shared Screens/oneclub_shared_system_screens_pass_6.tsx` | Loading, offline, session expired, no access, not found, file/confirm patterns |

**Student**

| Workspace | File | Contained UI |
|---|---|---|
| Home | `STUDENT/HOME/oneclub_student_home.tsx` | Next event, clubs snapshot, announcements, dues cue |
| Discover | `STUDENT/DISCOVER/oneclub_discover_clubs.tsx` | 14 clubs, search/filter, public club details, join entry |
| Events | `STUDENT/EVENTS/oneclub_student_events.tsx` | Upcoming/past, details, RSVP, my events |
| QR check-in | `STUDENT/QR-CheckIn/oneclub_student_qr_check_in.tsx` | Scan event QR, already checked in, invalid, student-only, unavailable |
| My clubs | `STUDENT/MYCLUBS/oneclub_student_my_clubs.tsx` | Memberships, member club home, updates, membership details, leave |
| Dues | `STUDENT/DUES/oneclub_student_dues.tsx` | Amounts, submit proof, awaiting/verified/rejected history |
| Announcements | `STUDENT/ANNOUNCEMENTS/oneclub_student_announcements.tsx` | List, detail, read/unread |
| Notifications | `STUDENT/NOTIFICATIONS/oneclub_student_notifications.tsx` | Inbox, filters, detail |
| Feedback | `STUDENT/FEEDBACK/oneclub_student_feedback.tsx` | Submit + my submissions UI |
| More | `STUDENT/MORE/oneclub_student_more.tsx` | Destinations, theme, sign out |
| Profile | `STUDENT/PROFILE/oneclub_student_profile.tsx` | Read-only identity, sessions, theme |
| Onboarding | `STUDENT/ONBOARDING/oneclub_first_time_onboarding.tsx` | Skippable interests; must **not** become a permanent preferences workspace |

**President (partial TSX — treat as approved direction)**

| Workspace | File | Contained UI |
|---|---|---|
| Home | `PRESIDENT/HOME/oneclub_president_home.tsx` | Attention (proposals, events, members, proofs), activity, announcement shortcut, overlays |
| Proposals | `PRESIDENT/PROPOSALS/oneclub_president_proposals.tsx` | Directory, 5-step builder, details, remarks, resubmit, success |
| Events | `PRESIDENT/EVENTS/oneclub_president_events.tsx` | List/calendar, details, organizer QR, live attendance, manual fallback, complete/cancel, report cue |

**Not in the design folder (derive from system + API):** President Members / More / Profile / first-time setup; **all Executive**; **all Advisor**.

### Backend-backed capabilities (actual API)

Base: `/api/v1`. Auth: Campus One OIDC (`/api/v1/auth/campus-one/*`).

| Area | Who can act | Notes |
|---|---|---|
| Profile `/me`, onboarding | Authenticated | Onboarding API still accepts `requested_role` student\|advisor and **requires `club_id`** — **do not expose in UI** |
| Club preferences GET/PUT | Student only | **Do not recreate Discovery Preferences** |
| Public clubs, club detail, media | Role-scoped | Admin CRUD clubs; president can update **own club profile** |
| Membership requests create | Student, executive, president | **Review/decision: Admin only** |
| Members list | Admin, president, executive | Create member: **Admin only**. Update (role/status): **President or Admin**. Alumni: Admin only. President cannot assign president. |
| Dues `/me` + submit confirmation | Student | List/manage all dues: **Admin only** |
| Proposals create/list/edit/submit | President (own club) | Advisor: pending queue + approve/reject. Admin: final approve/reject + override rejected |
| Events | Approved proposals | Student RSVP + self check-in via event id. President/Admin: attendance roster + manual check-in. Executive: visibility for own club, **cannot** manage attendance |
| Reports | President creates | Admin, advisor, president can view (scoped) |
| Announcements create | Admin, president | President: own club, audience club or role student/executive |
| Feedback create | Authenticated (club_id rules) | Event category **disabled** (410). List: admin, advisor, president, executive — **not student** |
| Tasks | President assigns to executives | Executive updates own. Admin can list. **No Admin Tasks workspace in new UI** |
| Dashboard | Executive / President / Admin ops | Advisor gets nav counts |
| People / advisor assignment | Admin | Assign student/executive/president/advisor — not Feedback Manager |
| Analytics summary | Admin | 7/30/90 day |
| Notifications, reminders | Own | Reminders are list-own only |
| Storage upload | Authenticated | Proof files |
| Leadership applications create | **Disabled** (403) | Do not design apply-for-president/executive |

Proposal statuses to label in plain language: draft; awaiting advisor review; awaiting admin review; approved; returned by advisor (`advisor_rejected`); returned by admin (`admin_rejected`). Advisor “return for changes” = reject with mandatory remarks (editable by president). There is **no separate return status**.

Events are **approved proposals**, not a separate create-event entity. “Create event” means prepare/check-in an already approved proposal.

---

## 6. Missing-screen and unsupported-feature findings

Flag these. Do not silently invent backend behavior. Generate the UI the product owner specified, mark simulated actions, and keep permission copy honest.

### Contradictions (design vs backend)

1. **President membership request decisions.** President Home shows pending join requests. API: only Admin can review membership requests. **UI rule:** President Members may show requests as **status/visibility** and link people to Club Services if needed. Do **not** give President Approve/Reject join-request buttons unless labelled as simulated product-intent and called out in the audit. Prefer: “Club Services reviews join requests; you can see who applied.”
2. **President dues proof verification.** President Home shows proofs to review. API: only Admin verifies dues. **UI rule:** President may see club proof **status** (awaiting/verified/rejected). Do not present President as the verifier unless simulated and flagged.
3. **Admin More still lists Tasks and Settings.** Product owner removed Admin Tasks and large Admin Settings. **New UI:** More destinations = Events, Announcements, Notifications, Feedback, Analytics, Exports, Activity log. No Tasks. No generic Settings (theme lives on Profile).
4. **Student onboarding TSX club names** (Debate Club, Enactus, Sports Club, etc.) are **not** the production 14. Use bootstrap names listed above.
5. **Onboarding API** lets users pick advisor and requires a club. **UI:** no role picker, no claiming a club or privileged role. Optional skippable interests only.
6. **Club Discovery Preferences API** exists. **UI:** do not recreate a permanent preferences section.
7. **QR.** User rule: organizer displays event QR, student scans. Backend: student posts self check-in to `/events/:proposalId/check-in` (typically after scanning a link/QR that contains the event id). Align UI with **event QR → student scan**. Do not use student-personal-QR.
8. **Advisor return vs reject.** API only `approve` \| `reject`. Use “Return for changes” as the human label for reject-with-remarks.
9. **Feedback Manager** still exists in `portalAccess.js` and `listFeedback`. **UI must omit it.** Admin handles feedback.
10. **Student “My Feedback”.** Students can submit; they **cannot list** feedback via API. Show local “submitted just now” success; history may be mocked and labelled as preview.
11. **Exports / Activity log.** No public list-export or list-audit HTTP APIs found. Generate Admin UI with **mocked** jobs/logs. Do not pretend live API.
12. **Leadership applications** self-service is disabled. Omit apply-for-role screens.
13. **Admin People** may still mention Settings in old rail. Do not reintroduce it.
14. **Token split** in refs: Admin Home Pass 6 M3 tokens vs some files using `blue-600` / `slate-950`. Standardize on Pass 6 tokens.
15. **President Events “Create event”** is not a separate backend resource. Bind it to **approved proposals without a live event setup**.
16. **WhatsApp onboarding** (`whatsapp-added`) is Admin-only. Show in Admin membership detail, not Student/President as a control.

### Screens in old product / backend with weak or no design

- Executive entire role
- Advisor entire role
- President Members, More, Profile, announcements composer, post-event report form
- Shared auth: signed-out landing, Campus One return, session expired (partially in Shared Screens)
- Manual attendance fallback (President Events TSX has it; keep)
- Admin override of a previously rejected proposal (supported by API; include in Approvals)

### Designs that exceed current API

- Admin Exports job runner
- Admin Activity log as a queryable workspace
- President verifying dues / deciding join requests
- Student feedback history
- Permanent club discovery preferences (must **not** be generated)

### Do not generate

- Feedback Manager anything
- Admin Tasks workspace
- Large Admin Settings
- Payment gateway checkout
- Student-displayed personal check-in QR
- Extra clubs beyond the 14
- Confetti, cinematic motion, neon, glass everywhere

---

## Shared prompts (copy first)

### COPY-READY PROMPT — 1. Shared OneClub design-system

```
Create the OneClub shared design system only. Do not build full role apps yet.

OneClub is Nile University’s club-management product. Campus One owns login and identity. OneClub owns club work.

Visual character: Google’s best product UIs + Material 3 Expressive. Calm, spacious, clean cards, Roboto Flex, Lucide icons, restrained rounded surfaces, soft elevation, strong hierarchy, purposeful color, light and dark only.

Establish:
1. Color tokens (use exactly):
   Light: primary #0B57D0, on-primary #FFFFFF, primary-container #D3E3FD, background #F8FAFD, surface #FFFFFF, surface-2 #F1F3F4, text #1F1F1F, text-secondary #5F6368, border #DADCE0, success #0F7B48, warning #B06000, error #B3261E.
   Dark: primary #A8C7FA, on-primary #041E49, background #111318, surface #1B1D22, surface-2 #25272D, text #E3E3E3, text-secondary #C4C7C5, border #444746.
2. Type scale with Roboto Flex. Load the font correctly.
3. Elevation, radius (12/16/24), spacing scale.
4. Components: App shell (rail + top bar + mobile bottom nav), buttons, icon buttons, text fields, selects, checkboxes, chips (sparse), cards, lists, tables that collapse to cards on mobile, tabs, dialogs, bottom sheets, side panels, snackbars, banners, empty states, skeletons, status badges (label + icon, not color only), theme toggle (Moon/Sun as specified).
5. Motion system as specified (fast, calm, reduced-motion).
6. Light and dark showcase of the system on desktop and mobile.

Rules: no System theme; no Clubly/NileHive/Feedback Manager; no dense enterprise dashboard; no fake payment processing.

Output a living design-system gallery, not a full application.
```

---

## 7. Admin workspace prompts

### COPY-READY PROMPT — Admin Home

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Admin Home

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Visual source: OneClub Google Design / ADMIN/HOME / oneclub_admin_home PASS 6.tsx.

Admin nav: Home, Approvals, Clubs, People, More.
Home is a calm command surface, not an analytics wall. Show a short attention list (proposals awaiting admin review, join requests, payment proofs awaiting review) plus recent activity. Primary action: Create announcement (dialog/sheet). Secondary: open notifications panel.
Do not say “Operational queue”. Do not show Tasks. Do not show Feedback Manager. Exactly 14 clubs in any club mention.
Permission: Admin only. Campus One identity in header is read-only.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — Admin Approvals

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Admin Approvals

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Visual source: ADMIN/APPROVALS/oneclub_admin_approvals_workspace.tsx.

This is the Admin review workspace for:
1) Proposals awaiting admin review (after advisor approval). Detail includes full proposal (basic info, event plan, budget line items, logistics, advisor remarks). Actions: Approve, Reject (remarks required), and Override a previously rejected proposal with override remarks.
2) Membership join requests. Actions: Approve / Reject. Include WhatsApp-added follow-up only as an Admin operational step after verified dues, not as a student control.
3) Payment proofs: Proof awaiting review / Proof verified / Proof rejected. OneClub does not process payments.

Plain language. Separate Campus One identity from OneClub role. Do not let Admin edit the president’s proposal text; they decide it.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — Admin Clubs

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Admin Clubs

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Visual source: ADMIN/Clubs/oneclub_admin_portal.tsx.

Directory of exactly the 14 official Nile University clubs listed in the constraints. Club details: public profile, media, dues amount copy (N10,000 per session as current product amount if shown), payment instructions as proof-upload guidance, advisor assignment summary, president assignment summary.
Admin may create/edit/archive club records in the UI as simulated local actions. Do not invent extra clubs. Students cannot appear to create clubs.
Private WhatsApp group notes are Admin-only fields, not public.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — Admin People

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Admin People

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Visual source: ADMIN/People/oneclub_PEOPLE.tsx.

People directory of Nile University users. Clearly separate:
- Campus One identity (name, email, student/staff ID, portal role) — read-only
- OneClub role and club assignment — Admin can change: student, executive, president, advisor
Never offer Feedback Manager. President and executive require a club. Assigning a new president must confirm replacement if one exists.
Advisor assignment to one or more of the 14 clubs. Suspended account state if present. No large Settings page.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — Admin Events

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Admin Events

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Visual source: ADMIN/EVENTS/oneclub_admin_events_workspace_pass_6.tsx.

Campus-wide view of approved events (approved proposals). Details: schedule, club, RSVP summary, attendance, organizer QR (Admin may view; student scans). Manual check-in fallback authorized for Admin. Post-event report status. Do not create a mixed student-personal-QR flow.
Executives must not appear as approvers. Complete/cancel language should be plain. No payment processing.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — Admin Announcements

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Admin Announcements

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Visual source: ADMIN/ANNOUNEMENTS/oneclub_admin_announcements_workspace.tsx.

Create/manage announcements. Audiences: all users, all clubs, a specific club, or a role. Composer, review, publish confirmation. Priority. Read tracking is secondary. Presidents create club announcements elsewhere; this workspace is Admin. No “operational queue” wording.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — Admin Notifications

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Admin Notifications

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Visual source: ADMIN/NOTIFICATIONS/oneclub_admin_notifications_workspace_pass_6.tsx.

Admin’s own notifications inbox: unread/read, filters, detail, mark read. Types in plain language (proposal needs review, proof submitted, report submitted). Not a broadcast composer (that is Announcements).

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — Admin Feedback

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Admin Feedback

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Visual source: ADMIN/Feedback/oneclub_admin_workspace.tsx.

Admin — not Feedback Manager — reviews student feedback. Categories to support in UI: general, club, onboarding, club joining, dues payment, login/access. Do not collect “event feedback” (replaced by attendance check-in). Directory, detail, status (open/reviewed). Export control may be simulated. No Feedback Manager role UI.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — Admin Analytics

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Admin Analytics

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Visual source: ADMIN/Analytics/oneclub_admin_analytics_workspace.tsx.

Calm participation overview for 7/30/90 days: active use, membership requests, dues proofs, RSVPs, attendance, feedback counts. Few numbers, each tied to a decision. No decorative charts. No Tasks metrics.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — Admin Activity log

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Admin Activity log

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Visual source: ADMIN/ACTIVITY LOG/oneclub_admin_activity_log_workspace.tsx.

Important administrative changes (role changes, proposal decisions, dues verification, announcement publish). Filters. This API is not publicly listed — use clearly mocked log rows. Do not claim live forensic completeness. Read-only besides optional simulated note.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — Admin Exports

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Admin Exports

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Visual source: ADMIN/EXPORTS/oneclub_admin_EXPORTS.tsx.

Create/download report files (roster, events, proofs metadata). No public export job API — simulate job states locally and label as preview. Privacy-conscious columns. No secrets. CSV/PDF as UI types only.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — Admin More

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Admin More

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Visual source: ADMIN/MORE/oneclub_admin_more_workspace.tsx — but REMOVE Tasks and REMOVE Settings.

Launcher groups:
Communication: Events, Announcements, Notifications, Feedback
Reports: Analytics, Exports, Activity log
Account: Profile (or profile lives in header; still list it)

Search destinations. Badges for unread. No coming-soon fake features. Theme toggle is on Profile, not a Settings app.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — Admin Profile

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Admin Profile

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Visual source: ADMIN/Profile/oneclub_admin_profile_workspace.tsx.

Read-only Campus One identity. OneClub role shown as Admin (Club Services). Theme toggle Moon/Sun. Session list and sign out confirmations. No role switcher. No Feedback Manager. No editable student ID.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

---

## 8. Student workspace prompts

### COPY-READY PROMPT — Student Home

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Student Home

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Visual source: STUDENT/HOME/oneclub_student_home.tsx.
Nav: Home, Discover, Events, My clubs, More.
Calm home: next event, membership snapshot, unpaid/awaiting proof cue, latest announcement. Primary action: the next real task (RSVP, submit proof, or open event QR scanner), not five competing buttons.
No role picker. No club claiming. No discovery-preferences module.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — Student Discover and join

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Student Discover and join

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Visual source: STUDENT/DISCOVER/oneclub_discover_clubs.tsx.
Directory of the 14 official clubs only (production names in the constraints, not the older Debate/Enactus mock names).
Public club details, then join request: motivation, student type if required, dues amount N10,000 with proof-later explanation. Cannot select president/executive. Duplicate open request = clear error. Already a member = membership state, not a second join.
Do not build Club Discovery Preferences.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — Student Events

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Student Events

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Visual source: STUDENT/EVENTS/oneclub_student_events.tsx.
Upcoming, my events, past. Event details. RSVP: going / interested / not going. RSVP closed state. Check-in is a separate scanner workspace reached from the event when it is the event day.
Students do not manage attendance lists. Organizer QR is not shown to students as something they display.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — Student QR check-in

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Student QR check-in

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Visual source: STUDENT/QR-CheckIn/oneclub_student_qr_check_in.tsx.
Student scans the **event** QR displayed by the organizer. States: camera permission, scanning, success checked in, already checked in, invalid link, not a student, event unavailable / not today, offline.
Do not generate a student personal QR to show at the door unless explicitly marked unsupported.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — Student My clubs

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Student My clubs

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Visual source: STUDENT/MYCLUBS/oneclub_student_my_clubs.tsx.
List of clubs the student belongs to or has a pending request for. Member club home, club updates/announcements scoped to that club, membership details (read-only identity + OneClub membership status), leave-club confirmation.
No executive/president tools. Leave does not delete Campus One identity.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — Student Dues

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Student Dues

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Visual source: STUDENT/DUES/oneclub_student_dues.tsx.
Per-club dues record. Amount, session, instructions to pay outside OneClub then upload proof. States: not submitted, proof awaiting review, proof verified, proof rejected (with reason + resubmit). File picker, validation, success.
Never say “Pay now” as a card-processor action.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — Student Announcements

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Student Announcements

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Visual source: STUDENT/ANNOUNCEMENTS/oneclub_student_announcements.tsx.
List and detail, unread, mark read, empty. No composer.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — Student Notifications

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Student Notifications

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Visual source: STUDENT/NOTIFICATIONS/oneclub_student_notifications.tsx.
Personal inbox. Membership, dues proof, event, announcement types in plain language.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — Student Feedback

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Student Feedback

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Visual source: STUDENT/FEEDBACK/oneclub_student_feedback.tsx.
Submit feedback to Club Services (Admin). Categories: general, club, onboarding, joining, dues, login/access. Not event feedback. “My Feedback” may show the just-submitted item; full history is not API-backed — label preview if shown. No Feedback Manager recipient picker.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — Student More

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Student More

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Visual source: STUDENT/MORE/oneclub_student_more.tsx.
Destinations: Announcements, Notifications, Dues, Feedback, Profile. Theme toggle. Sign out confirmation. No role switch. No discovery preferences.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — Student Profile

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Student Profile

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Visual source: STUDENT/PROFILE/oneclub_student_profile.tsx.
Campus One fields read-only. OneClub memberships listed, not editable as identity. Theme. Sessions. Sign out. No “requested role”.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — Student optional onboarding

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Student optional onboarding

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Visual source: STUDENT/ONBOARDING/oneclub_first_time_onboarding.tsx — but change club names to the official 14, and remove any role or club-claim step.
Short skippable interests (a few chips). Optional suggested clubs from those 14. Skip must land on Student Home. Must not become a permanent profile section. Do not call GET/PUT club-preferences a user-facing Preferences app.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

---

## 9. President workspace prompts

### COPY-READY PROMPT — President Home

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: President Home

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Visual source: PRESIDENT/HOME/oneclub_president_home.tsx.
Nav: Home, Proposals, Events, Members, More.
Assigned club only (example: Nile Debate Club). Attention: proposals needing action, upcoming event, membership request visibility, payment-proof status visibility.
Honest permissions: join-request decisions and dues verification are Club Services (Admin) in the current API. Show counts/status; do not fake President Approve on those records as a real capability. Proposal and event actions are President-owned.
Primary action: New proposal.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — President Proposals

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: President Proposals

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Visual source: PRESIDENT/PROPOSALS/oneclub_president_proposals.tsx.

Five-step builder (keep this structure):
1. Basic information
2. Event plan
3. Budget (line items: name, description, quantity, amount)
4. Logistics (venue, responsible members)
5. Review and submit

Also: drafts, awaiting advisor, awaiting admin, returned with remarks, resubmit, approved, rejected details. President cannot approve their own proposal. Cannot edit while under review. Returned/draft are editable.
Map UI labels to statuses without showing raw codes.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — President Events

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: President Events

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Visual source: PRESIDENT/EVENTS/oneclub_president_events.tsx.

Events = approved proposals for this club. “Create event” sets up an approved proposal for RSVP/check-in, not a new unapproved event.
Organizer QR display for students to scan. Live attendance. Manual check-in fallback for authorized organizer. Complete/cancel confirmations. RSVP summary. Post-event report entry point.
Executive is not the approver. Admin may also manage attendance in their own role UI, not here.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — President Members

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: President Members

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

No TSX yet. Derive from President Home membership overlay + OneClub system.

Directory of the assigned club’s members. Member details. Assign/remove **executive** from active members. Cannot assign President (Admin only). Mark inactive/reactivate as president tools if shown; Alumni is Admin-only — hide or disable.
Join requests: visible list with status (pending/approved/rejected by Club Services). Do not include President Approve/Reject unless explicitly marked simulated and called out. No Feedback Manager. No other clubs.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — President More

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: President More

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

No TSX yet. Same shell as other President screens.

Destinations: Announcements (create for own club, audience club or students/executives), Notifications, Club details (limited profile edit for own club), Post-event reports, Payment proof status (view-only vs Admin verify), Profile, Theme, Sign out.
Lightweight delegation: President may assign tasks to executives (backend supports this). If shown, keep it small under More or My work-equivalent — not an Admin Tasks clone. Do not build a fake campus-wide task board.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — President Profile

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: President Profile

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Read-only Campus One identity. OneClub role President + assigned club. Theme Moon/Sun. Sessions. Sign out. No role switcher. Optional first-time setup: welcome to your assigned club, how proposals work — skippable, no club claiming.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — President Announcements

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: President Announcements

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

President composer for the assigned club only. Target: whole club, or students, or executives. Not all-campus. Confirmation, success, validation. List of past club announcements.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — President post-event reports

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: President post-event reports

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

President submits one report per approved event: attendance count, summary, challenges, outcomes, budget used, optional media. Duplicate report = already submitted state. Advisors/Admins will read it in their roles. Link from completed events.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

---

## 10. Executive workspace prompts

### COPY-READY PROMPT — Executive Home

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Executive Home

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

No TSX yet. Match OneClub Admin/Student/President visual language.

Nav: Home, Club, Events, My work, More.
Home: assigned club name, upcoming club events, assigned actions/tasks (backend: presidents assign tasks to executives; executives update status), recent notifications. Not a president dashboard. No proposal approval. No admin people tools.
If showing tasks, keep them as “Assigned actions”, not a heavy task product.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — Executive Club

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Executive Club

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Assigned-club overview and public-style club details. Updates/announcements visibility. Member directory **view** (executive can list members, cannot create members or change roles). No club create. No advisor assignment.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — Executive Events

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Executive Events

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Own-club approved events, details, RSVP summary if visible. Cannot manage attendance or display-as-student QR scanner. May help at the door only if product later allows — currently attendance management is President/Admin. Do not invent executive check-in admin unless labelled unsupported. Show event info clearly.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — Executive My work

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Executive My work

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Backend supports tasks assigned by the president: list, detail, status update (pending/in progress/done) with remarks.
Design a simple assigned-actions view, not Admin Tasks and not a new invention if empty. Empty state: “No assigned actions yet.”
Do not revive Feedback Manager. Do not allow creating campus tasks.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — Executive More

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Executive More

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Notifications, Profile, Theme, Sign out, maybe Announcements (read). No announcement composer (president/admin only). No dues verification.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — Executive Profile

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Executive Profile

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Read-only Campus One identity. Role Executive + club. Theme. Sessions. Sign out. Cannot edit identity or switch role.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

---

## 11. Advisor workspace prompts

### COPY-READY PROMPT — Advisor Home

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Advisor Home

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

No TSX yet. Match OneClub system.

Nav: Home, Reviews, Clubs, Reports, More.
Home: pending proposal reviews for assigned clubs only, upcoming events visibility, reports submitted. Primary action: open next review. Not Admin. Not President editor.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — Advisor Reviews

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Advisor Reviews

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Pending advisor proposals. Detail is read-only (cannot edit president text). Actions: Approve (moves to admin review), Return for changes (API reject + mandatory remarks). Reject with remarks when authorized — same control, plain copy explaining the president can revise and resubmit.
Cannot make final Admin approval. Cannot review unassigned clubs.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — Advisor Clubs

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Advisor Clubs

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

List assigned clubs only (subset of the 14). Club details read-mostly. Events visibility for those clubs. No membership decisions. No dues verification.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — Advisor Reports

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Advisor Reports

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

List/detail of post-event reports for assigned clubs. Read-only. Empty: no reports yet.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — Advisor More

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Advisor More

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Notifications, Profile, Theme, Sign out. Feedback listing for assigned clubs is API-allowed — if included, keep it secondary and not a Feedback Manager product. Prefer not adding a fifth primary nav item.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

### COPY-READY PROMPT — Advisor Profile

```
You are a senior product designer generating a complete OneClub UI/UX reference in Google AI Studio.

Workspace: Advisor Profile

**Generation constraints (apply to every pass):**
- Product name: **OneClub**. Never show Clubly, NileHive, or Feedback Manager.
- Roles in this product: Student, President, Executive, Advisor, Admin only.
- Generate **desktop light, desktop dark, tablet, mobile light, and mobile dark** for this workspace.
- Breakpoints: 1440, 1024, 768, 390, 360. Touch targets 44×44. No horizontal page scroll.
- Desktop: navigation rail. Mobile: bottom navigation for the five role destinations. Side panels on desktop; bottom sheets on mobile.
- Theme: light and dark only. Moon labelled “Switch to dark mode”; Sun labelled “Switch to light mode”. Persist selection. No System theme.
- Font: Roboto Flex. Icons: Lucide, consistent optical weight. Material 3 Expressive, calm Google-like UI.
- Tokens: light primary `#0B57D0`, bg `#F8FAFD`, surface `#FFFFFF`, text `#1F1F1F`, secondary `#5F6368`, border `#DADCE0`. Dark primary `#A8C7FA`, bg `#111318`, surface `#1B1D22`, text `#E3E3E3`, secondary `#C4C7C5`, border `#444746`.
- Motion: fade + 8–12px vertical enter (~180ms); rail indicator slide; sheets rise; dialogs scale/fade; card hover elevation; button press; skeletons; success check; theme color transition. Honor `prefers-reduced-motion`.
- Accessibility: landmarks, headings, keyboard, visible focus, labelled icon buttons, dialog/sheet focus trap, field labels, error associations, status not by color alone, strong contrast.
- Exactly 14 official clubs (use these names, no extras): Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.
- Campus One identity (name, email, student/staff ID, portal role) is read-only. OneClub controls club assignment, membership, positions, proposals, events, attendance, dues records, announcements, reports, feedback, notifications.
- Payments: OneClub records proof only. Wording: Submit payment proof / Proof awaiting review / Payment recorded / Proof verified / Proof rejected. Do not claim OneClub processes payments.
- QR: organizer displays the **event** QR; student scans it. Do not show a student personal QR as the check-in model.
- Deterministic mock data. Mark mocked/simulated actions. Do not invent APIs. Do not weaken permissions for previews.
- No QA inspector, no Pass badges in the product UI, no Unsplash as a production dependency if local placeholders work.
- Export-ready React + TypeScript later; for this generation produce a complete interactive UI reference for this workspace only.

Read-only Campus One identity. Role Advisor. Assigned clubs listed. Theme. Sign out. No role picker. Do not use onboarding club_id claim.

Cover these six conceptual passes in one generation (do not skip any):

PASS 1 — CORE SCREEN
Normal populated screen. Desktop light/dark, tablet, mobile light/dark. Role navigation and hierarchy. One dominant primary action where practical.

PASS 2 — MAIN WORKFLOW
The most important journey for this workspace: forms, steps, panels, sheets, validation, progressive disclosure.

PASS 3 — DETAILS
Record details, secondary information, contextual actions, related records.

PASS 4 — INTERACTIONS
Dialogs, menus, notifications, confirmations, hover/focus/pressed/selected, motion listed in the constraints.

PASS 5 — SYSTEM STATES
Loading, refreshing, empty, no search results, error, partial error, success, disabled, offline, no access, not found, session expired.

PASS 6 — FINAL AUDIT
Responsive 1440/1024/768/390/360, light/dark, accessibility, wording, permission boundaries, component inventory, animation inventory, TSX export readiness (reusable pieces, no secrets, mock data separated conceptually).

Do not generate other roles in this run. Keep this workspace visually identical to the OneClub design system already established.
```

---

## 12. Shared authentication and system screens

### COPY-READY PROMPT — Shared system screens

```
Generate OneClub shared system screens used by every role. Visual source: ADMIN/Shared Screens/oneclub_shared_system_screens_pass_6.tsx, adapted to OneClub naming.

Screens:
1. Signed-out welcome / Continue with Campus One (no password form if Campus One is the only login).
2. Returning from Campus One (brief loading).
3. Session expired — continue with Campus One.
4. Account suspended.
5. No access / wrong role for this workspace.
6. Page not found.
7. Offline banner + retry.
8. Generic recoverable error.
9. Forbidden email domain (use your Nile University email) — plain language.
10. File upload too large / invalid type (for payment proof).
11. Confirm sign out.
12. Skeleton patterns and empty patterns for reuse.

Rules: OneClub name only. Light/dark. Desktop and mobile. No role selector. No Feedback Manager. No System theme. Accessibility and reduced motion. Campus One owns authentication; do not invent local username/password.

Cover passes 1–6: core, flows (login return), details (error copy), interactions (retry, sign out), all system states, final audit.
```

---

## 13. Final cross-role consistency-audit prompt

### COPY-READY PROMPT — Cross-role audit

```
Audit the generated OneClub UI across Student, President, Executive, Advisor, and Admin.

Check:
- Same tokens, type, radius, motion, theme toggle behavior
- Same 14 club names
- Nav matches the specified five items per role
- No Clubly, NileHive, Feedback Manager
- No Admin Tasks or large Admin Settings
- Campus One fields read-only everywhere
- Payment proof wording only
- Event QR: organizer displays, student scans
- President scoped to one club; advisor to assigned clubs; executive has no approvals
- Admin handles join-request decisions, dues verification, final proposal approval, feedback
- Responsive 1440/1024/768/390/360
- Contrast, 44px targets, focus, reduced motion
- No fake payment gateway, no extra clubs, no personal student QR check-in model
- Component and animation inventories are consistent
- Mock data is obviously mock

Return a punch list of inconsistencies to fix before TSX export. Do not add new product features.
```

---

## 14. TSX export prompts

Export **after** visuals are approved. Prefer folders, not one giant file.

### COPY-READY PROMPT — TSX export: shared

```
Export the OneClub design system as React TypeScript:
/shared/tokens.ts (or CSS variables)
/shared/theme.ts (light/dark only, persist, Moon/Sun toggle)
/shared/motion.ts
/shared/components/* (Button, IconButton, TextField, Dialog, Sheet, Card, AppShell, StatusBadge, Skeleton, Banner, EmptyState, ThemeToggle)
/shared/mock/clubs.ts (exactly the 14 official clubs)
Semantic HTML, Roboto Flex loaded, Lucide icons, accessible names, no secrets, no fabricated live API client.

Do not export QA inspectors. Do not include Feedback Manager. Split files. No one-file app.
```

### COPY-READY PROMPT — TSX export: Admin

```
Export Admin workspaces as separate TSX files under /admin: Home, Approvals, Clubs, People, Events, Announcements, Notifications, Feedback, Analytics, ActivityLog, Exports, More, Profile.
Use shared shell and tokens. Mock data in /admin/mock. Local interactions only. Include light/dark and the states already designed. No Tasks, no Settings app, no Feedback Manager.
```

### COPY-READY PROMPT — TSX export: Student

```
Export Student workspaces under /student: Home, Discover, Events, QrCheckIn, MyClubs, Dues, Announcements, Notifications, Feedback, More, Profile, Onboarding (optional skippable).
Shared shell with Student nav. Mock data separated. Scanner UI can be simulated. Official 14 clubs only.
```

### COPY-READY PROMPT — TSX export: President

```
Export President workspaces under /president: Home, Proposals (including five-step builder), Events (organizer QR + attendance), Members, Announcements, Reports, More, Profile.
Scoped to one club in mock data. Do not implement unauthorized Approve on membership/dues as if wired; if those screens exist, keep them view/status or clearly simulated.
```

### COPY-READY PROMPT — TSX export: Executive

```
Export Executive workspaces under /executive: Home, Club, Events, MyWork (assigned actions), More, Profile.
No approval dialogs. Tasks only as assigned actions from president mock data.
```

### COPY-READY PROMPT — TSX export: Advisor

```
Export Advisor workspaces under /advisor: Home, Reviews, Clubs, Reports, More, Profile.
Read-only proposal body. Approve / Return for changes with required remarks. Assigned clubs only.
```

### COPY-READY PROMPT — TSX export: system screens

```
Export shared system screens under /system: WelcomeCampusOne, SessionExpired, NoAccess, NotFound, Offline, Suspended, Error.
Reuse dialogs from shared components.
```

---

## 15. New-branch UI integration prompt

Use this later in Cursor, not in Google AI Studio.

### COPY-READY PROMPT — Cursor integration (after Studio export)

```
Integrate the approved OneClub TSX references into the NileHive repo without touching backend behavior.

Git:
- Current recoverable backup: backup/pre-oneclub-frontend-rebuild
- Create/use branch: codex/oneclub-ui-rebuild
- Do not push to main until explicitly approved
- Do not commit secrets, design ZIPs, or __codex_tmp

Frontend directory: C:\Users\goodl\Documents\NileHive\frontend
Keep Vite + React + TypeScript + Tailwind + lucide-react. Port 8080.
Replace placeholder App with shared tokens already in src/styles/tokens.css where they match.

Rules:
- Do not modify backend/ or APIs to make the UI easier
- Do not change Campus One authentication
- Do not reintroduce Feedback Manager, Admin Tasks, or large Admin Settings
- Wire routes and role guards only after screens exist
- Keep mock-mode screens working without pretending the API is connected
- When wiring APIs later, respect actual permissions (Admin verifies dues and join requests; President does not unless backend is changed)
- Preserve 14 official clubs
- Light/dark only

First milestone: shared shell + one role (Student or Admin) using exported components. Then the remaining roles.
```

---

## Generation sequence checklist

- [ ] Shared design system
- [ ] Shared system screens
- [ ] Admin: Home → Approvals → Clubs → People → Events → Announcements → Notifications → Feedback → Analytics → Activity log → Exports → More → Profile
- [ ] Student: Home → Discover → Events → QR → My clubs → Dues → Announcements → Notifications → Feedback → More → Profile → Onboarding
- [ ] President: Home → Proposals → Events → Members → Announcements → Reports → More → Profile
- [ ] Executive: Home → Club → Events → My work → More → Profile
- [ ] Advisor: Home → Reviews → Clubs → Reports → More → Profile
- [ ] Cross-role audit
- [ ] TSX export by role
- [ ] Cursor branch integration (later)

---

## Reference paths

| What | Path |
|---|---|
| Repo | `C:\Users\goodl\Documents\NileHive` |
| Design refs | `C:\Users\goodl\Documents\OneClub Google Design` |
| Backup ZIP | `C:\Users\goodl\Documents\OneClub Google Design.zip` |
| Frontend | `C:\Users\goodl\Documents\NileHive\frontend` |
| Backend APIs | `C:\Users\goodl\Documents\NileHive\backend\src\app.js` |
| Frontend backup branch | `backup/pre-oneclub-frontend-rebuild` |
| Recommended UI branch | `codex/oneclub-ui-rebuild` |
