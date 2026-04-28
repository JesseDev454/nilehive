# NileHive Backend

[![Service](https://img.shields.io/badge/service-Express%20API-16a34a)](C:/Users/goodl/Documents/NileHive/backend/README.md)
[![Database](https://img.shields.io/badge/database-Supabase%20Postgres-059669)](C:/Users/goodl/Documents/NileHive/docs/DEVELOPER_GUIDE.md#supabase-setup)
[![Tests](https://img.shields.io/badge/tests-node%20test%20runner-15803d)](C:/Users/goodl/Documents/NileHive/README.md#verification)

Backend quick reference for NileHive.

Start here first if you need the full project context:

- [README.md](C:/Users/goodl/Documents/NileHive/README.md)
- [docs/DEVELOPER_GUIDE.md](C:/Users/goodl/Documents/NileHive/docs/DEVELOPER_GUIDE.md)

## What Lives Here

- Express API routes
- backend role and scope enforcement
- Supabase-backed data access through `src/config/db.js`
- SQL migrations and production bootstrap SQL
- backend tests

## Setup

Install:

```powershell
npm.cmd install
```

Create:

```text
.env
```

Use `../backend/.env.example` as the base.

Important backend-only variables:

- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `ALLOWED_EMAIL_DOMAINS`
- `FRONTEND_APP_URL`

Never expose `SUPABASE_SERVICE_ROLE_KEY` in the frontend.

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

## Main Backend Entry Points

- app wiring: [src/app.js](C:/Users/goodl/Documents/NileHive/backend/src/app.js)
- auth middleware: [src/middleware/auth.js](C:/Users/goodl/Documents/NileHive/backend/src/middleware/auth.js)
- shared DB adapter: [src/config/db.js](C:/Users/goodl/Documents/NileHive/backend/src/config/db.js)
- profile module: [src/modules/profile](C:/Users/goodl/Documents/NileHive/backend/src/modules/profile)
- proposals module: [src/modules/proposals](C:/Users/goodl/Documents/NileHive/backend/src/modules/proposals)
- membership module: [src/modules/membership-requests](C:/Users/goodl/Documents/NileHive/backend/src/modules/membership-requests)

## Supabase Files

### Migrations

Apply SQL in numeric order from:

```text
supabase/migrations/
```

Current migration ceiling:

```text
0037_signup_profile_provisioning.sql
```

### Production-Safe SQL

- [supabase/bootstrap_admin.sql](C:/Users/goodl/Documents/NileHive/backend/supabase/bootstrap_admin.sql)
- [supabase/bootstrap_clubs.sql](C:/Users/goodl/Documents/NileHive/backend/supabase/bootstrap_clubs.sql)
- [supabase/verify_clean_production.sql](C:/Users/goodl/Documents/NileHive/backend/supabase/verify_clean_production.sql)

### Local/Demo Only

- [supabase/demo_seed.sql](C:/Users/goodl/Documents/NileHive/backend/supabase/demo_seed.sql)
- [supabase/seed.sql](C:/Users/goodl/Documents/NileHive/backend/supabase/seed.sql)

## API Shape

Common route groups:

- `/api/v1/health`
- `/api/v1/ready`
- `/api/v1/profile`
- `/api/v1/clubs`
- `/api/v1/proposals`
- `/api/v1/membership-requests`
- `/api/v1/members`
- `/api/v1/dues`
- `/api/v1/events`
- `/api/v1/reports`
- `/api/v1/communications`
- `/api/v1/tasks`
- `/api/v1/admin/users`

## Backend Development Rules

1. Keep business rules in services.
2. Keep validation explicit and close to the module.
3. Keep route handlers thin.
4. Add tests for behavior changes.
5. Treat backend authorization as the real security layer even if the frontend already hides the UI.

## More Detail

For setup, auth flow, production safety, and troubleshooting:

- [docs/DEVELOPER_GUIDE.md](C:/Users/goodl/Documents/NileHive/docs/DEVELOPER_GUIDE.md)
