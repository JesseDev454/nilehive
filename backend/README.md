# NileHive Backend

This package contains the Express API for NileHive. It owns the server-side business rules, role checks, workflow validation, and Supabase-backed data access used by the frontend.

## What Lives Here

- route registration and app bootstrap
- auth and authorization middleware
- feature modules for proposals, members, dues, events, communications, and reports
- the shared Supabase database adapter
- SQL migrations and operational Supabase SQL
- backend tests

## Stack

- Node.js
- Express
- Supabase JS
- Postgres on Supabase
- Node test runner

## Local Setup

Install dependencies:

```powershell
npm.cmd install
```

Create:

```text
.env
```

Use [backend/.env.example](C:/Users/goodl/Documents/NileHive/backend/.env.example) as the starting point.

Most important variables:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AUTH_PROVIDER`
- `PORTAL_API_BASE_URL`
- `PORTAL_ORIGIN`
- `ALLOWED_EMAIL_DOMAINS`
- `FRONTEND_APP_URL`

Never expose `SUPABASE_SERVICE_ROLE_KEY` in the frontend.

Use `AUTH_PROVIDER=supabase` for local fallback. Use `AUTH_PROVIDER=portal` for the Buildathon deployment so the backend verifies the Campus One session by forwarding cookies to `https://api.builtbysalih.com/api/session`.

## Run

```powershell
npm.cmd run dev
```

Default local URL:

```text
http://localhost:4000
```

## Test

```powershell
npm.cmd test
```

## Backend Structure

Key entry points:

- [src/app.js](C:/Users/goodl/Documents/NileHive/backend/src/app.js)
- [src/config/db.js](C:/Users/goodl/Documents/NileHive/backend/src/config/db.js)
- [src/middleware/auth.js](C:/Users/goodl/Documents/NileHive/backend/src/middleware/auth.js)
- [src/middleware/errorHandler.js](C:/Users/goodl/Documents/NileHive/backend/src/middleware/errorHandler.js)

Feature modules are organized under `src/modules/`. Most follow this pattern:

- `*.routes.js`
- `*.controller.js`
- `*.service.js`
- `*.validation.js`

Common route groups:

- `/api/v1/profile`
- `/api/v1/clubs`
- `/api/v1/membership-requests`
- `/api/v1/members`
- `/api/v1/dues`
- `/api/v1/proposals`
- `/api/v1/events`
- `/api/v1/reports`
- `/api/v1/storage`
- `/api/v1/communications`
- `/api/v1/tasks`
- `/api/v1/admin/users`

## Business Rule Responsibilities

The backend is the real security boundary. It is responsible for:

- enforcing role access
- resolving Campus One platform role plus NileHive local app role into safe effective access
- preventing users from acting outside their club scope
- validating request payloads
- shaping paginated responses
- coordinating membership, dues, and proposal workflows

If the frontend hides an action but the backend does not enforce it, it is not secure yet.

## Supabase Files

### Migrations

Apply SQL in numeric order from:

```text
supabase/migrations/
```

Current migration ceiling:

```text
0043_portal_auth_profile_bridge.sql
```

## Role Model In Portal Mode

In `AUTH_PROVIDER=portal`, the backend should treat roles as two separate layers:

- Campus One platform role from `/api/session`
  - `student`
  - `staff`
  - `admin`
- local NileHive app role from `public.profiles.role`
  - `student`
  - `executive`
  - `president`
  - `advisor`

Effective access rules:

- Campus One `admin` is the only source of NileHive admin access
- Campus One `staff` needs a local `advisor` assignment to use advisor features
- local `president` and `executive` remain valid for Campus One `student` users
- unassigned Campus One `staff` should be treated as access-pending, not as ordinary students

This means NileHive no longer treats local `admin` assignment as the source of truth for admin permissions.

### Production-safe SQL

- [supabase/bootstrap_admin.sql](C:/Users/goodl/Documents/NileHive/backend/supabase/bootstrap_admin.sql)
- [supabase/bootstrap_clubs.sql](C:/Users/goodl/Documents/NileHive/backend/supabase/bootstrap_clubs.sql)
- [supabase/verify_clean_production.sql](C:/Users/goodl/Documents/NileHive/backend/supabase/verify_clean_production.sql)

### Local or demo only

- [supabase/demo_seed.sql](C:/Users/goodl/Documents/NileHive/backend/supabase/demo_seed.sql)
- [supabase/seed.sql](C:/Users/goodl/Documents/NileHive/backend/supabase/seed.sql)

## Development Rules

1. Keep route handlers thin.
2. Put workflow logic in services.
3. Keep validation explicit and close to the module.
4. Add tests when behavior changes.
5. Update docs when the workflow contract changes.

## More Reading

- [README.md](C:/Users/goodl/Documents/NileHive/README.md)
- [docs/DEVELOPER_GUIDE.md](C:/Users/goodl/Documents/NileHive/docs/DEVELOPER_GUIDE.md)
- [docs/ARCHITECTURE.md](C:/Users/goodl/Documents/NileHive/docs/ARCHITECTURE.md)
- [docs/WORKFLOWS.md](C:/Users/goodl/Documents/NileHive/docs/WORKFLOWS.md)
