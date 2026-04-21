do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'leadership_application_status'
  ) then
    create type public.leadership_application_status as enum (
      'pending',
      'needs_more_info',
      'approved',
      'rejected',
      'cancelled'
    );
  end if;
end
$$;

create table if not exists public.leadership_applications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  club_id uuid not null references public.clubs (id) on delete cascade,
  current_app_role public.app_role not null,
  requested_role public.app_role not null,
  status public.leadership_application_status not null default 'pending',
  reason text not null,
  experience text,
  goals text,
  availability text,
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  decision_remarks text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint leadership_applications_requested_role_check
    check (requested_role::text in ('executive', 'president')),
  constraint leadership_applications_status_reason_check
    check (char_length(btrim(reason)) >= 20)
);

create unique index if not exists leadership_applications_one_open_per_profile_club
  on public.leadership_applications (profile_id, club_id)
  where status in ('pending', 'needs_more_info');

create index if not exists leadership_applications_profile_id_idx
  on public.leadership_applications (profile_id);

create index if not exists leadership_applications_club_id_idx
  on public.leadership_applications (club_id);

create index if not exists leadership_applications_status_idx
  on public.leadership_applications (status);

create index if not exists leadership_applications_requested_role_idx
  on public.leadership_applications (requested_role);

drop trigger if exists leadership_applications_set_updated_at on public.leadership_applications;
create trigger leadership_applications_set_updated_at
before update on public.leadership_applications
for each row
execute function public.set_updated_at();

alter table public.leadership_applications enable row level security;

drop policy if exists leadership_applications_select_visible on public.leadership_applications;
create policy leadership_applications_select_visible
on public.leadership_applications
for select
using (
  profile_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'admin'
        or (
          p.role = 'president'
          and p.club_id = leadership_applications.club_id
        )
      )
  )
);

drop policy if exists leadership_applications_insert_own_active_member on public.leadership_applications;
create policy leadership_applications_insert_own_active_member
on public.leadership_applications
for insert
with check (
  profile_id = auth.uid()
  and exists (
    select 1
    from public.club_members cm
    where cm.profile_id = auth.uid()
      and cm.club_id = leadership_applications.club_id
      and cm.membership_status = 'active'
  )
);
