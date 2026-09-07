-- NileHive demo seed for local/presentation environments only.
-- Do not run this in production. It creates predictable auth.users records
-- with the password: password123

with seed_users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) as (
  values
    ('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'authenticated', 'authenticated', 'admin@nilehive.test', crypt('password123', gen_salt('bf')), timezone('utc', now()), '{"provider":"email","providers":["email"]}', '{"full_name":"Club Services Admin"}', timezone('utc', now()), timezone('utc', now()), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'authenticated', 'authenticated', 'president@nilehive.test', crypt('password123', gen_salt('bf')), timezone('utc', now()), '{"provider":"email","providers":["email"]}', '{"full_name":"Tomi President"}', timezone('utc', now()), timezone('utc', now()), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'authenticated', 'authenticated', 'executive@nilehive.test', crypt('password123', gen_salt('bf')), timezone('utc', now()), '{"provider":"email","providers":["email"]}', '{"full_name":"Amina Executive"}', timezone('utc', now()), timezone('utc', now()), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'authenticated', 'authenticated', 'advisor@nilehive.test', crypt('password123', gen_salt('bf')), timezone('utc', now()), '{"provider":"email","providers":["email"]}', '{"full_name":"Daniel Advisor"}', timezone('utc', now()), timezone('utc', now()), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'authenticated', 'authenticated', 'student@nilehive.test', crypt('password123', gen_salt('bf')), timezone('utc', now()), '{"provider":"email","providers":["email"]}', '{"full_name":"Ada Student"}', timezone('utc', now()), timezone('utc', now()), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'authenticated', 'authenticated', 'pending.student@nilehive.test', crypt('password123', gen_salt('bf')), timezone('utc', now()), '{"provider":"email","providers":["email"]}', '{"full_name":"Pending Student"}', timezone('utc', now()), timezone('utc', now()), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', '99999999-9999-9999-9999-999999999999', 'authenticated', 'authenticated', 'dues.student@nilehive.test', crypt('password123', gen_salt('bf')), timezone('utc', now()), '{"provider":"email","providers":["email"]}', '{"full_name":"Dues Student"}', timezone('utc', now()), timezone('utc', now()), '', '', '', '')
)
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
select
  instance_id::uuid,
  id::uuid,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data::jsonb,
  raw_user_meta_data::jsonb,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
from seed_users
where not exists (
  select 1
  from auth.users u
  where u.id = seed_users.id::uuid
    or lower(u.email) = lower(seed_users.email)
);

insert into public.clubs (id, name, description, code)
values
  ('33333333-3333-3333-3333-333333333333', 'Nile Innovators Club', 'Demo club for technology, software projects, and student innovation.', 'NIC'),
  ('33333333-3333-3333-3333-000000000001', 'Nile Book Club', 'Demo club for reading, literature, and discussion.', 'NBC'),
  ('33333333-3333-3333-3333-000000000002', 'Nile Business Club', 'Demo club for business, entrepreneurship, and networking.', 'NBUC')
on conflict (name) do update set
  description = excluded.description,
  code = excluded.code;

update public.clubs
set is_public_signup = false
where name = 'Nile Innovators Club';

drop table if exists pg_temp.demo_seed_club_ids;

create temporary table demo_seed_club_ids on commit drop as
select code, id
from public.clubs
where code in ('NIC', 'NBC', 'NBUC');

drop table if exists pg_temp.demo_seed_actor_roles;

create temporary table demo_seed_actor_roles on commit drop as
select
  case
    when exists (
      select 1
      from public.profiles p
      where p.club_id = (select id from demo_seed_club_ids where code = 'NIC')
        and p.role = 'president'
        and coalesce(p.account_status::text, 'active') = 'active'
        and p.id <> 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid
    )
      then 'executive'::public.app_role
    else 'president'::public.app_role
  end as tomi_profile_role,
  case
    when exists (
      select 1
      from public.profiles p
      where p.club_id = (select id from demo_seed_club_ids where code = 'NIC')
        and p.role = 'president'
        and coalesce(p.account_status::text, 'active') = 'active'
        and p.id <> 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid
    )
      then 'executive'::public.club_member_role
    else 'president'::public.club_member_role
  end as tomi_club_role;

