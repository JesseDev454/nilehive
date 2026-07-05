# Clubly User Testing QA Plan

Purpose: prepare Clubly for real user testing after the Phase 1 and Phase 2 UX fixes. This plan verifies whether students, presidents, executives, advisors, admins, and feedback managers can complete their main tasks without confusion.

Tester setup:

- Use realistic test accounts for each role.
- Use at least one club with dues required and one club with no dues required.
- Use at least one pending proposal, one submitted dues proof, one membership request, one task, one approved event, and one feedback item where possible.
- Ask testers to think out loud and rate difficulty from 1 to 5 after each task.

## 1. Role-Based Test Scenarios

### Student

#### Scenario 1: Join a club with dues required

Goal:
The student should discover a club, understand payment requirements, upload proof, and know what happens next.

Steps:

1. Log in as student.
2. Open Discover Clubs.
3. Search or filter for a club with dues required.
4. Open the club detail page.
5. Review the five-step membership tracker.
6. Select the primary next-action CTA.
7. Submit required student details.
8. Review payment instructions.
9. Upload dues proof.
10. Submit the request.
11. Confirm the status and next action are clear.

Expected result:

- Student understands Choose Club, Submit Details, Pay Dues, Upload Proof, Await Approval.
- Only one main next-action CTA is obvious.
- Student knows approval/payment verification is pending.

Confusion signs to watch:

- Student asks whether they have joined already.
- Student cannot find where to upload proof.
- Student does not understand payment status.
- Student cannot tell what happens after submission.

#### Scenario 2: Join a club with no dues required

Goal:
The student should understand that payment and proof are not required and should be able to submit a join request.

Steps:

1. Log in as student.
2. Open Discover Clubs.
3. Find a club with no dues required.
4. Open the club detail page.
5. Review the membership tracker.
6. Confirm Pay Dues and Upload Proof are marked not required.
7. Submit required student details.
8. Submit the request.
9. Confirm the approval status is clear.

Expected result:

- Student does not look for payment instructions.
- Student understands the request is awaiting review.
- No disabled or irrelevant proof upload controls appear.

Confusion signs to watch:

- Student tries to pay anyway.
- Student thinks skipped dues steps mean the flow is broken.
- Student expects immediate membership activation.

#### Scenario 3: Upload payment proof after initial request

Goal:
The student should find the payment proof action when membership is pending payment or proof was rejected.

Steps:

1. Log in as student with a pending-payment membership request.
2. Open Discover Clubs or the student dashboard.
3. Open the relevant club detail page.
4. Review the tracker and primary CTA.
5. Upload payment proof.
6. Submit the payment confirmation.
7. Confirm the page communicates proof review is pending.

Expected result:

- The primary CTA says Upload Payment Proof.
- The upload field is easy to find.
- Student understands Clubly must verify the proof.

Confusion signs to watch:

- Student cannot find the old request.
- Student uploads a file but is unsure whether it was saved.
- Student expects instant approval after upload.

#### Scenario 4: View approval status

Goal:
The student should understand whether a request is pending, active, rejected, or needs payment work.

Steps:

1. Log in as student with an existing request.
2. Open the dashboard.
3. Open Discover Clubs.
4. Open the relevant club detail page.
5. Read the membership badge, tracker, and current request copy.

Expected result:

- Status is visible in both dashboard and club detail.
- Next action matches the request state.
- Student can explain what they are waiting for.

Confusion signs to watch:

- Student asks whether advisor/admin approval is still needed.
- Student misses rejected or proof-rejected status.
- Student cannot find what to do next.

#### Scenario 5: RSVP for an event

Goal:
The student should find an approved event and submit an RSVP.

Steps:

1. Log in as student.
2. Open Events.
3. Find an upcoming event.
4. Open event details.
5. Choose Going, Interested, or Not Going.
6. Confirm the selected RSVP status is reflected.

Expected result:

- RSVP controls are visible when RSVP is allowed.
- The selected status updates clearly.
- Student can still return to the event list.

Confusion signs to watch:

- Student cannot tell which events they are eligible for.
- Student expects RSVP on past events.
- Student misses the event details action on mobile.

#### Scenario 6: Check notifications

Goal:
The student should find notifications from the sidebar and understand action links.

Steps:

