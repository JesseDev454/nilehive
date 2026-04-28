# NileHive Production Fresh Start

Use this guide when the current deployed database has been contaminated by local/demo data and Club Services needs a clean production start.

This process does **not** clean the old production project in place. It replaces it with a brand-new Supabase production project and repoints the deployed frontend/backend to that new source of truth.

## Recommended Approach

Use a brand-new Supabase project for production when any of these are true:

- fake clubs such as `Nile Innovators Club` appear in admin dashboards or club matrices
- `.nilehive.test` users appear in production user lists
- local/dev data has been mixed into the deployed environment
- you want Club Services to begin with a clean slate

This is safer than trying to delete contaminated production data record by record.

## What Production Must Use

Production should use only:

- `backend/supabase/migrations/`
- `backend/supabase/bootstrap_admin.sql`
- `backend/supabase/bootstrap_clubs.sql` for the real official club directory

Production must **never** use:

- `backend/supabase/demo_seed.sql`
- `backend/supabase/seed.sql`

## Step 1: Create A Brand-New Supabase Project

1. Create a new Supabase project for production.
2. Keep your current local/dev Supabase project unchanged.
3. Treat the old contaminated production project as unused once the new one is ready.

Recommended naming:

- local/dev: `nilehive-dev`
- production: `nilehive-prod`

## Step 2: Collect The New Production Keys

From the new production Supabase project, copy:

- Project URL
- anon public key
- service role key

You will use them here:

- Vercel frontend:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Render backend:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

## Step 3: Apply Migrations Only

In the new production Supabase project, run every SQL file in:

```text
backend/supabase/migrations/
```

Run them in numeric order.

Current production-safe migration range in this repo:

```text
0001_week1_schema.sql
...
0035_public_club_visibility.sql
```

Do not run any seed file after migrations.

## Step 4: Repoint Render And Vercel To The New Project

### Render backend

Update these env vars:

```env
SUPABASE_URL=NEW_PRODUCTION_SUPABASE_URL
SUPABASE_ANON_KEY=NEW_PRODUCTION_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=NEW_PRODUCTION_SUPABASE_SERVICE_ROLE_KEY
ALLOWED_EMAIL_DOMAINS=nileuniversity.edu.ng
FRONTEND_APP_URL=https://your-frontend-domain
CORS_ALLOWED_ORIGINS=https://your-frontend-domain
```

Keep:

```env
ASYNC_JOBS_ENABLED=false
EMAIL_DELIVERY_ENABLED=false
```

unless you have separately finished Redis/email setup.

### Vercel frontend

Update these env vars:

```env
VITE_SUPABASE_URL=NEW_PRODUCTION_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=NEW_PRODUCTION_SUPABASE_ANON_KEY
VITE_API_BASE_URL=https://your-backend-domain
VITE_ALLOWED_EMAIL_DOMAINS=nileuniversity.edu.ng
```

Important:

- `VITE_API_BASE_URL` must stay as the backend origin only
- do not append `/api/v1`

## Step 5: Configure Supabase Auth URLs

In the new production Supabase project:

1. Open `Authentication -> URL Configuration`
2. Set `Site URL` to your deployed frontend URL
3. Add redirect URLs for:
   - `https://your-frontend-domain`
   - `https://your-frontend-domain/login`
   - `https://your-frontend-domain/reset-password`

## Step 6: Create The First Real Production User

Create the first real auth user in the **new** production project before running bootstrap SQL.

You can do this by:

- signing up through the deployed app, or
- creating the user in Supabase `Authentication -> Users`

The auth user must already exist before bootstrap runs.

## Step 7: Run `bootstrap_admin.sql`

Open:

```text
backend/supabase/bootstrap_admin.sql
```

Replace the three values in the `params` CTE:

- `REPLACE_WITH_AUTH_USER_UUID`
- `Club Services Admin`
- `admin@nileuniversity.edu.ng`

Use the real UUID and email of the first production admin account.

Example shape:

```sql
select
  'YOUR_AUTH_USER_UUID'::uuid as admin_id,
  'Your Full Name'::text as full_name,
  'yourname@nileuniversity.edu.ng'::text as email_for_reference
```

Then run the edited SQL once in Supabase SQL Editor against the **new production** project.

Expected result:

- the auth user is inserted or updated in `public.profiles`
- role becomes `admin`
- a bootstrap role-history record is written

## Step 8: Verify The New Production Project Is Clean

Use:

```text
backend/supabase/verify_clean_production.sql
```

Run it in the new production project and confirm:

- no `Nile Innovators Club`
- no `.nilehive.test` users
- zero demo proposals/tasks/dues/reports unless you have already created real ones

## Step 8b: Insert The Real Official Clubs

If signup or onboarding should immediately show real club choices, run:

```text
backend/supabase/bootstrap_clubs.sql
```

Replace the sample row with the actual Nile University clubs and keep only real production clubs in that script.

## Step 9: Redeploy And Smoke Test

Redeploy both services after the env changes:

- Render backend
- Vercel frontend

Then test:

- `GET /api/v1/health`
- `GET /api/v1/ready`
- login with the first real admin account
- admin dashboard
- club matrix
- signup page

Expected clean-state behavior:

- no `Nile Innovators Club`
- no `.nilehive.test` users
- empty or real-only data

## Local/Dev Safety Rules

To keep local work from affecting production:

- local/dev must use a separate Supabase project
- production must use a separate Supabase project
- never copy local/demo env values into Vercel or Render production envs
- never run `demo_seed.sql` or `seed.sql` against production
- only use `bootstrap_admin.sql` for the first real production admin

## If You Need To Hand Over Admin Later

When Club Services gives the real admin account:

1. Create or confirm the real auth user exists in production
2. Promote that account to admin from inside the app or via Supabase/backend tooling
3. Demote the temporary setup admin account to `student` if needed

This keeps the bootstrap phase separate from long-term institutional ownership.
