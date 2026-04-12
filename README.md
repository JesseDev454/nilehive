# NileHive

NileHive is a club operations and event approval platform for the Club Services Unit at Nile University of Nigeria.

The system replaces manual paper-based event proposal movement with a digital workflow for proposal submission, advisor review, admin verification, approved event tracking, reminders, notifications, dashboards, and task delegation.

## Current Product State

The app currently supports:

- Supabase Auth login/session handling
- App role/profile mapping through `profiles`
- Executive proposal submission with rich proposal fields
- Advisor pending proposal queue
- Advisor approve/reject decisions with remarks
- Admin final approve/reject decisions with remarks
- Approval history records
- Stored notifications
- Approved events page
- Approved event reminders
- Executive, advisor, admin, and president dashboard foundations
- President-to-executive task delegation
- Executive task status updates
- Club member database
- Basic executive team management through member roles

Planned but not fully implemented yet:

- Student/member experience
- Dues and payment tracking
- Post-event reports
- Media/report archive
- Announcements and feedback
- Production onboarding/admin invite flow

## Repository Structure

```text
NileHive/
  backend/      Express API, Supabase DB helpers, migrations, backend tests
  frontend/     Vite React app, role-based UI, API client, design reference
```

## Tech Stack

Backend:

- Node.js
- Express
- Supabase/Postgres
- Supabase Auth
- Node test runner

Frontend:

- Vite
- React
- TypeScript
- React Router
- TanStack Query
- Supabase JS
- shadcn/ui-style component structure
- Tailwind CSS

## Required Local Tools

Install:

- Node.js 18 or newer
- npm
- Git

Recommended:

- VS Code
- Supabase dashboard access

## Environment Files

Do not commit real secrets.

Backend env file:

```text
backend/.env
```

Example:

```env
PORT=4000
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Frontend env file:

```text
frontend/.env.local
```

Example:

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Frontend developers only need the Supabase URL and anon key. They should never use the service role key in frontend code.

## First-Time Setup

From the repo root:

```powershell
cd backend
npm.cmd install
```

Then:

```powershell
cd ..\frontend
npm.cmd install
```

Create the env files shown above.

## Supabase Setup

Apply SQL migrations in order from:

```text
backend/supabase/migrations/
```

Current migration order:

```text
0001_week1_schema.sql
0002_week1_rls.sql
0003_sprint_3_1_advisor_decision.sql
0004_sprint_3_2_approval_history.sql
0005_sprint_3_5_notifications.sql
0006_proposal_form_2_0.sql
0007_admin_final_verification.sql
0008_approved_events_reminders.sql
0009_task_delegation.sql
0010_member_database.sql
```

Apply them in the Supabase SQL Editor, one file at a time, in numeric order.

If Supabase says `success no rows returned`, that is usually correct for migrations.

## Required Roles

NileHive currently uses these app roles:

- `executive`
- `advisor`
- `admin`
- `president`

Future role:

- `student`

Supabase Auth stores the login account. The `profiles` table stores the app role and club link.

Every real app user must have:

```text
auth.users.id = profiles.id
```

## Minimum Test Users

For local end-to-end testing, create at least:

- one executive
- one advisor
- one admin
- one president

The executive and president should have a `club_id`.

The club should have an `advisor_id`.

Example relationship:

```text
executive profile -> club_id = CLUB_UUID
president profile -> club_id = CLUB_UUID
club -> advisor_id = ADVISOR_PROFILE_UUID
admin profile -> club_id can be null
```

## Example Profile Setup

After creating Auth users in Supabase Authentication, copy their user UUIDs.

Create a club:

```sql
insert into public.clubs (id, name, code)
values (
  gen_random_uuid(),
  'Nile Innovators Club',
  'NIC'
)
returning id, name, code;
```

Use the returned club ID in profile rows:

```sql
insert into public.profiles (id, full_name, role, club_id)
values
  ('EXECUTIVE_AUTH_USER_ID', 'Test Executive', 'executive', 'CLUB_UUID'),
  ('ADVISOR_AUTH_USER_ID', 'Test Advisor', 'advisor', null),
  ('ADMIN_AUTH_USER_ID', 'Test Admin', 'admin', null),
  ('PRESIDENT_AUTH_USER_ID', 'Test President', 'president', 'CLUB_UUID');
