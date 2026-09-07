drop policy if exists event_reports_insert_executive_own_club on public.event_reports;
drop policy if exists event_reports_insert_president_own_club on public.event_reports;

create policy event_reports_insert_president_own_club
on public.event_reports
for insert
with check (
  submitted_by = auth.uid()
  and exists (
    select 1
    from public.profiles p
    join public.proposals pr on pr.id = event_reports.proposal_id
    where p.id = auth.uid()
      and p.role = 'president'
      and p.club_id = event_reports.club_id
      and pr.club_id = event_reports.club_id
      and pr.status = 'approved'
  )
);
