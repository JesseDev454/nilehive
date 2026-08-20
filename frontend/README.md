# OneClub frontend

Minimal Vite, React, and TypeScript foundation for the new OneClub interface.

## Run locally

```bash
npm install
npm run dev
```

The development server runs at `http://localhost:8080`.

## Checks

```bash
npm run typecheck
npm run lint
npm run build
npm run preview
```

## Source organization

- `src/app`: application entry UI and top-level boundaries
- `src/components/ui`: reusable interface primitives
- `src/lib`: framework-independent helpers
- `src/styles`: global tokens and responsive base styles
- `public`: static assets

Future screens should be grouped under `src/features/student`,
`src/features/president`, `src/features/executive`, `src/features/advisor`, and
`src/features/admin`. Shared composed components belong in
`src/components/shared`, and future page shells belong in `src/layouts`.

Routing, authentication, role resolution, and backend integration are
intentionally deferred.
