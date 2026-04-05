# NileHive Backend

Week 1 backend foundation for the NileHive buildathon MVP.

## Week 1 scope

This backend only supports the first working approval handoff:

- an executive submits an event proposal
- the proposal is stored in Postgres / Supabase
- an advisor fetches proposals pending advisor review

Everything else is intentionally deferred for later weeks.

## Tech choices

- Node.js + Express
- Supabase-friendly PostgreSQL schema
- Supabase Auth user IDs mapped into an app `profiles` table
- Lean proposal payload only

## Project structure

```text
backend
  package.json
  .env.example
  README.md
  supabase/
    migrations/
    seed.sql
  src/
    app.js
    server.js
    config/
    middleware/
    modules/
    shared/
  tests/
```

## Environment variables

Copy `.env.example` to `.env` and fill in:

- `PORT`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

The backend uses the Supabase service role key for server-side reads and writes. RLS policies are still included so the data model stays compatible with direct Supabase access later.

## Local setup

```bash
cd backend
npm install
npm test
npm run dev
```

Apply the SQL files in `supabase/migrations` to your Supabase project, then load `supabase/seed.sql` if you want local sample data.

## API surface

### `GET /api/v1/health`

Returns service health plus a database connectivity check.

### `POST /api/v1/proposals`

Requires an authenticated executive.

Request body:

```json
{
  "title": "Club Leadership Summit",
  "description": "A one-day summit for executive handover and planning.",
  "event_date": "2026-05-15",
  "location": "Main Hall"
}
```

Server-side behavior:

- derives `submitted_by` from the authenticated user
- derives `club_id` from the executive profile
- stores status as `pending_advisor_review`

### `GET /api/v1/proposals/pending-advisor`

Requires an authenticated advisor.

Returns only pending proposals for clubs assigned to that advisor.

## Week 1 notes

- `profiles`, `clubs`, and `proposals` are implemented now.
- `approvals`, `notifications`, and `event_summaries` are intentionally deferred.
- The schema assumes one executive belongs to one club and one club has one advisor in Week 1.

