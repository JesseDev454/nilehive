-- Production admin bootstrap.
-- Use this only after the first real admin has signed up in Supabase Auth.
-- Replace the values in the params CTE before running this in Supabase SQL Editor.
--
-- This does not create auth.users. It only creates/updates the matching app
-- profile and records an idempotent bootstrap role-history entry.

with params as (
  select
    'REPLACE_WITH_AUTH_USER_UUID'::uuid as admin_id,
    'Club Services Admin'::text as full_name,
    'admin@nileuniversity.edu.ng'::text as email_for_reference
),
auth_match as (
  select p.admin_id, p.full_name, p.email_for_reference
  from params p
  where exists (
    select 1
    from auth.users u
    where u.id = p.admin_id
      and lower(coalesce(u.email, '')) = lower(p.email_for_reference)
  )
),
upserted_profile as (
  insert into public.profiles (
    id,
    full_name,
    role,
    club_id,
    requested_role,
    onboarding_status,
    updated_at
  )
  select
    admin_id,
    full_name,
    'admin'::public.app_role,
    null,
    'admin'::public.app_role,
    'complete',
    timezone('utc', now())
  from auth_match
  on conflict (id) do update set
    full_name = excluded.full_name,
    role = 'admin'::public.app_role,
    club_id = null,
    requested_role = 'admin'::public.app_role,
    onboarding_status = 'complete',
    updated_at = timezone('utc', now())
  returning id
)
insert into public.profile_role_history (
  profile_id,
  previous_role,
  new_role,
  previous_club_id,
  new_club_id,
  changed_by,
  remarks
)
select
  id,
  null,
  'admin'::public.app_role,
  null,
  null,
  id,
  'Production bootstrap: first Club Services admin profile created after Supabase Auth signup.'
from upserted_profile
where not exists (
  select 1
  from public.profile_role_history h
  where h.profile_id = upserted_profile.id
    and h.changed_by = upserted_profile.id
    and h.remarks like 'Production bootstrap:%'
);
