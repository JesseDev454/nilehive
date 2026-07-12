alter table public.clubs
  add column if not exists skills_offered text[] not null default '{}'::text[],
  add column if not exists career_goals text[] not null default '{}'::text[],
  add column if not exists meeting_windows text[] not null default '{}'::text[],
  add column if not exists weekly_commitment text;

alter table public.clubs
  drop constraint if exists clubs_weekly_commitment_check;
alter table public.clubs
  add constraint clubs_weekly_commitment_check
  check (weekly_commitment is null or weekly_commitment in ('1-2', '3-5', '6+'));

create table if not exists public.student_club_preferences (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  interests text[] not null default '{}'::text[],
  skills text[] not null default '{}'::text[],
  career_goals text[] not null default '{}'::text[],
  availability text[] not null default '{}'::text[],
  weekly_commitment text,
  status text not null default 'completed' check (status in ('completed', 'dismissed')),
  version integer not null default 1,
  completed_at timestamptz,
  dismissed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (weekly_commitment is null or weekly_commitment in ('1-2', '3-5', '6+'))
);

create table if not exists public.campus_one_authorizations (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  access_token_ciphertext text not null,
  refresh_token_ciphertext text,
  scopes text[] not null default '{}'::text[],
  access_token_expires_at timestamptz,
  disconnected_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid not null references public.notifications(id) on delete cascade,
  channel text not null check (channel in ('web_push', 'campus_one')),
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed', 'skipped')),
  attempt_count integer not null default 0,
  external_id text,
  last_error_code text,
  sent_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (notification_id, channel)
);

create index if not exists notification_deliveries_notification_idx
  on public.notification_deliveries(notification_id, channel);

create table if not exists public.campus_one_webhook_events (
  delivery_id text primary key,
  event_type text not null,
  payload jsonb not null,
  status text not null default 'received' check (status in ('received', 'processed', 'ignored', 'failed')),
  occurred_at timestamptz,
  processed_at timestamptz,
  error_code text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.student_club_preferences enable row level security;
alter table public.campus_one_authorizations enable row level security;
alter table public.notification_deliveries enable row level security;
alter table public.campus_one_webhook_events enable row level security;

drop policy if exists student_club_preferences_own_read on public.student_club_preferences;
create policy student_club_preferences_own_read
on public.student_club_preferences for select
using (profile_id = auth.uid());

drop policy if exists student_club_preferences_own_write on public.student_club_preferences;
create policy student_club_preferences_own_write
on public.student_club_preferences for all
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

drop policy if exists notification_deliveries_own_read on public.notification_deliveries;
create policy notification_deliveries_own_read
on public.notification_deliveries for select
using (
  exists (
    select 1 from public.notifications n
    where n.id = notification_deliveries.notification_id
      and n.user_id = auth.uid()
  )
);
