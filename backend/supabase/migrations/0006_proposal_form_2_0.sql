alter table public.proposals
  add column if not exists aim_objectives text,
  add column if not exists proposed_activity text,
  add column if not exists event_time time,
  add column if not exists number_of_participants integer,
  add column if not exists budget_estimate numeric(12, 2),
  add column if not exists budget_line_items jsonb not null default '[]'::jsonb,
  add column if not exists responsible_members jsonb not null default '[]'::jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'proposals_number_of_participants_positive'
  ) then
    alter table public.proposals
      add constraint proposals_number_of_participants_positive
      check (number_of_participants is null or number_of_participants > 0) not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'proposals_budget_estimate_non_negative'
  ) then
    alter table public.proposals
      add constraint proposals_budget_estimate_non_negative
      check (budget_estimate is null or budget_estimate >= 0) not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'proposals_budget_line_items_array'
  ) then
    alter table public.proposals
      add constraint proposals_budget_line_items_array
      check (jsonb_typeof(budget_line_items) = 'array') not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'proposals_responsible_members_array'
  ) then
    alter table public.proposals
      add constraint proposals_responsible_members_array
      check (jsonb_typeof(responsible_members) = 'array') not valid;
  end if;
end
$$;

drop policy if exists clubs_select_authenticated on public.clubs;
create policy clubs_select_authenticated
on public.clubs
for select
using (auth.role() = 'authenticated');
