# Clubly Role/Page/Button Audit

Scope: Clubly section of the CampusOne/NileHive codebase only. Roles audited: Student, Advisor, President, Executive, Admin, Feedback Manager.

Important note: Several routes are technically reachable by any authenticated role because the React router defines them globally, but page components often render a restricted/empty state when the role is not supported. In the maps below, "accessible" means the role has a usable workflow on that page. Restricted states are called out separately where relevant.

## 1. Clubly Overview

Clubly is a role-aware React/Vite frontend backed by an Express API and Supabase data/storage. The live app is centered in `frontend/src`, with the primary router in `frontend/src/App.tsx`, the shell in `frontend/src/components/AppLayout.tsx`, role navigation in `frontend/src/components/AppSidebar.tsx` and `frontend/src/lib/appNavigation.ts`, and data calls centralized in `frontend/src/lib/api.ts`.

Main routes/pages:

| Route | Page Component | Main Use |
| --- | --- | --- |
| `/` | `frontend/src/pages/Dashboard.tsx` | Role-specific dashboard. |
| `/membership` and `/membership/clubs/:clubId` | `frontend/src/pages/Membership.tsx` | Student/executive club discovery and join flow; admin membership review. |
| `/events` | `frontend/src/pages/EventCalendar.tsx` | Approved event feed, RSVP, check-in, attendance tools. |
| `/events/:proposalId/check-in` | `frontend/src/pages/EventCheckIn.tsx` | QR/self check-in screen for students. |
| `/communications` | `frontend/src/pages/Communications.tsx` | Announcement feed and announcement creation. |
| `/feedback` | `frontend/src/pages/Communications.tsx` with `defaultTab="feedback"` | App feedback form/inbox. |
| `/notifications` | `frontend/src/pages/Notifications.tsx` | Notification center and browser push controls. |
| `/proposals/new` | `frontend/src/pages/NewProposal.tsx` | President proposal creation/edit wizard. |
| `/proposals` | `frontend/src/pages/Proposals.tsx` | President proposal list; admin final review queue. |
| `/proposals/:id` | `frontend/src/pages/ProposalDetail.tsx` | Proposal detail, revision, advisor/admin decisions. |
| `/approvals` | `frontend/src/pages/Approvals.tsx` | Advisor pending proposal approval queue. |
| `/tasks` | `frontend/src/pages/Tasks.tsx` | President task assignment, executive task updates, admin task oversight. |
| `/members` | `frontend/src/pages/Members.tsx` | Member database and role/status controls. |
| `/dues` and `/dues/:paymentId/proof` | `frontend/src/pages/Dues.tsx`, `frontend/src/pages/DuesProofReview.tsx` | Admin dues ledger and proof verification. |
| `/clubs` and `/clubs/:clubId/edit` | `frontend/src/pages/Clubs.tsx` | Admin club directory management; president own club profile management. |
| `/analytics` | `frontend/src/pages/Analytics.tsx` | Admin usage analytics. |
| `/archive` | `frontend/src/pages/MediaArchive.tsx` | Reports/media archive and president post-event report submission. |
| `/user-management` and `/user-management/:userId` | `frontend/src/pages/UserManagement.tsx` | Admin local role and club assignment tools. |
| `/clubs/:clubId/dashboard` | `frontend/src/pages/AdminClubDashboard.tsx` | Admin club performance drilldown. |

Layout structure:

- `frontend/src/App.tsx` wraps authenticated pages in `ProtectedRoutes`, then `AppLayout`.
- `AppLayout` renders `AppSidebar`, a sticky header with role label, `Help / Guide`, and `Logout`, then the route outlet.
- `AppSidebar` reads role-specific items from `getRoleNavItems` and shows dynamic badges from `getNavigationCounts()`.
- `GuidedOnboarding` (`frontend/src/components/GuidedOnboarding.tsx`) overlays a role-specific tour and can route users through key sections.
- Shared Clubly UI primitives are in `frontend/src/components/Clubly.tsx`: page headers, metric cards, state cards, loading states, command panels, section headers, meta chips, etc.

Role-based access system:

- Frontend auth state is in `frontend/src/contexts/AuthContext.tsx`; it resolves `effective_role` via `resolveEffectiveRole`.
- `frontend/src/contexts/RoleContext.tsx` exposes the authenticated role; the setter is intentionally a no-op, so users cannot manually switch roles in the UI.
- Feedback Manager is special-cased in `ProtectedRoutes`: if `effectiveRole === "feedback_manager"`, the user is redirected to `/feedback` unless they are on `/feedback` or `/notifications`.
- Navigation items are role-specific in `frontend/src/lib/appNavigation.ts`.
- Backend route guards use `backend/src/middleware/auth.js`, `backend/src/shared/portalAccess.js`, and `backend/src/middleware/requireRole.js`.
- Backend module routes enforce hard role checks for sensitive actions, for example proposal creation is `requireRole("president")`, admin proposal decisions are `requireRole("admin")`, and advisor proposal decisions are `requireRole("advisor")` in `backend/src/modules/proposals/proposals.routes.js`.

Main data flow:

1. User signs in through local Supabase fallback or CampusOne/portal auth.
2. Auth context loads profile from `/api/v1/profile` or Supabase profile rows.
3. Role-aware pages call API helpers from `frontend/src/lib/api.ts`.
4. React Query caches and invalidates data after mutations.
5. Express modules under `backend/src/modules/*` validate role/scope, call database services, and return JSON envelopes.
6. Supabase tables/storage hold profiles, clubs, proposals, membership requests, dues receipts, announcements, feedback, tasks, reports, event engagement, push subscriptions, and usage analytics.

Important components used across Clubly:

- `AppLayout`, `AppSidebar`, `GuidedOnboarding`, `NavLink`, `StatusBadge`, `ApprovalStepper`, `DataPagination`, `NhStudentId`.
- Shared UI from `frontend/src/components/ui/*`, especially `Button`, `Card`, `Dialog`, `Select`, `Tabs`-like logic in `Communications`, `Input`, `Textarea`, `Badge`, `Switch`.
- Shared Clubly states/components from `frontend/src/components/Clubly.tsx`.
- Toast helpers in `frontend/src/lib/notify.ts` and direct `sonner` toasts.

## 2. Role-Based Page Map

### Role: Student

