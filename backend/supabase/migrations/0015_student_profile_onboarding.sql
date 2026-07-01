do $$
begin
  if not exists (
    select 1
    from pg_enum
    where enumtypid = 'public.app_role'::regtype
      and enumlabel = 'student'
  ) then
    alter type public.app_role add value 'student';
  end if;
end
$$;

alter table public.profiles
  add column if not exists student_id text,
  add column if not exists requested_role public.app_role,
  add column if not exists onboarding_status text not null default 'complete';

create unique index if not exists profiles_student_id_unique
  on public.profiles (student_id)
  where student_id is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_onboarding_status_check'
  ) then
    alter table public.profiles
      add constraint profiles_onboarding_status_check
      check (onboarding_status in ('complete'));
  end if;
end
$$;

drop policy if exists clubs_select_public_for_onboarding on public.clubs;
create policy clubs_select_public_for_onboarding
on public.clubs
for select
using (true);

drop policy if exists profiles_insert_own_student_onboarding on public.profiles;
create policy profiles_insert_own_student_onboarding
on public.profiles
for insert
with check (
  auth.uid() = id
  and role::text = 'student'
);
