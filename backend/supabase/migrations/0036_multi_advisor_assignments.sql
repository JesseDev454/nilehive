create table if not exists public.club_advisors (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  advisor_profile_id uuid not null references public.profiles (id) on delete cascade,
  assigned_by uuid references public.profiles (id) on delete set null,
  remarks text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (club_id, advisor_profile_id)
);

create index if not exists club_advisors_club_id_idx
  on public.club_advisors (club_id);

create index if not exists club_advisors_advisor_profile_id_idx
  on public.club_advisors (advisor_profile_id);

insert into public.club_advisors (club_id, advisor_profile_id, remarks)
select id, advisor_id, 'Migrated from legacy clubs.advisor_id'
from public.clubs
where advisor_id is not null
on conflict (club_id, advisor_profile_id) do nothing;

drop index if exists public.clubs_advisor_id_unique;
