do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'event_rsvp_status'
  ) then
    create type public.event_rsvp_status as enum ('interested', 'going', 'not_going', 'cancelled');
  end if;
end
$$;

create table if not exists public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals (id) on delete cascade,
  club_id uuid not null references public.clubs (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status public.event_rsvp_status not null default 'going',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (proposal_id, user_id)
);

create table if not exists public.event_attendance (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals (id) on delete cascade,
  club_id uuid not null references public.clubs (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  attended boolean not null default true,
  checked_in_by uuid not null references public.profiles (id) on delete restrict,
  checked_in_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (proposal_id, user_id)
);

create index if not exists event_rsvps_proposal_id_idx on public.event_rsvps (proposal_id);
create index if not exists event_rsvps_club_id_idx on public.event_rsvps (club_id);
create index if not exists event_rsvps_user_id_idx on public.event_rsvps (user_id);
create index if not exists event_rsvps_status_idx on public.event_rsvps (status);

create index if not exists event_attendance_proposal_id_idx on public.event_attendance (proposal_id);
create index if not exists event_attendance_club_id_idx on public.event_attendance (club_id);
create index if not exists event_attendance_user_id_idx on public.event_attendance (user_id);
create index if not exists event_attendance_attended_idx on public.event_attendance (attended);

drop trigger if exists event_rsvps_set_updated_at on public.event_rsvps;
create trigger event_rsvps_set_updated_at
before update on public.event_rsvps
for each row
execute function public.set_updated_at();

drop trigger if exists event_attendance_set_updated_at on public.event_attendance;
create trigger event_attendance_set_updated_at
before update on public.event_attendance
for each row
execute function public.set_updated_at();

alter table public.event_rsvps enable row level security;
alter table public.event_attendance enable row level security;

drop policy if exists event_rsvps_select_visible on public.event_rsvps;
create policy event_rsvps_select_visible
on public.event_rsvps
for select
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'admin'
        or (
          p.club_id = event_rsvps.club_id
          and p.role in ('president', 'executive')
        )
      )
  )
  or exists (
    select 1
    from public.clubs c
    where c.id = event_rsvps.club_id
      and c.advisor_id = auth.uid()
  )
);

drop policy if exists event_rsvps_insert_own_student on public.event_rsvps;
create policy event_rsvps_insert_own_student
on public.event_rsvps
for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'student'
  )
);

drop policy if exists event_rsvps_update_own_student on public.event_rsvps;
create policy event_rsvps_update_own_student
on public.event_rsvps
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists event_attendance_select_visible on public.event_attendance;
create policy event_attendance_select_visible
on public.event_attendance
for select
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'admin'
        or (
          p.club_id = event_attendance.club_id
          and p.role in ('president', 'executive')
        )
      )
  )
  or exists (
    select 1
    from public.clubs c
    where c.id = event_attendance.club_id
      and c.advisor_id = auth.uid()
  )
);

drop policy if exists event_attendance_insert_leaders on public.event_attendance;
create policy event_attendance_insert_leaders
on public.event_attendance
for insert
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'admin'
        or (
          p.club_id = event_attendance.club_id
          and p.role in ('president', 'executive')
        )
      )
  )
);

drop policy if exists event_attendance_update_leaders on public.event_attendance;
create policy event_attendance_update_leaders
on public.event_attendance
for update
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'admin'
        or (
          p.club_id = event_attendance.club_id
          and p.role in ('president', 'executive')
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'admin'
        or (
          p.club_id = event_attendance.club_id
          and p.role in ('president', 'executive')
        )
      )
  )
);