```

Link the advisor to the club:

```sql
update public.clubs
set advisor_id = 'ADVISOR_AUTH_USER_ID'
where id = 'CLUB_UUID';
```

## Run Locally

Terminal 1:

```powershell
cd backend
npm.cmd run dev
```

Backend runs at:

```text
http://localhost:4000
```

Terminal 2:

```powershell
cd frontend
npm.cmd run dev
```

Frontend usually runs at:

```text
http://localhost:8080
```

## Local Health Check

With the backend running:

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:4000/api/v1/health"
```

Expected:

```text
service OK and database reachable
```

## Main Manual Test Flow

1. Login as executive.
2. Create a proposal from the frontend.
3. Login as advisor.
4. Open the advisor approvals page.
5. Approve the proposal.
6. Login as admin.
7. Open the proposal detail.
8. Give final admin approval.
9. Confirm the proposal appears in Approved Events.
10. Login as president.
11. Open Task Delegation.
12. Assign a task to the executive.
13. Login as executive.
14. Open My Tasks.
15. Update the task status.
16. Login as president or admin.
17. Open Members.
18. Add a member and mark their club role as member, executive, or president.

## Backend API Summary

Health:

- `GET /api/v1/health`

Clubs:

- `GET /api/v1/clubs`

Proposals:

- `POST /api/v1/proposals`
- `GET /api/v1/proposals`
- `GET /api/v1/proposals/:proposalId`
- `GET /api/v1/proposals/pending-advisor`
- `GET /api/v1/proposals/advisor/:proposalId`
- `POST /api/v1/proposals/:proposalId/advisor-decision`
- `GET /api/v1/proposals/admin`
- `GET /api/v1/proposals/admin/:proposalId`
- `POST /api/v1/proposals/admin/:proposalId/decision`

Notifications:

- `GET /api/v1/notifications`

Events/reminders:

- `GET /api/v1/events/approved`
- `GET /api/v1/reminders`

Dashboards:

- `GET /api/v1/dashboard/executive`
- `GET /api/v1/dashboard/president`

Tasks:

- `GET /api/v1/tasks`
- `POST /api/v1/tasks`
- `GET /api/v1/tasks/:taskId`
- `POST /api/v1/tasks/:taskId/status`

Members:

- `GET /api/v1/members`
- `POST /api/v1/members`
- `POST /api/v1/members/:memberId`

## Frontend Notes For Teammates

The frontend should call backend routes through:

```text
frontend/src/lib/api.ts
```

Do not hardcode backend URLs in components. Use:

```env
VITE_API_BASE_URL=http://localhost:4000
```

Auth/session is handled in:

```text
frontend/src/contexts/AuthContext.tsx
```

Role behavior is exposed through:

```text
frontend/src/contexts/RoleContext.tsx
```

The app now uses the authenticated user's real profile role. Do not bring back manual role toggles for production behavior.

## Verification Commands

Backend:

```powershell
cd backend
npm.cmd test
```

Frontend:

```powershell
cd frontend
npm.cmd run build
```

The frontend build may show warnings about Browserslist data or large chunks. Those warnings are currently non-blocking.

## Important Security Rules

- Never commit `.env`, `backend/.env`, or `frontend/.env.local`.
- Never put the Supabase service role key in frontend code.
- Frontend uses anon key only.
- Backend uses service role key server-side.
- Role enforcement happens in the backend.
- Supabase RLS policies exist for compatibility and safety, but backend checks still matter.

## Development Rule Of Thumb

Keep the app buildathon-friendly:

- simple modules
- explicit routes
- clear validation
- no unnecessary services
- no unrelated refactors during feature work
- complete each role flow before adding the next big module
