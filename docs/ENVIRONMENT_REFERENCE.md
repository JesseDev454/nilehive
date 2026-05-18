# NileHive Environment Reference

This document lists the important environment variables used by the frontend and backend.

## Backend Variables

| Variable | Required | Purpose | Notes |
|---|---|---|---|
| `NODE_ENV` | No | Runtime mode | Usually `development` locally |
| `PORT` | Yes | Backend port | Local default is `4000` |
| `HOST` | No | Backend bind host | Common local value is `0.0.0.0` |
| `REQUEST_TIMEOUT_MS` | No | API request timeout | Helps avoid hanging requests |
| `SUPABASE_URL` | Yes | Supabase project URL | Must match the intended environment |
| `SUPABASE_ANON_KEY` | Yes | Supabase anon key | Used by some backend flows and parity checks |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Privileged Supabase access | Backend only. Never expose to the frontend |
| `AUTH_PROVIDER` | No | Backend auth verifier | Use `supabase` locally and `portal` for Buildathon shared auth |
| `PORTAL_API_BASE_URL` | Portal mode | Campus One auth API | Buildathon default is `https://api.builtbysalih.com` |
| `PORTAL_ORIGIN` | Portal mode | Campus One portal site | Buildathon default is `https://portal.builtbysalih.com` |
| `ALLOWED_EMAIL_DOMAINS` | Yes | Allowed signup domains | Local often includes `nilehive.test`; production should not |
| `FRONTEND_APP_URL` | Yes | Frontend origin | Used for redirects and environment alignment |
| `CORS_ALLOWED_ORIGINS` | Yes | Allowed browser origins | Keep aligned with active frontend URLs |
| `CURRENT_ACADEMIC_SESSION` | No | Academic session default | Used in dues and related workflows |
| `ASYNC_JOBS_ENABLED` | No | Async worker behavior | Defaults to `false` in simple local setups |
| `REDIS_URL` | No | Queue backend | Needed only for async job deployments |
| `REDIS_QUEUE_PREFIX` | No | Queue namespace | Helps separate environments |
| `JOB_CHUNK_SIZE` | No | Queue batching | Tuning knob for async processing |
| `JOB_DEFAULT_ATTEMPTS` | No | Retry attempts | Async jobs only |
| `JOB_BACKOFF_MS` | No | Retry delay | Async jobs only |
| `SENTRY_DSN_BACKEND` | No | Backend error reporting | Leave empty if not configured |
| `SENTRY_DSN_FRONTEND` | No | Shared frontend reporting value | Some deployment flows mirror this |
| `EMAIL_DELIVERY_ENABLED` | No | Email sending toggle | Microsoft Graph delivery is disabled unless true |
| `EMAIL_PROVIDER` | No | Email provider name | Current default is `microsoft_graph` |
| `MICROSOFT_TENANT_ID` | No | Microsoft Graph auth | Required only when email delivery is enabled |
| `MICROSOFT_CLIENT_ID` | No | Microsoft Graph auth | Required only when email delivery is enabled |
| `MICROSOFT_CLIENT_SECRET` | No | Microsoft Graph auth | Secret, backend only |
| `MICROSOFT_SENDER_EMAIL` | No | Sender mailbox | Used for email delivery |

## Frontend Variables

| Variable | Required | Purpose | Notes |
|---|---|---|---|
| `VITE_API_BASE_URL` | Yes | Backend origin | Use origin only, without `/api/v1` |
| `VITE_SUPABASE_URL` | Yes | Supabase project URL | Must match the backend environment |
| `VITE_SUPABASE_ANON_KEY` | Yes | Browser-safe Supabase key | Safe for frontend use |
| `VITE_ALLOWED_EMAIL_DOMAINS` | Yes | Allowed email domains | Should align with backend rules |
| `VITE_AUTH_PROVIDER` | No | Frontend auth owner | Use `supabase` locally and `portal` for Buildathon production |
| `VITE_PORTAL_ORIGIN` | Portal mode | Shared sign-in site | Buildathon default is `https://portal.builtbysalih.com` |
| `VITE_PORTAL_API_BASE_URL` | Portal mode | Shared auth API | Buildathon default is `https://api.builtbysalih.com` |
| `VITE_APP_ORIGIN` | Portal mode | Public app origin | Use `https://clubs.builtbysalih.com` in Buildathon production |
| `VITE_AUTH_MODE` | Yes | Active auth mode | Current supported value is `password` |
| `VITE_MICROSOFT_PASSWORD_HELP_URL` | No | Password reset helper link | Used in auth UI |

## Safety Rules

### Never put these in the frontend

- `SUPABASE_SERVICE_ROLE_KEY`
- Microsoft client secrets
- backend-only queue or email secrets
- Portal API secrets, if Campus One later provides any server-only keys

### Keep these aligned

- frontend and backend should point to the same Supabase project
- frontend and backend should agree on allowed email domains
- portal mode requires the app frontend and app backend to live under `*.builtbysalih.com` so the Campus One cookie can reach the backend
- local work should never point at production by accident

## Buildathon Portal Defaults

For the Team G/7 Buildathon deployment, use the shared Campus One portal as the identity owner:

Backend:

```env
AUTH_PROVIDER=portal
PORTAL_API_BASE_URL=https://api.builtbysalih.com
PORTAL_ORIGIN=https://portal.builtbysalih.com
FRONTEND_APP_URL=https://clubs.builtbysalih.com
CORS_ALLOWED_ORIGINS=https://clubs.builtbysalih.com,https://portal.builtbysalih.com
```

Frontend:

```env
VITE_AUTH_PROVIDER=portal
VITE_PORTAL_ORIGIN=https://portal.builtbysalih.com
VITE_PORTAL_API_BASE_URL=https://api.builtbysalih.com
VITE_APP_ORIGIN=https://clubs.builtbysalih.com
```

Keep Supabase configured in both services because NileHive still uses Supabase for Club Services data and storage. In portal mode, Supabase Auth is no longer the production sign-in owner.

## Recommended Local Defaults

Backend:

```env
PORT=4000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
AUTH_PROVIDER=supabase
ALLOWED_EMAIL_DOMAINS=nileuniversity.edu.ng,nilehive.test
FRONTEND_APP_URL=http://localhost:8080
ASYNC_JOBS_ENABLED=false
EMAIL_DELIVERY_ENABLED=false
```

Frontend:

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_ALLOWED_EMAIL_DOMAINS=nileuniversity.edu.ng,nilehive.test
VITE_AUTH_PROVIDER=supabase
VITE_AUTH_MODE=password
```