| Page/Screen | Route | Purpose | Main Components | Data/API Used |
| --- | --- | --- | --- | --- |
| Student dashboard | `/` | Shows membership status, next actions, dues/join progress, events, announcements, feedback prompt. | `Dashboard`, `StudentDashboard`, `ClublyLoadingState`, `ClublyStateCard`, cards/links/buttons. | `getMyMembershipRequests`, `getMyDuePayments`, `getApprovedEvents`, `getAnnouncements`, `getNotifications`, `publicClubsQueryOptions`. |
| Discover Clubs | `/membership` | Browse clubs, filter/search, see recommendations, view current requests. | `Membership`, `StudentMembershipView`, `DiscoverClubCard`, `ClubLogo`, filters, `Select`, `Input`. | `getPublicClubs`/`getClubs`, `getMyMembershipRequests`, `getApprovedEvents`, `publicClubsQueryOptions`. |
| Club join/detail | `/membership/clubs/:clubId` | View club details, gallery, announcements/events, dues settings, submit join/payment proof. | `StudentClubJoinPage`, `DuesConfirmationCard`, `NhStudentId`, `Dialog`, file input. | `getClubDetail`, `getClubPaymentSettings`, `createMembershipRequest`, `submitDuePaymentConfirmation`, `uploadStorageFile`, `resolveStorageFileUrl`. |
| Events | `/events` | View today/this week/upcoming/past events, RSVP, check event details, self check-in when allowed. | `EventCalendar`, `EventCard`, `EventEngagementPanel`, `EventDetailDialog`, `DataPagination`. | `getApprovedEvents`, `getEventEngagement`, `submitEventRsvp`, `submitEventSelfCheckIn`, `getEventReminders`, `getMyMembershipRequests`. |
| QR Check-in | `/events/:proposalId/check-in` | Auto-record student attendance from QR link if event is live. | `EventCheckIn`, `ClublyStateCard`, `ClublyLoadingState`. | `getEventEngagement`, `submitEventSelfCheckIn`. |
| Announcements | `/communications` | Read official updates and mark announcements read. | `Communications`, announcement feed, filters, `DataPagination`. | `getAnnouncements`, `markAnnouncementRead`, `markAllAnnouncementsRead`. |
| Feedback | `/feedback` | Submit structured app feedback privately. | `Communications` feedback tab, feedback form, `Select`, `Input`, `Textarea`. | `createFeedback`. |
| Notification Center | Not in student sidebar, but route exists as `/notifications` | In-app notification feed, filters, push notification toggle. | `Notifications`, notification cards, filter buttons, push controls. | `getNotifications`, `getAnnouncements`, `markAnnouncementRead`, push helpers. |
| Restricted proposal/tasks/member/admin pages | Various | Route renders access-restricted state if manually opened. | `ClublyStateCard`. | No usable role workflow. |

### Role: Advisor

| Page/Screen | Route | Purpose | Main Components | Data/API Used |
| --- | --- | --- | --- | --- |
| Advisor dashboard | `/` | Overview of pending advisor work, assigned-club events/reports/feedback links. | `Dashboard`, `AdvisorDashboard`, proposal/event/report cards. | `useAdvisorPendingProposals`, `getApprovedEvents`, `getEventReports`, `getFeedback`, `getAnnouncements`. |
| Pending Approvals | `/approvals` | Review proposals assigned to advisor and approve/reject with remarks. | `Approvals`, `Textarea`, `StatusBadge`, `ClublyMetaChip`. | `useAdvisorPendingProposals`, `submitAdvisorDecision`. |
| Proposal detail | `/proposals/:id` | View full proposal detail and timeline for advisor-visible proposals. | `ProposalDetail`, `ApprovalStepper`, details cards. | `getAdvisorProposal`. |
| Announcements | `/communications` | Read role/club updates and mark as read. | `Communications`, announcement filters/feed. | `getAnnouncements`, `markAnnouncementRead`, `markAllAnnouncementsRead`. |
| Events | `/events` | View approved events for accessible scope; no RSVP controls unless role-specific API permits. | `EventCalendar`, `EventCard`, `EventEngagementPanel`. | `getApprovedEvents`, `getEventEngagement`, `getEventReminders`, `getClubs`. |
| Reports Archive | `/archive` | View/download event reports and media for advisor scope. | `MediaArchive`, `ReportCard`, `DataPagination`. | `getEventReports`, `getEventReportDetail`, `downloadEventReportPdf`, `downloadReportMediaZip`. |
| Feedback | `/feedback` | Submit app feedback. Advisor does not get the admin/feedback-manager inbox because `canViewFeedback` is only admin/feedback_manager. | `Communications` feedback form. | `createFeedback`. |
| Notifications | `/notifications` | View workflow updates and push alert controls. | `Notifications`. | `getNotifications`, `getAnnouncements`, `markAnnouncementRead`, push helpers. |
| Restricted proposal list/new/task/member/admin pages | Various | Route renders restricted or empty state if manually opened. | `ClublyStateCard`. | No usable role workflow. |

### Role: President

| Page/Screen | Route | Purpose | Main Components | Data/API Used |
| --- | --- | --- | --- | --- |
| President dashboard | `/` | Club operations overview, pending proposals, tasks, health score, quick actions. | `Dashboard`, `PresidentDashboard`, quick action buttons, metrics. | `getPresidentDashboard`, `getTasks`, `getClubMembers`, `getAnnouncements`, `getEventReports`. |
| Club Profile | `/clubs`, `/clubs/:clubId/edit` | Edit assigned club public profile, categories, social links, logo/gallery. Cannot create/delete clubs. | `Clubs`, club form, file inputs, category buttons. | `getClubs`, `updateClubProfile`, `createClubMedia`, `uploadStorageFile`. |
| Create/Edit Proposal | `/proposals/new`, `/proposals/new?edit=:id` | Multi-step proposal wizard with autosave, budget, responsible members, draft/submit. | `NewProposal`, `ClublyStepIndicator`, forms, `Select`, `Input`, `Textarea`. | `getClubs`, `getPresidentProposal`, `createProposal`, `updatePresidentProposal`, local draft storage. |
| Club Proposals | `/proposals` | List club proposals, status, owner, edit/resubmit entry points. | `Proposals`, `StatusBadge`, `DataPagination`. | `getPresidentProposals`. |
| Proposal detail | `/proposals/:id` | View proposal details/timeline; edit draft/rejected proposals; resubmit. | `ProposalDetail`, `ApprovalStepper`, `StatusBadge`. | `getPresidentProposal`, `submitPresidentProposalRevision`. |
| Task Delegation | `/tasks` | Assign tasks to executives and update task statuses. | `Tasks`, assignment form, `TaskCard`, metrics. | `getTasks`, `getPresidentDashboard`, `createTask`, `updateTaskStatus`. |
| Members | `/members` | View members and promote/demote active members between member/executive. Cannot assign president or change membership status. | `Members`, member table, role `Select`. | `getClubMembers`, `updateClubMember`. |
| Announcements | `/communications` | Create own-club announcements and read updates. | `Communications`, announcement form/feed. | `createAnnouncement`, `getAnnouncements`, `markAnnouncementRead`, `markAllAnnouncementsRead`. |
| Events | `/events` | View approved events, show event QR, mark attendance, share event, view proposal links. | `EventCalendar`, `EventEngagementPanel`, `EventQrDialog`. | `getApprovedEvents`, `getEventEngagement`, `submitEventAttendance`, `getEventReminders`. |
| Reports Archive / Submit Report | `/archive` | Submit post-event reports, upload images, download reports/media. | `MediaArchive`, report form, `ReportCard`. | `getEventReports`, `getApprovedEvents`, `createEventReport`, `uploadStorageFile`, export helpers. |
| Feedback | `/feedback` | Submit app feedback. | `Communications` feedback form. | `createFeedback`. |
| Notifications | `/notifications` | View workflow updates and push controls. | `Notifications`. | `getNotifications`, `getAnnouncements`, push helpers. |

### Role: Executive

