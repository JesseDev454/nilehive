# NileHive Architecture

This document explains how NileHive is assembled across the frontend, backend, and Supabase layers.

## High-Level Topology

```text
Browser
  -> Frontend (Vite + React)
    -> Backend API (Express)
      -> Supabase Postgres / Auth / Storage
```

## Frontend Layer

The frontend is responsible for:

- routing and protected screens
- session-aware UI
- role-aware navigation and dashboards
- calling the backend API through a shared client
- uploading dues receipts to storage

Important areas:

- `src/App.tsx`
- `src/contexts/AuthContext.tsx`
- `src/lib/api.ts`
- `src/pages/`
- `src/components/`

## Backend Layer

The backend is responsible for:

- verifying authenticated requests
- loading the linked profile
- enforcing role and club scope
- validating workflow inputs
- shaping list, detail, and pagination responses
- coordinating business rules that should not live in the browser

Important areas:

- `src/app.js`
- `src/middleware/`
- `src/modules/`
- `src/config/db.js`

## Supabase Layer

Supabase provides:

- email and password auth
- Postgres data
- storage buckets for uploaded files
- SQL migrations, triggers, and policies

Important directories:

- `backend/supabase/migrations/`
- `backend/supabase/bootstrap_admin.sql`
- `backend/supabase/bootstrap_clubs.sql`

## Key Runtime Flows

### Auth and profile loading

1. the frontend signs the user in with Supabase
2. the auth context loads the linked `public.profiles` row
3. the frontend uses the profile role to decide which screens to expose
4. backend routes enforce the real permissions

### Club joining

1. the user signs up without a club
2. the user opens `Discover Clubs`
3. the user submits a club join request with payment details and receipt
4. presidents and admins review the dues-backed request
5. approved membership updates the relevant records

### Proposal to event flow

1. presidents submit proposals
2. advisors review
3. admins give final Club Services approval
4. approved proposals appear as events

## Security Boundaries

NileHive relies on multiple layers together:

- frontend role-aware UX
- backend auth middleware and service-level checks
- Supabase policies, grants, and trigger behavior

The frontend is not the final security boundary. Sensitive workflow rules must be enforced server-side.

## Current Architectural Defaults

- signup is intentionally lightweight
- club join and dues happen after account creation
- shared API functions are preferred over page-level `fetch()` calls
- business rules live in backend services
- schema changes ship through numbered migrations
