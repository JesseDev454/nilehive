# NileHive Backend

This is the Express backend for NileHive.

Start from the root README first:

```text
../README.md
```

## Setup

Install dependencies:

```powershell
npm.cmd install
```

Create:

```text
.env
```

Use:

```env
PORT=4000
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The service role key is backend-only. Do not expose it in the frontend.

## Run

```powershell
npm.cmd run dev
```

Backend URL:

```text
http://localhost:4000
```

## Test

```powershell
npm.cmd test
```

## Supabase Migrations

Apply migrations in numeric order from:

```text
supabase/migrations/
```

Current migrations:

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
```

## Main Modules

```text
src/modules/clubs
src/modules/dashboard
src/modules/dues
src/modules/events
src/modules/health
src/modules/notifications
src/modules/proposals
src/modules/reminders
src/modules/reports
src/modules/tasks
src/modules/members
```

## Auth Model

Supabase Auth is the identity provider.

The app profile lives in:

```text
public.profiles
```

The backend maps:

```text
Supabase access token -> auth user -> profiles row -> app role and club scope
```

Current roles:

```text
executive
advisor
admin
president
```

## API Overview

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

## Notes

- Keep route logic inside the relevant module.
- Keep validation explicit.
- Avoid adding new abstractions unless the current module pattern genuinely needs it.
- Add tests when adding backend behavior.
