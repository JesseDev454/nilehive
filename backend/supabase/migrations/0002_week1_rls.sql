alter table public.clubs enable row level security;
alter table public.profiles enable row level security;
alter table public.proposals enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists clubs_select_member_or_advisor on public.clubs;
create policy clubs_select_member_or_advisor
on public.clubs
for select
using (
  advisor_id = auth.uid()
  or id in (
    select profiles.club_id
    from public.profiles
    where profiles.id = auth.uid()
  )
);

drop policy if exists proposals_select_week1 on public.proposals;
create policy proposals_select_week1
on public.proposals
for select
using (
  submitted_by = auth.uid()
  or exists (
    select 1
    from public.clubs
    where clubs.id = proposals.club_id
      and clubs.advisor_id = auth.uid()
  )
  or exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'president')
  )
);

drop policy if exists proposals_insert_executive on public.proposals;
create policy proposals_insert_executive
on public.proposals
for insert
with check (
  auth.uid() = submitted_by
  and status = 'pending_advisor_review'
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'executive'
      and profiles.club_id = proposals.club_id
  )
);

