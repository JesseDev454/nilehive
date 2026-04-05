create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'app_role'
  ) then
    create type public.app_role as enum ('executive', 'advisor', 'admin', 'president');
  end if;

  if not exists (
    select 1 from pg_type where typname = 'proposal_status'
  ) then
    create type public.proposal_status as enum ('pending_advisor_review');
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text unique,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role public.app_role not null,
  club_id uuid references public.clubs (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.clubs
  add column if not exists advisor_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'clubs_advisor_id_fkey'
  ) then
    alter table public.clubs
      add constraint clubs_advisor_id_fkey
      foreign key (advisor_id)
      references public.profiles (id)
      on delete set null;
  end if;
end
$$;

create unique index if not exists clubs_advisor_id_unique
  on public.clubs (advisor_id)
  where advisor_id is not null;

create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete restrict,
  submitted_by uuid not null references public.profiles (id) on delete restrict,
  title text not null,
  description text not null,
  event_date date not null,
  location text not null,
  status public.proposal_status not null default 'pending_advisor_review',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_club_id_idx on public.profiles (club_id);
create index if not exists proposals_club_status_idx on public.proposals (club_id, status);
create index if not exists proposals_submitted_by_idx on public.proposals (submitted_by);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists proposals_set_updated_at on public.proposals;
create trigger proposals_set_updated_at
before update on public.proposals
for each row
execute function public.set_updated_at();