1. Log in as student.
2. Confirm Notifications appears in the sidebar.
3. Open Notifications.
4. Filter notification types.
5. Open a notification card with a target link.
6. Return to Notifications.

Expected result:

- Notifications is discoverable.
- Badge count appears when there are unread notifications.
- Notification links route to student-safe destinations.

Confusion signs to watch:

- Student does not notice the mobile Menu control.
- Student cannot tell which cards are clickable.
- Student lands on a restricted page.

#### Scenario 7: Submit feedback

Goal:
The student should submit private app feedback without seeing admin-only feedback inboxes.

Steps:

1. Log in as student.
2. Open Feedback.
3. Choose category, impact, completion, and contact preference.
4. Enter what they were trying to do.
5. Enter what confused them.
6. Submit feedback.

Expected result:

- Student understands feedback is private.
- Required fields are clear.
- Success message confirms submission.

Confusion signs to watch:

- Student thinks feedback goes to club executives.
- Student feels the form has too many fields.
- Student cannot find Feedback from navigation.

### President

#### Scenario 1: Create Event Proposal

Goal:
The president should start a new event proposal from the dashboard with no duplicate/conflicting CTA.

Steps:

1. Log in as president.
2. Open dashboard.
3. Find Create Event Proposal.
4. Click it.
5. Confirm `/proposals/new` opens.
6. Start entering event information.

Expected result:

- There is one obvious event creation CTA.
- The route and page title match event proposal creation.
- President understands this is the approval path for an event.

Confusion signs to watch:

- President looks for a separate Create Event button.
- President sees two actions that appear to do the same thing.
- President thinks the proposal is already an approved event.

#### Scenario 2: Save proposal draft

Goal:
The president should understand draft behavior and be able to leave and resume.

Steps:

1. Open Create Event Proposal.
2. Enter partial proposal details.
3. Save as draft or leave after autosave if that is the current behavior.
4. Open Proposals.
5. Reopen the draft.

Expected result:

- Draft state is clear.
- Reopening the proposal preserves entered details.
- President knows the proposal has not been submitted yet.

Confusion signs to watch:

- President believes a draft was submitted.
- President cannot find the draft.
- President is unsure whether autosave worked.

#### Scenario 3: Submit proposal

Goal:
The president should complete required fields and submit for review.

Steps:

1. Open a draft or create a new proposal.
2. Fill all required proposal sections.
3. Review budget and responsible members.
4. Submit the proposal.
5. Confirm success message and new status.

Expected result:

- Required fields are discoverable.
- Submission clearly moves the proposal to review.
- President understands who reviews next.

Confusion signs to watch:

- President cannot find missing required fields.
- President misses the final submit action.
- President cannot tell whether advisor or admin is next.

#### Scenario 4: Track proposal status

Goal:
The president should find proposal status and understand pending, rejected, approved, or revision states.

Steps:

1. Log in as president.
2. Open dashboard.
3. Click Track Proposal Status or open Proposals.
4. Open a proposal detail page.
5. Review status, timeline, remarks, and back link.

Expected result:

- Status and waiting-on role are visible.
- Advisor/admin remarks are understandable.
- Back to Proposals returns to the list.

Confusion signs to watch:

- President cannot interpret rejected status.
- President cannot find how to revise.
- President uses browser back because in-app back is unclear.

#### Scenario 5: Assign task to executive

Goal:
The president should assign a task to an available executive.

Steps:

1. Log in as president with at least one executive.
2. Open Tasks.
3. Enter task title, description, priority, due date, and assignee.
4. Submit task.
5. Confirm it appears in the task list.

Expected result:

- Executive select is populated.
- Task submission is clear.
- Created task appears with correct status.

Confusion signs to watch:

- President cannot find the assignee field.
- President expects to assign tasks to regular members.
- President cannot tell if task creation succeeded.

#### Scenario 6: Handle no-executives state

Goal:
The president should understand why task assignment is blocked and how to fix it.

Steps:

1. Log in as president for a club with no executives.
2. Open dashboard.
3. Open Tasks.
4. Read the no-executives message.
5. Click the Members link.

Expected result:

- Message says no executives are available.
- Next action points to Members.
- Task submit is not available until an executive exists.

Confusion signs to watch:

