alter table public.clubs
  add column if not exists whatsapp_group_name text,
  add column if not exists whatsapp_onboarding_notes text;

alter table public.membership_requests
  add column if not exists whatsapp_onboarding_status text not null default 'not_ready',
  add column if not exists whatsapp_added_by uuid references public.profiles (id) on delete set null,
  add column if not exists whatsapp_added_at timestamptz,
  add column if not exists whatsapp_onboarding_notes text;

alter table public.membership_requests
  drop constraint if exists membership_requests_whatsapp_onboarding_status_check;

alter table public.membership_requests
  add constraint membership_requests_whatsapp_onboarding_status_check
  check (whatsapp_onboarding_status in ('not_ready', 'ready', 'added'));

create index if not exists membership_requests_whatsapp_onboarding_idx
  on public.membership_requests (whatsapp_onboarding_status, club_id);

drop policy if exists membership_requests_select_visible on public.membership_requests;
create policy membership_requests_select_visible
on public.membership_requests
for select
using (
  profile_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

update public.clubs
set dues_amount = 10000;

update public.club_payment_settings
set
  fresher_dues_amount = 10000,
  returning_student_dues_amount = 10000,
  payment_instructions = 'All students pay N10,000 per session. Submit the payment reference and receipt used for Club Services review.',
  updated_at = timezone('utc', now());

update public.due_payments
set
  amount = 10000,
  updated_at = timezone('utc', now())
where status in ('unpaid', 'submitted', 'rejected');

update public.membership_requests mr
set
  dues_amount = 10000,
  updated_at = timezone('utc', now())
where exists (
  select 1
  from public.due_payments dp
  where dp.id = mr.due_payment_id
    and dp.status in ('unpaid', 'submitted', 'rejected')
);

update public.membership_requests mr
set whatsapp_onboarding_status = 'ready'
where mr.status = 'active'
  and exists (
    select 1
    from public.due_payments dp
    where dp.id = mr.due_payment_id
      and dp.status = 'paid'
  );

create or replace function public.resolve_join_dues_amount(student_type_input text)
returns numeric
language plpgsql
as $$
begin
  return 10000;
end;
$$;

create or replace function public.apply_admin_decision(
  p_proposal_id uuid,
  p_reviewer_id uuid,
  p_reviewer_role public.app_role,
  p_decision public.approval_decision,
  p_remarks text,
  p_decided_at timestamptz,
  p_next_status public.proposal_status
)
returns jsonb
language plpgsql
as $$
declare
  v_updated public.proposals;
begin
  update public.proposals
  set
    status = p_next_status,
    admin_remarks = p_remarks,
    admin_decided_at = p_decided_at,
    admin_decided_by = p_reviewer_id
  where id = p_proposal_id
    and status in ('pending_admin_review', 'advisor_rejected', 'admin_rejected')
  returning * into v_updated;

  if v_updated.id is null then
    return null;
  end if;

  insert into public.approvals (
    proposal_id,
    reviewer_id,
    reviewer_role,
    decision,
    remarks,
    decided_at
  )
  values (
    p_proposal_id,
    p_reviewer_id,
    p_reviewer_role,
    p_decision,
    p_remarks,
    p_decided_at
  );

  return to_jsonb(v_updated);
end;
$$;
