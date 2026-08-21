# 09 — TSX export prompts

Export after visuals are approved. New Studio chat per export. Paste the design-system prompt first. Do not export every role at once.

### Shared design system

```
Export the OneClub design system as React + TypeScript files:
/shared/tokens (CSS variables matching the specified hex values)
/shared/theme.ts (light/dark only, persist, Moon/Sun toggle)
/shared/components (Button, IconButton, TextField, Dialog, Sheet, Card, AppShell, StatusBadge, Skeleton, Banner, EmptyState, ThemeToggle)
/shared/mock/clubs.ts (exactly the 14 official clubs)
Roboto Flex loaded. Lucide icons. Accessible names. No secrets. No API client. No QA inspector. No one-file app.
```

### Admin

```
Export Admin screens as separate files under /admin: Home, Approvals, Clubs, People, Events, Announcements, Notifications, Feedback, Analytics, More, Profile.
Shared shell with Admin nav. Mock data in /admin/mock. Local interactions only. No Tasks, Settings, Exports, Activity log, or Feedback Manager.
```

### Student

```
Export Student screens under /student: Home, Discover (with join), Events (with RSVP), QrCheckIn, MyClubs, Dues, Announcements, Notifications, Feedback, More, Profile, Onboarding (skippable).
Student nav. Official 14 clubs. Success receipt for feedback, no history module. No leave-club.
```

### President

```
Export President screens under /president: Home, Proposals (including five-step builder), Events (QR + attendance), Members (read-only), Announcements, Reports, ClubDetails, ClubWork, Notifications, More, Profile.
One assigned club in mock data. No membership decisions or dues tools.
```

### Executive

```
Export Executive screens under /executive: Home, Club, Events, MyWork, Notifications, More, Profile.
No approval or attendance-admin UI.
```

### Advisor

```
Export Advisor screens under /advisor: Home, Reviews, Clubs, Reports, Notifications, More, Profile.
Read-only proposal body. Approve / Return for changes with required remarks.
```

### Shared system screens

```
Export under /system: ContinueCampusOne, ReturningFromCampusOne, SessionExpired, NoAccess, NotFound, Offline, AccountUnavailable, Error, SignOutConfirm, UploadError.
Reuse shared components.
```
