-- Migration 0041: Slim signup trigger — no longer creates club_members,
-- due_payments, or membership_requests during account creation.
-- All club joining, dues, and membership requests are handled via the
-- Discover Clubs join flow in /membership.

create or replace function public.provision_profile_from_auth_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role_text text;
  full_name_text       text;
begin
  requested_role_text := lower(coalesce(trim(new.raw_user_meta_data ->> 'requested_role'), 'student'));

  if requested_role_text not in ('student', 'advisor') then
    return new;
  end if;

  full_name_text := nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '');

  if full_name_text is null then
    full_name_text := nullif(trim(split_part(coalesce(new.email, ''), '@', 1)), '');
  end if;

  -- Create a minimal profile with no club assignment, no student details,
  -- and no auto-created membership records. Students join clubs through
  -- the Discover Clubs page after their account is created.
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
      null,
      null,
      requested_role_text::public.app_role,
      'complete',
      'active'
    )
    on conflict (id) do update
    set
      full_name         = excluded.full_name,
      role              = excluded.role,
      requested_role    = excluded.requested_role,
      onboarding_status = 'complete',
      account_status    = 'active',
      updated_at        = timezone('utc', now());
  end if;

  return new;
end;
$$;

-- Re-create the trigger (safe to run against the existing one).
drop trigger if exists provision_profile_from_auth_signup on auth.users;
create trigger provision_profile_from_auth_signup
after insert on auth.users
for each row
execute function public.provision_profile_from_auth_signup();
