# Agent prompt — port new OneClub UI into NileHive

Copy everything inside the fenced block below into a new agent chat.

```
You are implementing the new OneClub UI in the NileHive repository.

Do not replace NileHive with the whole OneClub folder. That folder is an old Clubly app with new workspaces layered on top. Port only the new visual workspaces and shared design system into NileHive’s placeholder frontend so the app LOOKS like the new UI.

Do not modify the backend. Do not change Campus One authentication. Do not push to main. Do not commit secrets. Create/use branch `codex/oneclub-ui-rebuild` if it does not exist. Recoverable old frontend is `backup/pre-oneclub-frontend-rebuild`.

==================================================
FOLDERS (use these exact paths)
==================================================

NileHive repo (TARGET):
C:\Users\goodl\Documents\NileHive

NileHive frontend (ONLY place to implement UI):
C:\Users\goodl\Documents\NileHive\frontend

NileHive frontend entry files already there (keep stack; replace placeholder App):
C:\Users\goodl\Documents\NileHive\frontend\src\app\App.tsx
C:\Users\goodl\Documents\NileHive\frontend\src\app\ErrorBoundary.tsx
C:\Users\goodl\Documents\NileHive\frontend\src\main.tsx
C:\Users\goodl\Documents\NileHive\frontend\src\lib\theme.ts
C:\Users\goodl\Documents\NileHive\frontend\src\components\ui\ThemeToggle.tsx
C:\Users\goodl\Documents\NileHive\frontend\src\styles\tokens.css
C:\Users\goodl\Documents\NileHive\frontend\src\styles\global.css
C:\Users\goodl\Documents\NileHive\frontend\package.json
C:\Users\goodl\Documents\NileHive\frontend\vite.config.ts
C:\Users\goodl\Documents\NileHive\frontend\tailwind.config.ts

NileHive backend (DO NOT MODIFY):
C:\Users\goodl\Documents\NileHive\backend
C:\Users\goodl\Documents\NileHive\backend\src\app.js

Product rules / capability map (AUTHORITATIVE for what UI is allowed):
C:\Users\goodl\Documents\NileHive\docs\oneclub-google-ai-studio-prompts\00-audit-and-capability-map.md
C:\Users\goodl\Documents\NileHive\docs\oneclub-google-ai-studio-prompts\01-shared-oneclub-design-system.md

Approved visual TSX references (visual only, not permissions):
C:\Users\goodl\Documents\OneClub Google Design
C:\Users\goodl\Documents\OneClub Google Design\ADMIN\HOME\oneclub_admin_home PASS 6.tsx

SOURCE of generated screens (COPY FROM — do not run this app as NileHive):
C:\Users\goodl\Documents\OneClub

SOURCE shared design system:
C:\Users\goodl\Documents\OneClub\src\shared\
C:\Users\goodl\Documents\OneClub\src\shared\components\
C:\Users\goodl\Documents\OneClub\src\shared\tokens\index.ts
C:\Users\goodl\Documents\OneClub\src\shared\theme.ts
C:\Users\goodl\Documents\OneClub\src\shared\mock\clubs.ts

SOURCE new workspaces to port:

Student:
C:\Users\goodl\Documents\OneClub\src\components\student\home\
C:\Users\goodl\Documents\OneClub\src\components\student\discover\
C:\Users\goodl\Documents\OneClub\src\components\student\events\
C:\Users\goodl\Documents\OneClub\src\components\student\checkin\
C:\Users\goodl\Documents\OneClub\src\components\student\myclubs\
C:\Users\goodl\Documents\OneClub\src\components\student\dues\
C:\Users\goodl\Documents\OneClub\src\components\student\announcements\
C:\Users\goodl\Documents\OneClub\src\components\student\notifications\
C:\Users\goodl\Documents\OneClub\src\components\student\feedback\
C:\Users\goodl\Documents\OneClub\src\components\student\more\
C:\Users\goodl\Documents\OneClub\src\components\student\profile\
C:\Users\goodl\Documents\OneClub\src\components\student\onboarding\

President:
C:\Users\goodl\Documents\OneClub\src\components\president\home\
C:\Users\goodl\Documents\OneClub\src\components\president\proposals\
C:\Users\goodl\Documents\OneClub\src\components\president\events\
C:\Users\goodl\Documents\OneClub\src\components\president\members\
C:\Users\goodl\Documents\OneClub\src\components\president\announcements\
C:\Users\goodl\Documents\OneClub\src\components\president\reports\
C:\Users\goodl\Documents\OneClub\src\components\president\club\
C:\Users\goodl\Documents\OneClub\src\components\president\work\
C:\Users\goodl\Documents\OneClub\src\components\president\notifications\
C:\Users\goodl\Documents\OneClub\src\components\president\more\
C:\Users\goodl\Documents\OneClub\src\components\president\profile\

Executive:
C:\Users\goodl\Documents\OneClub\src\components\executive\home\
C:\Users\goodl\Documents\OneClub\src\components\executive\club\
C:\Users\goodl\Documents\OneClub\src\components\executive\events\
C:\Users\goodl\Documents\OneClub\src\components\executive\work\
C:\Users\goodl\Documents\OneClub\src\components\executive\notifications\
C:\Users\goodl\Documents\OneClub\src\components\executive\more\
C:\Users\goodl\Documents\OneClub\src\components\executive\profile\

Admin:
C:\Users\goodl\Documents\OneClub\src\components\admin\          (home pieces: AdminHomeHeader, AdminAttentionGrid, AdminRecentActivity, AdminAnnouncementComposer)
C:\Users\goodl\Documents\OneClub\src\components\admin\approvals\
C:\Users\goodl\Documents\OneClub\src\components\admin\clubs\
C:\Users\goodl\Documents\OneClub\src\components\admin\people\
C:\Users\goodl\Documents\OneClub\src\components\admin\events\
C:\Users\goodl\Documents\OneClub\src\components\admin\announcements\
C:\Users\goodl\Documents\OneClub\src\components\admin\notifications\
C:\Users\goodl\Documents\OneClub\src\components\admin\feedback\
C:\Users\goodl\Documents\OneClub\src\components\admin\analytics\
C:\Users\goodl\Documents\OneClub\src\components\admin\more\
C:\Users\goodl\Documents\OneClub\src\components\admin\profile\
C:\Users\goodl\Documents\OneClub\src\components\AdminHomeView.tsx

SOURCE mock data that belongs with those workspaces:
C:\Users\goodl\Documents\OneClub\src\data\official14ClubsData.ts
C:\Users\goodl\Documents\OneClub\src\data\adminMoreData.ts
C:\Users\goodl\Documents\OneClub\src\data\adminPeopleData.ts
C:\Users\goodl\Documents\OneClub\src\data\adminEventsData.ts
C:\Users\goodl\Documents\OneClub\src\data\adminAnnouncementsData.ts
C:\Users\goodl\Documents\OneClub\src\data\adminNotificationsData.ts
C:\Users\goodl\Documents\OneClub\src\data\adminFeedbackData.ts
C:\Users\goodl\Documents\OneClub\src\data\adminAnalyticsData.ts
C:\Users\goodl\Documents\OneClub\src\data\adminProfileData.ts

SOURCE nav (use as a STARTING POINT, then fix Advisor and remove RoleToggle):
C:\Users\goodl\Documents\OneClub\src\lib\appNavigation.ts

DO NOT COPY these Clubly-era files into NileHive:
C:\Users\goodl\Documents\OneClub\src\components\Clubly.tsx
C:\Users\goodl\Documents\OneClub\src\components\ClublySkeleton.tsx
C:\Users\goodl\Documents\OneClub\src\components\RoleToggle.tsx
C:\Users\goodl\Documents\OneClub\src\contexts\RoleContext.tsx
C:\Users\goodl\Documents\OneClub\src\pages\Login.tsx
C:\Users\goodl\Documents\OneClub\src\pages\SignUp.tsx
C:\Users\goodl\Documents\OneClub\src\pages\ForgotPassword.tsx
C:\Users\goodl\Documents\OneClub\src\pages\ResetPassword.tsx
C:\Users\goodl\Documents\OneClub\src\pages\Dashboard.tsx          (2800-line hybrid; extract only the new workspace switches, do not copy the file)
C:\Users\goodl\Documents\OneClub\src\pages\Membership.tsx         (same)
C:\Users\goodl\Documents\OneClub\src\pages\EventCalendar.tsx      (same)
C:\Users\goodl\Documents\OneClub\src\lib\api.ts                   (old Clubly API client; do not pretend it is wired)
C:\Users\goodl\Documents\OneClub\backend\                        (NileHive already has backend)
C:\Users\goodl\Documents\OneClub\frontend\                       (second frontend tree; ignore)

There is NO folder:
C:\Users\goodl\Documents\OneClub\src\components\advisor\
Advisor is unfinished. Keep a simple placeholder Advisor shell using the required nav, or skip Advisor until those screens exist. Do not use the old AdvisorDashboard as the visual target.

==================================================
PRODUCT RULES
==================================================

User-facing name: OneClub. Never display Clubly, NileHive, or Feedback Manager.

Roles: Student, President, Executive, Advisor, Admin only.

Exact primary nav:
- Student: Home, Discover, Events, My clubs, More
- President: Home, Proposals, Events, Members, More
- Executive: Home, Club, Events, My work, More
- Advisor: Home, Reviews, Clubs, Reports, More
- Admin: Home, Approvals, Clubs, People, More

Theme: light and dark only. Moon = “Switch to dark mode”. Sun = “Switch to light mode”. Persist. No System theme.

Campus One identity is read-only. No role picker in the product UI. A DEV-only role switch is allowed behind an obvious “Preview role” control if needed to demo all roles without auth, but it must not look like a user can claim a role.

Payments: proof wording only (Submit payment proof / awaiting review / verified / rejected). Amount in mock data must be N10,000 per session, not 2500/5000 from some source mocks.

QR: organizer displays event QR; student scans it.

President Members is read-only. No join-request decisions, no dues verification, no promote/remove.

Admin More destinations: Events, Announcements, Notifications, Feedback, Analytics, Profile. No Tasks, Settings, Exports, Activity log.

Student feedback: submit + success receipt only. No My Feedback history.

Exactly 14 official clubs from bootstrap / official14ClubsData names:
Nile Book Club, Nile Business Club, Nile Charity Club, Nile Climate Initiatives Club, Nile Creative Arts Club, Nile Debate Club, Nile Games Club, Nile Google Developers, Nile Model United Nations Club, Nile Photography Club, Nile Startup Campus, Nile Toastmaster's Club, TEDx Nile Club, Women in Tech Club.

This phase is VISUAL. Use deterministic mock data. Do not invent API integration. Do not modify backend routes. Clearly separate mock files from components.

==================================================
TARGET STRUCTURE IN NILEHIVE FRONTEND
==================================================

Implement under:
C:\Users\goodl\Documents\NileHive\frontend\src\

Suggested layout:
frontend/src/shared/                 ← from OneClub/src/shared
frontend/src/data/                   ← official 14 clubs + role mock data
frontend/src/components/student/
frontend/src/components/president/
frontend/src/components/executive/
frontend/src/components/admin/
frontend/src/components/advisor/     ← placeholder only if needed
frontend/src/app/App.tsx             ← role preview + routing shell
frontend/src/styles/tokens.css       ← keep/merge with shared tokens (#0B57D0 / #111318)

Keep Vite + React + TypeScript + Tailwind + lucide-react. Port 8080.

Add react-router-dom only if needed for workspace switching. Keep it simple.

==================================================
IMPLEMENTATION ORDER
==================================================

1. Create/checkout branch codex/oneclub-ui-rebuild from current NileHive HEAD.
2. Port shared tokens, theme, AppShell, Button, Card, Dialog, Sheet, TextField, StatusBadge, Banner, EmptyState, Skeleton, ThemeToggle.
3. Port official 14 clubs mock. Fix dues amount to 10000 if source mocks differ.
4. Build a simple app shell: desktop rail + mobile bottom nav + light/dark toggle. DEV preview role switcher only.
5. Port Admin workspaces and wire Admin nav. Start with Home, Approvals, Clubs, People, More, then More destinations.
6. Port Student workspaces with Student nav.
7. Port President workspaces with President nav.
8. Port Executive workspaces with Executive nav.
9. Advisor: required nav + honest placeholder (“Advisor screens not generated yet”), unless you can derive a matching shell without inventing unauthorized actions.
10. Strip Clubly strings, Feedback Manager, RoleToggle-as-product, password signup, Unsplash if you can use local placeholders.
11. npm install, typecheck, lint, build, run http://127.0.0.1:8080/ and verify light/dark desktop + 390px mobile for at least Admin Home and Student Home.

==================================================
SUCCESS
==================================================

- NileHive frontend looks like the new OneClub Google UI, not old Clubly.
- All five primary navs match the product rules.
- No Clubly / NileHive / Feedback Manager in visible UI.
- Backend untouched.
- Mock data only; no fake live API.
- Theme light/dark only.
- Build passes.

When done, report: files added, files ignored from OneClub, remaining gaps (especially Advisor), and how to run the frontend.
```
