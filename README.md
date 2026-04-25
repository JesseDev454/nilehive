# NileHive

NileHive is a club operations and event approval platform for the Club Services Unit at Nile University of Nigeria.

The system replaces manual paper-based event proposal movement with a digital workflow for proposal submission, advisor review, admin verification, approved event tracking, reminders, notifications, dashboards, and task delegation.

## Current Product State

The app currently supports:

- Supabase Auth login/session handling
- App role/profile mapping through `profiles`
- President-owned proposal submission with rich proposal fields
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
- Manual dues and payment tracking
- Post-event report submission
- Reports and media archive visibility
- Communication Hub for targeted announcements, read state, and feedback
- Microsoft SSO foundation is present but hidden until the university approves it
- Microsoft Graph email foundation for high/urgent announcements

Planned but not fully implemented yet:

- Full Outlook calendar sync
- Club Services user guide

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
- Vercel access for the frontend deployment
- Render access for the backend deployment

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
ALLOWED_EMAIL_DOMAINS=nileuniversity.edu.ng,nilehive.test
FRONTEND_APP_URL=http://localhost:8080
EMAIL_DELIVERY_ENABLED=false
EMAIL_PROVIDER=microsoft_graph
MICROSOFT_TENANT_ID=your-azure-tenant-id
MICROSOFT_CLIENT_ID=your-azure-app-client-id
MICROSOFT_CLIENT_SECRET=your-azure-app-client-secret
MICROSOFT_SENDER_EMAIL=clubservices@nileuniversity.edu.ng
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
VITE_ALLOWED_EMAIL_DOMAINS=nileuniversity.edu.ng,nilehive.test
VITE_AUTH_MODE=password
VITE_MICROSOFT_PASSWORD_HELP_URL=https://passwordreset.microsoftonline.com/
```

Environment safety rules:

- Local/demo must point to a local or demo Supabase project.
- Production must point to a separate production Supabase project.
- Local/demo should allow `nileuniversity.edu.ng,nilehive.test`.
- Production should allow only `nileuniversity.edu.ng`.
- Never run `backend/supabase/demo_seed.sql` or `backend/supabase/seed.sql` against production.
- `backend/supabase/bootstrap_admin.sql` is production/bootstrap only and is not a seed file.
- `backend/supabase/bootstrap_clubs.sql` is the production-safe place to insert the real official clubs.

Frontend developers only need the Supabase URL and anon key. They should never use the service role key in frontend code.

If teammates connect their frontend to a backend running on your laptop, set your backend env to listen on the network and allow their frontend origin:

```env
HOST=0.0.0.0
CORS_ALLOWED_ORIGINS=http://localhost:8080,http://localhost:8081,http://127.0.0.1:8080,http://127.0.0.1:8081
```

Their frontend should use your current Wi-Fi IP:

```env
VITE_API_BASE_URL=http://YOUR_WIFI_IPV4:4000
```

They can confirm backend access by opening:

```text
http://YOUR_WIFI_IPV4:4000/api/v1/health
```

## Microsoft Outlook Authentication

NileHive has a dormant Microsoft/Outlook authentication foundation, but the visible app currently keeps the normal email/password login while university approval is pending.

For now, keep:

```env
VITE_AUTH_MODE=password
```

If the university approves Microsoft SSO later, production NileHive users can sign in with their existing Nile University Microsoft/Outlook account:

```text
user@nileuniversity.edu.ng
```

At that point, Supabase Auth should be configured with the Microsoft/Azure provider and the frontend can be switched to:

```env
VITE_AUTH_MODE=microsoft
```

Password recovery for production users is handled by Nile University's Microsoft account recovery process, not by NileHive.

## Microsoft Graph Email Delivery

NileHive can send high/urgent announcement emails through Microsoft Graph from the Club Services mailbox. This is separate from Microsoft login.

Required Azure setup:

- Create an Azure app registration.
- Add Microsoft Graph application permission: `Mail.Send`.
- Grant admin consent.
- Set `MICROSOFT_TENANT_ID`, `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, and `MICROSOFT_SENDER_EMAIL`.
- Set `EMAIL_DELIVERY_ENABLED=true` only when the Microsoft setup is ready.

If email delivery fails, NileHive still publishes the announcement and stores the in-app notification. Email delivery attempts are logged in `email_deliveries`.

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
0011_dues_payment_tracking.sql
0012_post_event_reports.sql
...
0025_communication_hub.sql
0026_email_delivery_logs.sql
0027_production_rls_cleanup.sql
```

Apply them in the Supabase SQL Editor, one file at a time, in numeric order.

If Supabase says `success no rows returned`, that is usually correct for migrations.

## Required Roles

NileHive currently uses these app roles:

- `executive`
- `advisor`
- `admin`
- `president`
- `student`

Supabase Auth stores the login account. The `profiles` table stores the app role and club link.

Every real app user must have:

```text
auth.users.id = profiles.id
```

## Minimum Test Users

For local end-to-end testing, create at least:

- one student
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
  'Nile Book Club',
  'NBC'
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

1. Login as president.
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
19. Open Dues.
20. Create a dues record for a member.
21. Mark the dues record as submitted or paid.
22. Login as president.
23. Open Reports Archive.
24. Submit a post-event report for an approved event.
25. Login as admin, advisor, or president.
26. Open Reports Archive and confirm the report is visible in the correct scope.

## Production Handoff

Use the production hardening guide before a real deployment:

```text
docs/PRODUCTION_HANDOFF.md
docs/PRODUCTION_FRESH_START.md
```

Deployment config checked into this repo:

```text
vercel.json
render.yaml
```

Important production/demo setup files:

```text
backend/supabase/bootstrap_admin.sql
backend/supabase/bootstrap_clubs.sql
backend/supabase/verify_clean_production.sql
backend/supabase/demo_seed.sql
backend/supabase/migrations/0027_production_rls_cleanup.sql
```

Production note:

- `demo_seed.sql` and `seed.sql` are local/demo only.
- `bootstrap_admin.sql` is the production-safe way to promote the first real admin after a real auth signup.

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

Dues:

- `GET /api/v1/dues`
- `POST /api/v1/dues`
- `POST /api/v1/dues/:paymentId`

Reports:

- `GET /api/v1/reports`
- `POST /api/v1/reports`
- `GET /api/v1/reports/:reportId`

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
