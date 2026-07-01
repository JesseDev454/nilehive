alter table public.clubs
  add column if not exists categories text[] not null default '{}'::text[],
  add column if not exists logo_path text,
  add column if not exists website_url text,
  add column if not exists social_links jsonb not null default '{}'::jsonb;

create table if not exists public.club_media (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  storage_path text not null unique,
  caption text,
  display_order integer not null default 0,
  uploaded_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists club_media_club_order_idx
  on public.club_media(club_id, display_order, created_at);

drop trigger if exists club_media_set_updated_at on public.club_media;
create trigger club_media_set_updated_at
before update on public.club_media
for each row
execute function public.set_updated_at();

create table if not exists public.usage_daily_active_users (
  activity_date date not null default current_date,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (activity_date, user_id)
);

create index if not exists usage_daily_active_users_role_date_idx
  on public.usage_daily_active_users(role, activity_date);

create table if not exists public.usage_daily_metrics (
  activity_date date not null default current_date,
  feature text not null,
  event_count bigint not null default 0,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (activity_date, feature)
);

create or replace function public.increment_usage_daily_metric(
  p_activity_date date,
  p_feature text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usage_daily_metrics(activity_date, feature, event_count)
  values (p_activity_date, p_feature, 1)
  on conflict (activity_date, feature)
  do update set
    event_count = public.usage_daily_metrics.event_count + 1,
    updated_at = timezone('utc', now());
end;
$$;

insert into storage.buckets (id, name, public)
values ('club-media', 'club-media', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists storage_objects_select_public_by_bucket on storage.objects;
create policy storage_objects_select_public_by_bucket
on storage.objects for select
using (bucket_id in ('club-logos', 'club-media', 'event-media'));

drop policy if exists storage_objects_insert_public_assets_by_club on storage.objects;
create policy storage_objects_insert_public_assets_by_club
on storage.objects for insert
with check (
  bucket_id in ('club-logos', 'club-media', 'event-media')
  and (storage.foldername(name))[1] is not null
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'admin'
        or (p.role = 'president' and p.club_id::text = (storage.foldername(name))[1])
      )
  )
);

drop policy if exists storage_objects_update_club_media on storage.objects;
create policy storage_objects_update_club_media
on storage.objects for update
using (
  bucket_id in ('club-logos', 'club-media')
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'admin'
        or (p.role = 'president' and p.club_id::text = (storage.foldername(name))[1])
      )
  )
)
with check (
  bucket_id in ('club-logos', 'club-media')
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'admin'
        or (p.role = 'president' and p.club_id::text = (storage.foldername(name))[1])
      )
  )
);

drop policy if exists storage_objects_delete_club_media on storage.objects;
create policy storage_objects_delete_club_media
on storage.objects for delete
using (
  bucket_id in ('club-logos', 'club-media')
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'admin'
        or (p.role = 'president' and p.club_id::text = (storage.foldername(name))[1])
      )
  )
);

alter table public.club_media enable row level security;
alter table public.usage_daily_active_users enable row level security;
alter table public.usage_daily_metrics enable row level security;

drop policy if exists club_media_public_read on public.club_media;
create policy club_media_public_read
on public.club_media for select
using (true);

drop policy if exists club_media_admin_president_write on public.club_media;
create policy club_media_admin_president_write
on public.club_media for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'admin'
        or (p.role = 'president' and p.club_id = club_media.club_id)
      )
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'admin'
        or (p.role = 'president' and p.club_id = club_media.club_id)
      )
  )
);

drop policy if exists usage_daily_active_users_admin_read on public.usage_daily_active_users;
create policy usage_daily_active_users_admin_read
on public.usage_daily_active_users for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

drop policy if exists usage_daily_metrics_admin_read on public.usage_daily_metrics;
create policy usage_daily_metrics_admin_read
on public.usage_daily_metrics for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);
