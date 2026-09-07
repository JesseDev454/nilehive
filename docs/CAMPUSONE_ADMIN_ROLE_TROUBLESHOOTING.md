# Campus One Admin Role Troubleshooting

Use this checklist when a user assigned the Campus One custom role `club_services_admin` still appears as a student in Club Services.

## What Club Services Trusts

Club Services only grants effective admin access from one of these sources:

- Campus One top-level `role` is `admin`.
- The local Club Services profile role is `admin`.
- Campus One sends the exact app custom role `club_services_admin`.

Club Services does not promote every Campus One `staff` user to admin. It also does not trust unrelated custom roles or a generic `admin` value inside the mixed Campus One `roles` array.

## Campus One Configuration Checklist

1. Confirm the user was assigned `club_services_admin` on the same production Campus One app/client used by `https://clubs.campusone.com.ng`.
2. Confirm the custom role spelling is exactly `club_services_admin`.
3. Confirm the production app requests and is granted the `roles` scope.
4. Confirm the user is signing into the production frontend, not a staging or dev deployment.
5. Confirm the backend deployed to production includes the app-side custom role mapping.

## Force A Fresh Token

Campus One roles are read during sign-in, so old sessions can keep showing old role data.

1. Sign out of Club Services.
2. If Campus One allows it, disconnect or revoke consent for the Club Services app.
3. Clear cookies for `clubs.campusone.com.ng` and `clubs-api.campusone.com.ng`, or use an incognito window.
4. Sign in again through `https://clubs.campusone.com.ng/login`.
5. Allow Campus One access again.

## Verify The Session

Open this URL while logged in:

```text
https://clubs-api.campusone.com.ng/api/v1/profile/me
```

Expected response shape:

```json
{
  "profile": {
    "app_role": "student",
    "portal_role": "student",
    "custom_roles": ["club_services_admin"],
    "effective_role": "admin"
  }
}
```

`app_role` can still be `student`. That is okay. The important value for navigation and authorization is `effective_role`.

## If `custom_roles` Is Still Empty

If `custom_roles` is still `[]` after a fresh sign-in, Campus One is not sending the custom role to Club Services. Send this to the Campus One admin:

```text
The user has the `club_services_admin` custom role assigned on the Club Services production app, but after a fresh sign-in, Club Services receives `custom_roles: []` from the OIDC token/session.

Please confirm that the `roles` scope is granted for this app/client and that app-specific custom roles are being included in the OIDC token for this user.

Expected token claim:
custom_roles: ["club_services_admin"]

App: Club Services
Frontend: https://clubs.campusone.com.ng
Backend callback: https://clubs-api.campusone.com.ng/api/v1/auth/campus-one/callback
```

## Safety Rule

Do not add an email-based admin fallback or map all Campus One `staff` users to admin unless the project lead explicitly approves that risk. Club Services should stay safe by default.
