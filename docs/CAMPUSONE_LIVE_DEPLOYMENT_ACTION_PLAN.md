# CampusOne Live Deployment Action Plan

This plan documents the first live rollout approach for CampusOne, with NileHive operating as one of the connected systems under the shared CampusOne login model.

## Objective

The goal of this deployment sprint is to validate CampusOne in a real operational environment while keeping onboarding simple, protecting student trust, and making sure counselors and support teams are not overwhelmed.

The live rollout should focus on:

- reliable single-login access across CampusOne services
- clear role-based routing after login
- fast support for students, counselors, admins, and staff
- daily monitoring of usage, issues, and workflow bottlenecks
- structured feedback collection during the first two weeks

## Onboarding Strategy

### Phase 1: Participant ID

Before launch, confirm that the Phase 1 users are ready for access.

Actions:

- Confirm all pilot students, counselors, admins, and relevant staff have valid CampusOne login access.
- Verify that each user has the correct role and can reach the correct workspace after login.
- Prepare an onboarding tracker with these columns:
  - name
  - email or participant ID
  - role
  - assigned unit or service
  - login status
  - setup status
  - support notes
- Flag users who cannot log in or land in the wrong workspace for same-day support.

Success criteria:

- Pilot users can access CampusOne with one login.
- Users are routed to the correct system area based on their role.
- The team has a clear list of users who still need help.

### Phase 2: Intro Sessions

Intro sessions should be short, practical, and focused on first-use confidence.

Actions:

- Run separate walkthroughs for students and counselors where possible.
- Demonstrate how to log in, navigate the dashboard, use key workflows, receive notifications, and request support.
- Keep the walkthrough centered on live tasks, not technical explanations.
- Share a quick reference guide with screenshots for the most common actions.

Student focus:

- how to log in
- how to find the right service
- how to submit requests or reports where applicable
- how to check updates and notifications
- how to ask for help

Counselor focus:

- how to access assigned workflows
- how to review student submissions or bookings
- how to respond without duplicating manual tracking
- how to escalate technical or operational issues

Success criteria:

- Students understand how to start using CampusOne without needing repeated verbal guidance.
- Counselors understand their workflow and know where to report issues.

### Phase 3: Setup

Setup should validate the main live workflows before wider use.

Actions:

- Test login, dashboard routing, profile access, notifications, bookings or reports, and role-based permissions.
- Confirm that counselors only see information relevant to their role and assigned workflow.
- Confirm that admins can monitor the rollout without needing direct database access.
- Set up a support channel for urgent launch issues.
- Assign daily monitoring ownership so issues do not go unnoticed.

Success criteria:

- Core workflows work end to end before students are directed to use them.
- Access control is correct for students, counselors, admins, and staff.
- Support responsibilities are clear.

### Phase 4: Monitoring

Monitoring should be active during the first two weeks of live use.

Actions:

- Track daily logins, failed access attempts, support requests, and unresolved bugs.
- Review counselor workload and identify areas where the platform creates confusion or extra manual effort.
- Prioritize quick fixes for issues that block students from using the system.
- Keep a daily issue summary with status, owner, and next action.

Success criteria:

- Blocking issues are identified quickly.
- Counselors feel supported during the transition.
- The team has real usage data for product and operational decisions.

## KPI Tracking

### Student Engagement

Track whether students are actually using the platform after launch.

Metrics:

- active users
- first-time logins
- repeat logins
- completion of key student actions
- service areas with the highest and lowest usage
- drop-off points in important workflows

Review rhythm:

- check daily during Week 1
- summarize trends at the end of Week 1 and Week 2

### Wellness and Support

Track whether student support workflows are functioning smoothly.

Metrics:

- counselor bookings or relevant support requests
- submitted reports
- response times
- unresolved support cases
- recurring student issues
- counselor escalation requests

Review rhythm:

- review with counselors during Week 1 check-ins
- identify workload or filtering problems early

### Operational Efficiency

Track whether CampusOne is reducing manual work and improving response time.

Metrics:

- average issue resolution time
- number of manual follow-ups needed
- repeated user errors
- failed login or access cases
- number of unresolved launch issues
- workflow completion compared with previous manual processes

Review rhythm:

- maintain a daily tracker
- produce a short summary after Week 2

## Week 1 Execution

Week 1 should focus on access, onboarding, and confidence-building.

Actions:

- Confirm students and counselors can log in through the single CampusOne login.
- Monitor role routing and fix incorrect access quickly.
- Provide daily counselor check-ins to identify workflow pressure points.
- Respond quickly to login, role, notification, navigation, or workflow issues.
- Collect immediate feedback from students after first use.
- Keep support responses simple and visible so users trust the system.

Expected outcome:

- Users can access the platform.
- Counselors understand their live workflow.
- The team has a clear list of adoption issues and blockers.

## Week 2 Execution

Week 2 should focus on stabilizing workflows and improving adoption.

Actions:

- Review Week 1 KPI trends and identify low-engagement groups.
- Send targeted reminders or mini-guides to students who have not engaged.
- Follow up with counselors on bottlenecks and repeated issues.
- Separate issues into urgent fixes, usability improvements, and future enhancements.
- Share a short Week 2 report with progress, blockers, and recommendations.

Expected outcome:

- Adoption gaps are visible.
- Operational issues are categorized and owned.
- The team has enough evidence to decide what to improve next.

## Feedback Loop

Feedback should be collected from both users and operational data.

Sources:

- short student feedback forms
- counselor check-ins
- support tickets or support channel messages
- observed usage data
- admin reports from live workflows

Feedback categories:

- login and access
- navigation confusion
- notifications
- workflow clarity
- counselor workload
- data privacy concerns
- technical bugs
- response time issues

Tracking process:

- Maintain a shared issue tracker with priority, owner, status, and expected resolution date.
- Review urgent blockers daily during Week 1.
- Summarize feedback weekly so decisions are based on evidence instead of scattered messages.
- Keep a record of resolved issues to show progress and maintain stakeholder confidence.

## Data Privacy and Trust

Student trust must be protected throughout the deployment.

Actions:

- Make sure users only see data relevant to their role.
- Avoid sharing student information through informal channels unless required for support.
- Keep support messages professional and minimal.
- Document access or privacy issues immediately.
- Escalate any suspected data exposure as a high-priority issue.

## Support Model

Support should feel organized and responsive.

Roles:

- Students use the support channel for login, navigation, and workflow issues.
- Counselors report workflow pressure points and student-support bottlenecks.
- Admins monitor access, roles, and operational reports.
- Technical support investigates bugs, failed requests, and deployment issues.

Response priority:

- Critical: login failure, wrong role access, privacy issue, broken live workflow.
- High: repeated user confusion, counselor workflow blocker, notification failure.
- Medium: usability friction or unclear copy.
- Low: cosmetic issues or future enhancement requests.

## Submission Summary

For the first two weeks, the deployment approach is to keep onboarding simple, verify single-login access, monitor live workflows daily, support counselors closely, and collect structured feedback from students and staff.

The main success measure is not only that CampusOne goes live, but that students can confidently use it, counselors can manage their work without being overwhelmed, and the team can quickly identify and resolve operational bottlenecks.
