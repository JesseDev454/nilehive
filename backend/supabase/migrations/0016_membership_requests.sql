do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'membership_request_status'
  ) then
    create type public.membership_request_status as enum (
      'pending',
      'approved_pending_dues',
      'active',
      'rejected',
      'cancelled'
    );
  end if;
end
$$;

create table if not exists public.membership_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  club_id uuid not null references public.clubs (id) on delete cascade,
  requested_role public.club_member_role not null default 'member',
  status public.membership_request_status not null default 'pending',
  remarks text,
  decision_remarks text,
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  member_id uuid references public.club_members (id) on delete set null,
  due_payment_id uuid references public.due_payments (id) on delete set null,
  dues_amount numeric(12, 2) check (dues_amount is null or dues_amount >= 0),
  academic_session text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists membership_requests_one_open_per_profile_club
  on public.membership_requests (profile_id, club_id)
  where status in ('pending', 'approved_pending_dues', 'active');

create index if not exists membership_requests_profile_id_idx on public.membership_requests (profile_id);
create index if not exists membership_requests_club_id_idx on public.membership_requests (club_id);
create index if not exists membership_requests_status_idx on public.membership_requests (status);

drop trigger if exists membership_requests_set_updated_at on public.membership_requests;
create trigger membership_requests_set_updated_at
before update on public.membership_requests
for each row
execute function public.set_updated_at();

alter table public.membership_requests enable row level security;

drop policy if exists membership_requests_select_visible on public.membership_requests;
create policy membership_requests_select_visible
on public.membership_requests
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
          p.club_id = membership_requests.club_id
          and p.role = 'president'
        )
      )
  )
);

drop policy if exists membership_requests_insert_own_student on public.membership_requests;
create policy membership_requests_insert_own_student
on public.membership_requests
for insert
with check (
  profile_id = auth.uid()
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'student'
  )
);