insert into public.profiles (id, full_name, role, club_id, student_id, requested_role, onboarding_status)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Club Services Admin', 'admin', null, null, 'admin', 'complete'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Tomi President', (select tomi_profile_role from demo_seed_actor_roles), (select id from demo_seed_club_ids where code = 'NIC'), '020232255', (select tomi_profile_role from demo_seed_actor_roles), 'complete'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Amina Executive', 'executive', (select id from demo_seed_club_ids where code = 'NIC'), '020303344', 'executive', 'complete'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Daniel Advisor', 'advisor', null, null, 'advisor', 'complete'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Ada Student', 'student', (select id from demo_seed_club_ids where code = 'NIC'), '242124563', 'student', 'complete'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Pending Student', 'student', null, '020303345', 'student', 'complete'),
  ('99999999-9999-9999-9999-999999999999', 'Dues Student', 'student', null, '020303346', 'student', 'complete')
on conflict (id) do update set
  full_name = excluded.full_name,
  role = excluded.role,
  club_id = excluded.club_id,
  student_id = excluded.student_id,
  requested_role = excluded.requested_role,
  onboarding_status = excluded.onboarding_status,
  updated_at = timezone('utc', now());

update public.clubs
set advisor_id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'
where id = (select id from demo_seed_club_ids where code = 'NIC');

with demo_role_history (
  profile_id,
  previous_role,
  new_role,
  previous_club_id,
  new_club_id,
  changed_by,
  remarks
) as (
  values
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, null::public.app_role, 'admin'::public.app_role, null::uuid, null::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Demo seed: admin profile.'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, null::public.app_role, (select tomi_profile_role from demo_seed_actor_roles), null::uuid, (select id from demo_seed_club_ids where code = 'NIC')::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Demo seed: president profile.'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, null::public.app_role, 'executive'::public.app_role, null::uuid, (select id from demo_seed_club_ids where code = 'NIC')::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Demo seed: executive profile.')
)
insert into public.profile_role_history (
  profile_id,
  previous_role,
  new_role,
  previous_club_id,
  new_club_id,
  changed_by,
  remarks
)
select
  profile_id,
  previous_role,
  new_role,
  previous_club_id,
  new_club_id,
  changed_by,
  remarks
from demo_role_history
where not exists (
  select 1
  from public.profile_role_history h
  where h.profile_id = demo_role_history.profile_id
    and h.changed_by = demo_role_history.changed_by
    and h.remarks = demo_role_history.remarks
);

