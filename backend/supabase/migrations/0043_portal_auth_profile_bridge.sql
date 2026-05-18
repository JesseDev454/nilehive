alter table public.profiles
  drop constraint if exists profiles_id_fkey;

alter table public.profiles
  add column if not exists portal_user_id text,
  add column if not exists email text;

update public.profiles p
set email = lower(u.email)
from auth.users u
where p.id = u.id
  and p.email is null
  and u.email is not null;

create unique index if not exists profiles_portal_user_id_unique
  on public.profiles (portal_user_id)
  where portal_user_id is not null;

create unique index if not exists profiles_email_unique_lower
  on public.profiles (lower(email))
  where email is not null;