- President thinks the task feature is broken.
- President does not understand executives must be assigned first.
- Members link does not route correctly.

#### Scenario 7: Manage members

Goal:
The president should manage member roles within allowed permissions.

Steps:

1. Log in as president.
2. Open Members.
3. Find an active member.
4. Change role to executive if allowed.
5. Confirm the list updates.

Expected result:

- President can manage eligible club members.
- Restricted admin-only controls are not shown.
- Role changes are confirmed.

Confusion signs to watch:

- President expects to change membership status.
- President cannot tell which members are active.
- Role select appears for unsupported users.

#### Scenario 8: Submit event report

Goal:
The president should submit a post-event report and understand archive behavior.

Steps:

1. Log in as president.
2. Open Reports Archive or Submit Event Report.
3. Select an eligible past event.
4. Fill report details.
5. Upload media if available.
6. Submit report.
7. Confirm it appears in archive.

Expected result:

- Eligible event selection is clear.
- Required report fields are understandable.
- Submission creates a visible archive/report item.

Confusion signs to watch:

- President cannot tell which events need reports.
- Upload progress/success is unclear.
- President expects reports for upcoming events.

### Executive

#### Scenario 1: View assigned tasks

Goal:
The executive should find tasks assigned to them.

Steps:

1. Log in as executive.
2. Open dashboard.
3. Open My Tasks.
4. Review assigned task details and due dates.

Expected result:

- Tasks are visible from dashboard and sidebar.
- Status, priority, and due date are understandable.
- Empty state appears if no tasks exist.

Confusion signs to watch:

- Executive cannot find tasks.
- Executive sees tasks for other people.
- Due date or priority is unclear.

#### Scenario 2: Update task status

Goal:
The executive should update a task from pending to in progress or completed.

Steps:

1. Open My Tasks.
2. Select a task.
3. Change status.
4. Confirm the status updates.

Expected result:

- Status control is obvious.
- Update persists after refresh.
- Success or updated UI confirms the action.

Confusion signs to watch:

- Executive cannot tell status is editable.
- Status changes but card does not update.
- Executive expects to edit task title/details.

#### Scenario 3: Read announcements

Goal:
The executive should read relevant announcements and mark them read.

Steps:

1. Open Communications.
2. Filter unread or high-priority announcements.
3. Open/read an announcement.
4. Mark it read or mark all read.

Expected result:

- Announcement filters work.
- Unread styling is visible.
- Read state updates.

Confusion signs to watch:

- Executive confuses announcements with notifications.
- Mark all read is enabled/disabled unexpectedly.
- Announcement audience is unclear.

#### Scenario 4: View events

Goal:
The executive should find club events and understand available actions.

Steps:

1. Open Events.
2. Filter or scan upcoming events.
3. Open event details.
4. Use share or view proposal link if available.

Expected result:

- Events list is readable.
- Details open on mobile and desktop.
- Executive sees only permitted actions.

Confusion signs to watch:

- Executive expects RSVP controls meant for students.
- Event cards look clickable but are not.
- Proposal detail link routes to restricted content.

#### Scenario 5: Use Discover Clubs and Members

Goal:
The executive should confirm Discover Clubs and Members access remains intentional and understandable.

Steps:

1. Open Discover Clubs from sidebar.
2. Browse club directory.
3. Open Members.
4. Confirm member list is view-only unless permissions allow more.

Expected result:

- Both pages load without AccessDenied.
- Executive understands why they can view these sections.
- No admin/president-only mutation controls are available.

Confusion signs to watch:

- Executive thinks they are in student join mode by mistake.
- Members page feels like a management page but has no allowed actions.
- Sidebar feels too broad.

#### Scenario 6: Submit feedback

Goal:
The executive should report app issues privately.

Steps:

1. Open Feedback.
2. Fill category, impact, completion, goal, issue, and suggestions.
3. Submit.

Expected result:

- Feedback submission succeeds.
- Executive does not see feedback inbox.
- Confirmation is clear.

Confusion signs to watch:

- Executive thinks feedback goes to president.
- Form feels too long.
- Success state is missed.

### Advisor

#### Scenario 1: Review pending proposal

Goal:
The advisor should find a pending proposal and understand the review context.

Steps:

1. Log in as advisor.
2. Open Approvals.
3. Select a pending proposal.
4. Open proposal detail.
5. Review event details, budget, responsible members, and approval timeline.