| Page/Screen | Route | Purpose | Main Components | Data/API Used |
| --- | --- | --- | --- | --- |
| Executive dashboard | `/` | Task-focused dashboard with assigned tasks, upcoming events, announcements/feedback links. | `Dashboard`, `ExecutiveDashboard`, task/event/update cards. | `getExecutiveDashboard`, `getAnnouncements`, `getApprovedEvents`, `getEventReminders`, `getTasks`. |
| My Tasks | `/tasks` | View assigned tasks and update status. | `Tasks`, `TaskCard`, status `Select`, metrics. | `getTasks`, `updateTaskStatus`. |
| Announcements | `/communications` | Read announcements and mark read. | `Communications` announcement feed. | `getAnnouncements`, `markAnnouncementRead`, `markAllAnnouncementsRead`. |
| Events | `/events` | View events, share event, view details. | `EventCalendar`, `EventCard`, `EventEngagementPanel`. | `getApprovedEvents`, `getEventEngagement`, `getEventReminders`, `getClubs`. |
| Feedback | `/feedback` | Submit app feedback. | `Communications` feedback form. | `createFeedback`. |
| Notifications | `/notifications` | View updates, filter notifications, enable/disable push. | `Notifications`. | `getNotifications`, `getAnnouncements`, push helpers. |
| Discover Clubs / Join | `/membership`, `/membership/clubs/:clubId` | Executives are allowed into student-style membership/discovery flow by the page component. | `Membership`, `StudentMembershipView`. | `getClubs`, `getMyMembershipRequests`, `createMembershipRequest`, `submitDuePaymentConfirmation`. |
| Members | `/members` | View member database only; no management controls. Not in executive sidebar. | `Members`, member table, badges. | `getClubMembers`. |
| Restricted proposals/new/archive/admin pages | Various | Route renders restricted state if manually opened. | `ClublyStateCard`. | No usable role workflow. |

### Role: Admin

| Page/Screen | Route | Purpose | Main Components | Data/API Used |
| --- | --- | --- | --- | --- |
| Admin dashboard / operations matrix | `/` | Global operational overview, pending queues, club performance matrix, exports/drilldowns. | `Dashboard`, `PolishedAdminDashboard`, `AdminMetricCard`, matrix/cards. | `getAdminOperationsDashboard`, `getAdminProposals`, `getDuePayments`, `getEventReports`, `getFeedback`, `downloadAdminPerformanceMatrixCsv`. |
| Analytics | `/analytics` | Aggregate usage and operational analytics by date range. | `Analytics`, `ClublyMetricCard`. | `getAnalyticsSummary`. |
| User Management | `/user-management`, `/user-management/:userId` | Search/filter users, manage local roles, club assignment, advisor assignment, president replacement. | `UserManagement`, `UserActionPanel`, `Dialog`, filters. | `getAdminUsers`, `getAdminUser`, `getClubs`, `updateAdminUserRole`, `assignAdminUserAdvisor`. |
| Clubs | `/clubs`, `/clubs/:clubId/edit` | Create, edit, delete clubs; manage public signup visibility, categories, logo/gallery. | `Clubs`, form, delete dialog, club cards. | `getClubs`, `createClub`, `updateClub`, `deleteClub`, `createClubMedia`, `uploadStorageFile`. |
| Final Review | `/proposals` | Review all club proposals with status filtering. | `Proposals`, status filter, `StatusBadge`, `DataPagination`. | `getAdminProposals`. |
| Proposal detail / final decision | `/proposals/:id` | View proposal and approval timeline; approve/reject final review; override rejected proposals with remarks. | `ProposalDetail`, `ApprovalStepper`, decision form. | `getAdminProposal`, `submitAdminDecision`. |
| Membership Review | `/membership` | View payment-backed join requests and filter by club/status; dues page performs actual verification. | `Membership`, `ReviewerMembershipView`, filters. | `getMembershipRequests`, `getClubs`. |
| Members | `/members` | View members across clubs, filter/group by club, change club role and membership status, replace president. | `Members`, tables, `Dialog`, role/status selects. | `getClubMembers`, `getClubs`, `updateClubMember`. |
| Tasks | `/tasks` | Read-only task oversight with club filter. | `Tasks`, club filter, task list. | `getTasks`, `getClubs`. |
| Dues | `/dues` | Review dues ledger, pending proofs, shared payment profile. | `Dues`, filters, dues table, payment profile form. | `getDuePayments`, `getClubPaymentSettings`, `applyClubPaymentProfileToAll`, `getClubs`. |
| Dues proof review | `/dues/:paymentId/proof` | Full-page proof viewer; verify or reject payment. | `DuesProofReview`, receipt viewer, decision buttons. | `getDuePayment`, `updateDuePayment`, `resolveStorageFileUrl`. |
| Announcements | `/communications` | Create global/all-clubs/club/role announcements; read and mark announcements. | `Communications`, announcement form/feed. | `createAnnouncement`, `getAnnouncements`, `markAnnouncementRead`, `markAllAnnouncementsRead`, `getClubs`. |
| Events | `/events` | Admin event feed with timing filter, attendance tools and QR. | `EventCalendar`, admin filter buttons, `EventEngagementPanel`. | `getApprovedEvents`, `getEventEngagement`, `submitEventAttendance`, `getEventReminders`, `getClubs`. |
| Reports Archive | `/archive` | Filter reports by club; download individual PDFs, images, filtered reports ZIP. | `MediaArchive`, `ReportCard`, admin club filter. | `getEventReports`, `getEventReportDetail`, `downloadEventReportPdf`, `downloadReportMediaZip`, `downloadEventReportsZip`, `getClubs`. |
| Feedback | `/feedback` | View app feedback inbox with filters and CSV export; admin does not submit feedback. | `Communications` feedback inbox. | `getFeedback`, `downloadFeedbackCsv`, `getClubs`. |
| Notifications | `/notifications` | View all role-relevant updates and push controls. | `Notifications`. | `getNotifications`, `getAnnouncements`, push helpers. |
| Club drilldown | `/clubs/:clubId/dashboard` | Per-club performance, tasks, health, recent members/activity, PDF export. | `AdminClubDashboard`, `TaskList`, metrics. | `getAdminClubDashboard`, `downloadAdminClubPerformancePdf`. |

### Role: Feedback Manager

| Page/Screen | Route | Purpose | Main Components | Data/API Used |
| --- | --- | --- | --- | --- |
| App Feedback Inbox | `/feedback` | Review non-operational app feedback only; export CSV; filter by category/role/date. | `Communications` with feedback-manager mode, feedback inbox, filters. | `getFeedback`, `downloadFeedbackCsv`. |
| Notifications | `/notifications` | View feedback/announcement/update notifications and push controls. | `Notifications`. | `getNotifications`, `getAnnouncements`, `markAnnouncementRead`, push helpers. |
| Forced redirect from other Clubly routes | Any other protected route | `ProtectedRoutes` redirects Feedback Manager back to `/feedback`. | `ProtectedRoutes` in `App.tsx`. | No page data; route guard only. |

## 3. Buttons and Actions Per Role

Global actions visible to most authenticated roles:

| Page | Button/Action | What It Does | Is It Clear? | Notes |
| --- | --- | --- | --- | --- |
| App shell | Sidebar item clicks | Navigate to role-specific pages. | Mostly yes | Navigation labels differ by role; some route behavior differs even when labels are similar. |
| App shell | Collapse sidebar / Expand sidebar | Desktop sidebar collapse/expand. | Yes | Icon-only but has `aria-label`. |
| App shell | Help / Guide | Restarts guided onboarding for current role. | Mostly | Useful, but "Guide" on mobile may not convey that it will navigate between pages. |
| App shell | Logout | Signs out. | Yes | Present in top header. |
| Guided onboarding | Skip, Back, Next, Finish | Tour controls; may navigate to tour route. | Yes | Tour can move users unexpectedly between pages. |

### Role: Student

