do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'profile_account_status'
  ) then
    create type public.profile_account_status as enum ('pending_onboarding', 'active', 'suspended');
  end if;
end
$$;

alter table public.profiles
  add column if not exists account_status public.profile_account_status not null default 'active';

alter table public.notifications
  add column if not exists read_at timestamptz;

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles (id) on delete restrict,
  entity_type text not null,
  action text not null,
  target_profile_id uuid references public.profiles (id) on delete set null,
  club_id uuid references public.clubs (id) on delete set null,
  proposal_id uuid references public.proposals (id) on delete set null,
  due_payment_id uuid references public.due_payments (id) on delete set null,
  leadership_application_id uuid references public.leadership_applications (id) on delete set null,
  announcement_id uuid references public.announcements (id) on delete set null,
  remarks text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists profiles_role_club_id_idx
  on public.profiles (role, club_id);

create unique index if not exists profiles_active_president_per_club_idx
  on public.profiles (club_id)
  where role = 'president'
    and club_id is not null
    and account_status = 'active';

create index if not exists proposals_club_status_created_at_idx
  on public.proposals (club_id, status, created_at desc);

create index if not exists membership_requests_club_status_requested_role_created_at_idx
  on public.membership_requests (club_id, status, requested_role, created_at desc);

create index if not exists due_payments_club_status_created_at_idx
  on public.due_payments (club_id, status, created_at desc);

create index if not exists tasks_club_assigned_to_status_due_date_idx
  on public.tasks (club_id, assigned_to, status, due_date);

create index if not exists announcements_club_audience_priority_created_at_idx
  on public.announcements (club_id, audience, priority, created_at desc);

create index if not exists announcement_reads_user_announcement_read_at_idx
  on public.announcement_reads (user_id, announcement_id, read_at);

create index if not exists notifications_user_read_at_created_at_idx
  on public.notifications (user_id, read_at, created_at desc);

create index if not exists leadership_applications_club_status_role_profile_created_at_idx
  on public.leadership_applications (club_id, status, requested_role, profile_id, created_at desc);

create unique index if not exists leadership_applications_one_open_per_user_club_idx
  on public.leadership_applications (profile_id, club_id)
  where status in ('pending', 'needs_more_info');

create index if not exists event_attendance_proposal_user_attended_idx
  on public.event_attendance (proposal_id, user_id, attended);

create index if not exists feedback_proposal_submitted_by_created_at_idx
  on public.event_feedback (proposal_id, submitted_by, created_at desc);

create unique index if not exists feedback_one_event_submission_per_user_idx
  on public.event_feedback (proposal_id, submitted_by)
  where proposal_id is not null
    and category = 'event';

create index if not exists audit_logs_actor_id_created_at_idx
  on public.audit_logs (actor_id, created_at desc);

create index if not exists audit_logs_action_created_at_idx
  on public.audit_logs (action, created_at desc);

create index if not exists audit_logs_entity_type_created_at_idx
  on public.audit_logs (entity_type, created_at desc);

alter table public.audit_logs enable row level security;

drop policy if exists audit_logs_admin_select on public.audit_logs;
create policy audit_logs_admin_select
on public.audit_logs
for select
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);
