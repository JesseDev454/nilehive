# Club Services Demo QA Checklist

Use this before a student demo or stakeholder walkthrough. Test on one mobile viewport and one desktop viewport.

## Student
- Sign in with CampusOne and land on the student dashboard.
- Confirm the next action card is clear.
- Open Discover Clubs.
- Search for a club and filter by interest/category.
- Open a club detail page.
- Use Invite Friend and confirm share/copy feedback appears.
- Join a club.
- If dues are required, upload dues proof and submit the request.
- Confirm membership and dues status are visible after submitting.
- Open Events.
- RSVP to an upcoming event.
- Open an active event check-in route and confirm success, already checked-in, invalid, and unauthorized states are friendly.
- Open Announcements and confirm student copy is not admin-heavy.
- Submit app feedback.

## President
- Sign in as president and land on the president dashboard.
- Review the club setup checklist.
- Open each quick action: create announcement, create event/proposal, assign task, view members, view reports.
- Create a test announcement.
- Create or draft a proposal/event.
- Assign a task and confirm it appears for the executive.

## Admin
- Sign in as admin and land on the admin dashboard.
- Open pending membership requests from the dashboard.
- Verify or reject a dues proof.
- Manage a club record and confirm Discover Clubs still loads.
- Review a pending proposal.
- Open analytics and admin-only queues.
- Export reports and feedback CSV files.

## Advisor
- Sign in as advisor and confirm the dashboard is review-focused.
- Open an assigned proposal.
- Add a comment or decision where allowed.
- Open reports/events for assigned clubs.
- Confirm admin-only pages show restricted access or are not available from navigation.

## Executive
- Sign in as executive and confirm the dashboard is task-focused.
- Open an assigned task and update status.
- Open announcements and events.
- Submit feedback.
- Confirm admin-only controls are not visible.

## Feedback Manager
- Sign in as feedback manager.
- Confirm the app redirects to the feedback inbox.
- Confirm announcements/admin pages are not available from navigation.
- Filter feedback by category, status, role, and date.
- Export filtered feedback.
- Confirm direct admin URLs show restricted access or redirect away.

## General Polish
- Test `/unknown-route` and confirm recovery links work without a full reload.
- Confirm loading states are friendly on slow network.
- Confirm empty states include a clear next step where a user can act.
- Confirm CTAs use student-friendly labels: Join Club, Upload Dues Proof, View Events, RSVP, Check In, Invite Friend, Submit Feedback.
- Confirm no student can see admin, president, or feedback-manager-only controls.