| Page | Button/Action | What It Does | Is It Clear? | Notes |
| --- | --- | --- | --- | --- |
| Dashboard | Next-action cards/links | Routes to membership, dues continuation, events, feedback, or announcements depending on state. | Mostly | State logic is helpful but could benefit from clearer progress wording. |
| Dashboard | Discover/Join related links | Opens `/membership` or specific club detail. | Yes | Driven by `getStudentNextAction`. |
| Dashboard | Event/announcement cards | Opens events or communications. | Yes | Some cards are clickable without button styling. |
| Discover Clubs | Search field | Filters club directory by name/category/description. | Yes | Good placeholder. |
| Discover Clubs | Interest filter buttons | Filter clubs by interest. | Yes | Many buttons if category list grows. |
| Discover Clubs | Events select | Filters clubs by event availability. | Mostly | "Any event status" may be a little abstract. |
| Discover Clubs | Clear filters | Resets search/category/event filters. | Yes | Also appears in empty state. |
| Discover Clubs | Dismiss recommended clubs | Hides recommendation section for session. | Yes | No easy undo except session reset. |
| Discover Clubs | View Club / Continue Setup | Opens detail/join page or continues dues setup. | Mostly | "View Club" is clear; "Continue Setup" depends on status context. |
| Club detail/join | Back / Back to Discover Clubs | Returns to membership directory. | Yes | Present in focused detail flow. |
| Club detail/join | Share / Copy club invite | Shares/copies club URL. | Mostly | Uses browser share/copy; may be hidden in cards. |
| Club detail/join | Website / social links | Opens external club links. | Yes | Depends on club data. |
| Club detail/join | Join Club / Submit Join Request | Submits membership request with payment details. | Yes | Core CTA. |
| Club detail/join | Upload dues proof | Opens file picker and uploads receipt to storage. | Yes | File validation exists. |
| Club detail/join | Submit/Update Payment Confirmation | Sends receipt/account/date/note for review. | Mostly | The flow mixes joining and payment proof in one page. |
| Events | View Details | Opens event detail modal. | Yes | Present per event. |
| Events | Share Event | Shares/copies event invite. | Yes | Useful for students. |
| Events | RSVP | Sets RSVP to going from card. | Yes | Mutates to `going`. |
| Events detail | Going / Interested / Not Going | Sets RSVP status. | Yes | Disabled when RSVP closed. |
| Events | Check In | Self check-in when event is happening today. | Yes | Only visible when available. |
| Events | Check In with QR | Opens check-in route. | Mostly | Label may confuse because it is a link to QR flow, not scanner UI. |
| QR Check-in | View Events | Returns to events after success/error/unavailable states. | Yes | Only action on state cards. |
| Communications | Announcements / Feedback tab buttons | Switch hub tab. | Mostly | Implemented by button state, not URL tabs except default route. |
| Communications | Mark all read | Marks all announcements read. | Yes | Disabled when none unread. |
| Communications | All / Unread / High/Urgent / Club updates | Announcement filters. | Yes | High/Urgent currently filters only high priority in API call, urgent count includes both. |
| Communications | Mark as read | Marks one announcement read. | Yes | Clear. |
| Feedback | Category, Impact, Completion, Contact selects | Structured feedback metadata. | Yes | Many fields for a feedback form. |
| Feedback | Submit Feedback | Sends app feedback. | Yes | Clear; success toast exists. |
| Notifications | Enable/Disable on this device | Registers/removes browser push subscription. | Yes | Copy clarifies not SMS/WhatsApp. |
| Notifications | All / Action needed / category filters | Filters notification list. | Yes | Student proposal filter is hidden. |
| Notifications | Notification cards | Navigate to target area when linkable. | Mostly | Whole card is clickable with only arrow affordance. |
| Notifications | Open | Opens communications from latest announcements side card. | Yes | Simple. |
| Notifications | Mark read | Marks preview announcement read. | Yes | Clear. |

### Role: Advisor

| Page | Button/Action | What It Does | Is It Clear? | Notes |
| --- | --- | --- | --- | --- |
| Dashboard | Pending approval cards | Route to proposal detail/approvals. | Mostly | Depends on card affordance. |
| Dashboard | Event/report/feedback cards | Navigate to `/events`, `/archive`, `/feedback`. | Mostly | Advisor feedback page is submit-only, despite onboarding text saying "review and send feedback." |
| Pending Approvals | Remarks textarea | Adds optional review remarks. | Mostly | Placeholder says add remarks before approving/rejecting, but not required. |
| Pending Approvals | View details | Opens proposal detail. | Yes | Clear. |
| Pending Approvals | Approve | Sends advisor approval. | Yes | No confirmation dialog. |
| Pending Approvals | Reject | Sends advisor rejection. | Yes | No confirmation dialog and remarks are optional. |
| Proposal detail | Back | Returns to previous page. | Yes | Clear. |
| Events | View Details | Opens event details. | Yes | Same as other non-student roles. |
| Events | Share Event | Shares/copies event invite. | Yes | Available broadly. |
| Events | View proposal | Opens proposal detail if role can view. | Yes | Advisor can open. |
| Communications | Mark all read / filters / Mark as read | Announcement reading workflow. | Yes | Same as student. |
| Feedback | Submit Feedback | Sends app feedback. | Yes | Advisor cannot actually review feedback inbox. |
| Reports Archive | Download Report | Downloads event report PDF. | Yes | Clear. |
| Reports Archive | Download Images | Downloads report media ZIP. | Yes | Clear. |
| Reports Archive | View Media | Opens first media URL in new tab. | Yes | Only first media has direct view button. |
| Notifications | Push controls, filters, notification card links, Open, Mark read | Manage notifications and route to target workflows. | Mostly | Feedback notifications can route to feedback page but advisor has submit-only page. |

### Role: President

