# NileHive Supabase RLS And Storage Audit Checklist

Use this checklist before any production launch, major schema change, or role-model change.

## Table Policies

### `profiles`
- Self-service onboarding can create only the caller's own student profile.
- Admin-controlled role changes are performed through backend service-role logic only.
- Suspended users remain blocked at backend auth resolution.

### `proposals`
- Presidents can create and edit only their own club proposals.
- Advisors can view and review only proposals for assigned clubs.
- Admins can view and final-review any proposal.
- Executives and students cannot view proposal detail.

### `membership_requests`
- Students can create and view only their own requests.
- Presidents can review only ordinary member requests for their own club.
- Admins can review all requests and all leadership-sensitive cases.

### `leadership_applications`
- Applicants can create/view only their own applications.
- Only admins can review applications.
- One open application per user per club is enforced at the database level.

### `tasks`
- Presidents can assign tasks for their own club.
- Executives can read/update only tasks assigned to them.
- Admins have read-only oversight access.

### `due_payments`
- Students can view and submit proof only for their own records.
- Presidents and admins can view/manage club dues.
- Executives and advisors cannot access dues tracking.

### `announcements`
- Admins can create global, club, and role-targeted announcements.
- Presidents can create only own-club announcements or own-club student/executive role announcements.
- All reads remain audience-scoped.

### `announcement_reads`
- Users can read/insert only their own read-state rows.

### `notifications`
- Users can read only their own notifications.
- Notifications remain backend-generated.

### `event_reports`
- Presidents can submit reports for approved events in their own club.
- Advisors/admins can read reports in their allowed scope.
- Executives cannot access reports.

### `profile_role_history`
- Admin-only read access.

### `email_deliveries`
- Admin-only read access.

### `audit_logs`
- Admin-only read access.
- Backend service-role writes sensitive action records.

## Storage Buckets

### `dues-receipts`
- Student can upload and view only own files.
- President/admin can view/manage receipts for allowed club scope.
- Executive/advisor cannot access private dues receipts.

### `event-media`
- Public read is allowed only if approved-event media requires it.
- Upload/update/delete remains scoped to president/admin permissions.

### `reports`
- Reserved for future report-document uploads.
- No executive access.

## Final Production Checks
- Validate all policy names still match the latest migrations.
- Test each role with a real signed-in user, not only service-role queries.
- Confirm storage paths follow the documented conventions.
- Confirm backend authorization still rejects forbidden access even if a frontend link is exposed.
