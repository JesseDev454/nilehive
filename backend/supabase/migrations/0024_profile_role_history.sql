create table if not exists public.profile_role_history (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  previous_role public.app_role,
  new_role public.app_role not null,
  previous_club_id uuid references public.clubs (id) on delete set null,
  new_club_id uuid references public.clubs (id) on delete set null,
  changed_by uuid not null references public.profiles (id) on delete restrict,
  remarks text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists profile_role_history_profile_id_idx
  on public.profile_role_history (profile_id);

create index if not exists profile_role_history_changed_by_idx
  on public.profile_role_history (changed_by);

create index if not exists profile_role_history_created_at_idx
  on public.profile_role_history (created_at desc);

alter table public.profile_role_history enable row level security;

drop policy if exists profile_role_history_select_admin on public.profile_role_history;
create policy profile_role_history_select_admin
on public.profile_role_history
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);
