# NileHive Migaki Deployment Readiness Audit Plan

This audit plan is for checking whether NileHive, the Club Services module inside CampusOne, meets the full Migaki Deployment Standard before live deployment.

Use this document together with `docs/MIGAKI_READINESS_TRACKER_UPDATED.csv`. The tracker is the working checklist; this document explains how to run the audit and what evidence to collect.

## 1. Audit Method

Use the tracker columns exactly:

```text
Standard, Requirement, Status, Evidence, Owner, Issue, Severity, Fix Required, Retest Date
```

Allowed status values:

```text
Pass
Conditional
Fail
Not Tested
```

Evidence must be concrete. Do not mark a row as `Pass` without one of:

- Screenshot.
- Screen recording.
- Test account result.
- Production log.
- Build/test output.
- Exported CSV/PDF.
- Owner confirmation.
- Link to issue tracker item.

Run the audit against the real deployment environment, not only local development.

Required test accounts:

- `student`
- `president`
- `executive`
- `advisor`
- `admin`
- `feedback_manager`

Recommended evidence folders:

```text
deployment-evidence/
deployment-evidence/screenshots/
deployment-evidence/videos/
deployment-evidence/logs/
deployment-evidence/exports/
deployment-evidence/kpi/
deployment-evidence/issues/
```

## 2. Pre-Audit Setup

Fill these before testing starts:

| Item | Value |
| --- | --- |
| Frontend URL | To be filled |
| Backend API URL | To be filled |
| CampusOne login URL | To be filled |
| Supabase project | To be filled |
| Render backend service | To be filled |
| Vercel frontend project | To be filled |
| Pilot user list location | To be filled |
| Issue tracker location | To be filled |
| KPI tracker location | To be filled |
| Support channel | To be filled |

Confirm named owners:

| Role | Assigned To | Backup |
| --- | --- | --- |
| Deployment Lead | Migaki | Goodluck Jesse Kassa |
| Onboarding Owner | Rita Ude | Kamsi Ivoke |
| Technical Owner | Goodluck Jesse Kassa | Josiah |
| Support Lead | Josiah | Kamsi Ivoke |
| Monitoring Lead | Goodluck Jesse Kassa | Rita Ude |
| Feedback Lead | Goodluck Jesse Kassa | Kamsi Ivoke |
| Documentation / Evidence Support | Kamsi Ivoke | Rita Ude |

## 3. Product Clarity Audit

The product clarity section is only a pass if all answers are clear enough for a non-developer reviewer.

Validate:

- The problem is stated as fragmented/manual club administration.
- The exact users are listed: students, presidents, executives, advisors, Club Services admins, CampusOne admins, and feedback manager.
- The core workflow is clear: join club, submit dues proof, verify payment, activate membership.
- The Week 2 success definition includes onboarding, core workflow completion, and critical blocker targets.
- The deployment test goal includes real users, live workflows, feedback, reports, notifications, and role-based access.

Evidence to collect:

- Final Migaki submission document.
- Screenshot or PDF of product clarity section.
- Link to approved team response.

## 4. Workflow Mapping Audit

Every critical workflow must be tested with an account that matches the role.

Required workflows:

| Workflow | Role | Trigger | Success Evidence |
| --- | --- | --- | --- |
| CampusOne login and profile access | All roles | User opens NileHive | Correct role dashboard or inbox opens |
| Discover and join club | Student | Student selects club | Membership request and dues record created |
| Dues submission | Student | Student uploads/submits payment proof | Dues record shows submitted status |
| Dues verification | Admin or president | Reviewer approves/rejects dues | Status updates and persists |
| Membership activation | Admin or president | Dues confirmed | Student becomes active club member |
| Proposal approval | President, advisor, admin | President submits proposal | Proposal moves through advisor/admin review |
| Event attendance | Student, president, admin | QR displayed for event | RSVP/check-in records are created |
| Report and media review | President, advisor, admin | Event report submitted | Report can be viewed/downloaded |
| App feedback | All users, feedback manager | User submits feedback | Feedback manager sees app feedback |

Evidence to collect:

- Screenshot before and after each workflow.
- Relevant database/admin record where available.
- Any exported reports or CSV files.
- Notes from a tester who did not build the feature.

## 5. Non-Negotiable Requirements Audit

### 5.1 Onboarding

Pass criteria:

- New users can access NileHive through CampusOne without developer help.
- The guided onboarding appears for first-time users.
- The guide can be restarted from `Help / Guide`.
- Students can understand the purpose of NileHive within 2 minutes.
- Profile setup and join forms enforce required fields with friendly messages.

Evidence:

- First-login screen recording.
- Guided onboarding screenshot.
- Student dashboard screenshot.
- Missing University ID validation screenshot.

### 5.2 Core Workflow Completion

Pass criteria:

- Student can complete club joining from start to finish.
- Student can submit dues/payment proof.
- Admin/president can verify or reject dues.
- Membership status updates clearly.
- Data persists after logout/login.
- No raw database errors appear.

Evidence:

- End-to-end test notes.
- Student status screenshots.
- Admin/president dues verification screenshots.
- Database/API logs if needed.

### 5.3 Technical Stability

Pass criteria:

- Production frontend loads on desktop and mobile.
- Backend readiness endpoint returns success.
- Authentication, logout, and session handling work.
- Main submissions persist across sessions.
- Error messages are human-readable.
- Migrations are applied, especially feedback migrations `0045` and `0046`.
- Final CampusOne frontend domain is allowed by CORS.

Suggested commands/checks:

```powershell
cd frontend
npm.cmd run build
```

```powershell
cd backend
node --test tests/communications.test.js
```

Production health check:

```text
GET {API_BASE_URL}/api/v1/ready
GET {API_BASE_URL}/api/v1/health
```

Supabase migration checks:

```sql
select enumlabel
from pg_enum
where enumtypid = 'public.app_role'::regtype
order by enumlabel;
```

```sql
select column_name, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'event_feedback'
  and column_name = 'club_id';
```

Expected results:

- `feedback_manager` exists in `public.app_role`.
- `event_feedback.club_id` is nullable.
- App feedback categories are accepted.

### 5.4 Support and Escalation

Pass criteria:

- A support channel exists and is visible to users.
- Support Lead is named and reachable.
- Issue severity definitions are documented.
- Response SLA is documented.
- Outage escalation path is documented and shared.

Severity standard:

| Severity | Definition | Response Target |
| --- | --- | --- |
| Critical | Platform down, data loss, security/privacy issue, CampusOne login fully blocked | 2 hours |
| High | Core workflow blocked, dues verification impossible, role access broken | 6 hours |
| Medium | Feature broken but workaround exists | 24 hours |
| Low | Minor bug, copy issue, cosmetic issue | Next update |

Escalation path:

```text
Team member -> Support Lead -> Technical Owner -> Migaki Deployment Lead
```

### 5.5 Feedback Collection

Pass criteria:

- All users can submit app feedback.
- Students cannot see private feedback.
- `feedback_manager` can see app feedback from all users.
- `feedback_manager` cannot see club/event operational feedback.
- Admin can view/export feedback CSV.
- Week 1 and Week 2 feedback touchpoints are scheduled.

Evidence:

- Student feedback submission screenshot.
- Feedback manager inbox screenshot.
- Admin CSV export file.
- Feedback touchpoint schedule.

## 6. Role-Based Workflow Validation

### Student Tester

Test steps:

1. Login through CampusOne.
2. Complete profile/setup.
3. Restart onboarding guide.
4. Open Discover Clubs.
5. Submit club join request.
6. Submit dues/payment proof.
7. Check membership status.
8. View events.
9. Submit app feedback.

Pass if:

- Student can complete all steps without team guidance.
- Required fields block invalid submissions.
- Student does not see private feedback list.

### President Tester

Test steps:

1. Login as president.
2. Confirm only current club workspace appears.
3. Review membership requests.
4. Verify dues records.
5. Create proposal.
6. Display QR check-in.
7. Print QR without popup blocker failure.
8. Download event report/media.

Pass if:

- President cannot see another club's events or past events.
- President can complete current-club operational tasks.

### Executive Tester

Test steps:

1. Login as executive.
2. View dashboard.
3. View tasks.
4. View announcements.
5. View events for current club.
6. Submit app feedback.

Pass if:

- Executive access is limited to appropriate club workflow.
- App feedback submission works.

### Advisor Tester

Test steps:

1. Login as advisor.
2. View pending approvals.
3. Approve/reject proposal.
4. View assigned-club events.
5. View reports archive.
6. View allowed feedback.

Pass if:

- Advisor sees assigned-club workflow only.
- Advisor decisions are saved and visible.

### Admin Tester

Test steps:

1. Login as admin.
2. Open operations dashboard.
3. Manage local roles, excluding admin and feedback manager assignment.
4. Verify dues across clubs.
5. Filter dues by club.
6. Review proposals.
7. Download performance matrix.
8. Download club performance PDF.
9. Export feedback CSV.

Pass if:

- Admin has full oversight.
- No raw database errors appear.
- Admin cannot locally assign `feedback_manager`.

### Feedback Manager Tester

Test steps:

1. Login normally.
2. Confirm redirect to `/feedback`.
3. Confirm sidebar only shows App Feedback.
4. View App Feedback Inbox.
5. Filter by category.
6. Filter by status.
7. Export app feedback CSV.
8. Try restricted pages: `/user-management`, `/dues`, `/proposals`, `/events`, `/archive`.

Pass if:

