do $$
begin
  if not exists (
    select 1
    from pg_enum
    where enumtypid = 'public.proposal_status'::regtype
      and enumlabel = 'draft'
  ) then
    alter type public.proposal_status add value 'draft';
  end if;

  if not exists (
    select 1
    from pg_enum
    where enumtypid = 'public.notification_type'::regtype
      and enumlabel = 'proposal_resubmitted'
  ) then
    alter type public.notification_type add value 'proposal_resubmitted';
  end if;
end
$$;

alter table public.proposals
  add column if not exists submitted_at timestamptz,
  add column if not exists resubmitted_at timestamptz,
  add column if not exists revision_count integer not null default 0,
  add column if not exists last_edited_at timestamptz,
  add column if not exists last_edited_by uuid references public.profiles (id) on delete set null;

alter table public.proposals
  alter column title drop not null,
  alter column description drop not null,
  alter column event_date drop not null,
  alter column location drop not null;

update public.proposals
set submitted_at = created_at
where submitted_at is null
  and status::text <> 'draft';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'proposals_revision_count_non_negative'
  ) then
    alter table public.proposals
      add constraint proposals_revision_count_non_negative
      check (revision_count >= 0);
  end if;
end
$$;

drop policy if exists proposals_insert_executive on public.proposals;
create policy proposals_insert_executive
on public.proposals
for insert
with check (
  auth.uid() = submitted_by
  and status::text in ('draft', 'pending_advisor_review')
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'executive'
      and profiles.club_id = proposals.club_id
  )
);

drop policy if exists proposals_update_executive_editable on public.proposals;
create policy proposals_update_executive_editable
on public.proposals
for update
using (
  auth.uid() = submitted_by
  and status::text in ('draft', 'advisor_rejected', 'admin_rejected')
)
with check (
  auth.uid() = submitted_by
  and status::text in ('draft', 'advisor_rejected', 'admin_rejected', 'pending_advisor_review')
);
