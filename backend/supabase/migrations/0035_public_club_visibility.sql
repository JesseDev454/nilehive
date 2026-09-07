alter table public.clubs
add column if not exists is_public_signup boolean not null default true;

create index if not exists clubs_public_signup_name_idx
  on public.clubs (is_public_signup, name);

update public.clubs
set is_public_signup = false
where lower(name) = lower('Nile Innovators Club');
