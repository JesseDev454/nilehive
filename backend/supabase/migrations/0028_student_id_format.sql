create or replace function public.responsible_members_have_valid_student_ids(members jsonb)
returns boolean
language sql
immutable
as $$
  select exists (
    select 1
    from jsonb_array_elements(coalesce(members, '[]'::jsonb)) as member
  )
  and not exists (
    select 1
    from jsonb_array_elements(coalesce(members, '[]'::jsonb)) as member
    where coalesce(member ->> 'student_id', '') !~ '^\d{9}$'
  );
$$;

alter table public.profiles
  add constraint profiles_student_id_9_digits
  check (student_id is null or student_id ~ '^\d{9}$')
  not valid;

alter table public.club_members
  add constraint club_members_student_id_9_digits
  check (student_id ~ '^\d{9}$')
  not valid;

alter table public.proposals
  add constraint proposals_responsible_members_student_ids_9_digits
  check (
    status = 'draft'
    or public.responsible_members_have_valid_student_ids(responsible_members)
  )
  not valid;
