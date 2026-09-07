# Campus One staging E2E

This suite is intentionally separate from `tests/e2e`. It tests the deployed OneClub frontend, real backend, and real Supabase staging project. A staging-only bridge creates a short-lived OneClub session for dedicated test profiles, so a Campus One test tenant is not required.

## Safety contract

- Never point `E2E_STAGING_*` values at production.
- Only dedicated test accounts whose emails begin with `e2e+` are eligible for cleanup.
- Only clubs with an `E2E-` code are deleted.
- The reset script requires `E2E_STAGING_ENABLED=true`, a matching project ref, and `E2E_STAGING_ALLOW_RESET=reset-e2e-staging`.
- Credentials, service-role keys, and the actor map belong in GitHub Environment secrets, never this repository.
- The session bridge is available only when the backend has `APP_ENV=staging`, `E2E_STAGING_AUTH_BRIDGE_ENABLED=true`, and the matching bridge secret. It rejects every profile except one whose email begins with `e2e+`.

## Required configuration

GitHub Environment variables: `E2E_STAGING_BASE_URL`, `E2E_STAGING_API_BASE_URL` (when the API is on a different origin), `E2E_STAGING_PROJECT_REF`, and `E2E_STAGING_STORAGE_BUCKETS`.

The Vercel staging deployment proxies `/api/*` to the Render staging backend. Keep `VITE_API_BASE_URL` pointed at the Render backend; the frontend detects its Vercel host and uses the same-origin proxy so browser session cookies are not third-party cookies.

GitHub Environment secrets: `E2E_STAGING_SUPABASE_URL`, `E2E_STAGING_SUPABASE_SERVICE_ROLE_KEY`, `E2E_STAGING_ACTORS_JSON`, and `E2E_STAGING_AUTH_BRIDGE_SECRET`.

`E2E_STAGING_ACTORS_JSON` maps each lower-case role to its already-provisioned Campus One profile, for example:

```json
{
  "student": { "profile_id": "uuid", "email": "e2e+student@example.test" },
  "president": { "profile_id": "uuid", "email": "e2e+president@example.test" },
  "executive": { "profile_id": "uuid", "email": "e2e+executive@example.test" },
  "advisor": { "profile_id": "uuid", "email": "e2e+advisor@example.test" },
  "admin": { "profile_id": "uuid", "email": "e2e+admin@example.test" },
  "feedback_manager": { "profile_id": "uuid", "email": "e2e+feedback@example.test" }
}
```

All six roles are required. The seed command assigns their staging role/club relationship; it does not create identities. Each mapped profile must already exist in staging and use an email beginning with `e2e+`.

## Staging backend deployment settings

Set these only on the staging backend deployment (not in GitHub Actions and never in production):

```text
APP_ENV=staging
E2E_STAGING_AUTH_BRIDGE_ENABLED=true
E2E_STAGING_AUTH_BRIDGE_SECRET=<the same GitHub Environment secret>
E2E_STAGING_ALLOWED_PROFILE_IDS=<comma-separated dedicated test profile UUIDs; optional>
```

The staging backend must also use `AUTH_PROVIDER=campus_one_oidc`, because the bridge issues the same signed session cookie as the Campus One callback. By default, the bridge accepts only profiles whose email begins with `e2e+`. `E2E_STAGING_ALLOWED_PROFILE_IDS` is a staging-only explicit allow-list for existing dedicated test profiles that use different email addresses; never include real-user IDs.

The nightly workflow alone sets `E2E_STAGING_ENABLE_MUTATIONS=true`. That enables the connected proposal → advisor → admin → RSVP/QR check-in → report → feedback → club-health test; local staging runs remain read-only unless you deliberately set that flag.

## Commands

```powershell
npm --prefix backend run e2e:staging:reset
npm --prefix backend run e2e:staging:seed
npm --prefix frontend run test:e2e:staging
```
