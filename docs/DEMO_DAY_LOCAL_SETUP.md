# NileHive Demo Day Local Setup

Use this only for a **local/demo** environment. Do **not** run the demo seed against production.

## 1. Confirm local auth mode

Frontend in [frontend/.env.local](C:/Users/goodl/Documents/NileHive/frontend/.env.local):

```env
VITE_AUTH_PROVIDER=supabase
```

Backend in [backend/.env](C:/Users/goodl/Documents/NileHive/backend/.env):

```env
AUTH_PROVIDER=supabase
```

## 2. Prepare the demo database

1. Apply all Supabase migrations to your **demo/local** Supabase project.
2. Run [demo_seed.sql](C:/Users/goodl/Documents/NileHive/backend/supabase/demo_seed.sql) in the SQL editor for that same non-production project.

Seeded password:

```text
password123
```

Seeded demo users:

- `admin@nilehive.test`
- `president@nilehive.test`
- `executive@nilehive.test`
- `advisor@nilehive.test`
- `student@nilehive.test`
- `pending.student@nilehive.test`
- `dues.student@nilehive.test`

## 3. Start the app

Backend:

```powershell
cd backend
npm.cmd install
npm.cmd test
npm.cmd run dev
```

Frontend:

```powershell
cd frontend
npm.cmd install
npm.cmd run build
npm.cmd run dev
```

## 4. Demo route to verify before presenting

- `student@nilehive.test`
  - Discover Clubs
  - open a join form
  - upload a receipt
  - remove the receipt
  - upload the correct one
  - submit or show membership state
- `president@nilehive.test`
  - proposals
  - tasks
  - dues flow
  - reports
- `advisor@nilehive.test`
  - pending advisor review
- `admin@nilehive.test`
  - user management
  - final approval queue
  - institution dashboard
- `executive@nilehive.test`
  - task-focused dashboard

## 5. Safe reminder

- Never run [demo_seed.sql](C:/Users/goodl/Documents/NileHive/backend/supabase/demo_seed.sql) on production.
- If you need a live deployment for the demo, point it to a separate non-production Supabase project first.
