# Contributing To NileHive

Thanks for contributing. This repo is private, but we still treat it like a handoff-ready product codebase: clear docs, deliberate changes, and reproducible verification matter.

## Before You Start

Read these first:

1. [README.md](C:/Users/goodl/Documents/NileHive/README.md)
2. [docs/DEVELOPER_GUIDE.md](C:/Users/goodl/Documents/NileHive/docs/DEVELOPER_GUIDE.md)
3. [docs/ENVIRONMENT_REFERENCE.md](C:/Users/goodl/Documents/NileHive/docs/ENVIRONMENT_REFERENCE.md)
4. [docs/WORKFLOWS.md](C:/Users/goodl/Documents/NileHive/docs/WORKFLOWS.md)

## Setup Expectations

- use a non-production Supabase project for local work
- apply migrations before testing workflow-dependent changes
- keep backend and frontend pointed at the same environment
- never place `SUPABASE_SERVICE_ROLE_KEY` in frontend code

## Change Guidelines

### Code changes

- keep frontend API calls centralized in `frontend/src/lib/api.ts`
- keep backend workflow rules in services
- keep validation explicit
- avoid hidden UI as a substitute for authorization

### Database changes

- add a new numbered migration instead of editing old migrations
- update docs that mention current schema or workflow behavior
- verify dependent flows after the migration

### Documentation changes

If you change behavior, update the docs in the same change set when needed. At minimum, consider:

- `README.md`
- `docs/DEVELOPER_GUIDE.md`
- `docs/WORKFLOWS.md`
- `docs/ENVIRONMENT_REFERENCE.md`

## Verification Before Sharing Changes

Frontend changes:

```powershell
cd frontend
npm.cmd run build
```

Backend changes:

```powershell
cd backend
npm.cmd test
```

Run both when the change spans the full stack.

## Pull Request And Review Expectations

A good PR or handoff should:

- explain the user-facing change
- mention any env or migration requirements
- describe how it was verified
- call out known risks or follow-up work

## Security And Environment Rules

- do not use the production Supabase project for local testing
- do not expose secrets in screenshots, logs, or committed files
- do not weaken auth, role, or storage protections just to make local testing easier

## Need More Context?

- [docs/ARCHITECTURE.md](C:/Users/goodl/Documents/NileHive/docs/ARCHITECTURE.md)
- [backend/README.md](C:/Users/goodl/Documents/NileHive/backend/README.md)
- [frontend/README.md](C:/Users/goodl/Documents/NileHive/frontend/README.md)