Expected result:

- Pending proposals are easy to find.
- Detail page has Back to Approvals.
- Advisor can decide whether to approve or reject.

Confusion signs to watch:

- Advisor cannot find Approvals.
- Advisor lacks enough context to decide.
- Back link returns to the wrong page.

#### Scenario 2: Approve proposal without remarks

Goal:
The advisor should approve without mandatory remarks.

Steps:

1. Open Approvals.
2. Choose a pending proposal.
3. Leave remarks empty.
4. Click Approve.
5. Confirm the proposal leaves the pending queue.

Expected result:

- Approval succeeds without remarks.
- Queue updates.
- Success message appears.

Confusion signs to watch:

- Advisor thinks remarks are required for approval.
- Approval button remains disabled.
- Queue does not refresh.

#### Scenario 3: Try rejecting without remarks

Goal:
The advisor should be blocked from rejecting without remarks and see inline validation.

Steps:

1. Open Approvals.
2. Choose a pending proposal.
3. Leave remarks empty.
4. Click Reject.
5. Read validation message.

Expected result:

- Rejection does not submit.
- Inline validation explains remarks are required.
- Advisor can fix the problem in place.

Confusion signs to watch:

- Validation appears only as toast and is missed.
- Advisor cannot tell which field needs attention.
- Proposal is rejected despite empty remarks.

#### Scenario 4: Reject proposal with remarks

Goal:
The advisor should reject with a clear reason.

Steps:

1. Open Approvals.
2. Add specific rejection remarks.
3. Click Reject.
4. Confirm success and queue update.
5. Open proposal detail if available and confirm remarks are recorded.

Expected result:

- Rejection succeeds with remarks.
- Remarks are visible to downstream users.
- Queue updates.

Confusion signs to watch:

- Advisor cannot tell remarks were saved.
- President cannot later understand rejection reason.
- Queue still shows rejected proposal.

#### Scenario 5: View reports archive

Goal:
The advisor should find submitted event reports.

Steps:

1. Open Reports Archive.
2. Filter or scan reports.
3. Open/download a report if available.
4. Return to archive.

Expected result:

- Reports are readable and downloadable.
- Empty state is clear if no reports exist.
- Advisor sees only allowed report scope.

Confusion signs to watch:

- Advisor expects to create reports.
- Download buttons are unclear.
- Archive and events feel overlapping.

#### Scenario 6: Check notifications

Goal:
The advisor should find review-related notifications.

Steps:

1. Open Notifications.
2. Filter action-needed notifications.
3. Open a proposal-related notification.
4. Confirm it routes to an advisor-safe proposal or approvals page.

Expected result:

- Notifications highlight review work.
- Links are role-safe.
- Advisor can get back to Notifications.

Confusion signs to watch:

- Notification routes to restricted proposal list.
- Advisor cannot distinguish announcements from notifications.
- Notification card affordance is weak.

### Admin

#### Scenario 1: Use Needs Action Today queues

Goal:
The admin should start daily work from the highest-priority queues.

Steps:

1. Log in as admin.
2. Open dashboard.
3. Locate Needs Action Today.
4. Review counts for proposals, dues proofs, membership requests, event reports, and feedback.
5. Open each queue card.
6. Return to dashboard.

Expected result:

- Needs Action Today appears before metrics.
- Each card has count, explanation, and one clear action button.
- All links route to the expected review page.

Confusion signs to watch:

- Admin starts in analytics instead of action queues.
- Queue card count does not match destination page.
- Too many dashboard sections compete for attention.

#### Scenario 2: Review final proposal

Goal:
The admin should review a proposal at final review and approve or reject.

Steps:

1. Open Needs Action Today.
2. Click Review Proposals.
3. Open a pending final-review proposal.
4. Review proposal details and approval timeline.
5. Approve with optional remarks.
6. Confirm status and queue update.

Expected result:

- Admin can identify final-review proposals.
- Approval succeeds without remarks.
- Back to Final Review works.

Confusion signs to watch:

- Admin opens advisor-stage proposals by mistake.
- Timeline does not explain prior advisor decision.
- Back link loses filter context.

#### Scenario 3: Reject final proposal without remarks

Goal:
The admin should be blocked from rejecting without remarks.