| Page | Button/Action | What It Does | Is It Clear? | Notes |
| --- | --- | --- | --- | --- |
| Dashboard | New proposal | Opens proposal creation wizard. | Yes | Clear primary action. |
| Dashboard | Needs Attention / Upcoming Events / Members / Reports cards | Navigate to relevant work queues. | Mostly | Some are cards, some are buttons; mixed affordance. |
| Dashboard | View all / Open tasks | Opens proposals/tasks. | Yes | Clear. |
| Dashboard | Create announcement | Opens communications. | Mostly | Does not deep-open/create form specifically; user lands on page. |
| Dashboard | Create event | Opens new proposal. | Potentially confusing | Event creation is really proposal creation. |
| Dashboard | Create proposal | Opens new proposal. | Yes | Duplicate destination with "Create event". |
| Dashboard | Assign task | Opens task page. | Yes | Clear. |
| Dashboard | View members | Opens member database. | Yes | Clear. |
| Dashboard | View reports | Opens archive. | Yes | Clear. |
| Club Profile | Edit Club | Opens focused editor. | Yes | President sees only assigned/manageable clubs from API. |
| Club Profile | Back to clubs | Returns from focused edit to list. | Yes | Clear. |
| Club Profile | Category buttons | Toggle up to five interest categories. | Mostly | No visible max warning until silently sliced. |
| Club Profile | Club logo / Add gallery image file inputs | Select images for upload. | Yes | File validation exists. |
| Club Profile | Save Changes | Updates club public profile. | Yes | Clear. |
| Proposals | Create Proposal | Opens new proposal wizard. | Yes | Clear. |
| Proposals | Proposal title link | Opens detail. | Yes | Clear. |
| Proposals | Action button: Edit Draft / Revise / View | Opens edit wizard for editable statuses or detail otherwise. | Mostly | Label comes from workflow helper and is good, but behavior changes by status. |
| New Proposal | Step indicator | Shows wizard progress. | Yes | Visual only; not clickable. |
| New Proposal | Add Item | Adds budget line. | Yes | Clear. |
| New Proposal | Trash budget/member icon | Removes a line/member. | Mostly | Icon-only no visible text. |
| New Proposal | Add Member | Adds responsible member. | Yes | Clear. |
| New Proposal | Back | Moves to previous wizard step. | Yes | Clear. |
| New Proposal | Save Draft | Saves proposal as draft. | Yes | Clear. |
| New Proposal | Continue | Moves to next wizard step. | Yes | Clear. |
| New Proposal | Submit Proposal / Save Changes | Sends proposal for advisor review or saves edit. | Yes | Clear. |
| Proposal Detail | Back | Returns to previous page. | Yes | Clear. |
| Proposal Detail | Edit Draft / Revise Proposal | Opens proposal edit wizard. | Yes | Clear. |
| Proposal Detail | Submit for Advisor Review | Resubmits rejected/draft proposal. | Yes | Clear. |
| Tasks | Assign Task | Creates executive task. | Yes | Clear. |
| Tasks | Executive select | Chooses assignee from president dashboard executive team. | Yes | Empty list state not very explicit in form. |
| Tasks | Priority select | Sets low/medium/high. | Yes | Clear. |
| Tasks | Task status select | Updates status for a task. | Mostly | Presidents can update statuses too, which may be unexpected if executives own progress. |
| Members | Club role select | Change member/executive role. | Mostly | President cannot assign president; can only choose member/executive. |
| Communications | Create announcement form submit | Sends club-scoped or club-role announcement. | Mostly | Label appears as "Send Announcement" through pending state text in form area. |
| Communications | Audience select | President limited to club/role targeting. | Mostly | Help text explains but target limitation is subtle. |
| Communications | Mark all read / filters / Mark as read | Announcement reading workflow. | Yes | Clear. |
| Events | Show Event QR | Opens QR dialog for check-in. | Yes | Clear for organizers. |
| Event QR dialog | Copy Link | Copies check-in link. | Yes | Clear. |
| Event QR dialog | Print QR | Prints QR sheet. | Yes | Disabled until generated. |
| Events | Mark attended | Manually marks RSVP attendee as attended. | Yes | Clear. |
| Events | View proposal | Opens proposal detail. | Yes | Clear. |
| Reports Archive | Select event | Chooses approved event needing report. | Yes | Clear. |
| Reports Archive | Upload Event Images | Adds event media images. | Yes | Disabled until event selected. |
| Reports Archive | Remove | Removes uploaded image from draft. | Yes | Clear. |
| Reports Archive | Save Draft | Stores report draft in local storage. | Yes | Device-local only; copy explains. |
| Reports Archive | Submit Report | Creates event report. | Yes | Clear. |
| Reports Archive | Download Report / Download Images / View Media | Download or open archived materials. | Yes | Clear. |
| Feedback | Submit Feedback | Sends app feedback. | Yes | Clear. |
| Notifications | Push controls, filters, linked cards, Open, Mark read | Manage notifications. | Mostly | Whole-card links need stronger affordance. |

### Role: Executive

| Page | Button/Action | What It Does | Is It Clear? | Notes |
| --- | --- | --- | --- | --- |
| Dashboard | Task cards | Navigate to tasks or show assigned work. | Mostly | Task-focused dashboard is appropriate. |
| Dashboard | Send Feedback | Opens `/feedback`. | Yes | E2E test checks this. |
| My Tasks | Task status select | Updates assigned task status. | Yes | Core executive action. |
| Announcements | Mark all read / filters / Mark as read | Announcement reading workflow. | Yes | Clear. |
| Events | View Details | Opens event detail dialog. | Yes | Clear. |
| Events | Share Event | Shares/copies event link. | Yes | Clear. |
| Discover Clubs | Same as Student discover/join buttons | Executive can access student membership flow if opened. | Unclear | Not in sidebar; product intent is ambiguous. |
| Members | Role/status badges only | View-only member database if opened. | Mostly | Not in sidebar; access may surprise executives. |
| Feedback | Submit Feedback | Sends app feedback. | Yes | Clear. |
| Notifications | Push controls, filters, card links, Open, Mark read | Manage notifications. | Yes | Same as other roles. |

### Role: Admin

| Page | Button/Action | What It Does | Is It Clear? | Notes |
| --- | --- | --- | --- | --- |
| Dashboard | Pending action cards / Open queue | Route to final review, membership, dues, archive, tasks. | Mostly | Strong dashboard, but many metrics compete. |
| Dashboard | Club matrix/drilldown links | Opens `/clubs/:clubId/dashboard`. | Mostly | Cards need clear "open" affordance if not styled as buttons. |
| Dashboard | Download performance matrix CSV | Exports admin performance matrix. | Yes | Clear if button visible. |
| Club drilldown | Back to matrix | Returns to dashboard. | Yes | Clear. |
| Club drilldown | View tasks | Opens tasks filtered by club ID. | Yes | Clear. |
| Club drilldown | View members | Opens members route with club ID, but `Members.tsx` does not read URL `club_id`. | No | Link suggests filtered view, but page uses local state only. |
| Club drilldown | Download Performance | Exports club performance PDF. | Yes | Clear. |
| Analytics | 7 days / 30 days / 90 days | Changes analytics date range. | Yes | Clear segmented buttons. |
| User Management | Search name or ID | Filters user directory. | Yes | Clear. |
| User Management | Role / Club / Requested role selects | Filter user directory. | Yes | Clear. |
| User Management | Manage Access | Opens focused access editor for user. | Yes | Clear. |
| User editor | Close | Closes editor. | Yes | Clear. |
| User editor | New role select | Sets local Clubly role. | Yes | Clear. |
| User editor | Club select | Assigns club context. | Yes | Disabled submit enforces required club for leadership roles. |
| User editor | Assign Advisor / Update Role | Saves local role/advisor assignment. | Yes | Clear. |
| President replacement dialog | Cancel / Confirm Replacement | Cancels or replaces current president. | Yes | Good confirmation copy. |
| Clubs | Add Club | Creates a new club. | Yes | Clear. |
| Clubs | Edit Club | Opens focused club editor. | Yes | Clear. |
| Clubs | Delete Club | Opens delete confirmation. | Yes | Clear destructive styling. |
| Clubs delete dialog | Cancel / Delete Club | Cancels or deletes club. | Yes | Clear. |
| Clubs | Show in Discover Clubs switch | Toggles public signup visibility. | Mostly | Good label. |
| Clubs | Category buttons | Toggle categories. | Mostly | Same max-five hidden behavior. |
| Final Review | Status select | Filters proposals by status. | Yes | Clear. |
| Final Review | View | Opens proposal detail. | Yes | Clear. |
| Proposal Detail | Approve Proposal | Approves proposal and creates event/reminders. | Yes | Clear. |
| Proposal Detail | Reject | Rejects final review. | Mostly | Remarks optional; no confirmation dialog. |
| Proposal Detail | Approve Rejected Proposal | Overrides previous rejection with required remarks and confirmation. | Yes | Good safety. |
| Membership Review | Club select | Filters join requests by club. | Yes | Clear. |
| Membership Review | Status select | Filters requests. | Yes | Clear. |
| Membership Review | No direct verify button | Shows next-step guidance to dues page. | Unclear | Users might expect approve/reject here. |
| Members | Club filter | Filters member table by selected club. | Yes | Clear. |
| Members | Club role select | Changes member role; can assign president. | Mostly | President replacement handled, but role change is immediate. |
| Members | Membership status select | Changes active/inactive. | Mostly | No confirmation for deactivation. |
| Dues | View Proof | Opens full proof review page. | Yes | Clear. |
| Dues | Club/status filters | Filter ledger. | Yes | Clear. |
| Dues | Apply to all clubs | Saves shared payment profile across clubs. | Mostly | Very broad action; no confirmation dialog. |
| Dues Proof Review | Back to Dues | Returns to dues queue/list. | Yes | Clear. |
| Dues Proof Review | Open Proof | Opens non-image proof in new tab. | Yes | Clear. |
| Dues Proof Review | Verify Payment | Marks dues paid. | Yes | Disabled until proof loaded. |
| Dues Proof Review | Reject Proof | Marks dues rejected. | Yes | Disabled until proof loaded. |
| Tasks | Club filter | Filters read-only task oversight. | Yes | Clear. |
| Communications | Announcement tab / Feedback tab | Switches between announcements and feedback. | Mostly | Admin has both; tab state not always reflected in URL. |
| Communications | Audience/club/role/priority selects | Configure announcement targeting. | Mostly | Powerful but needs careful copy. |
| Communications | Send Announcement | Creates announcement. | Yes | Clear. |
| Communications | Mark all read / filters / Mark as read | Announcement reading workflow. | Yes | Clear. |
| Feedback inbox | Download CSV | Exports filtered feedback. | Yes | Clear. |
| Feedback inbox | Category / Role / Date / Club filters | Filters feedback list. | Yes | Clear. |
| Events | Today / Upcoming / Past | Filters admin event feed. | Yes | Clear. |
| Events | Show Event QR / Copy Link / Print QR / Mark attended | Attendance management. | Yes | Good operator actions. |
| Reports Archive | Club select | Filters reports by club. | Yes | Clear. |
| Reports Archive | Download Filtered Reports ZIP | Exports all reports matching filter. | Yes | Clear. |
| Reports Archive | Download Report / Download Images / View Media | Exports/open report assets. | Yes | Clear. |
| Feedback | Same feedback inbox actions | View/filter/export app feedback. | Yes | Clear. |
| Notifications | Push controls, filters, card links, Open, Mark read | Manage notifications. | Yes | Clear. |

