alter table public.profiles
  add column if not exists phone_number text,
  add column if not exists department text,
  add column if not exists student_type text,
  add column if not exists join_reason text;

alter table public.profiles
  drop constraint if exists profiles_student_type_check;

alter table public.profiles
  add constraint profiles_student_type_check
  check (student_type is null or student_type in ('fresher', 'returning'));

alter table public.membership_requests
  add column if not exists student_type text,
  add column if not exists join_reason text;

alter table public.membership_requests
  drop constraint if exists membership_requests_student_type_check;

alter table public.membership_requests
  add constraint membership_requests_student_type_check
  check (student_type is null or student_type in ('fresher', 'returning'));

alter table public.club_payment_settings
  add column if not exists fresher_dues_amount numeric(12,2) not null default 10000,
  add column if not exists returning_student_dues_amount numeric(12,2) not null default 5000;

create or replace function public.resolve_join_dues_amount(student_type_input text)
returns numeric
language plpgsql
as $$
begin
  if lower(coalesce(trim(student_type_input), 'returning')) = 'fresher' then
    return 10000;
  end if;

  return 5000;
end;
$$;

insert into public.club_payment_settings (
  club_id,
  bank_name,
  account_number,
  account_name,
  payment_instructions,
  fresher_dues_amount,
  returning_student_dues_amount
)
select
  clubs.id,
  'Providus Bank',
  '1305861314',
  'Nile Arts & Creative Hub',
  'Freshers pay N10,000. Returning students pay N5,000. Submit the payment reference and proof used for Club Services review.',
  10000,
  5000
from public.clubs
on conflict (club_id) do update
set
  bank_name = excluded.bank_name,
  account_number = excluded.account_number,
  account_name = excluded.account_name,
  payment_instructions = excluded.payment_instructions,
  fresher_dues_amount = excluded.fresher_dues_amount,
  returning_student_dues_amount = excluded.returning_student_dues_amount,
  updated_at = timezone('utc', now());

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
  phone_number_text text;
  department_text text;
  student_type_text text;
  join_reason_text text;
  payment_account_name_text text;
  payment_reference_text text;
  payment_paid_at_value timestamptz;
  proof_url_text text;
  payer_note_text text;
  join_dues_amount numeric;
  pending_member_id uuid;
  pending_due_payment_id uuid;
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

  phone_number_text := nullif(trim(coalesce(new.raw_user_meta_data ->> 'phone_number', '')), '');
  department_text := nullif(trim(coalesce(new.raw_user_meta_data ->> 'department', '')), '');
  join_reason_text := nullif(trim(coalesce(new.raw_user_meta_data ->> 'join_reason', '')), '');
  payment_account_name_text := nullif(trim(coalesce(new.raw_user_meta_data ->> 'payment_account_name', '')), '');
  payment_reference_text := nullif(trim(coalesce(new.raw_user_meta_data ->> 'payment_reference', '')), '');
  proof_url_text := nullif(trim(coalesce(new.raw_user_meta_data ->> 'proof_url', '')), '');
  payer_note_text := nullif(trim(coalesce(new.raw_user_meta_data ->> 'payer_note', '')), '');

  if requested_role_text = 'student' then
    student_type_text := lower(coalesce(trim(new.raw_user_meta_data ->> 'student_type'), 'returning'));

    if student_type_text not in ('fresher', 'returning') then
      student_type_text := 'returning';
    end if;
  else
    student_type_text := null;
  end if;

  if nullif(trim(coalesce(new.raw_user_meta_data ->> 'payment_paid_at', '')), '') is not null then
    begin
      payment_paid_at_value := (new.raw_user_meta_data ->> 'payment_paid_at')::timestamptz;
    exception
      when others then
        payment_paid_at_value := null;
    end;
  else
    payment_paid_at_value := null;
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
      account_status,
      phone_number,
      department,
      student_type,
      join_reason
    )
    values (
      new.id,
      full_name_text,
      requested_role_text::public.app_role,
      requested_club_id,
      student_id_text,
      requested_role_text::public.app_role,
      'complete',
      'active',
      phone_number_text,
      department_text,
      student_type_text,
      join_reason_text
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
      phone_number = excluded.phone_number,
      department = excluded.department,
      student_type = excluded.student_type,
      join_reason = excluded.join_reason,
      updated_at = timezone('utc', now());
  end if;

  if requested_role_text = 'student' and requested_club_id is not null then
    select cm.id
    into pending_member_id
    from public.club_members cm
    where cm.profile_id = new.id
      and cm.club_id = requested_club_id
    limit 1;

    if pending_member_id is null then
      insert into public.club_members (
        club_id,
        profile_id,
        full_name,
        student_id,
        email,
        phone_number,
        club_role,
        membership_status
      )
      values (
        requested_club_id,
        new.id,
        full_name_text,
        student_id_text,
        new.email,
        phone_number_text,
        'member'::public.club_member_role,
        'inactive'
      )
      returning id into pending_member_id;
    else
      update public.club_members
      set
        full_name = full_name_text,
        student_id = student_id_text,
        email = new.email,
        phone_number = phone_number_text,
        club_role = 'member'::public.club_member_role,
        membership_status = case
          when membership_status = 'alumni' then membership_status
          else 'inactive'
        end,
        updated_at = timezone('utc', now())
      where id = pending_member_id;
    end if;

    if not exists (
      select 1
      from public.membership_requests mr
      where mr.profile_id = new.id
        and mr.club_id = requested_club_id
        and mr.status in (
          'pending'::public.membership_request_status,
          'approved_pending_dues'::public.membership_request_status,
          'active'::public.membership_request_status
        )
    ) then
      join_dues_amount := public.resolve_join_dues_amount(student_type_text);

      insert into public.due_payments (
        club_id,
        member_id,
        amount,
        academic_session,
        payment_reference,
        payment_account_name,
        payment_paid_at,
        payer_note,
        proof_url,
        submitted_at,
        status,
        verified_by,
        verified_at
      )
      values (
        requested_club_id,
        pending_member_id,
        join_dues_amount,
        coalesce(current_setting('app.current_academic_session', true), '2025/2026'),
        payment_reference_text,
        payment_account_name_text,
        payment_paid_at_value,
        payer_note_text,
        proof_url_text,
        timezone('utc', now()),
        case
          when payment_account_name_text is not null and payment_reference_text is not null then 'submitted'::public.due_payment_status
          else 'unpaid'::public.due_payment_status
        end,
        null,
        null
      )
      returning id into pending_due_payment_id;

      insert into public.membership_requests (
        profile_id,
        club_id,
        requested_role,
        status,
        remarks,
        member_id,
        due_payment_id,
        dues_amount,
        academic_session,
        student_type,
        join_reason
      )
      values (
        new.id,
        requested_club_id,
        'member'::public.club_member_role,
        'pending'::public.membership_request_status,
        'Created during signup with payment details attached.',
        pending_member_id,
        pending_due_payment_id,
        join_dues_amount,
        coalesce(current_setting('app.current_academic_session', true), '2025/2026'),
        student_type_text,
        join_reason_text
      );
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists provision_profile_from_auth_signup on auth.users;
create trigger provision_profile_from_auth_signup
after insert on auth.users
for each row
execute function public.provision_profile_from_auth_signup();
