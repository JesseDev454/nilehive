create table if not exists public.club_member_status_history (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.club_members (id) on delete cascade,
  club_id uuid not null references public.clubs (id) on delete cascade,
  profile_id uuid references public.profiles (id) on delete set null,
  previous_status public.membership_status,
  new_status public.membership_status not null,
  changed_by uuid references public.profiles (id) on delete set null,
  reason text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists club_member_status_history_member_id_idx
  on public.club_member_status_history (member_id);

create index if not exists club_member_status_history_club_id_idx
  on public.club_member_status_history (club_id);

create index if not exists club_member_status_history_created_at_idx
  on public.club_member_status_history (created_at desc);

alter table public.club_member_status_history enable row level security;

drop policy if exists club_member_status_history_select_visible on public.club_member_status_history;
create policy club_member_status_history_select_visible
on public.club_member_status_history
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
          p.club_id = club_member_status_history.club_id
          and p.role = 'president'
        )
      )
  )
);