### Role: Feedback Manager

| Page | Button/Action | What It Does | Is It Clear? | Notes |
| --- | --- | --- | --- | --- |
| Feedback Inbox | Category filter | Filters feedback by API category. | Yes | Clear. |
| Feedback Inbox | Role filter | Filters by role parsed from structured feedback comment. | Mostly | Role is parsed from comment text, not normalized field. |
| Feedback Inbox | Date filter | Filters feedback by created date. | Yes | Clear. |
| Feedback Inbox | Download CSV | Exports visible feedback rows. | Yes | Core action. |
| Notifications | Enable/Disable on this device | Push subscription toggle. | Yes | Clear. |
| Notifications | All / Action needed / category filters | Filters notifications. | Yes | Clear. |
| Notifications | Notification cards | Navigate to target areas when linkable. | Mostly | Feedback manager is redirected away from non-feedback/non-notification routes. |
| Notifications | Open | Opens communications. | Potentially confusing | For feedback_manager, protected route redirects `/communications` to `/feedback`; button says "Open" without saying feedback. |
| Notifications | Mark read | Marks preview announcement read. | Yes | Clear. |

## 4. User Flow Summary

### Student Flow

1. Student logs in and lands on the role-aware dashboard.
2. Student opens Discover Clubs from sidebar or dashboard.
3. Student searches/filters clubs and opens a club detail page.
4. Student enters ID/phone/department/student type/join reason and payment details.
5. Student uploads dues receipt/proof and submits the join request.
6. Student waits for Clubly/admin verification and monitors membership status.
7. Student reads announcements, views approved events, RSVPs, and checks in on event day.
8. Student submits app feedback if something is confusing.

### Advisor Flow

1. Advisor opens dashboard or Pending Approvals.
2. Advisor reviews assigned-club pending proposals.
3. Advisor opens details if needed, enters remarks, approves or rejects.
4. Advisor tracks approved events and reports archive for assigned clubs.
5. Advisor reads announcements and submits app feedback about workflow issues.
6. Advisor monitors notifications for review/update prompts.

### President Flow

1. President lands on club dashboard and reviews pending proposals/tasks/members/events.
2. President maintains club profile and public discovery details.
3. President creates a proposal through the multi-step wizard and submits it for advisor review.
4. President watches proposal status, edits drafts/rejected proposals, and resubmits.
5. President assigns tasks to executives and monitors completion.
6. President manages member roles for active members, especially choosing executives.
7. President creates club announcements and manages approved event attendance/QR tools.
8. President submits post-event reports with media after events.
9. President reads notifications and sends app feedback.

### Executive Flow

1. Executive opens a task-focused dashboard.
2. Executive reads assigned tasks and updates progress/status.
3. Executive follows announcements and event updates.
4. Executive views event details and shares event links if needed.
5. Executive can submit app feedback.
6. If manually navigating, executive can also use the student-style membership flow and view members, though this is not advertised in navigation.

### Admin Flow

1. Admin opens operations dashboard for global Clubly health.
2. Admin reviews pending final proposals and makes final approve/reject decisions.
3. Admin manages users, local roles, advisor assignments, presidents/executives, clubs, and member status.
4. Admin reviews membership requests but verifies actual dues through the dues proof review page.
5. Admin manages shared dues payment profile and verifies/rejects submitted receipts.
6. Admin creates global/club/role announcements.
7. Admin reviews events, QR/attendance tools, reports/media, analytics, feedback, and per-club drilldowns.
8. Admin exports CSV/PDF/ZIP reports for operational review.

### Feedback Manager Flow

1. Feedback Manager signs in and is redirected to `/feedback`.
2. Feedback Manager filters app feedback by category, role, and date.
3. Feedback Manager reads structured feedback details and exports CSV as needed.
4. Feedback Manager can open notifications and manage optional browser push alerts.
5. Any attempt to open other protected Clubly pages redirects back to feedback.

## 5. Friction and Confusion Points

