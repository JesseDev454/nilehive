do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'approval_decision'
  ) then
    create type public.approval_decision as enum ('approve', 'reject');
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_enum
    where enumtypid = 'public.proposal_status'::regtype
      and enumlabel = 'pending_admin_review'
  ) then
    alter type public.proposal_status add value 'pending_admin_review';
  end if;
end
$$;

create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals (id) on delete cascade,
  reviewer_id uuid not null references public.profiles (id) on delete restrict,
  reviewer_role public.app_role not null,
  decision public.approval_decision not null,
  remarks text,
  decided_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists approvals_proposal_id_idx on public.approvals (proposal_id);
create index if not exists approvals_reviewer_id_idx on public.approvals (reviewer_id);

alter table public.approvals enable row level security;

drop policy if exists approvals_select_related_users on public.approvals;
create policy approvals_select_related_users
on public.approvals
for select
using (
  reviewer_id = auth.uid()
  or exists (
    select 1
    from public.proposals
    where proposals.id = approvals.proposal_id
      and proposals.submitted_by = auth.uid()
  )
  or exists (
    select 1
    from public.proposals
    join public.clubs on clubs.id = proposals.club_id
    where proposals.id = approvals.proposal_id
      and clubs.advisor_id = auth.uid()
  )
  or exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'president')
  )
);

create or replace function public.apply_advisor_decision(
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
    advisor_remarks = p_remarks,
    advisor_decided_at = p_decided_at,
    advisor_decided_by = p_reviewer_id
  where id = p_proposal_id
    and status = 'pending_advisor_review'
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
