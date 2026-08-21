# OneClub staging E2E

This suite is intentionally separate from the mocked `tests/e2e` Admin suite. It tests the deployed OneClub frontend, Render staging backend, and isolated staging Supabase project. A staging-only bridge creates a short-lived Campus One session for dedicated `e2e+` profiles.

A local mocked Playwright pass does not prove staging integration.

## Safety contract

- Never point `E2E_STAGING_*` values at production (`clubs.campusone.com.ng` / `clubs-api.campusone.com.ng`).
- Only dedicated test accounts whose emails begin with `e2e+` are eligible for cleanup.
- Only clubs with an `E2E-` code are deleted. The official 14 clubs are not modified.
- The reset script requires `E2E_STAGING_ENABLED=true`, a matching project ref, and `E2E_STAGING_ALLOW_RESET=reset-e2e-staging`.
- Credentials, service-role keys, cookies, CSRF tokens, and the actor map belong in GitHub Environment secrets, never this repository.
- The session bridge is available only when the backend has `APP_ENV=staging`, `E2E_STAGING_AUTH_BRIDGE_ENABLED=true`, and the matching bridge secret.
- Feedback Manager is not a product role and is not required in `E2E_STAGING_ACTORS_JSON`.
- Admin Tasks are not seeded or tested.

## Required GitHub Environment configuration

Variables: `E2E_STAGING_BASE_URL`, `E2E_STAGING_API_BASE_URL`, `E2E_STAGING_PROJECT_REF`, `E2E_STAGING_STORAGE_BUCKETS`.

Secrets: `E2E_STAGING_SUPABASE_URL`, `E2E_STAGING_SUPABASE_SERVICE_ROLE_KEY`, `E2E_STAGING_ACTORS_JSON`, `E2E_STAGING_AUTH_BRIDGE_SECRET`.

`E2E_STAGING_ACTORS_JSON` maps each product role to its already-provisioned profile:

```json
{
  "student": { "profile_id": "uuid", "email": "e2e+student@example.test" },
  "president": { "profile_id": "uuid", "email": "e2e+president@example.test" },
  "executive": { "profile_id": "uuid", "email": "e2e+executive@example.test" },
  "advisor": { "profile_id": "uuid", "email": "e2e+advisor@example.test" },
  "admin": { "profile_id": "uuid", "email": "e2e+admin@example.test" }
}
```

Do not include a Feedback Manager actor.

## Staging backend deployment settings

Set these only on the staging backend, never in production:

```text
APP_ENV=staging
E2E_STAGING_AUTH_BRIDGE_ENABLED=true
E2E_STAGING_AUTH_BRIDGE_SECRET=<the same GitHub Environment secret>
```

The GitHub workflow sets `E2E_STAGING_ENABLE_MUTATIONS=true` so Admin mutation coverage can run against isolated `e2e-` records.

## Commands

```powershell
npm --prefix backend run e2e:staging:reset
npm --prefix backend run e2e:staging:seed
npm run test:e2e:staging
```

Run Playwright from the repository root. Never use production as a substitute.
