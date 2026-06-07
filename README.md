# NileHive

[![Status](https://img.shields.io/badge/status-active%20development-1D4DA1)](#project-overview)
[![Frontend](https://img.shields.io/badge/frontend-Vite%20%2B%20React-0ea5e9)](#technology-stack)
[![Backend](https://img.shields.io/badge/backend-Express%20%2B%20Supabase-16a34a)](#technology-stack)
[![Database](https://img.shields.io/badge/database-Supabase%20Postgres-059669)](#data-and-auth-model)
[![License](https://img.shields.io/badge/license-private-52525b)](#repository-structure)

NileHive is the Club Services platform for Nile University of Nigeria. It replaces paper-heavy club operations with a role-based web app for student access, dues-backed club joining, proposal approvals, approved events, and day-to-day club administration.

## Project Overview

NileHive currently supports:

- Supabase auth locally and Campus One portal auth for Buildathon production
- slim local fallback account creation for students and advisors
- Discover Clubs join flow with dues proof upload
- membership request and dues verification workflows
- proposal submission, advisor review, president oversight, and admin final approval
- approved events, reminders, and post-event reporting
- member management, role assignment, announcements, notifications, and dashboards

The codebase is organized as one frontend app, one backend API, and a Supabase project that handles storage and Postgres data. In local mode, Supabase can still own auth; in Buildathon production, the shared Campus One portal owns sign-in.

## Repository Structure

```text
NileHive/
  backend/      Express API, Supabase adapter, tests, SQL migrations
  frontend/     Vite + React application
  docs/         Architecture, workflows, environment, and deployment guides
```

## Technology Stack

### Frontend

- Vite
- React
- TypeScript
- React Router
- TanStack Query
- Tailwind CSS
- Supabase browser client

### Backend

- Node.js
- Express
- Supabase JS
- Postgres on Supabase
- Node test runner

## Quick Start

### 1. Install dependencies

```powershell
cd backend
npm.cmd install
cd ..\frontend
npm.cmd install
```

### 2. Create environment files

Create:

- `backend/.env`
- `frontend/.env.local`

Use these files as the base:

- [backend/.env.example](C:/Users/goodl/Documents/NileHive/backend/.env.example)
- [frontend/.env.example](C:/Users/goodl/Documents/NileHive/frontend/.env.example)

### 3. Apply Supabase migrations

Run the SQL files in:

```text
backend/supabase/migrations/
```

Apply them in numeric order. The current checked-in migration ceiling is:

```text
0043_portal_auth_profile_bridge.sql
```

### 4. Start the services

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

## Data And Auth Model

NileHive supports two auth providers:

- `supabase` for local development and standalone demos
- `portal` for the Buildathon shared Campus One login flow

In both modes, `public.profiles` remains the Club Services profile table. In portal mode, profiles are linked by `portal_user_id` and email, while Campus One provides the live platform role from the shared session.

Buildathon production defaults:

```text
Frontend: https://clubs.builtbysalih.com
Portal:   https://portal.builtbysalih.com
Auth API: https://api.builtbysalih.com
```

The app backend must also be hosted under a `*.builtbysalih.com` domain for cookie-based Portal session forwarding to work reliably.

Current auth behavior:

Local fallback mode:

1. the user creates an account with full name, Nile email, password, and role
2. Supabase creates the auth user
3. the signup trigger provisions a minimal app profile
4. no club membership, dues record, or membership request is created during signup
5. students join clubs later from `Discover Clubs`
6. club assignment becomes meaningful after a membership request is reviewed and approved

Buildathon production mode:

1. the user signs in through Campus One
2. Campus One returns a platform role of `student`, `staff`, or `admin`
3. NileHive loads the linked local profile from `public.profiles`
4. NileHive combines the Campus One platform role with the local app role to decide the experience

Current role model:

- platform role from Campus One:
  - `student`
  - `staff`
  - `admin`
- local NileHive app role:
  - `student`
  - `executive`
  - `president`
  - `advisor`

Effective access rules:

- Campus One `admin` always gets NileHive admin access
- Campus One `staff` needs a local NileHive `advisor` assignment to use advisor features
- Campus One `student` may still be a local `executive` or `president`
- NileHive no longer treats local `admin` assignment as the source of truth for admin access

## Environment Rules

Keep local and production fully separate:

- local or demo Supabase project
- production Supabase project

Local and demo may allow:

```text
nileuniversity.edu.ng,nilehive.test
```

Production should allow only:

```text
nileuniversity.edu.ng
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` in the frontend.

## Verification

Backend tests:

```powershell
cd backend
npm.cmd test
```

Frontend production build:

```powershell
cd frontend
npm.cmd run build
```

Current expected non-blocking frontend warnings:

- Browserslist data age warning
- large chunk-size warning

## Documentation Map

Start here if you are new to the codebase:

1. [docs/README.md](C:/Users/goodl/Documents/NileHive/docs/README.md)
2. [docs/DEVELOPER_GUIDE.md](C:/Users/goodl/Documents/NileHive/docs/DEVELOPER_GUIDE.md)
3. [docs/ARCHITECTURE.md](C:/Users/goodl/Documents/NileHive/docs/ARCHITECTURE.md)
4. [docs/WORKFLOWS.md](C:/Users/goodl/Documents/NileHive/docs/WORKFLOWS.md)
5. [docs/ENVIRONMENT_REFERENCE.md](C:/Users/goodl/Documents/NileHive/docs/ENVIRONMENT_REFERENCE.md)

Service-specific references:

- [frontend/README.md](C:/Users/goodl/Documents/NileHive/frontend/README.md)
- [backend/README.md](C:/Users/goodl/Documents/NileHive/backend/README.md)

Production and recovery guides:

- [docs/PRODUCTION_HANDOFF.md](C:/Users/goodl/Documents/NileHive/docs/PRODUCTION_HANDOFF.md)
- [docs/PRODUCTION_FRESH_START.md](C:/Users/goodl/Documents/NileHive/docs/PRODUCTION_FRESH_START.md)

## Contribution Expectations

Before opening a PR or pushing shared changes:

- update docs when behavior changes
- apply new migrations locally before testing dependent flows
- run backend tests for backend behavior changes
- run a frontend build for frontend changes
- avoid pointing local work at the production Supabase project

Full contribution guidance lives in [CONTRIBUTING.md](C:/Users/goodl/Documents/NileHive/CONTRIBUTING.md).
