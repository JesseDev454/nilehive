# NileHive Workflows

This document describes the current product flows that developers are most likely to touch.

## 1. Signup And Sign-In

### Signup

Current local fallback signup is intentionally light:

- full name
- Nile email
- password
- role choice: `student` or `advisor`

What happens:

1. the frontend calls Supabase Auth signup
2. the provisioning trigger creates a minimal `public.profiles` row
3. the user is not assigned to a club at this stage
4. students join clubs later from `Discover Clubs`

### Sign-in

In Buildathon production, Campus One owns sign-in and platform roles.

1. the user signs in through Campus One
2. the auth context restores the shared Campus One session if still valid
3. the profile loads from `public.profiles`
4. the app resolves both:
   - the Campus One platform role: `student`, `staff`, or `admin`
   - the NileHive app role: `student`, `executive`, `president`, or `advisor`
5. the app routes the user into the correct role-aware experience

## 2. Discover Clubs And Join Request

This is the current student onboarding flow after account creation.

1. the student opens `Discover Clubs`
2. the student browses club descriptions
3. the student opens one club’s join page
4. the student fills the club-specific form
5. the student uploads receipt proof
6. the request is submitted for review

The join form currently captures:

- student ID if available
- phone number
- department
- student type
- join reason
- payment account name
- payment reference
- payment date if provided
- receipt upload

## 3. Dues Review And Membership Activation

1. the join request creates dues-linked review records
2. presidents and admins review submitted payment details
3. dues are marked approved or rejected
4. approved dues support active club membership

The goal is low manual overhead for presidents:

- they review and confirm
- they do not create each dues record by hand

## 4. Proposal Workflow

1. a president submits a proposal
2. advisor review happens next
3. admin performs final Club Services review
4. approved proposals become visible as events

Important behavior:

- presidents can view proposal details for their club scope
- submitters should not be able to approve their own work

## 5. Events Workflow

1. approved proposals surface in the Events experience
2. users can view upcoming and past approved events
3. reminders, attendance, and related activity continue from there
4. post-event reporting closes the loop for completed events

## 6. Role Assignment

NileHive now uses two layers of roles:

- platform role from Campus One: `student`, `staff`, `admin`
- local NileHive app role: `student`, `executive`, `president`, `advisor`

Important rules:

- Campus One admins become NileHive admins automatically
- NileHive does not assign admin access locally anymore
- Campus One staff do not automatically become advisors
- advisor access requires both:
  - Campus One `staff` or `admin`
  - a local NileHive advisor assignment
- presidents and executives remain club-specific NileHive roles
- unassigned Campus One staff should see an access-pending state instead of the student experience

### Admin

- comes from the Campus One `admin` role
- manages global users, club assignments, and final approvals
- can assign or update local leadership roles except admin

### President

- oversees club proposals, dues review, and executive operations for one club

### Executive

- supports club operations with narrower access than presidents

### Advisor

- requires Campus One `staff` or `admin` plus a local advisor assignment
- reviews proposals and advisor-relevant club work

### Student

- signs up, joins clubs, tracks requests, and sees approved events

## 7. Files Worth Checking When A Workflow Changes

Signup and auth:

- `frontend/src/pages/SignUp.tsx`
- `frontend/src/contexts/AuthContext.tsx`
- `backend/supabase/migrations/0041_slim_signup_no_club_join.sql`

Discover Clubs and membership:

- `frontend/src/pages/Membership.tsx`
- `backend/src/modules/membership-requests/`
- `backend/src/modules/dues/`

Proposals and events:

- `frontend/src/pages/ProposalDetail.tsx`
- `frontend/src/pages/EventCalendar.tsx`
- `backend/src/modules/proposals/`
- `backend/src/modules/events/`