insert into public.club_members (id, club_id, profile_id, full_name, student_id, email, phone_number, club_role, membership_status)
values
  ('12121212-1212-1212-1212-121212121212', (select id from demo_seed_club_ids where code = 'NIC'), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Tomi President', '020232255', 'president@nilehive.test', '08000000001', (select tomi_club_role from demo_seed_actor_roles), 'active'),
  ('13131313-1313-1313-1313-131313131313', (select id from demo_seed_club_ids where code = 'NIC'), 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Amina Executive', '020303344', 'executive@nilehive.test', '08000000002', 'executive', 'active'),
  ('14141414-1414-1414-1414-141414141414', (select id from demo_seed_club_ids where code = 'NIC'), 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Ada Student', '242124563', 'student@nilehive.test', '08000000003', 'member', 'active'),
  ('15151515-1515-1515-1515-151515151515', (select id from demo_seed_club_ids where code = 'NIC'), '99999999-9999-9999-9999-999999999999', 'Dues Student', '020303346', 'dues.student@nilehive.test', '08000000004', 'member', 'inactive')
on conflict (club_id, student_id) do update set
  profile_id = excluded.profile_id,
  full_name = excluded.full_name,
  email = excluded.email,
  phone_number = excluded.phone_number,
  club_role = excluded.club_role,
  membership_status = excluded.membership_status,
  updated_at = timezone('utc', now());

insert into public.proposals (
  id,
  club_id,
  submitted_by,
  title,
  description,
  event_date,
  event_time,
  location,
  status,
  aim_objectives,
  proposed_activity,
  number_of_participants,
  budget_estimate,
  budget_line_items,
  responsible_members,
  submitted_at,
  revision_count,
  advisor_remarks,
  admin_remarks
)
values
  ('50000000-0000-0000-0000-000000000001', (select id from demo_seed_club_ids where code = 'NIC'), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Draft Innovation Workshop', 'Draft planning notes for an innovation workshop.', '2026-06-12', '10:00', 'Innovation Lab', 'draft', 'Introduce students to rapid prototyping.', 'Workshop', 50, 120000, '[{"item":"Materials","quantity":1,"description":"Workshop supplies","amount":120000}]', '[{"name":"Amina Executive","student_id":"020303344","phone_number":"08000000002","position":"Logistics Lead"}]', null, 0, null, null),
  ('50000000-0000-0000-0000-000000000002', (select id from demo_seed_club_ids where code = 'NIC'), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'AI Awareness Seminar', 'Seminar awaiting advisor review.', '2026-06-18', '11:00', 'LT A', 'pending_advisor_review', 'Help members understand responsible AI.', 'Seminar', 100, 250000, '[{"item":"Refreshments","quantity":100,"description":"Light snacks","amount":250000}]', '[{"name":"Amina Executive","student_id":"020303344","phone_number":"08000000002","position":"Operations"}]', timezone('utc', now()), 0, null, null),
  ('50000000-0000-0000-0000-000000000003', (select id from demo_seed_club_ids where code = 'NIC'), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Startup Pitch Night', 'Proposal awaiting final Club Services review.', '2026-06-25', '16:00', 'Auditorium', 'pending_admin_review', 'Give student founders a pitching platform.', 'Pitch night', 150, 500000, '[{"item":"Venue setup","quantity":1,"description":"Stage and media","amount":500000}]', '[{"name":"Amina Executive","student_id":"020303344","phone_number":"08000000002","position":"Executive Support"}]', timezone('utc', now()), 0, 'Recommended for final approval.', null),
  ('50000000-0000-0000-0000-000000000004', (select id from demo_seed_club_ids where code = 'NIC'), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Returned Hackathon Proposal', 'Returned proposal that needs clearer budget justification.', '2026-07-02', '09:00', 'Innovation Lab', 'advisor_rejected', 'Run a student hackathon.', 'Hackathon', 80, 800000, '[{"item":"Internet support","quantity":1,"description":"Dedicated bandwidth","amount":800000}]', '[{"name":"Amina Executive","student_id":"020303344","phone_number":"08000000002","position":"Technical Lead"}]', timezone('utc', now()), 1, 'Please clarify budget items and expected outcomes.', null),
  ('50000000-0000-0000-0000-000000000005', (select id from demo_seed_club_ids where code = 'NIC'), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Completed Innovation Showcase', 'Approved and completed showcase with report submitted.', '2026-03-10', '13:00', 'Main Hall', 'approved', 'Showcase completed student innovation projects.', 'Innovation showcase', 120, 400000, '[{"item":"Media coverage","quantity":1,"description":"Photography and video","amount":400000}]', '[{"name":"Amina Executive","student_id":"020303344","phone_number":"08000000002","position":"Media Lead"}]', timezone('utc', now()), 0, 'Approved by advisor.', 'Approved by Club Services.'),
  ('50000000-0000-0000-0000-000000000006', (select id from demo_seed_club_ids where code = 'NIC'), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Past Approved Event Missing Report', 'Approved event intentionally left without a report for dashboard demo.', '2026-03-20', '14:00', 'LT B', 'approved', 'Create a missing report prompt.', 'Community meetup', 70, 150000, '[{"item":"Refreshments","quantity":70,"description":"Snacks","amount":150000}]', '[{"name":"Amina Executive","student_id":"020303344","phone_number":"08000000002","position":"Coordinator"}]', timezone('utc', now()), 0, 'Approved by advisor.', 'Approved by Club Services.')
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  event_date = excluded.event_date,
  event_time = excluded.event_time,
  location = excluded.location,
  status = excluded.status,
  aim_objectives = excluded.aim_objectives,
  proposed_activity = excluded.proposed_activity,
  number_of_participants = excluded.number_of_participants,
  budget_estimate = excluded.budget_estimate,
  budget_line_items = excluded.budget_line_items,
  responsible_members = excluded.responsible_members,
  advisor_remarks = excluded.advisor_remarks,
  admin_remarks = excluded.admin_remarks,
  updated_at = timezone('utc', now());

with demo_approvals (proposal_id, reviewer_id, reviewer_role, decision, remarks, decided_at) as (
  values
    ('50000000-0000-0000-0000-000000000003'::uuid, 'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, 'advisor'::public.app_role, 'approve'::public.approval_decision, 'Recommended for final approval.', timezone('utc', now()) - interval '2 days'),
    ('50000000-0000-0000-0000-000000000004'::uuid, 'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, 'advisor'::public.app_role, 'reject'::public.approval_decision, 'Please clarify budget items and expected outcomes.', timezone('utc', now()) - interval '1 day'),
    ('50000000-0000-0000-0000-000000000005'::uuid, 'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, 'advisor'::public.app_role, 'approve'::public.approval_decision, 'Approved by advisor.', timezone('utc', now()) - interval '30 days'),
    ('50000000-0000-0000-0000-000000000005'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'admin'::public.app_role, 'approve'::public.approval_decision, 'Approved by Club Services.', timezone('utc', now()) - interval '29 days'),
    ('50000000-0000-0000-0000-000000000006'::uuid, 'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, 'advisor'::public.app_role, 'approve'::public.approval_decision, 'Approved by advisor.', timezone('utc', now()) - interval '25 days'),
    ('50000000-0000-0000-0000-000000000006'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'admin'::public.app_role, 'approve'::public.approval_decision, 'Approved by Club Services.', timezone('utc', now()) - interval '24 days')
)
insert into public.approvals (proposal_id, reviewer_id, reviewer_role, decision, remarks, decided_at)
select proposal_id, reviewer_id, reviewer_role, decision, remarks, decided_at
from demo_approvals
where not exists (
  select 1
  from public.approvals a
  where a.proposal_id = demo_approvals.proposal_id
    and a.reviewer_id = demo_approvals.reviewer_id
    and a.decision = demo_approvals.decision
    and a.remarks = demo_approvals.remarks
);

insert into public.tasks (id, club_id, assigned_by, assigned_to, title, description, priority, status, due_date)
values
  ('60000000-0000-0000-0000-000000000001', (select id from demo_seed_club_ids where code = 'NIC'), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Confirm seminar logistics', 'Check venue, projector, and seating.', 'high', 'pending', '2026-06-15'),
  ('60000000-0000-0000-0000-000000000002', (select id from demo_seed_club_ids where code = 'NIC'), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Prepare social media captions', 'Draft announcement captions for approved events.', 'medium', 'in_progress', '2026-06-10'),
  ('60000000-0000-0000-0000-000000000003', (select id from demo_seed_club_ids where code = 'NIC'), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Submit attendance sheet', 'Upload the attendance summary after the showcase.', 'low', 'completed', '2026-03-11')
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  priority = excluded.priority,
  status = excluded.status,
  due_date = excluded.due_date,
  updated_at = timezone('utc', now());

with demo_task_history (task_id, changed_by, old_status, new_status, remarks) as (
  values
    ('60000000-0000-0000-0000-000000000002'::uuid, 'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, 'pending'::public.task_status, 'in_progress'::public.task_status, 'Started content draft.'),
    ('60000000-0000-0000-0000-000000000003'::uuid, 'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, 'in_progress'::public.task_status, 'completed'::public.task_status, 'Attendance sheet submitted.')
)
insert into public.task_status_history (task_id, changed_by, old_status, new_status, remarks)
select task_id, changed_by, old_status, new_status, remarks
from demo_task_history
where not exists (
  select 1
  from public.task_status_history h
  where h.task_id = demo_task_history.task_id
    and h.changed_by = demo_task_history.changed_by
    and h.new_status = demo_task_history.new_status
    and h.remarks = demo_task_history.remarks
);

insert into public.due_payments (id, club_id, member_id, amount, academic_session, payment_reference, proof_url, status, verified_by, verified_at)
values
  ('70000000-0000-0000-0000-000000000001', (select id from demo_seed_club_ids where code = 'NIC'), '14141414-1414-1414-1414-141414141414', 5000, '2025/2026', 'NIC-PAID-001', 'dues-receipts/33333333-3333-3333-3333-333333333333/eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee/demo-receipt.pdf', 'paid', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', timezone('utc', now()) - interval '10 days'),
  ('70000000-0000-0000-0000-000000000002', (select id from demo_seed_club_ids where code = 'NIC'), '15151515-1515-1515-1515-151515151515', 5000, '2025/2026', 'NIC-SUBMITTED-001', 'dues-receipts/33333333-3333-3333-3333-333333333333/99999999-9999-9999-9999-999999999999/demo-receipt.pdf', 'submitted', null, null),
  ('70000000-0000-0000-0000-000000000003', (select id from demo_seed_club_ids where code = 'NIC'), '13131313-1313-1313-1313-131313131313', 5000, '2025/2026', null, null, 'unpaid', null, null)
on conflict (id) do update set
  payment_reference = excluded.payment_reference,
  proof_url = excluded.proof_url,
  status = excluded.status,
  verified_by = excluded.verified_by,
  verified_at = excluded.verified_at,
  updated_at = timezone('utc', now());

insert into public.membership_requests (id, profile_id, club_id, requested_role, status, remarks, decision_remarks, reviewed_by, reviewed_at, member_id, due_payment_id, dues_amount, academic_session)
values
  ('80000000-0000-0000-0000-000000000001', 'ffffffff-ffff-ffff-ffff-ffffffffffff', (select id from demo_seed_club_ids where code = 'NIC'), 'member', 'pending', 'I want to join the club.', null, null, null, null, null, null, null),
  ('80000000-0000-0000-0000-000000000002', '99999999-9999-9999-9999-999999999999', (select id from demo_seed_club_ids where code = 'NIC'), 'member', 'approved_pending_dues', 'Request approved, dues pending.', 'Pay dues to become active.', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', timezone('utc', now()) - interval '3 days', '15151515-1515-1515-1515-151515151515', '70000000-0000-0000-0000-000000000002', 5000, '2025/2026'),
  ('80000000-0000-0000-0000-000000000003', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', (select id from demo_seed_club_ids where code = 'NIC'), 'member', 'active', 'Active member request.', 'Dues verified.', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', timezone('utc', now()) - interval '15 days', '14141414-1414-1414-1414-141414141414', '70000000-0000-0000-0000-000000000001', 5000, '2025/2026')
on conflict (id) do update set
  status = excluded.status,
  decision_remarks = excluded.decision_remarks,
  reviewed_by = excluded.reviewed_by,
  reviewed_at = excluded.reviewed_at,
  member_id = excluded.member_id,
  due_payment_id = excluded.due_payment_id,
  dues_amount = excluded.dues_amount,
  academic_session = excluded.academic_session,
  updated_at = timezone('utc', now());

insert into public.event_reports (id, proposal_id, club_id, submitted_by, attendance_count, summary, challenges, outcomes, budget_used, media_urls, status, submitted_at)
values
  ('90000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000005', (select id from demo_seed_club_ids where code = 'NIC'), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 95, 'The innovation showcase was completed successfully.', 'Some presenters arrived late.', 'Students demonstrated five working prototypes.', 380000, '["https://example.com/demo-event-photo.jpg"]', 'submitted', timezone('utc', now()) - interval '20 days')
on conflict (proposal_id) do update set
  attendance_count = excluded.attendance_count,
  summary = excluded.summary,
  challenges = excluded.challenges,
  outcomes = excluded.outcomes,
  budget_used = excluded.budget_used,
  media_urls = excluded.media_urls,
  updated_at = timezone('utc', now());

insert into public.announcements (id, club_id, created_by, title, message, audience, priority, target_role)
values
  ('a0000000-0000-0000-0000-000000000001', null, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Club Services deadline reminder', 'All clubs should update their records before Friday.', 'all_users', 'urgent', null),
  ('a0000000-0000-0000-0000-000000000002', (select id from demo_seed_club_ids where code = 'NIC'), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Nile Innovators weekly meeting', 'Executives and members should prepare updates for the weekly meeting.', 'club', 'normal', null),
  ('a0000000-0000-0000-0000-000000000003', (select id from demo_seed_club_ids where code = 'NIC'), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Executive task follow-up', 'Executives should update assigned task progress today.', 'role', 'high', 'executive')
on conflict (id) do update set
  title = excluded.title,
  message = excluded.message,
  audience = excluded.audience,
  priority = excluded.priority,
  target_role = excluded.target_role,
  updated_at = timezone('utc', now());

insert into public.notifications (id, user_id, proposal_id, announcement_id, type, message)
values
  ('b0000000-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '50000000-0000-0000-0000-000000000004', null, 'advisor_rejected', 'Your hackathon proposal was returned by the advisor.'),
  ('b0000000-0000-0000-0000-000000000002', 'cccccccc-cccc-cccc-cccc-cccccccccccc', null, 'a0000000-0000-0000-0000-000000000003', 'announcement_published', 'New executive task follow-up announcement.'),
  ('b0000000-0000-0000-0000-000000000003', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', null, 'a0000000-0000-0000-0000-000000000001', 'announcement_published', 'Club Services deadline reminder.')
on conflict (id) do update set
  message = excluded.message;

insert into public.event_reminders (id, user_id, proposal_id, message, remind_at)
values
  ('c0000000-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '50000000-0000-0000-0000-000000000003', 'Startup Pitch Night is coming up.', '2026-06-20T09:00:00+00'),
  ('c0000000-0000-0000-0000-000000000002', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '50000000-0000-0000-0000-000000000003', 'Support logistics for Startup Pitch Night.', '2026-06-20T09:00:00+00')
on conflict (user_id, proposal_id) do update set
  message = excluded.message,
  remind_at = excluded.remind_at;
