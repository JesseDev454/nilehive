# NileHive

[![Status](https://img.shields.io/badge/status-active%20development-1D4DA1)](#current-scope)
[![Frontend](https://img.shields.io/badge/frontend-Vite%20%2B%20React-0ea5e9)](#tech-stack)
[![Backend](https://img.shields.io/badge/backend-Express%20%2B%20Supabase-16a34a)](#tech-stack)
[![Auth](https://img.shields.io/badge/auth-Supabase%20Auth-0f766e)](#auth-and-signup-model)
[![Database](https://img.shields.io/badge/database-Postgres%20on%20Supabase-059669)](#supabase-and-database-rules)
[![Tests](https://img.shields.io/badge/tests-192%20passing-15803d)](#verification)
[![License](https://img.shields.io/badge/license-private-52525b)](#repository-structure)

NileHive is the club operations and event approval platform for the Club Services Unit at Nile University of Nigeria.

It replaces paper-based proposal movement with a digital workflow for:

- club signup and profile provisioning
- membership requests and dues tracking
- proposal submission, advisor review, and admin approval
- approved events, reminders, and reports
- announcements, notifications, and dashboards
- club operations for students, executives, presidents, advisors, and admins

## Quick Links

- Developer guide: [docs/DEVELOPER_GUIDE.md](C:/Users/goodl/Documents/NileHive/docs/DEVELOPER_GUIDE.md)
- Production handoff: [docs/PRODUCTION_HANDOFF.md](C:/Users/goodl/Documents/NileHive/docs/PRODUCTION_HANDOFF.md)
- Production fresh start: [docs/PRODUCTION_FRESH_START.md](C:/Users/goodl/Documents/NileHive/docs/PRODUCTION_FRESH_START.md)
- Backend notes: [backend/README.md](C:/Users/goodl/Documents/NileHive/backend/README.md)
- Frontend notes: [frontend/README.md](C:/Users/goodl/Documents/NileHive/frontend/README.md)

## Current Scope

NileHive currently supports:

- password-based Supabase Auth with Nile University email restrictions
- automatic app-profile provisioning during signup
- student and advisor self-signup
- membership requests and dues verification workflows
- president proposal submission
- advisor review queue
- admin final review queue
- self-review protection so submitters cannot approve their own proposals
- approved events and event engagement foundations
- club members, leadership applications, and advisor assignments
- role-based dashboards, tasks, reports, and communications

Still evolving:

- Outlook/Microsoft SSO activation once the university approves it
- fuller pagination coverage across all list pages
- additional end-user product documentation

## Repository Structure

```text
NileHive/
  backend/      Express API, Supabase helpers, SQL migrations, Node tests
  frontend/     Vite React app, auth/session UI, role-based pages
  docs/         Deployment, recovery, and developer-facing documentation
```

## Tech Stack

### Backend

- Node.js
- Express
- Supabase JS
- Postgres on Supabase
- Node test runner

### Frontend

- Vite
- React
- TypeScript
- React Router
- TanStack Query
- Tailwind CSS
- Supabase JS

## Getting Started

### 1. Install dependencies

```powershell
cd backend
npm.cmd install
cd ..\frontend
npm.cmd install
```

### 2. Create environment files

Backend:

```text
backend/.env
```

Frontend:

```text
frontend/.env.local
```

Use the examples in:

- [backend/.env.example](C:/Users/goodl/Documents/NileHive/backend/.env.example)
- [frontend/.env.example](C:/Users/goodl/Documents/NileHive/frontend/.env.example)

### 3. Apply Supabase migrations

Run the SQL files in:

```text
backend/supabase/migrations/
```

Apply them in numeric order through:

- Supabase SQL Editor, or
- your team’s preferred migration workflow

The current migration range in this repo ends at:

```text
0037_signup_profile_provisioning.sql
```

### 4. Start the app

Backend:

```powershell
cd backend
npm.cmd run dev
```

Frontend:

```powershell
cd frontend
npm.cmd run dev
```

Expected local URLs:

- frontend: `http://localhost:8080`
- backend: `http://localhost:4000`

## Auth And Signup Model

NileHive uses Supabase Auth for identity and `public.profiles` for app access.

The normal signup flow is now:

1. user completes the signup form
2. Supabase creates the auth account
3. signup metadata is consumed by the SQL trigger in [0037_signup_profile_provisioning.sql](C:/Users/goodl/Documents/NileHive/backend/supabase/migrations/0037_signup_profile_provisioning.sql)
4. a matching `public.profiles` row is created automatically
5. student signup also creates the first ordinary membership request
6. if Supabase requires email confirmation, the user sees a confirmation-pending page
7. after confirmation or immediate session creation, the user enters the app directly

Important rule:

```text
auth.users.id = public.profiles.id
```

## App Roles

NileHive currently uses these app roles:

- `student`
- `executive`
- `president`
- `advisor`
- `admin`

Role scope is enforced in the backend. The frontend should never be treated as the real security boundary.

## Supabase And Database Rules

Keep environments fully separated:

- local/demo Supabase project
- production Supabase project

Local/demo may allow:

```text
nileuniversity.edu.ng,nilehive.test
```

Production must allow only:

```text
nileuniversity.edu.ng
```

Never run these in production:

- `backend/supabase/demo_seed.sql`
- `backend/supabase/seed.sql`

Production-safe operational SQL files:

- [bootstrap_admin.sql](C:/Users/goodl/Documents/NileHive/backend/supabase/bootstrap_admin.sql)
- [bootstrap_clubs.sql](C:/Users/goodl/Documents/NileHive/backend/supabase/bootstrap_clubs.sql)
- [verify_clean_production.sql](C:/Users/goodl/Documents/NileHive/backend/supabase/verify_clean_production.sql)

## Developer Workflow

If you are new to the codebase, read in this order:

1. [README.md](C:/Users/goodl/Documents/NileHive/README.md)
2. [docs/DEVELOPER_GUIDE.md](C:/Users/goodl/Documents/NileHive/docs/DEVELOPER_GUIDE.md)
3. [frontend/README.md](C:/Users/goodl/Documents/NileHive/frontend/README.md)
4. [backend/README.md](C:/Users/goodl/Documents/NileHive/backend/README.md)

Good first places to look in code:

- auth/session: [AuthContext.tsx](C:/Users/goodl/Documents/NileHive/frontend/src/contexts/AuthContext.tsx)
- frontend API client: [api.ts](C:/Users/goodl/Documents/NileHive/frontend/src/lib/api.ts)
- backend app wiring: [app.js](C:/Users/goodl/Documents/NileHive/backend/src/app.js)
- backend database adapter: [db.js](C:/Users/goodl/Documents/NileHive/backend/src/config/db.js)
- SQL migrations: [backend/supabase/migrations](C:/Users/goodl/Documents/NileHive/backend/supabase/migrations)

## Verification

Backend tests:

```powershell
cd backend
npm.cmd test
```

Frontend production build:

```powershell
cd frontend
npm.cmd run build
```

Current known non-blocking frontend build warnings:

- Browserslist data age warning
- large chunk-size warning

## Production Notes

For a normal production rollout, use:

- [docs/PRODUCTION_HANDOFF.md](C:/Users/goodl/Documents/NileHive/docs/PRODUCTION_HANDOFF.md)

If production was contaminated by local/demo data, use:

- [docs/PRODUCTION_FRESH_START.md](C:/Users/goodl/Documents/NileHive/docs/PRODUCTION_FRESH_START.md)

## For Other Developers

If you only remember five rules, remember these:

1. Never point local work at the production Supabase project.
2. Never use the Supabase service role key in frontend code.
3. Apply migrations in order before testing auth or data flows.
4. Use the shared frontend API client instead of ad hoc `fetch()` calls.
5. Treat `ProfileSetup` as a legacy recovery screen, not the normal signup path.