| Role | Page | Problem | Why It Matters | Suggested Fix |
| --- | --- | --- | --- | --- |
| Student | Club join/detail | Join and dues proof upload are tightly combined, with many fields before submission. | Students may not understand whether they are joining first or paying first. | Split into explicit steps: profile details, payment instructions, proof upload, review status. |
| Student | Club join/detail | Dues state labels such as "Required, proof not uploaded" and "Payment Under Review" appear across cards and status areas. | Repeated status wording can feel like multiple separate tasks. | Add one unified progress tracker with a single next action. |
| Student | Events | "Check In with QR" may imply scanning a QR, but it opens the QR check-in route. | Students may expect camera/scanner behavior. | Rename to "Open Check-in Link" or reserve QR language for organizer QR display. |
| Student | Feedback | Feedback form asks many structured fields, including rating, goal, completion, issue, suggestion, contact permission. | Students may abandon feedback for small issues. | Provide a short mode with category + issue, and advanced optional details. |
| Advisor | Feedback | Guided onboarding says "Review and send feedback", but advisor page only allows sending app feedback, not reviewing feedback. | Role expectation mismatch. | Change onboarding/nav copy to "Send workflow feedback" or allow advisor feedback review if intended. |
| Advisor | Approvals | Reject/Approve actions do not require remarks or confirmation. | Mistaken decisions can advance/reject proposals without rationale. | Require remarks for rejection and add a lightweight confirmation. |
| President | Dashboard | "Create event" and "Create proposal" both route to `/proposals/new`. | Users may think events and proposals are different creation workflows. | Use one label, for example "Create Event Proposal", or deep-link to an event-focused first step. |
| President | New Proposal | Wizard has many fields, budget lines, responsible members, duration validation, local autosave, and review page. | High cognitive load for first-time presidents. | Add section-level required markers, inline validation summary, and optional budget/team collapses. |
| President | Members | Presidents can update task statuses and member roles quickly with no confirmation. | Accidental role/status changes affect access. | Add confirmation or undo toast for role changes and distinguish "assign executive" as a guided action. |
| President | Reports Archive | Report draft is local-only. | President may think draft is saved to Clubly and accessible elsewhere. | Make "Save Draft" copy explicit in button or add a warning badge "This device only". |
| Executive | Membership/Members | Executive can access membership and member views if manually navigated, though not in sidebar. | Hidden access may cause role confusion and inconsistent training. | Decide whether executive membership/member access is intentional; either add nav or restrict with clearer state. |
| Admin | Dashboard | Many metrics, pending actions, matrices, exports, drilldowns compete for attention. | Admins may miss the highest-priority queue. | Add a prioritized "Today" queue at top with 3-5 action cards. |
| Admin | Club drilldown | "View members" links to `/members?club_id=...`, but `Members.tsx` does not read `club_id` from URL. | Link appears filtered but likely opens default all-club view. | Make `Members.tsx` initialize `memberClubFilter` from search params. |
| Admin | Membership Review | Page says join requests are reviewed there, but actual verification happens on Dues page. | Admins may hunt for approve/reject buttons. | Add a direct "Open dues proof" CTA per request when payment exists. |
| Admin | Dues | "Apply to all clubs" is broad and has no confirmation dialog. | Accidental global payment profile changes have wide impact. | Add confirmation dialog showing affected club count. |
| Admin | Proposal Detail | Final rejection does not require remarks or confirmation. | Clubs may receive unclear rejection. | Require remarks for rejection and show confirmation. |
| Feedback Manager | Notifications | Notification cards can route to unsupported pages, then ProtectedRoutes redirects to `/feedback`. | Feels broken if a notification appears clickable but returns to same page. | Filter/link feedback-manager notifications only to `/feedback` or `/notifications`. |
| Feedback Manager | Feedback Inbox | Role filter depends on parsing "Role:" from comment body. | Inconsistent or legacy comments may be "unknown". | Store submitter role as a first-class backend field. |
| All | App shell mobile | Desktop sidebar is hidden at max-width 920px, while header uses `SidebarTrigger`. | If mobile sidebar behavior depends on hidden sidebar implementation, navigation could be hard to discover. | Verify mobile sidebar visibility and provide a reliable bottom/nav drawer pattern. |
| All | Restricted routes | Many routes are globally registered and rely on page-level restricted states. | Users may see pages they cannot use through deep links/notifications. | Centralize route-level role guards or normalize restricted pages with consistent copy. |

## 6. Missing or Weak UX States

| Page | Missing/Weak State | Current Behavior | Recommended Improvement |
| --- | --- | --- | --- |
| `App.tsx` protected loading | Long loading delay | `ClublyLoadingState` shows delayed network message after 8s. | Good base; add retry/sign-out action after sustained failure. |
| `Membership.tsx` join flow | Upload progress and failed upload recovery | Proof upload state exists, but the multi-step state can be hard to inspect from the truncated component. | Show upload progress, filename, retry, and clear "uploaded successfully" state inline. |
| `Membership.tsx` recommendations | Dismissed recommendations | Dismiss stores session flag with no visible undo. | Add "Show recommendations again" when filters are clear. |
| `EventCalendar.tsx` event engagement | RSVP loading | Buttons disable during mutation, but individual optimistic state is minimal. | Show per-button spinner or "Saving RSVP..." on selected button. |
| `EventCalendar.tsx` QR dialog | QR generation failure | Shows generic "could not prepare QR yet." | Add retry button and copy-link fallback even if QR render fails. |
| `Approvals.tsx` decisions | Confirmation and validation | Approve/reject immediately submit, remarks optional. | Require rejection note and optionally confirm approve/reject. |
| `ProposalDetail.tsx` admin rejection | Missing required note | Admin rejection can be submitted with empty remarks. | Require rejection remarks; add error text below textarea. |
| `NewProposal.tsx` form validation | Field-level validation summary | Some validation exists for duration; other required fields rely on native required or backend errors. | Add a review-page validation checklist and jump-to-step links. |
| `Tasks.tsx` president form | No executives available | Executive select may be empty if no executive team. | Show explicit empty state: "No active executives; assign one from Members first." |
| `Members.tsx` role/status changes | Disabled/update state granularity | Whole selects disable while mutation is pending. | Disable only the row being updated and show row-level "Saving". |
| `Members.tsx` president replacement | Good confirmation | Dialog exists for president conflict. | Keep; add undo/immediate history link if available. |
| `Dues.tsx` global payment profile | No confirmation for global apply | `Apply to all clubs` immediately mutates. | Add confirmation dialog and show diff from current profile. |
| `DuesProofReview.tsx` proof preview | Proof action blocked until loaded | Verify/reject disabled until proof loads; error text is shown if broken. | Good safety; add "Open Proof" fallback for images too. |
| `Communications.tsx` announcement creation | Target preview | Help text explains targeting, but no recipient count/preview. | Show "This will notify X users/clubs" if backend can provide estimate. |
| `Communications.tsx` feedback inbox | Feedback status workflow | Feedback records are listed but no status/assignment action is visible. | Add status, owner/assignee, and "mark reviewed" if feedback management is intended. |
| `Notifications.tsx` linked cards | Card affordance | Some cards are links with only arrow indicator. | Add explicit "Open" button/link inside each actionable notification. |
| `Clubs.tsx` category limit | Silent max 5 | Uses `.slice(0, 5)` when adding categories. | Show "Maximum 5 categories" helper and disable extra choices. |
| `MediaArchive.tsx` file upload | Uploading multiple files sequentially | Uses upload spinner and success toast. | Add per-file progress/errors and retry/replace controls. |
| `UserManagement.tsx` role changes | Admin cannot grant/remove admin, but warning appears only for current admin users. | Role options exclude admin/feedback_manager. | Add persistent note explaining admin/feedback_manager provisioning source. |
| `AdminClubDashboard.tsx` drilldown links | URL filter mismatch | "View members" passes `club_id` query that member page ignores. | Read `club_id` search param in `Members.tsx`. |
| Restricted pages | Access denied consistency | Each page has its own restricted copy. | Create shared `AccessDenied` component with role, route, and suggested destination. |
| Mobile responsiveness | Needs visual verification | Code uses responsive classes, hidden desktop sidebar, and mobile trigger. | Run mobile screenshots for the highest-traffic roles and fix any nav dead ends. |

## 7. Navigation Review

Student navigation:

- Sidebar items from `studentItems`: Home, Discover Clubs, Events, Announcements, Feedback.
- Student does not get Notifications in sidebar, but `/notifications` exists and is usable.
- Main quick routes are dashboard cards, Discover Clubs filters/cards, event cards, and feedback form.
- Potential issue: no visible sidebar Notifications item even though notifications are a real page and notification counts are handled for other roles.

Advisor navigation:

- Sidebar items: Dashboard, Pending Approvals, Announcements, Events, Reports Archive, Feedback, Notifications.
- The flow is sensible for proposal review and report/event visibility.
- Potential issue: Feedback nav suggests a feedback workflow, but advisor only submits app feedback; they do not review a feedback inbox.

President navigation:

- Sidebar items: Dashboard, Club Profile, Create Proposal, Club Proposals, Task Delegation, Members, Announcements, Events, Reports Archive, Feedback, Notifications.
- This is a lot but maps to real club operations.
- Dashboard quick actions duplicate several nav entries.
- Potential issue: "Create Event" quick action and "Create Proposal" both route to proposal creation; combine or clarify.

Executive navigation:

- Sidebar items: Dashboard, My Tasks, Announcements, Events, Feedback, Notifications.
- Good focused navigation for the narrow executive role.
- Potential issue: executives can manually access `/membership` and `/members`, but these are absent from nav. Product should decide whether this is intentional hidden access or a role leakage.

Admin navigation:

- Sidebar items: Dashboard, Analytics, User Management, Clubs, Final Review, Membership, Members, Tasks, Dues, Announcements, Events, Reports Archive, Feedback, Notifications.
- This is the heaviest menu and may feel overwhelming, but it reflects admin breadth.
- Important actions are sometimes buried: dues proof verification is two clicks deep from Membership Review; per-club drilldown is reachable from dashboard matrix, not sidebar.
- Suggested navigation grouping: Oversight (Dashboard, Analytics), Review Queues (Final Review, Membership, Dues, Reports), People/Clubs (User Management, Clubs, Members), Communications (Announcements, Feedback, Notifications), Operations (Tasks, Events).

Feedback Manager navigation:

- Sidebar items: App Feedback and Notifications only.
- `ProtectedRoutes` enforces this by redirecting every other protected route to `/feedback`.
- Very focused and appropriate.
- Potential issue: notification links can still point toward areas this role cannot use, creating redirect loops or confusing "Open" behavior.

Breadcrumbs:

- No formal breadcrumb system is used across Clubly pages. Some pages have Back buttons (`ProposalDetail`, `DuesProofReview`, focused `Clubs`, focused `UserManagement`, `AdminClubDashboard`).
- Because workflows are multi-step and role-specific, breadcrumbs or "Back to queue" links would help in proposal, dues proof, user edit, and club edit flows.

Tabs:

- `Communications.tsx` uses an internal announcements/feedback tab concept via buttons and route defaults (`/communications` vs `/feedback`).
- The tab state is partially URL-aware through `defaultTab` and `?tab=feedback` checks, but not a full route-per-tab model.

## 8. Priority Improvement List

### Critical

1. Make admin membership-to-dues verification flow direct: add "Open Proof" or "Review Payment" per join request in `Membership.tsx`.
2. Fix `AdminClubDashboard` "View members" filter mismatch by teaching `Members.tsx` to read `club_id` from URL search params.
3. Require remarks for rejection in advisor and admin proposal decisions.
4. Add confirmation dialog for global dues/payment profile "Apply to all clubs".
5. Clarify or restrict Executive access to `/membership` and `/members`.

### Important

1. Rename president dashboard duplicate "Create event" / "Create proposal" actions to one clear "Create Event Proposal" action.
2. Add a unified Student membership progress tracker and one next-action CTA.
3. Improve notification card affordance with explicit open buttons and role-safe targets.
4. Add a shared Access Denied component for all restricted role states.
5. Add empty state for president task assignment when no executives are available.
6. Add category max feedback in `Clubs.tsx`.
7. Make Feedback Manager feedback fields first-class instead of parsing role/impact from comment body.

### Nice to Have

1. Add breadcrumbs/back-to-queue links for proposal detail, dues proof review, user edit, club edit, and admin club drilldown.
2. Add recipient count/target preview for announcements.
3. Add per-file progress for report media and dues proof uploads.
4. Add undo or review history links after member role/status changes.
5. Add a grouped admin sidebar or section headings to reduce menu scanning cost.
6. Add quick "Show recommendations again" after dismissing recommended clubs.

## 9. Files Inspected

Routes and layout:

- `frontend/src/App.tsx`
- `frontend/src/components/AppLayout.tsx`
- `frontend/src/components/AppSidebar.tsx`
- `frontend/src/components/NavLink.tsx`
- `frontend/src/lib/appNavigation.ts`
- `frontend/src/components/GuidedOnboarding.tsx`

Role/auth/permission logic:

- `frontend/src/contexts/AuthContext.tsx`
- `frontend/src/contexts/RoleContext.tsx`
- `frontend/src/lib/roleAccess.ts`
- `backend/src/middleware/auth.js`
- `backend/src/middleware/requireRole.js`
- `backend/src/shared/portalAccess.js`
- `backend/supabase/migrations/0046_feedback_manager_role.sql`

Pages:

- `frontend/src/pages/Dashboard.tsx`
- `frontend/src/pages/Membership.tsx`
- `frontend/src/pages/EventCalendar.tsx`
- `frontend/src/pages/EventCheckIn.tsx`
- `frontend/src/pages/Communications.tsx`
- `frontend/src/pages/Notifications.tsx`
- `frontend/src/pages/Proposals.tsx`
- `frontend/src/pages/ProposalDetail.tsx`
- `frontend/src/pages/NewProposal.tsx`
- `frontend/src/pages/Approvals.tsx`
- `frontend/src/pages/Tasks.tsx`
- `frontend/src/pages/Members.tsx`
- `frontend/src/pages/Dues.tsx`
- `frontend/src/pages/DuesProofReview.tsx`
- `frontend/src/pages/Clubs.tsx`
- `frontend/src/pages/Analytics.tsx`
- `frontend/src/pages/MediaArchive.tsx`
- `frontend/src/pages/AdminClubDashboard.tsx`
- `frontend/src/pages/UserManagement.tsx`

Shared components/helpers:

- `frontend/src/components/Clubly.tsx`
- `frontend/src/components/StatusBadge.tsx`
- `frontend/src/components/ApprovalStepper.tsx`
- `frontend/src/components/DataPagination.tsx`
- `frontend/src/components/NhStudentId.tsx`
- `frontend/src/lib/api.ts`
- `frontend/src/lib/exports.ts`
- `frontend/src/lib/notify.ts`
- `frontend/src/lib/storage.ts`
- `frontend/src/lib/share.ts`
- `frontend/src/lib/proposalWorkflow.ts`
- `frontend/src/lib/eventLifecycle.ts`
- `frontend/src/lib/eventCheckIn.ts`
- `frontend/src/lib/studentActivation.ts`
- `frontend/src/lib/clubDiscovery.ts`
- `frontend/src/lib/publicClubsQuery.ts`
- `frontend/src/lib/proposalDraftStorage.ts`
- `frontend/src/lib/joinFormDraftStorage.ts`

Backend API routes/services checked:

- `backend/src/app.js`
- `backend/src/modules/proposals/proposals.routes.js`
- `backend/src/modules/dashboard/dashboard.routes.js`
- `backend/src/modules/communications/communications.routes.js`
- `backend/src/modules/events/events.routes.js`
- `backend/src/modules/dues/dues.routes.js`
- `backend/src/modules/clubs/clubs.routes.js`
- `backend/src/modules/members/members.routes.js`
- `backend/src/modules/membership-requests/membership-requests.routes.js`
- `backend/src/modules/tasks/tasks.routes.js`
- `backend/src/modules/reports/reports.routes.js`
- `backend/src/modules/notifications/notifications.routes.js`
- `backend/src/modules/admin-users/admin-users.routes.js`
- `backend/src/modules/analytics/analytics.routes.js`

Documentation:

- `README.md`
- `frontend/README.md`
- `backend/README.md`
- `docs/WORKFLOWS.md`
- `docs/PRODUCTION_HANDOFF.md`

Unclear from code:

- Whether executive access to student-style membership and member database screens is intentional product behavior or just allowed by current component conditions.
- Whether advisors are intended to review feedback. Navigation/onboarding copy implies "Review and send feedback", but `Communications.tsx` only gives feedback inbox visibility to admins and feedback managers.
- Whether student notifications should be reachable only by direct route or should appear in student navigation.
- Whether admin `Members` page is intended to support URL `club_id` filtering; drilldown links suggest yes, but the page does not currently initialize from search params.
