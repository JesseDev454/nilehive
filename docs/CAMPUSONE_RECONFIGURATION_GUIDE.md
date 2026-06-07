# CampusOne Reconfiguration Guide

Use this guide when recreating the NileHive / Club Services app in the CampusOne developer dashboard.

## Correct Domain Model

CampusOne should identify NileHive by its frontend app domain:

```text
https://clubs.campusone.com.ng
```

The backend API is separate and should only be used for API calls and the OIDC callback:

```text
https://clubs-api.campusone.com.ng
```

Do not use the backend domain as the CampusOne app domain or homepage.

## CampusOne App Settings

Create a new developer app with:

```text
Protocol: OIDC
Domain / reserved subdomain: clubs
Homepage URL: https://clubs.campusone.com.ng
Redirect URL: https://clubs-api.campusone.com.ng/api/v1/auth/campus-one/callback
```

If CampusOne requires the redirect URL to be under the frontend domain, ask the CampusOne admin whether backend callback URLs are allowed. NileHive currently handles OIDC callback on the backend.

## Vercel Frontend

The frontend should serve:

```text
https://clubs.campusone.com.ng
```

The repo root already has `vercel.json`, so Vercel should use the repository root:

```text
Root Directory: leave blank / repo root
Install Command: npm --prefix frontend install
Build Command: npm --prefix frontend run build
Output Directory: frontend/dist
```

Do not set the Vercel root directory to `frontend` while this root `vercel.json` is active, because that causes paths such as `frontend/frontend/package.json`.

Frontend production environment:

```env
VITE_AUTH_PROVIDER=campus_one_oidc
VITE_API_BASE_URL=https://clubs-api.campusone.com.ng
VITE_APP_ORIGIN=https://clubs.campusone.com.ng
```

`VITE_API_BASE_URL` must be the backend origin only. Do not append `/api/v1`.

## Render Backend

The backend should serve:

```text
https://clubs-api.campusone.com.ng
```

Render should use:

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
Health Check Path: /api/v1/ready
```

Backend production environment:

```env
AUTH_PROVIDER=campus_one_oidc
CAMPUS_ONE_CLIENT_ID=your-campusone-client-id
CAMPUS_ONE_CLIENT_SECRET=your-campusone-client-secret
CAMPUS_ONE_ISSUER=https://auth.campusone.com.ng
CAMPUS_ONE_REDIRECT_URI=https://clubs-api.campusone.com.ng/api/v1/auth/campus-one/callback
CAMPUS_ONE_ENFORCE_EMAIL_DOMAIN=false
FRONTEND_APP_URL=https://clubs.campusone.com.ng
CORS_ALLOWED_ORIGINS=https://clubs.campusone.com.ng
```

Keep the Supabase database and storage variables configured on both frontend and backend.

## DNS / CNAME Checklist

Frontend:

```text
clubs.campusone.com.ng -> Vercel project hostname
```

Backend:

```text
clubs-api.campusone.com.ng -> Render custom domain target
```

Use the exact DNS values shown by CampusOne, Vercel, or Render. If CampusOne support asks for records, send the frontend CNAME first because the CampusOne app domain is the frontend.

## Verification Checklist

1. Open `https://clubs-api.campusone.com.ng/api/v1/ready` and confirm the backend is healthy.
2. Open `https://clubs.campusone.com.ng` and confirm the frontend loads.
3. Click login and confirm NileHive redirects to CampusOne.
4. Complete CampusOne login and confirm the user returns to NileHive.
5. Confirm browser network calls use `https://clubs-api.campusone.com.ng/api/v1/...`.
6. Confirm there are no requests containing `/api/v1/api/v1`.
7. Confirm `GET /api/v1/profile/me` returns `200` after login.
8. Click logout and confirm the app does not immediately log the user back in.

## Common Errors

- CampusOne app domain points to the backend instead of the frontend.
- `VITE_API_BASE_URL` includes `/api/v1`, causing `/api/v1/api/v1/...` requests.
- Vercel root directory is set to `frontend` while the root `vercel.json` still prefixes commands with `frontend`.
- Render root directory is left as repo root with plain `npm install`, so Render cannot find `package.json`.
- `CAMPUS_ONE_REDIRECT_URI` does not exactly match the redirect URL registered in CampusOne.
- Environment variables were changed but the frontend/backend was not redeployed.