Steps:

1. Open a final-review proposal.
2. Leave admin remarks empty.
3. Click Reject Proposal.
4. Read inline validation.

Expected result:

- Rejection does not submit.
- Inline validation explains remarks are required.
- Admin can enter remarks and retry.

Confusion signs to watch:

- Proposal rejects despite empty remarks.
- Error is not near the textarea.
- Admin does not understand why rejection is blocked.

#### Scenario 4: Review dues proof from Membership Review

Goal:
The admin should move from membership request to payment proof review.

Steps:

1. Open Membership Review.
2. Find a request with payment proof.
3. Click Review Payment Proof.
4. Confirm dues proof review page opens.
5. Click Back to Membership Review.

Expected result:

- Proof CTA is visible when proof exists.
- Rows without proof explain what is missing.
- Return link goes back to Membership Review.

Confusion signs to watch:

- Admin cannot find why a request is blocked.
- CTA appears when no proof exists.
- Return link goes to Dues instead of Membership Review.

#### Scenario 5: Verify dues proof

Goal:
The admin should verify a valid payment proof.

Steps:

1. Open Dues or dues proof review from Membership Review.
2. Review receipt image/PDF/document.
3. Click Verify or mark as paid.
4. Confirm success and updated payment status.

Expected result:

- Proof preview loads or failure state is clear.
- Verification updates the dues record.
- Related membership/member data refreshes.

Confusion signs to watch:

- Proof preview area is blank.
- Verify button is enabled before proof loads.
- Status update is not visible after returning.

#### Scenario 6: Reject dues proof

Goal:
The admin should reject invalid payment proof.

Steps:

1. Open a submitted dues proof.
2. Review the uploaded file.
3. Click Reject.
4. Confirm the rejected status is visible in Dues/Membership Review.

Expected result:

- Admin understands rejection affects payment status.
- Student will see proof needs attention.
- Queue updates.

Confusion signs to watch:

- Admin expects remarks but none are collected.
- Reject action has no confirmation.
- Rejected status is hard to find.

#### Scenario 7: Use `/members?club_id=...` from club dashboard

Goal:
The admin should drill from a club dashboard into a pre-filtered member list.

Steps:

1. Open admin dashboard.
2. Open a club drilldown.
3. Click View members.
4. Confirm Members opens with the club filter preselected.
5. Change the club filter manually.

Expected result:

- URL query initializes the filter.
- Manual filtering still works.
- Pagination resets correctly after filter changes.

Confusion signs to watch:

- Members page opens unfiltered.
- Filter cannot be changed after URL initialization.
- Club name in filter does not match dashboard.

#### Scenario 8: Apply shared payment profile

Goal:
The admin should understand that applying the payment profile affects all clubs.

Steps:

1. Open Dues.
2. Edit shared payment profile details.
3. Click Apply to all clubs.
4. Read confirmation dialog.
5. Cancel once and confirm no mutation runs.
6. Click again and confirm.
7. Confirm success/error behavior.

Expected result:

- Confirmation explains all clubs are affected.
- Affected club count appears when available.
- Mutation only runs after confirmation.

Confusion signs to watch:

- Admin misses the global impact.
- Cancel still applies changes.
- Club count is missing or misleading.

#### Scenario 9: Review feedback and export

Goal:
The admin should filter feedback and export CSV when needed.

Steps:

1. Open Feedback.
2. Filter by status New / Open.
3. Filter by role, category, date, and club.
4. Clear filters.
5. Download CSV.

Expected result:

- Status labels match current persisted states.
- Open feedback is visually distinct.
- Export is disabled when no filtered feedback exists.

Confusion signs to watch:

- Admin expects In Progress/Resolved statuses.
- Clear filters misses one filter.
- CSV export contents do not match visible results.

#### Scenario 10: Export reports

Goal:
The admin should export reports or feedback where available.

Steps:

1. Open Reports Archive.
2. Apply a club/date filter if available.
3. Download a report PDF or media ZIP.
4. Return to archive.
5. Open Feedback and download CSV.

Expected result:

- Export buttons are discoverable.
- Disabled states are clear when nothing can be exported.
- Download success/error messages are visible.

Confusion signs to watch:

- Admin cannot tell what will be included in export.
- Export starts without feedback.
- Filtered archive and exported data do not match.