- Feedback manager only sees app feedback.
- Feedback manager does not see event/club feedback.
- Restricted pages redirect back to `/feedback`.

## 7. Edge Case Validation

Required edge cases:

- Empty required form fields.
- Missing University ID.
- Invalid University ID format.
- Missing receipt/proof where required.
- Duplicate join request.
- Duplicate event feedback.
- Existing president replacement conflict.
- Unauthorized page access.
- Feedback submission without club.
- Network interruption during receipt upload.
- QR print flow on desktop browser.
- App feedback submission with no club membership.

Evidence:

- Screenshot of friendly error.
- Test result notes.
- Log entry or API response if available.

## 8. KPI and Monitoring Audit

Create a KPI tracker with these columns:

```text
Date, Invited Users, Onboarded Users, Active Users, Club Join Started, Club Join Completed, Dues Submitted, Dues Verified, Feedback Submitted, Critical Issues Raised, Critical Issues Resolved, Notes
```

Required targets:

| KPI | Target |
| --- | --- |
| Onboarding Completion Rate | At least 80% |
| Weekly Active Usage | At least 60% |
| Core Workflow Completion | At least 70% |
| Critical Issue Response Time | Under 24 hours |
| Feedback Collection Rate | At least 50% |
| Platform Reliability | At least 95% uptime |

NileHive-specific KPIs:

| KPI | Target |
| --- | --- |
| Dues Verification Time | Under 24 hours |
| Proposal Review Completion | At least 70% |
| Event Engagement Capture | At least 60% |

Monitoring requirements:

- Monitoring Lead updates KPIs every 48 hours.
- Missed targets trigger team review.
- Weekly KPI summary is submitted to Migaki.
- Issues are tracked over time by severity and status.

## 9. Operational Readiness Audit

Pass criteria:

- All owners are named.
- Internal communication channel is active.
- User support channel is visible.
- Escalation protocol is documented.
- Rollback/contingency plan exists.
- Student guide exists.
- Admin/president guide exists.
- FAQ exists.
- Patch schedule exists.
- Migaki has been briefed.

Contingency scenarios to document:

- CampusOne login failure.
- Backend API failure.
- Database migration failure.
- Broken dues workflow.
- Feedback failure.
- Notification failure.
- File upload/storage failure.

## 10. Week 1 and Week 2 Execution Audit

### Day 1

- Review Migaki checklist.
- Confirm owners.
- Test production domain, API, auth, and CORS.
- Finalize pilot users.
- Prepare onboarding messages.

### Day 2

- Send invitations.
- Support first logins.
- Track onboarding completion live.
- Log first issues.

### Day 3 to Day 5

- Close onboarding gaps.
- Fix critical bugs.
- Collect first feedback.
- Validate workflows with non-builders.

### Day 6 to Day 8

- Run live workflows.
- Monitor KPIs every 48 hours.
- Resolve issues within SLA.
- Collect mid-deployment feedback.

### Day 9 to Day 10

- Measure final KPIs.
- Document open issues.
- Prepare final deployment summary.
- Classify deployment outcome.

## 11. Evidence Package Checklist

Screenshots:

- CampusOne login entry.
- Student dashboard.
- Guided onboarding.
- Discover Clubs.
- Join form.
- Dues submission.
- Admin dues verification.
- Proposal approval flow.
- Event QR check-in.
- Reports/downloads.
- App Feedback form.
- Feedback Manager inbox.
- Admin feedback export.

Technical evidence:

- Frontend build output.
- Backend test output.
- Backend readiness/health response.
- Migration confirmation.
- Render/Vercel deployment status.
- CORS/auth environment confirmation.

Operational evidence:

- Owner list.
- Support channel.
- Issue tracker.
- KPI tracker.
- User guide/FAQ.
- Week 1/Week 2 schedule.

## 12. Pass, Conditional, and Fail Rules

Deployment is not ready if any of these fail:

- CampusOne login.
- Student club joining.
- Dues verification.
- Data persistence.
- Human-friendly errors.
- Role permission boundaries.
- Support owner/channel.
- Feedback collection.

Deployment is conditional if:

- Core workflows pass.
- Minor UI issues remain.
- Optional web push is not fully configured.
- Some exports need polish but do not block operations.

Deployment is successful if:

- All non-negotiables pass.
- KPI tracking is active.
- Real users complete core workflows without team help.
- Feedback and issue response processes are working.

## 13. Final Sign-Off

Before submitting to Migaki, complete:

| Item | Status |
| --- | --- |
| All tracker rows reviewed | Not Tested |
| All critical/high issues resolved | Not Tested |
| Owner names filled | Pass |
| KPI tracker active | Pass |
| Evidence folder complete | Not Tested |
| Migaki response updated | Not Tested |
| Final deployment classification chosen | Not Tested |

Final classification:

```text
Successful / Conditional / Incomplete
```
