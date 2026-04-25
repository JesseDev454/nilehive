# NileHive Production Handoff

This checklist prepares NileHive for a real Club Services demo or first production deployment.

## Deployment Shape

Recommended first deployment:

- Frontend: Vercel
- Backend API: Render or Railway
- Backend worker: Render worker service running `npm run worker`
- Database/auth/storage: managed Supabase
- Redis: managed Redis

The frontend should call only the deployed backend API. The Supabase service role key must stay backend-only.

Repo deployment helpers:

- `vercel.json` builds `frontend/` and rewrites SPA routes to `index.html`
- `render.yaml` provisions the backend API service with async jobs disabled by default
- `.nvmrc` pins Node `20`

Deployment UI note:

- In Vercel, import the repo root. `vercel.json` already points build/install/output to `frontend/`.
- In Render, use the repo blueprint or create the web service from `backend/`.

## Production Environment Variables

Backend:

```env
NODE_ENV=production
PORT=4000
REQUEST_TIMEOUT_MS=15000
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ALLOWED_EMAIL_DOMAINS=nileuniversity.edu.ng
FRONTEND_APP_URL=https://your-frontend-domain
CURRENT_ACADEMIC_SESSION=2025/2026
ASYNC_JOBS_ENABLED=false
REDIS_URL=
REDIS_QUEUE_PREFIX=nilehive
JOB_CHUNK_SIZE=250
JOB_DEFAULT_ATTEMPTS=3
JOB_BACKOFF_MS=5000
SENTRY_DSN_BACKEND=
SENTRY_DSN_FRONTEND=
EMAIL_DELIVERY_ENABLED=false
EMAIL_PROVIDER=microsoft_graph
MICROSOFT_TENANT_ID=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_SENDER_EMAIL=clubservices@nileuniversity.edu.ng
```

Frontend:

```env
VITE_API_BASE_URL=https://your-backend-domain
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_ALLOWED_EMAIL_DOMAINS=nileuniversity.edu.ng
VITE_AUTH_MODE=password
VITE_MICROSOFT_PASSWORD_HELP_URL=https://passwordreset.microsoftonline.com/
```

Notes:

- `SUPABASE_SERVICE_ROLE_KEY` is never shared with frontend developers.
- `VITE_SUPABASE_ANON_KEY` is safe for the frontend.
- `VITE_API_BASE_URL` should be the backend origin only, without `/api/v1`.
- `REQUEST_TIMEOUT_MS` should stay low enough to fail fast instead of letting requests hang.
- `ASYNC_JOBS_ENABLED` should stay `false` until Redis and the worker service are ready.
- `REDIS_URL` is used by both shared rate limiting and BullMQ background jobs.
- When `ASYNC_JOBS_ENABLED=true`, `/api/v1/ready` expects both Redis and the worker heartbeat to be healthy.
- Microsoft Graph variables can remain blank while `EMAIL_DELIVERY_ENABLED=false`.
- Supabase Auth site URL and redirect URLs must include the deployed frontend URL.
- Backend CORS must allow `FRONTEND_APP_URL`.

## First Admin Bootstrap

Production should not seed fake `auth.users`.

1. Create the first admin account through Supabase Auth or the app signup flow.
2. Copy the Supabase Auth user UUID and email.
3. Open `backend/supabase/bootstrap_admin.sql`.
4. Replace:
   - `REPLACE_WITH_AUTH_USER_UUID`
   - `Club Services Admin`
   - `admin@nileuniversity.edu.ng`
5. Run the SQL once in Supabase SQL Editor.

The bootstrap script is idempotent. It upserts the admin profile and records one role-history entry.

## Demo Seed

Use `backend/supabase/demo_seed.sql` only for local/demo environments.

Demo login password for seeded users:

```text
password123
```

Demo users:

- `admin@nilehive.test`
- `president@nilehive.test`
- `executive@nilehive.test`
- `advisor@nilehive.test`
- `student@nilehive.test`
- `pending.student@nilehive.test`
- `dues.student@nilehive.test`

Suggested demo flow:

1. Login as president and show club proposals, tasks, dues, reports, announcements, and missing-report prompt.
2. Login as advisor and review the pending advisor proposal.
3. Login as admin and show user management, final approval queue, and institution-wide dashboard.
4. Login as executive and show task-focused dashboard only.
5. Login as student and show membership/dues status plus approved events.

## RLS And Storage Audit

Final production role model:

- President owns proposals, dues oversight, reports, members, tasks, and club follow-up.
- Executive receives tasks, updates task progress, and views operational announcements/events.
- Advisor reviews assigned-club proposals and can view assigned-club reports.
- Admin has institution-wide oversight.
- Student can request membership, confirm dues payment, RSVP, and submit feedback.

Table policy checklist:

- `profiles`: users can create their own student profile during onboarding; admin changes roles through backend/user management.
- `proposals`: president-owned insert/update; advisor/admin/president scoped select.
- `event_reports`: president submit/select own club; advisor/admin scoped select; no executive access.
- `due_payments`: student own payment visibility; president/admin club visibility; no executive access.
- `tasks`: president assigns; executive sees assigned tasks.
- `membership_requests`: student own requests; president own-club member requests; admin all leadership/member requests.
- `announcements`: admin global/club/role; president own club/student/executive targets; read state is per user.
- `profile_role_history`: admin-only select.
- `email_deliveries`: admin-only select.
- `audit_logs`: admin-only select.

Storage path conventions:

- `dues-receipts/{club_id}/{profile_id}/{file}`
- `event-media/{club_id}/{file}`
- Future report documents: `reports/{club_id}/{proposal_id}/{file}`

Storage policy checklist:

- `dues-receipts`: students upload/view own receipt; president/admin manage relevant club receipts.
- `event-media`: public read; president/admin upload/update/delete for their scope.
- `reports`: reserved for future report documents; president/admin upload, advisor/admin/president scoped read.
- Executives should not have private dues/report storage access.

## Release Checks

Deployment order:

1. Apply Supabase migrations in staging/production.
2. Deploy backend API on Render with env vars from this file.
3. Set frontend env vars in Vercel and deploy the Vite app.
4. Add Supabase Auth site URL and redirect URLs for the deployed frontend domain.
5. Create the first real admin account and run `backend/supabase/bootstrap_admin.sql`.
6. Verify `/api/v1/health` and `/api/v1/ready`.
7. Enable the Render worker and Redis later only when async jobs are funded and ready.

Run before demo or deployment:

```powershell
cd backend
npm.cmd test
```

```powershell
cd frontend
npm.cmd run build
```

Manual checks:

- President can create proposals and submit reports.
- Executive cannot access proposals, dues tracking, or reports.
- Student can submit dues proof only for their own membership flow.
- Advisor sees assigned-club proposal queue.
- Admin can manage users and final approvals.
- `/api/v1/ready` returns healthy status before promoting a deployment.
- Outlook email delivery is skipped safely while disabled.
