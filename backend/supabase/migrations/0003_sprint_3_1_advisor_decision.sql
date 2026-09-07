do $$
begin
  if not exists (
    select 1
    from pg_enum
    where enumtypid = 'public.proposal_status'::regtype
      and enumlabel = 'advisor_approved'
  ) then
    alter type public.proposal_status add value 'advisor_approved';
  end if;

  if not exists (
    select 1
    from pg_enum
    where enumtypid = 'public.proposal_status'::regtype
      and enumlabel = 'advisor_rejected'
  ) then
    alter type public.proposal_status add value 'advisor_rejected';
  end if;
end
$$;

alter table public.proposals
  add column if not exists advisor_remarks text,
  add column if not exists advisor_decided_at timestamptz,
  add column if not exists advisor_decided_by uuid references public.profiles (id) on delete set null;
