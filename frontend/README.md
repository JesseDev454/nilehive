# NileHive Frontend

This is the Vite React frontend for NileHive.

Start from the root README first:

```text
../README.md
```

## Setup

Install dependencies:

```powershell
npm.cmd install
```

Create:

```text
.env.local
```

Use:

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Do not put the Supabase service role key in this folder.

## Run

```powershell
npm.cmd run dev
```

The local app usually runs at:

```text
http://localhost:8080
```

## Build

```powershell
npm.cmd run build
```

## Frontend Architecture Notes

- API calls live in `src/lib/api.ts`.
- Supabase client setup lives in `src/lib/supabase.ts`.
- Auth/session state lives in `src/contexts/AuthContext.tsx`.
- Role behavior lives in `src/contexts/RoleContext.tsx`.
- App routes live in `src/App.tsx`.
- Shared layout/sidebar live in `src/components/`.
- Main pages live in `src/pages/`.

Use `src/lib/api.ts` for backend communication. Avoid direct `fetch()` calls in page components unless there is a strong reason.

## Current Live Pages

- `/login`
- `/signup`
- `/`
- `/proposals/new`
- `/proposals`
- `/proposals/:id`
- `/approvals`
- `/notifications`
- `/events`
- `/tasks`
- `/analytics`
- `/archive`

Some pages are still placeholders or partially mocked where backend modules are not built yet.