### Feedback Manager

#### Scenario 1: Open feedback inbox

Goal:
The feedback manager should land in the app feedback inbox without admin-only operations.

Steps:

1. Log in as feedback manager.
2. Confirm app opens `/feedback`.
3. Review inbox header and stats.
4. Confirm sidebar only includes App Feedback and Notifications.

Expected result:

- Feedback Manager does not see admin queues.
- Inbox purpose is clear.
- Restricted routes redirect or show safe access.

Confusion signs to watch:

- Feedback Manager expects club operations access.
- Sidebar contains unrelated admin items.
- Redirect feels like an error.

#### Scenario 2: Filter by status

Goal:
The feedback manager should filter existing feedback by current status values.

Steps:

1. Open Feedback.
2. Select New / Open.
3. Select Reviewed.
4. Select Archived.
5. Return to All statuses.

Expected result:

- Each status filter changes the visible list.
- Empty states explain when no feedback exists for a status.
- Open items are visually distinct.

Confusion signs to watch:

- Tester expects In Progress or Resolved.
- Status labels feel too limited.
- URL status filter and select disagree.

#### Scenario 3: Filter by role/category/date

Goal:
The feedback manager should narrow feedback to a useful subset.

Steps:

1. Select a role filter.
2. Select a category filter.
3. Select a date filter.
4. Confirm the list updates.

Expected result:

- Filters are easy to scan.
- Results match selected filters.
- Filtered count is understandable.

Confusion signs to watch:

- Too many filters feel overwhelming.
- No-results state does not mention filters.
- Role inferred from feedback text feels wrong.

#### Scenario 4: Clear filters

Goal:
The feedback manager should recover from no-results filters.

Steps:

1. Apply filters that return no feedback.
2. Read the empty state.
3. Click Clear filters.
4. Confirm the full/default list returns.

Expected result:

- Clear filters resets status, role, category, date, and club where applicable.
- Inbox does not feel broken.

Confusion signs to watch:

- One filter remains active.
- Clear filters button is missing.
- User refreshes page instead.

#### Scenario 5: Export CSV

Goal:
The feedback manager should export visible feedback.

Steps:

1. Open Feedback.
2. Apply a filter.
3. Click Download CSV.
4. Confirm download starts.

Expected result:

- CSV export uses visible filtered feedback.
- Button is disabled when no feedback is visible.
- File name is recognizable.

Confusion signs to watch:

- Export includes hidden/unfiltered results.
- Download button is hard to find.
- No success/failure feedback appears.

#### Scenario 6: Open notifications and confirm role-safe links

Goal:
The feedback manager should never be sent to unsupported Clubly routes.

Steps:

1. Open Notifications.
2. Open each notification category available.
3. Click notification cards with action links.
4. Confirm links route only to `/feedback` or `/notifications`.
5. Confirm unsupported targets show safe feedback-related copy.

Expected result:

- No notification link opens dues, membership, proposals, tasks, events, or communications.
- Feedback Manager can return to feedback inbox.

Confusion signs to watch:

- Notification looks actionable but stays inert without explanation.
- Notification routes to restricted page.
- Copy does not explain why only feedback access is available.

## 2. Mobile QA Checklist

| Area | What to Test | Expected Behavior | Possible Failure Signs |
| --- | --- | --- | --- |
| Student membership flow | Open Discover Clubs, filter, open club detail, use membership tracker and primary CTA. | Menu is discoverable, tracker fits, CTA is visible, form fields stack cleanly. | Tracker cards overflow, CTA hidden below too much content, form labels wrap badly. |
| Payment proof upload | Upload image/PDF proof from mobile browser. | File picker opens, upload state is visible, proof filename/status appears, submit is reachable. | Upload appears frozen, filename is clipped, submit button is below confusing competing CTAs. |
| Event RSVP | Open Events, event detail, RSVP controls. | Event cards fit narrow screen, RSVP buttons wrap, selected state is clear. | RSVP buttons overflow, detail modal is too tall, event actions hidden. |
| President proposal creation | Complete proposal form on mobile. | Sections are readable, inputs fit width, navigation between steps is visible. | Long form causes lost context, budget/responsible-member rows overflow, final submit is hard to find. |
| Admin Needs Action Today | Open admin dashboard and use queue cards. | Cards stack cleanly, each has count/explanation/action, dashboard does not require horizontal scrolling. | Cards feel too dense, action buttons wrap poorly, admin misses queue section. |
| Dues proof review | Open proof review on mobile and verify/reject. | Proof preview is readable or has clear fallback, action buttons stay reachable. | Preview is blank, PDF is impossible to inspect, verify/reject buttons are off-screen. |
| Feedback inbox filtering | Use status, role, category, date filters. | Select controls stack, Clear filters is visible in empty states. | Filters are too long, dropdowns clip, no-results state appears broken. |
| Sidebar/menu behavior | Use mobile Menu for every role. | Menu label is visible, sheet opens, role items and badges are readable. | User misses menu, sidebar content is hidden, admin menu feels too long to scan. |

