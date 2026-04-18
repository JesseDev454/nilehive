alter table public.announcements
  drop constraint if exists announcements_audience_check;

alter table public.announcements
  drop constraint if exists announcements_check;

alter table public.announcements
  drop constraint if exists announcements_priority_check;

alter table public.announcements
  drop constraint if exists announcements_targeting_check;

alter table public.announcements
  add column if not exists priority text not null default 'normal',
  add column if not exists target_role public.app_role;

update public.announcements
set audience = case
  when audience = 'all' then 'all_users'
  else audience
end;

alter table public.announcements
  add constraint announcements_audience_check
  check (audience in ('all_users', 'all_clubs', 'club', 'role'));

alter table public.announcements
  add constraint announcements_priority_check
  check (priority in ('low', 'normal', 'high', 'urgent'));

alter table public.announcements
  add constraint announcements_targeting_check
  check (
    (audience in ('all_users', 'all_clubs') and club_id is null and target_role is null)
    or (audience = 'club' and club_id is not null and target_role is null)
    or (audience = 'role' and target_role is not null)
  );

create index if not exists announcements_priority_idx on public.announcements (priority);
create index if not exists announcements_target_role_idx on public.announcements (target_role);

create table if not exists public.announcement_reads (
  announcement_id uuid not null references public.announcements (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  read_at timestamptz not null default timezone('utc', now()),
  primary key (announcement_id, user_id)
);

create index if not exists announcement_reads_user_id_idx
  on public.announcement_reads (user_id);

alter table public.announcement_reads enable row level security;

drop policy if exists announcement_reads_select_own on public.announcement_reads;
create policy announcement_reads_select_own
on public.announcement_reads
for select
using (user_id = auth.uid());

drop policy if exists announcement_reads_insert_own on public.announcement_reads;
create policy announcement_reads_insert_own
on public.announcement_reads
for insert
with check (user_id = auth.uid());

do $$
begin
  if exists (
    select 1
    from pg_type
    where typname = 'notification_type'
  ) and not exists (
    select 1
    from pg_enum
    where enumtypid = 'public.notification_type'::regtype
      and enumlabel = 'announcement_published'
  ) then
    alter type public.notification_type add value 'announcement_published';
  end if;
end
$$;

alter table public.notifications
  alter column proposal_id drop not null,
  add column if not exists announcement_id uuid references public.announcements (id) on delete cascade;

create index if not exists notifications_announcement_id_idx
  on public.notifications (announcement_id);
