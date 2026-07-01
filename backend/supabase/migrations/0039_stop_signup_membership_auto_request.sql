create or replace function public.provision_profile_from_auth_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role_text text;
  full_name_text text;
  requested_club_id uuid;
  student_id_text text;
begin
  requested_role_text := lower(coalesce(trim(new.raw_user_meta_data ->> 'requested_role'), 'student'));

  if requested_role_text not in ('student', 'advisor') then
    return new;
  end if;

  full_name_text := nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '');

  if full_name_text is null then
    full_name_text := nullif(trim(split_part(coalesce(new.email, ''), '@', 1)), '');
  end if;

  if coalesce(new.raw_user_meta_data ->> 'requested_club_id', '') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    requested_club_id := (new.raw_user_meta_data ->> 'requested_club_id')::uuid;

    if not exists (
      select 1
      from public.clubs
      where id = requested_club_id
    ) then
      requested_club_id := null;
    end if;
  else
    requested_club_id := null;
  end if;

  if requested_role_text = 'student' then
    student_id_text := nullif(trim(coalesce(new.raw_user_meta_data ->> 'student_id', '')), '');

    if student_id_text is not null and student_id_text !~ '^\d{9}$' then
      student_id_text := null;
    end if;
  else
    student_id_text := null;
  end if;

  if full_name_text is not null then
    insert into public.profiles (
      id,
      full_name,
      role,
      club_id,
      student_id,
      requested_role,
      onboarding_status,
      account_status
    )
    values (
      new.id,
      full_name_text,
      requested_role_text::public.app_role,
      requested_club_id,
      student_id_text,
      requested_role_text::public.app_role,
      'complete',
      'active'
    )
    on conflict (id) do update
    set
      full_name = excluded.full_name,
      role = excluded.role,
      club_id = excluded.club_id,
      student_id = excluded.student_id,
      requested_role = excluded.requested_role,
      onboarding_status = 'complete',
      account_status = 'active',
      updated_at = timezone('utc', now());
  end if;

  return new;
end;
$$;
