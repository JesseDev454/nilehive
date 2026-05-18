# NileHive Developer Guide

This guide is the main technical walkthrough for developers working on NileHive. It explains how the system is put together, how the main business flows work today, and how to stay safe while changing code that touches auth, roles, dues, proposals, and club operations.

## Who This Is For

Use this guide if you need to:

- run the app locally
- understand the frontend and backend architecture
- work safely with Supabase
- trace the current signup, club join, dues, and proposal workflows
- debug common data, auth, and environment issues

If you need a map of all available docs, start at [docs/README.md](C:/Users/goodl/Documents/NileHive/docs/README.md).

## System Overview

NileHive is the Club Services platform for Nile University of Nigeria. It supports:

- account creation and sign-in
- club discovery and join requests
- dues submission and verification
- proposal workflows across presidents, advisors, and admins
- approved events and post-event reporting
- role-based dashboards, notifications, and operations screens

At a high level, the system has three layers:

1. `frontend/` for the web UI
2. `backend/` for the API and business rules
3. Supabase for storage and Postgres data, plus auth in local fallback mode

## Role Model

NileHive now uses two separate role layers in Buildathon production:

### 1. Campus One platform role

This comes from the live Campus One session and is controlled by the super app:

- `student`
- `staff`
- `admin`

Campus One guidance matters here:

- public self-signup is student-oriented
- `staff` and `admin` are expected to come from Campus One admin invitation / role assignment
- users do not self-promote into these roles

### 2. NileHive local app role

This lives in `public.profiles.role` and controls club-services-specific responsibilities:

- `student`
- `executive`
- `president`
- `advisor`

These are not the same thing as Campus One platform roles.

Examples:

- a Campus One `student` can still be a NileHive `president`
- a Campus One `student` can still be a NileHive `executive`
- a Campus One `student` can still be a NileHive `advisor`

### Effective access rules

- Campus One `admin` always gets NileHive admin access
- Campus One only controls the admin override
- local `president` and `executive` still work for Campus One `student` users
- local `advisor` is fully controlled by NileHive
- local `admin` is no longer the source of truth for admin privileges

## Local Setup

### Prerequisites

- Node.js 18+
- npm
- Git
- access to a non-production Supabase project

Recommended:

- VS Code
- Render access if you support backend deployment
- Vercel access if you support frontend deployment

### Install dependencies

```powershell
cd backend
npm.cmd install
cd ..\frontend
npm.cmd install
```

### Create environment files

Create:

- `backend/.env`
- `frontend/.env.local`

Use these as templates:

- [backend/.env.example](C:/Users/goodl/Documents/NileHive/backend/.env.example)
- [frontend/.env.example](C:/Users/goodl/Documents/NileHive/frontend/.env.example)

### Start the app

Backend:

```powershell
cd backend
npm.cmd run dev
```

Frontend:

```powershell
cd frontend
npm.cmd run dev
```

Default local URLs:

- frontend: `http://localhost:8080`
- backend: `http://localhost:4000`

## Architecture At A Glance

### Frontend responsibilities

The frontend handles:

- routing and protected screens
- Supabase browser auth session management in local mode
- Campus One portal session handoff in Buildathon production mode
- role-aware dashboards and UI
- effective-role routing across Campus One and local app roles
- file uploads for dues receipts and reports
- typed calls into the backend API

Most important files:

- [frontend/src/App.tsx](C:/Users/goodl/Documents/NileHive/frontend/src/App.tsx)
- [frontend/src/contexts/AuthContext.tsx](C:/Users/goodl/Documents/NileHive/frontend/src/contexts/AuthContext.tsx)
- [frontend/src/contexts/RoleContext.tsx](C:/Users/goodl/Documents/NileHive/frontend/src/contexts/RoleContext.tsx)
- [frontend/src/lib/api.ts](C:/Users/goodl/Documents/NileHive/frontend/src/lib/api.ts)
- [frontend/src/pages/Dashboard.tsx](C:/Users/goodl/Documents/NileHive/frontend/src/pages/Dashboard.tsx)

### Backend responsibilities

The backend handles:

- Supabase or Campus One portal-backed auth checks
- role enforcement
- platform-role and app-role resolution
- workflow validation
- data access through the Supabase adapter
- pagination, filtering, and response shaping

Most important files:

- [backend/src/app.js](C:/Users/goodl/Documents/NileHive/backend/src/app.js)
- [backend/src/config/db.js](C:/Users/goodl/Documents/NileHive/backend/src/config/db.js)
- [backend/src/middleware/auth.js](C:/Users/goodl/Documents/NileHive/backend/src/middleware/auth.js)
- [backend/src/shared/portalAccess.js](C:/Users/goodl/Documents/NileHive/backend/src/shared/portalAccess.js)
- [backend/src/middleware/errorHandler.js](C:/Users/goodl/Documents/NileHive/backend/src/middleware/errorHandler.js)

## How Role Assignment Works Today

### Campus One admin

Managed in Campus One, not NileHive.

- use Campus One admin tools to assign `admin`

### NileHive president / executive / advisor

Managed in NileHive local data.

- `president` and `advisor` come from NileHive assignment flows
- `executive` remains a local club-services role
- normal day-to-day assignment should happen through NileHive UI, not direct SQL

### When SQL is still appropriate

Use Supabase SQL only for:

- repair work
- bootstrapping when no UI path is available
- debugging broken data
- emergency recovery

It should not be the normal role-management path.

Feature modules typically follow:

- `routes`
- `controller`
- `service`
- `validation`

## Data, Roles, And Security

### Identity model

NileHive uses:

