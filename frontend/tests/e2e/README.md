# Club Services E2E Tests

These Playwright tests do not use CampusOne production SSO or production API data.

## Test Auth Strategy

The app has a test-only auth seam enabled only when both are true:

- Vite is running in development mode.
- `VITE_ENABLE_E2E_AUTH=true`.

Tests write a role-specific profile into `localStorage` before the app loads. The app then treats that profile as the current user for E2E only. This path is disabled in production builds.

The Playwright config also sets:

- `VITE_AUTH_PROVIDER=portal`
- dummy Supabase URL/key values
- a dummy API base URL

All API calls needed by the tests are fulfilled by Playwright route mocks.

## Run Locally

From `frontend`:

```powershell
npm.cmd run test:e2e
```

Useful variants:

```powershell
npm.cmd run test:e2e:headed
npm.cmd run test:e2e:ui
npm.cmd run test:e2e:debug
```

List tests without starting the Vite dev server:

```powershell
npm.cmd run test:e2e -- --list
```

Run focused workflow specs:

```powershell
npm.cmd run test:e2e -- tests/e2e/notifications.spec.ts
npm.cmd run test:e2e -- tests/e2e/push-notifications.spec.ts
npm.cmd run test:e2e -- tests/e2e/event-check-in.spec.ts
npm.cmd run test:e2e -- tests/e2e/president-dashboard.spec.ts
npm.cmd run test:e2e -- tests/e2e/advisor-flow.spec.ts
npm.cmd run test:e2e -- tests/e2e/executive-flow.spec.ts
npm.cmd run test:e2e -- tests/e2e/feedback-export.spec.ts
npm.cmd run test:e2e -- tests/e2e/mobile-viewport.spec.ts
```

## Current Coverage

- Basic app load smoke.
- Student dashboard smoke.
- Student discover, join, and dues proof flow.
- Student RSVP flow.
- Admin dashboard smoke.
- Admin membership and dues approval flow.
- Feedback manager routing smoke.
- Student notification center with role-safe notification data.
- Announcement and dues notification deep links.
- Optional browser push alerts UI, mocked permission, mocked service worker subscription, save-subscription API call, disable/unsubscribe API call, permission-denied state, and unsupported-browser fallback.
- QR check-in success, already checked-in, inactive/expired, invalid-link, and non-student blocked states.
- President dashboard setup checklist, action cards, and task delegation route.
- Advisor dashboard focus view and proposal approval queue.
- Executive dashboard focus view and assigned task status update.
- Feedback manager inbox and CSV export.
- Mobile viewport smoke for student notification/check-in and president actions.

The Playwright config uses the installed Google Chrome channel so local runs do not require Playwright's bundled Chromium download. If Chrome is not installed on a machine, either install Google Chrome or run:

```powershell
npx playwright install chromium
```

If Vite fails to load config with an esbuild access error on Windows, run the tests from a normal local PowerShell session outside the restricted Codex sandbox. The installed Vite version is 5.4.x, which does not expose `--configLoader runner`; use that flag only after upgrading to a Vite version that supports it.

## Push Notification E2E Scope

`push-notifications.spec.ts` tests the frontend push setup flow without sending real browser/device notifications. It mocks:

- `window.Notification.requestPermission`
- `navigator.serviceWorker.register`
- `navigator.serviceWorker.ready`
- `registration.pushManager.getSubscription`
- `registration.pushManager.subscribe`
- `subscription.unsubscribe`

The API mock captures calls to:

- `GET /api/v1/notifications/push-config`
- `POST /api/v1/notifications/push-subscriptions`
- `POST /api/v1/notifications/push-subscriptions/remove`

Real notification tray delivery still needs staging/manual verification with configured VAPID keys, HTTPS, a real service worker, and a real test browser/device.
