# NileHive Frontend

[![Frontend](https://img.shields.io/badge/frontend-Vite%20%2B%20React-0ea5e9)](C:/Users/goodl/Documents/NileHive/frontend/README.md)
[![Auth](https://img.shields.io/badge/auth-Supabase%20browser%20client-0f766e)](C:/Users/goodl/Documents/NileHive/docs/DEVELOPER_GUIDE.md#auth-signup-and-recovery-flows)
[![Build](https://img.shields.io/badge/build-vite-1D4DA1)](C:/Users/goodl/Documents/NileHive/README.md#verification)

Frontend quick reference for NileHive.

Read these first for the bigger picture:

- [README.md](C:/Users/goodl/Documents/NileHive/README.md)
- [docs/DEVELOPER_GUIDE.md](C:/Users/goodl/Documents/NileHive/docs/DEVELOPER_GUIDE.md)

## What Lives Here

- route-level app UI
- auth and session state
- role-based pages and layouts
- shared typed backend API client
- Supabase browser client setup

## Setup

Install:

```powershell
npm.cmd install
```

Create:

```text
.env.local
```

Use `../frontend/.env.example` as the base.

Minimum local variables:

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_SUPABASE_URL=https://your-dev-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-dev-anon-key
VITE_ALLOWED_EMAIL_DOMAINS=nileuniversity.edu.ng,nilehive.test
VITE_AUTH_MODE=password
```

Do not place the Supabase service role key in the frontend.

## Run

```powershell
npm.cmd run dev
```

Default local URL:

```text
http://localhost:8080
```

## Build

```powershell
npm.cmd run build
```

## Important Frontend Files

- routes: [src/App.tsx](C:/Users/goodl/Documents/NileHive/frontend/src/App.tsx)
- auth/session: [src/contexts/AuthContext.tsx](C:/Users/goodl/Documents/NileHive/frontend/src/contexts/AuthContext.tsx)
- role behavior: [src/contexts/RoleContext.tsx](C:/Users/goodl/Documents/NileHive/frontend/src/contexts/RoleContext.tsx)
- backend API client: [src/lib/api.ts](C:/Users/goodl/Documents/NileHive/frontend/src/lib/api.ts)
- Supabase browser client: [src/lib/supabase.ts](C:/Users/goodl/Documents/NileHive/frontend/src/lib/supabase.ts)

## Auth UI Flow

Main auth pages:

- [src/pages/Login.tsx](C:/Users/goodl/Documents/NileHive/frontend/src/pages/Login.tsx)
- [src/pages/SignUp.tsx](C:/Users/goodl/Documents/NileHive/frontend/src/pages/SignUp.tsx)
- [src/pages/SignupConfirmation.tsx](C:/Users/goodl/Documents/NileHive/frontend/src/pages/SignupConfirmation.tsx)
- [src/pages/ProfileSetup.tsx](C:/Users/goodl/Documents/NileHive/frontend/src/pages/ProfileSetup.tsx)

Important current rule:

- `ProfileSetup` is a legacy recovery page
- it is not the normal post-signup destination anymore

Signup currently includes:

- user role selection (`student` or `advisor`)
- first club selection during account creation
- optional student ID for students
- required phone number and department
- fresher/returning student type for students
- shared Club Services dues details
- receipt image upload that is attached to the signup-created dues record

## Frontend Development Rules

1. Use `src/lib/api.ts` for backend communication.
2. Prefer shared error formatting instead of inline raw `error.message`.
3. Keep auth and role behavior centralized in contexts.
4. Do not hardcode backend origins in components.
5. Do not treat hidden UI as real authorization.

## Deployment Note

The repo root contains:

- `vercel.json`

Keep `VITE_API_BASE_URL` as the backend origin only. Do not append `/api/v1`.

Example:

```env
VITE_API_BASE_URL=https://your-backend-domain.onrender.com
```

## More Detail

For architecture, Supabase setup, production safety, and troubleshooting:

- [docs/DEVELOPER_GUIDE.md](C:/Users/goodl/Documents/NileHive/docs/DEVELOPER_GUIDE.md)
