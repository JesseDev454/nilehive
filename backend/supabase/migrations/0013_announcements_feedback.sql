create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references public.clubs (id) on delete cascade,
  created_by uuid not null references public.profiles (id) on delete restrict,
  title text not null,
  message text not null,
  audience text not null default 'club' check (audience in ('all', 'club')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (
    (audience = 'all' and club_id is null)
    or (audience = 'club' and club_id is not null)
  )
);

create index if not exists announcements_club_id_idx on public.announcements (club_id);
create index if not exists announcements_created_by_idx on public.announcements (created_by);
create index if not exists announcements_audience_idx on public.announcements (audience);
create index if not exists announcements_created_at_idx on public.announcements (created_at);

drop trigger if exists announcements_set_updated_at on public.announcements;
create trigger announcements_set_updated_at
before update on public.announcements
for each row
execute function public.set_updated_at();

alter table public.announcements enable row level security;

drop policy if exists announcements_select_visible on public.announcements;
create policy announcements_select_visible
on public.announcements
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'admin'
        or announcements.audience = 'all'
        or (
          announcements.audience = 'club'
          and p.club_id = announcements.club_id
        )
      )
  )
  or exists (
    select 1
    from public.clubs c
    where c.id = announcements.club_id
      and c.advisor_id = auth.uid()
  )
);

drop policy if exists announcements_insert_allowed on public.announcements;
create policy announcements_insert_allowed
on public.announcements
for insert
with check (
  created_by = auth.uid()
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'admin'
        or (
          p.role in ('president', 'executive')
          and announcements.audience = 'club'
          and p.club_id = announcements.club_id
        )
      )
  )
);

create table if not exists public.event_feedback (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  proposal_id uuid references public.proposals (id) on delete set null,
  submitted_by uuid not null references public.profiles (id) on delete restrict,
  category text not null default 'general' check (category in ('general', 'event', 'club')),
  rating integer check (rating between 1 and 5),
  comment text not null,
  status text not null default 'open' check (status in ('open', 'reviewed', 'archived')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists event_feedback_club_id_idx on public.event_feedback (club_id);
create index if not exists event_feedback_proposal_id_idx on public.event_feedback (proposal_id);
create index if not exists event_feedback_submitted_by_idx on public.event_feedback (submitted_by);
create index if not exists event_feedback_status_idx on public.event_feedback (status);
create index if not exists event_feedback_created_at_idx on public.event_feedback (created_at);

drop trigger if exists event_feedback_set_updated_at on public.event_feedback;
create trigger event_feedback_set_updated_at
before update on public.event_feedback
for each row
execute function public.set_updated_at();

alter table public.event_feedback enable row level security;

drop policy if exists event_feedback_select_visible on public.event_feedback;
create policy event_feedback_select_visible
on public.event_feedback
for select
using (
  submitted_by = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'admin'
        or (
          p.club_id = event_feedback.club_id
          and p.role in ('president', 'executive')
        )
      )
  )
  or exists (
    select 1
    from public.clubs c
    where c.id = event_feedback.club_id
      and c.advisor_id = auth.uid()
  )
);

drop policy if exists event_feedback_insert_own_club on public.event_feedback;
create policy event_feedback_insert_own_club
on public.event_feedback
for insert
with check (
  submitted_by = auth.uid()
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.club_id = event_feedback.club_id
  )
);
