# Phase 5: Demo Environment and Deterministic Seed Specification

## 1. Overview & Architectural Isolation
To support realistic product showcases, executive walkthroughs, and portfolio screen captures without mutating production data or introducing test artifacts into live environments, OneClub utilizes an isolated, deterministic demo dataset.

---

## 2. Environment Separation & Security Model

### Authority Model Preservation
- **Campus One Production Authority:** In production and staging, Campus One users obtain OneClub Admin privileges **only** from a global Campus One `admin` portal role or the exact custom role `club_services_admin`. Local profiles cannot self-elevate to Admin.
- **Demo-Only Authentication:** In the isolated demo environment (`APP_ENV=demo`), fictional demo personas authenticate directly via Supabase Auth. The demo admin profile has `portal_role: "admin"` and custom role `["club_services_admin"]`.
- **Fail-Closed Guarantee:** Outside `APP_ENV=demo`, demo authentication pathways and seed scripts immediately abort.

---

## 3. Four-Tier Multi-Layer Safety Guard

The demo seed script (`backend/scripts/demo-seed.js`) executes four mandatory safety checks before executing any DDL or DML:

1. **Environment Identity:**
   - Requires `process.env.APP_ENV === 'demo'`
   - Requires `process.env.ALLOW_DEMO_SEED === 'true'`
2. **Hostname & Project Ref Validation:**
   - Target database URL hostname must match allowlisted patterns (`127.0.0.1`, `localhost`, `::1`, or explicitly configured demo hostnames).
   - Rejects any hostname matching production domains (`nilehive.app`, `campusone.nileuniversity.edu.ng`, unlisted `.supabase.co`).
3. **Positive Demo Database Sentinel:**
   - Queries `public.oneclub_demo_sentinel` where `is_demo_database = true`.
   - If the table does not exist or the sentinel flag is not true, the script immediately aborts with a descriptive error.
   - **Important:** Sentinel records and tables are provisioned only inside the isolated demo database; no production migrations exist for demo sentinels.
4. **Deterministic Personas & Admin Auth API:**
   - Users are created or retrieved through the supported Supabase Admin Auth API (`supabase.auth.admin.createUser` / `supabase.auth.admin.listUsers`).
   - Fixed UUID inserts into `auth.users` are strictly prohibited. Returned user UUIDs are dynamically linked to `public.profiles`.

---

## 4. Fictional Demo Personas

| Persona Key | Full Name | Email | Student / Staff ID | Role | Assigned Club / Entity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `student` | Amina Yusuf | `amina.yusuf@demo.oneclub.internal` | `U22/NAS/CSC/1042` | `student` | Nile Google Developers (Active Member) |
| `president` | Daniel Okafor | `daniel.okafor@demo.oneclub.internal` | `U21/NAS/CSC/0812` | `president` | Nile Google Developers (`NGD`) |
| `executive` | Zainab Musa | `zainab.musa@demo.oneclub.internal` | `U22/NAS/CSC/1105` | `executive` | Nile Google Developers (`NGD`) |
| `advisor` | Dr. Sarah Bello | `sarah.bello@demo.oneclub.internal` | — | `advisor` | Nile Google Developers & Climate Club |
| `admin` | Tobi Adeyemi | `tobi.adeyemi@demo.oneclub.internal` | — | `admin` | OneClub Central Administration |

---

## 5. Connected Multi-Stage Seed Dataset

### Multi-Stage Proposals Connected to Nile Google Developers (`NGD`):
1. **"Annual Nile Innovation & Hackathon 2026"** (`status: approved`) — Upcoming 48-hour hackathon. Appears on Student and Executive calendars. Tracks 6 assigned executive tasks.
2. **"Inter-University Coding Marathon"** (`status: pending_admin_review`) — Passed Advisor review; currently queued in Central Administration's Operations Queue.
3. **"Nile Tech Symposium & Career Fair"** (`status: pending_advisor_review`) — Submitted by President; waiting for Dr. Sarah Bello's review decision.
4. **"Off-Campus Unsanctioned Overnight Trip"** (`status: advisor_rejected`) — Rejection notes recorded by Advisor; demonstrates proposal review history.

### Executive Tasks for Zainab Musa (100% Exact Distribution):
- **Pending (2):** "Finalize event banner & digital badges", "Coordinate speaker lodging & transport"
- **In Progress (3):** "Set up Lab 3 networking & backup power", "Design RSVP QR check-in posters", "Order catering & refreshments"
- **Completed (1):** "Draft initial budget breakdown"
- **Task Summary:** 6 tasks total (33.3% pending, 50.0% in progress, 16.7% completed). All percentages match task records precisely.

---

## 6. Foreign-Key Ordered Scoped Reset

When executing `node scripts/demo-seed.js reset`, records are deleted in strict child-before-parent foreign-key order:
1. `notification_deliveries`
2. `notifications`
3. `push_subscriptions`
4. `event_attendance`
5. `event_rsvps`
6. `event_feedback`
7. `event_reports`
8. `task_status_history`
9. `tasks`
10. `due_payments`
11. `membership_requests`
12. `approvals`
13. `proposals`
14. `announcements`
15. `club_members`
16. `club_advisors` (demo assignments)
17. `public.profiles` (demo persona profiles)
18. `auth.users` (via `supabase.auth.admin.deleteUser(id)`)

The 14 official Nile University clubs and non-demo users remain untouched.

---

## 7. Execution Commands

```bash
# Set required environment variables for isolated demo
export APP_ENV=demo
export ALLOW_DEMO_SEED=true
export DEMO_SUPABASE_URL=http://127.0.0.1:54321
export DEMO_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
export DEMO_AUTH_PASSWORD=YourSecureDemoPassword2026!

# Seed demo dataset
node backend/scripts/demo-seed.js

# Scoped reset demo dataset
node backend/scripts/demo-seed.js reset
```