## 3. Empty State QA

| Empty State | Verify Copy Explains What Happened | Verify Next Action | Verify Routing | Broken-Feeling Signs |
| --- | --- | --- | --- | --- |
| Student has no membership requests | Says no memberships/requests exist yet. | Prompts student to choose a club. | Show all clubs or club cards are available. | Student thinks data failed to load. |
| Student has no uploaded proof | Says no payment proof uploaded yet. | Prompts pay dues then upload receipt. | Upload field remains in same flow. | Student thinks proof upload is optional when dues are required. |
| President has no proposals | Says no proposals have been started. | Create Event Proposal button appears. | Button opens `/proposals/new`. | Empty list has no CTA. |
| President has no executives | Says no executives are available yet. | Link/button points to Members. | Opens `/members`. | President thinks Tasks is broken. |
| Admin has no pending queue items | Says all queues are clear. | View Activity is available. | Stays in dashboard activity context. | Admin thinks dashboard failed to load. |
| Feedback manager has no feedback | Says no feedback exists for the selected status. | Clear filters appears if filters are active. | Returns to broader inbox results. | Inbox looks like access is broken. |
| Feedback filters return no results | Says no feedback matches filters. | Clear filters button appears. | All filters reset. | User refreshes page to recover. |
| Advisor has no pending approvals | Says no approvals are pending. | Points to notifications/dashboard if available. | Navigation still works. | Advisor thinks proposal review feature is missing. |
| Executive has no assigned tasks | Says no tasks are assigned yet. | Suggests waiting for president-assigned tasks. | Task page remains stable. | Executive thinks they lack permissions. |

## 4. Regression Checklist

- [ ] Login works for Student, President, Executive, Advisor, Admin, and Feedback Manager.
- [ ] Role detection shows the correct dashboard and sidebar for each role.
- [ ] Sidebar navigation items match each role.
- [ ] Mobile Menu opens and shows role navigation.
- [ ] `AccessDenied` appears for restricted pages with title, reason, current role, safe destination, and dashboard button.
- [ ] Student sidebar includes Notifications and shows badge count when available.
- [ ] Executive sidebar includes Discover Clubs and Members.
- [ ] Executive can open `/membership` and `/members` without hidden manual access confusion.
- [ ] Admin club dashboard View members opens `/members?club_id=...`.
- [ ] Members page initializes the club filter from `club_id` and still allows manual filter changes.
- [ ] Advisor rejection without remarks shows inline validation and does not submit.
- [ ] Advisor approval without remarks still submits.
- [ ] Admin proposal rejection without remarks shows inline validation and does not submit.
- [ ] Admin approval without remarks still submits.
- [ ] Global dues Apply to all clubs opens confirmation dialog.
- [ ] Canceling global dues confirmation does not run mutation.
- [ ] Confirming global dues confirmation runs existing mutation and success/error behavior.
- [ ] Membership Review rows with proof show Review Payment Proof.
- [ ] Membership Review rows without proof/payment show explicit status text.
- [ ] Feedback Manager notification links route only to `/feedback` or `/notifications`.
- [ ] Proposal detail back links return to Approvals, Final Review, or Proposals as appropriate.
- [ ] Dues proof review back link returns to Dues or Membership Review based on source.
- [ ] Club edit back link returns to Clubs.
- [ ] User access edit back link returns to User Management.
- [ ] Admin club dashboard back link returns to admin dashboard.
- [ ] `npm run lint` passes with no new errors.
- [ ] `npm run build` passes.

