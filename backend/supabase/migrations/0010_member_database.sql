do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'club_member_role'
  ) then
    create type public.club_member_role as enum ('member', 'executive', 'president');
  end if;

  if not exists (
    select 1
    from pg_type
    where typname = 'membership_status'
  ) then
    create type public.membership_status as enum ('active', 'inactive', 'alumni');
  end if;
end
$$;

create table if not exists public.club_members (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  profile_id uuid references public.profiles (id) on delete set null,
  full_name text not null,
  student_id text not null,
  email text,
  phone_number text,
  club_role public.club_member_role not null default 'member',
  membership_status public.membership_status not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (club_id, student_id)
);

create index if not exists club_members_club_id_idx on public.club_members (club_id);
create index if not exists club_members_profile_id_idx on public.club_members (profile_id);
create index if not exists club_members_club_role_idx on public.club_members (club_role);
create index if not exists club_members_membership_status_idx on public.club_members (membership_status);

drop trigger if exists club_members_set_updated_at on public.club_members;
create trigger club_members_set_updated_at
before update on public.club_members
for each row
execute function public.set_updated_at();

alter table public.club_members enable row level security;

drop policy if exists club_members_select_visible on public.club_members;
create policy club_members_select_visible
on public.club_members
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
          p.club_id = club_members.club_id
          and p.role in ('president', 'executive')
        )
      )
  )
);
