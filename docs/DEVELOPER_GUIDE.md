# NileHive Developer Guide

[![Audience](https://img.shields.io/badge/audience-developers-1D4DA1)](#who-this-is-for)
[![Local Setup](https://img.shields.io/badge/local%20setup-supported-15803d)](#local-setup)
[![Production Safety](https://img.shields.io/badge/production-safety%20first-b45309)](#environment-safety-rules)
[![Supabase](https://img.shields.io/badge/supabase-required-059669)](#supabase-setup)
[![Frontend](https://img.shields.io/badge/frontend-Vite%20React-0ea5e9)](#frontend-architecture)
[![Backend](https://img.shields.io/badge/backend-Express%20API-16a34a)](#backend-architecture)

## Who This Is For

This guide is for developers who need to:

- run NileHive locally
- understand the current architecture
- work safely with Supabase
- know which SQL files are safe for production vs demo
- debug the common environment and auth issues quickly

If you are looking for deployment-only instructions, use:

- [PRODUCTION_HANDOFF.md](C:/Users/goodl/Documents/NileHive/docs/PRODUCTION_HANDOFF.md)
- [PRODUCTION_FRESH_START.md](C:/Users/goodl/Documents/NileHive/docs/PRODUCTION_FRESH_START.md)

## Project Overview

NileHive is the Club Services platform for Nile University. It manages:

- signup and profile provisioning
- club membership requests
- dues and verification
- proposal submission and approval
- approved events
- reports, tasks, and dashboards
- targeted announcements and notifications

### Current Access Roles

- `student`
- `executive`
- `president`
- `advisor`
- `admin`

## Architecture At A Glance

### Identity Model

NileHive uses two layers:

1. `auth.users`
   This is the Supabase Auth account.

2. `public.profiles`
   This is the app profile and role record.

Rule:

```text
auth.users.id = public.profiles.id
```

### Signup Model

The normal signup flow is:

1. user signs up in the frontend
2. signup metadata is sent to Supabase Auth
3. [0037_signup_profile_provisioning.sql](C:/Users/goodl/Documents/NileHive/backend/supabase/migrations/0037_signup_profile_provisioning.sql) provisions the app profile
4. students also get an initial ordinary membership request
5. if email confirmation is required, the user sees the confirmation page
6. after confirmation or immediate session creation, the user enters the app directly

### Legacy Recovery Path

[ProfileSetup.tsx](C:/Users/goodl/Documents/NileHive/frontend/src/pages/ProfileSetup.tsx) is no longer the normal signup continuation. It is only a fallback for older accounts that signed in before automatic provisioning existed.

## Repository Layout

```text
NileHive/
  backend/
    src/
    supabase/
      migrations/
      bootstrap_admin.sql
      bootstrap_clubs.sql
      demo_seed.sql
      seed.sql
      verify_clean_production.sql
    tests/
  frontend/
    src/
      components/
      contexts/
      lib/
      pages/
  docs/
```

## Local Setup

### Prerequisites

- Node.js 18+
- npm
- Git
- Supabase dashboard access

Recommended:

- VS Code
- Render access for backend deployment support
- Vercel access for frontend deployment support

### Install Dependencies

```powershell
cd backend
npm.cmd install
cd ..\frontend
npm.cmd install
```

### Create Environment Files

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

### Minimal Local Example

Backend:

```env
PORT=4000
SUPABASE_URL=https://your-dev-project-ref.supabase.co
SUPABASE_ANON_KEY=your-dev-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-dev-service-role-key
ALLOWED_EMAIL_DOMAINS=nileuniversity.edu.ng,nilehive.test
FRONTEND_APP_URL=http://localhost:8080
ASYNC_JOBS_ENABLED=false
EMAIL_DELIVERY_ENABLED=false
```

Frontend:

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_SUPABASE_URL=https://your-dev-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-dev-anon-key
VITE_ALLOWED_EMAIL_DOMAINS=nileuniversity.edu.ng,nilehive.test
VITE_AUTH_MODE=password
VITE_MICROSOFT_PASSWORD_HELP_URL=https://passwordreset.microsoftonline.com/
```

### Start The App

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

Default local URLs:

- frontend: `http://localhost:8080`
- backend: `http://localhost:4000`

## Environment Safety Rules

These rules matter a lot:

### Local And Production Must Never Share The Same Supabase Project

Use:

- one local/dev Supabase project
- one production Supabase project

Never point local `.env` files to production.

### Allowed Email Domains

Local/dev:

```text
nileuniversity.edu.ng,nilehive.test
```

Production:

```text
nileuniversity.edu.ng
```

### Service Role Key Rule

The Supabase service role key is backend-only.

Never place it in:

- frontend env files
- Vite code
- client-rendered code

## Supabase Setup

### Apply Migrations

Run everything in:

```text
backend/supabase/migrations/
```

Apply them in numeric order.

Current migration range:

```text
0001_week1_schema.sql
...
0037_signup_profile_provisioning.sql
```

### SQL Files And When To Use Them

| File | Use It When | Production Safe |
|---|---|---|
| `migrations/*.sql` | schema and behavior changes | `Yes` |
| `bootstrap_admin.sql` | promoting the first real admin after real auth signup | `Yes` |
| `bootstrap_clubs.sql` | inserting the real official Nile clubs | `Yes` |
| `verify_clean_production.sql` | checking a clean production database | `Yes` |
| `demo_seed.sql` | local/demo seeded walkthrough data | `No` |
| `seed.sql` | local/dev starter data | `No` |

### First Production Admin

Use [bootstrap_admin.sql](C:/Users/goodl/Documents/NileHive/backend/supabase/bootstrap_admin.sql) only after the real auth user already exists in Supabase Auth.

### Real Production Clubs

Use [bootstrap_clubs.sql](C:/Users/goodl/Documents/NileHive/backend/supabase/bootstrap_clubs.sql) to insert the official Nile University clubs into a clean production database.

## Frontend Architecture

Most important files:

- [App.tsx](C:/Users/goodl/Documents/NileHive/frontend/src/App.tsx)
  Main route wiring and protected-route behavior

- [AuthContext.tsx](C:/Users/goodl/Documents/NileHive/frontend/src/contexts/AuthContext.tsx)
  Session state, profile hydration, signup flow, legacy profile recovery behavior

- [RoleContext.tsx](C:/Users/goodl/Documents/NileHive/frontend/src/contexts/RoleContext.tsx)
  UI role exposure for role-based page behavior

- [api.ts](C:/Users/goodl/Documents/NileHive/frontend/src/lib/api.ts)
  Shared backend request layer and typed API calls

- [supabase.ts](C:/Users/goodl/Documents/NileHive/frontend/src/lib/supabase.ts)
  Browser Supabase client setup and storage key behavior

### Frontend Rules

1. Prefer shared API functions from `src/lib/api.ts`.
2. Avoid scattered direct `fetch()` calls in page components.
3. Keep auth/session behavior inside `AuthContext`.
4. Treat backend validation messages as the source of truth for form errors.

## Backend Architecture

Most important files:

- [app.js](C:/Users/goodl/Documents/NileHive/backend/src/app.js)
  Express app composition and route registration

- [db.js](C:/Users/goodl/Documents/NileHive/backend/src/config/db.js)
  Supabase-backed database adapter

- [auth.js](C:/Users/goodl/Documents/NileHive/backend/src/middleware/auth.js)
  Token lookup and profile enforcement

- [errorHandler.js](C:/Users/goodl/Documents/NileHive/backend/src/middleware/errorHandler.js)
  Standard API error envelope

### Backend Module Pattern

Each feature module usually contains:

- routes
- controller
- service
- validation

Examples:

- `src/modules/proposals/`
- `src/modules/membership-requests/`
- `src/modules/profile/`
- `src/modules/admin-users/`

### Backend Rules

1. Keep role enforcement in backend services and middleware.
2. Keep validation explicit.
3. Keep business rules in services, not route handlers.
4. Add tests when changing behavior.

## Auth, Signup, And Recovery Flows

### Student Signup

- requires Nile email
- requires student ID
- requires club choice
- creates Supabase auth user
- provisions `public.profiles` automatically
- creates the first ordinary membership request automatically

### Advisor Signup

- requires Nile email
- does not require student ID
- requires club choice
- creates Supabase auth user
- provisions `public.profiles` automatically
- does not auto-grant advisor-club authority

### Email Confirmation

If Supabase email confirmation is enabled:

- signup may return no live session
- user is sent to the signup confirmation page
- user confirms through email
- user returns and signs in normally

### Legacy Account Recovery

If a user has an older auth account but no `public.profiles` row:

- the app retries profile loading briefly
- then exposes the legacy recovery page
- this should be rare after `0037_signup_profile_provisioning.sql`

## Common Developer Tasks

### Add A New Backend Feature

1. create or update the module in `backend/src/modules`
2. add database adapter support in `db.js` if needed
3. add validation
4. add tests in `backend/tests`
5. add frontend API functions in `frontend/src/lib/api.ts`
6. connect the relevant page or component

### Add A New SQL Change

1. create a new numbered migration in `backend/supabase/migrations/`
2. keep it idempotent where reasonable
3. update any docs that mention the current migration ceiling
4. add at least one regression test if the migration affects a critical path

### Update Signup Behavior

Check:

- [AuthContext.tsx](C:/Users/goodl/Documents/NileHive/frontend/src/contexts/AuthContext.tsx)
- [SignUp.tsx](C:/Users/goodl/Documents/NileHive/frontend/src/pages/SignUp.tsx)
- [SignupConfirmation.tsx](C:/Users/goodl/Documents/NileHive/frontend/src/pages/SignupConfirmation.tsx)
- [0037_signup_profile_provisioning.sql](C:/Users/goodl/Documents/NileHive/backend/supabase/migrations/0037_signup_profile_provisioning.sql)

## Troubleshooting

### `/api/v1/ready` Returns 503 `DATABASE_UNAVAILABLE`

Check:

1. `SUPABASE_URL` is correct
2. `SUPABASE_SERVICE_ROLE_KEY` is correct
3. Data API is enabled in Supabase
4. migrations were applied
5. existing tables were granted to `service_role`, `authenticated`, and `anon` where appropriate

### Frontend Signs In But Cannot Load Profile

Check:

1. migration `0037_signup_profile_provisioning.sql` was applied
2. user exists in `auth.users`
3. matching `public.profiles` row exists
4. Supabase table grants and RLS are correct
5. the user is not hitting the legacy recovery path because of an older account

### Clubs Do Not Show On Signup

Check:

1. production has real clubs inserted
2. [bootstrap_clubs.sql](C:/Users/goodl/Documents/NileHive/backend/supabase/bootstrap_clubs.sql) has been run
3. public club visibility is correct
4. frontend is pointing to the intended backend and Supabase project

### Site Opens Already Logged In

Check:

- [supabase.ts](C:/Users/goodl/Documents/NileHive/frontend/src/lib/supabase.ts)

The frontend now uses a project-specific auth storage key to avoid stale cross-project sessions.

### Generic `Failed to fetch` Style Errors

This should be much rarer now because `src/lib/api.ts` normalizes:

- network failures
- malformed JSON responses
- backend validation errors

If a page still shows poor errors, check whether it is bypassing `getUserFacingErrorMessage(...)` or `actionError(...)`.

## Verification

### Backend

```powershell
cd backend
npm.cmd test
```

### Frontend

```powershell
cd frontend
npm.cmd run build
```

Expected current result:

- backend tests passing
- frontend build passing
- possible non-blocking Browserslist warning
- possible non-blocking large chunk warning

## Documentation Map

Use these docs together:

- repo overview: [README.md](C:/Users/goodl/Documents/NileHive/README.md)
- developer workflow: [DEVELOPER_GUIDE.md](C:/Users/goodl/Documents/NileHive/docs/DEVELOPER_GUIDE.md)
- backend quick reference: [backend/README.md](C:/Users/goodl/Documents/NileHive/backend/README.md)
- frontend quick reference: [frontend/README.md](C:/Users/goodl/Documents/NileHive/frontend/README.md)
- production deployment: [PRODUCTION_HANDOFF.md](C:/Users/goodl/Documents/NileHive/docs/PRODUCTION_HANDOFF.md)
- clean production reset: [PRODUCTION_FRESH_START.md](C:/Users/goodl/Documents/NileHive/docs/PRODUCTION_FRESH_START.md)