## 5. UX Risk Register

| Risk | Role Affected | Severity | How To Test | Suggested Fix If Confirmed |
| --- | --- | --- | --- | --- |
| Student still confused by dues/payment state. | Student | Critical | Ask student to explain what step they are on after uploading proof. | Add stronger status copy near tracker and payment card; consider clearer receipt submitted state. |
| Student thinks join request means active membership. | Student | Critical | Have tester submit a request and ask if they are now a member. | Add post-submit confirmation panel explaining approval timeline. |
| Upload states are not obvious enough. | Student, Admin | Important | Upload proof on slow network and observe whether tester waits/confirms. | Add persistent upload progress/success state and disable submit until upload completes. |
| Admin dashboard still too crowded. | Admin | Important | Ask admin where they would start the day. | Collapse secondary analytics lower on page or add stronger visual priority to queues. |
| Admin queue counts do not match destination pages. | Admin | Critical | Compare Needs Action Today count with filtered destination list. | Align API count source or add explanatory count labels. |
| Dues proof review is hard on mobile. | Admin | Important | Review image and PDF proofs on a phone. | Add open-in-new-tab/download affordance near proof preview. |
| Executive sidebar feels too broad. | Executive | Medium | Ask executive what Discover Clubs and Members are for. | Add role-specific helper copy or regroup navigation if confusion persists. |
| Mobile proposal form is too long. | President | Important | Have president create full proposal on phone without guidance. | Add sticky step progress/actions or split dense sections further. |
| President no-executives setup still unclear. | President | Important | Ask president to assign task before any executive exists. | Add inline role assignment guidance directly in Members page. |
| Advisor rejection validation is missed. | Advisor | Important | Try rejecting without remarks and watch whether tester sees error. | Move validation above action buttons or focus textarea on error. |
| Feedback statuses are too limited. | Admin, Feedback Manager | Important | Ask reviewer to triage feedback into in-progress/resolved. | Add backend status mutation for New, Reviewed, In Progress, Resolved, Ignored. |
| Notification links still feel unclear. | All roles | Medium | Ask tester to predict destination before clicking notification card. | Add explicit action labels per notification type. |
| AccessDenied feels like an error instead of permission boundary. | Restricted roles | Medium | Ask user to manually open restricted route. | Add role-specific suggested next steps or route-specific safe links. |
| Export actions do not explain scope. | Admin, Feedback Manager | Medium | Ask tester what CSV/PDF/ZIP will include before clicking. | Add small scope summary near export buttons. |

## 6. Manual Testing Script

Use this script at the start of each live test:

> Today we are testing Clubly, the CampusOne club management section. We are not testing you; we are testing whether the app makes sense.
>
> Please think out loud as you work. Say what you are looking for, what you expect to happen, and anything that feels confusing or slow.
>
> Try to complete each task without help. I will only guide you if you are stuck for more than a short time or cannot continue.
>
> After each task, rate the difficulty from 1 to 5, where 1 means very easy and 5 means very difficult.
>
> If any label, button, page, or status is unclear, say so even if you eventually figure it out.

Observer notes to capture after each task:

- Completion: completed / completed with help / failed.
- Difficulty rating: 1 to 5.
- Time to complete.
- Where the tester hesitated.
- Exact confusing words or labels.
- Any wrong turns or restricted pages.
- Suggested wording from the tester, if offered.

## 7. Highest-Risk Workflows To Test First

1. Student joins a dues-required club and uploads proof.
2. Admin reviews payment proof from Membership Review.
3. President creates, saves, submits, and tracks an event proposal.
4. Advisor rejects a proposal with required remarks.
5. Admin uses Needs Action Today to clear queues.
6. Feedback Manager filters feedback and opens notifications safely.
7. Mobile student membership and mobile president proposal creation.

## 8. Recommended Live Testing Order

1. Student membership/payment flow.
2. Admin review queues and payment proof review.
3. President proposal, task, member, and report flows.
4. Advisor proposal review.
5. Executive task, event, Discover Clubs, and Members access.
6. Feedback Manager inbox, filters, export, and notifications.

Run student and admin sessions first because their workflows have the highest risk of blocking real operational use.

## 9. Code Changes Made

None. This QA plan is documentation-only.
