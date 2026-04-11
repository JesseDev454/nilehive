do $$
begin
  if not exists (
    select 1
    from pg_enum
    where enumtypid = 'public.proposal_status'::regtype
      and enumlabel = 'approved'
  ) then
    alter type public.proposal_status add value 'approved';
  end if;

  if not exists (
    select 1
    from pg_enum
    where enumtypid = 'public.proposal_status'::regtype
      and enumlabel = 'admin_rejected'
  ) then
    alter type public.proposal_status add value 'admin_rejected';
  end if;

  if not exists (
    select 1
    from pg_enum
    where enumtypid = 'public.notification_type'::regtype
      and enumlabel = 'admin_approved'
  ) then
    alter type public.notification_type add value 'admin_approved';
  end if;

  if not exists (
    select 1
    from pg_enum
    where enumtypid = 'public.notification_type'::regtype
      and enumlabel = 'admin_rejected'
  ) then
    alter type public.notification_type add value 'admin_rejected';
  end if;
end
$$;

alter table public.proposals
  add column if not exists admin_remarks text,
  add column if not exists admin_decided_at timestamptz,
  add column if not exists admin_decided_by uuid references public.profiles (id) on delete set null;

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
    and status = 'pending_admin_review'
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