1. Campus One Portal identity in Buildathon production
2. Supabase Auth in local fallback mode
3. `public.profiles` for Club Services roles and app access

Local fallback rule:

```text
auth.users.id = public.profiles.id
```

Portal mode rule:

```text
public.profiles.portal_user_id = Campus One user id
```

In portal mode the profile ID remains the local Club Services user ID used by proposals, dues, membership, and notifications.

### App roles

- `student`
- `executive`
- `president`
- `advisor`
- `admin`

The frontend hides or shows screens based on role, but the real security boundary is the backend plus Supabase policies.

### Current signup model

In local Supabase mode, the checked-in signup flow is intentionally slim:

- the user submits full name, email, password, and role
- the role is limited to `student` or `advisor` at signup time
- Supabase creates the auth user
- the provisioning trigger creates a minimal `public.profiles` row
- no club membership or dues records are created during signup

In Buildathon portal mode:

- signup, login, logout, and password recovery redirect to `portal.builtbysalih.com`
- the frontend calls the NileHive backend with cookies included
- the backend forwards the cookie to `https://api.builtbysalih.com/api/session`
- first-time Portal users get a local `public.profiles` row with role `student` and no club assignment
- Club Services roles are still managed inside NileHive, with Campus One only overriding admin access

This behavior comes from:

- [0041_slim_signup_no_club_join.sql](C:/Users/goodl/Documents/NileHive/backend/supabase/migrations/0041_slim_signup_no_club_join.sql)

### Current join model

Students join clubs later from `Discover Clubs`, where they submit:

- student ID if available
- phone number
- department
- student type
- join reason
- payment details
- receipt upload

That flow creates the membership request and dues-linked review state.

## Supabase Setup

### Migration policy

Run SQL files in:

```text
backend/supabase/migrations/
```

Apply them in numeric order.

Current migration ceiling:

```text
0043_portal_auth_profile_bridge.sql
```

### Production-safe SQL files

- [bootstrap_admin.sql](C:/Users/goodl/Documents/NileHive/backend/supabase/bootstrap_admin.sql)
- [bootstrap_clubs.sql](C:/Users/goodl/Documents/NileHive/backend/supabase/bootstrap_clubs.sql)
- [verify_clean_production.sql](C:/Users/goodl/Documents/NileHive/backend/supabase/verify_clean_production.sql)

### Local or demo only

- [demo_seed.sql](C:/Users/goodl/Documents/NileHive/backend/supabase/demo_seed.sql)
- [seed.sql](C:/Users/goodl/Documents/NileHive/backend/supabase/seed.sql)

Never run the seed scripts against production.

## Core Business Flows

### 1. Signup and access

- students and advisors create accounts with Nile email addresses
- a profile is provisioned automatically
- the user signs in and lands in the app without a club assignment

### 2. Discover Clubs and join request

- the user opens `Discover Clubs`
- chooses one club
- fills the club join form
- uploads a dues receipt
- submits the request

### 3. Dues and membership review

- presidents and admins review submitted dues
- payment confirmation drives the membership decision
- approved requests activate club membership and update the relevant records

### 4. Proposal workflow

- presidents submit proposals
- advisors review and can return or approve
- admins perform final Club Services approval
- approved proposals surface as events

### 5. Events and reporting

- only approved events are visible on the student-facing events experience
- reminders, attendance, feedback, and post-event reporting continue from there

More detailed role-by-role flow notes live in [WORKFLOWS.md](C:/Users/goodl/Documents/NileHive/docs/WORKFLOWS.md).

## Developer Workflow

### Changing frontend behavior

1. update the relevant page or component
2. keep shared fetch logic in `frontend/src/lib/api.ts`
3. keep auth and role logic inside contexts where possible
4. run a production build before finalizing

### Changing backend behavior

1. update the relevant module under `backend/src/modules`
2. keep validation explicit
3. keep business rules in services, not route handlers
4. add or update tests

### Changing database behavior

1. add a new numbered migration
2. keep it safe to re-run where practical
3. update docs that mention current migration behavior
4. verify the frontend and backend still match the new schema

## Troubleshooting

### The site opens but profile data does not load

Check:

- the correct Supabase project is configured
- the latest migrations are applied
- the signed-in user has a matching `public.profiles` row
- the user is allowed by the configured email domain rules

### A club join request cannot be submitted

Check:

- the user is signed in
- the club join form has required fields filled
- a receipt was uploaded successfully
- the `dues-receipts` storage bucket and policies are in place

### Local auth works but app data fails

Check:

- `SUPABASE_SERVICE_ROLE_KEY` is correct in `backend/.env`
- the backend is pointed at the same Supabase project as the frontend
- migrations are current

### A page shows a poor generic error

Check whether the screen is bypassing the shared error formatting in:

- [frontend/src/lib/api.ts](C:/Users/goodl/Documents/NileHive/frontend/src/lib/api.ts)

## Verification

Backend:

```powershell
cd backend
npm.cmd test
```

Frontend:

```powershell
cd frontend
npm.cmd run build
```

## Related Docs

- [README.md](C:/Users/goodl/Documents/NileHive/README.md)
- [ARCHITECTURE.md](C:/Users/goodl/Documents/NileHive/docs/ARCHITECTURE.md)
- [ENVIRONMENT_REFERENCE.md](C:/Users/goodl/Documents/NileHive/docs/ENVIRONMENT_REFERENCE.md)
- [WORKFLOWS.md](C:/Users/goodl/Documents/NileHive/docs/WORKFLOWS.md)
- [CONTRIBUTING.md](C:/Users/goodl/Documents/NileHive/CONTRIBUTING.md)
