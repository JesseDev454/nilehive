# NileHive Frontend

This package contains the NileHive web application. It handles routing, auth-aware UI, role-based dashboards, club discovery, proposals, events, and the frontend side of the membership and dues experience.

## What Lives Here

- route-level pages
- session and role contexts
- the shared API client
- Supabase browser auth setup
- shared UI components and app shell

## Stack

- Vite
- React
- TypeScript
- React Router
- TanStack Query
- Tailwind CSS
- Supabase JS

## Local Setup

Install dependencies:

```powershell
npm.cmd install
```

Create:

```text
.env.local
```

Use [frontend/.env.example](C:/Users/goodl/Documents/NileHive/frontend/.env.example) as the base.

Minimum important variables:

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
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

## Important Files

- routes and protected loading: [src/App.tsx](C:/Users/goodl/Documents/NileHive/frontend/src/App.tsx)
- auth and session state: [src/contexts/AuthContext.tsx](C:/Users/goodl/Documents/NileHive/frontend/src/contexts/AuthContext.tsx)
- role exposure: [src/contexts/RoleContext.tsx](C:/Users/goodl/Documents/NileHive/frontend/src/contexts/RoleContext.tsx)
- shared API client: [src/lib/api.ts](C:/Users/goodl/Documents/NileHive/frontend/src/lib/api.ts)
- Supabase browser client: [src/lib/supabase.ts](C:/Users/goodl/Documents/NileHive/frontend/src/lib/supabase.ts)
- global app shell: [src/components/AppLayout.tsx](C:/Users/goodl/Documents/NileHive/frontend/src/components/AppLayout.tsx)

## Current Auth And UI Flow

### Signup

Signup is currently slim:

- full name
- Nile email
- password
- role choice: `student` or `advisor`

Signup does not assign a club. Students join a club later from `Discover Clubs`.

### Sign-in and session behavior

- Supabase browser auth is used for the session
- the app loads the linked profile after sign-in
- inactivity protection signs the user out after the configured timeout, including persisted-session re-entry checks

### Discover Clubs and join flow

Students browse clubs, open one club’s join page, and submit:

- student profile details
- student type
- payment information
- receipt upload

## Frontend Development Rules

1. Prefer functions from `src/lib/api.ts` over ad hoc `fetch()` calls.
2. Keep auth and session logic inside the auth context when practical.
3. Reuse shared loading and error components.
4. Avoid hardcoded backend URLs inside components.
5. Do not rely on hidden UI for real authorization.

## Deployment Note

`VITE_API_BASE_URL` should be the backend origin only.

Example:

```env
VITE_API_BASE_URL=https://your-backend-domain.onrender.com
```

Do not append `/api/v1`.

## More Reading

- [README.md](C:/Users/goodl/Documents/NileHive/README.md)
- [docs/DEVELOPER_GUIDE.md](C:/Users/goodl/Documents/NileHive/docs/DEVELOPER_GUIDE.md)
- [docs/WORKFLOWS.md](C:/Users/goodl/Documents/NileHive/docs/WORKFLOWS.md)
- [docs/ENVIRONMENT_REFERENCE.md](C:/Users/goodl/Documents/NileHive/docs/ENVIRONMENT_REFERENCE.md)
