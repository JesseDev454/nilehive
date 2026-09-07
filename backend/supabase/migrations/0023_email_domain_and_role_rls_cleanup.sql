drop policy if exists profiles_insert_own_student_onboarding on public.profiles;
create policy profiles_insert_own_student_onboarding
on public.profiles
for insert
with check (
  auth.uid() = id
  and role::text = 'student'
  and lower(coalesce(auth.jwt() ->> 'email', '')) like '%@nileuniversity.edu.ng'
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
      and (
        profiles.role = 'admin'
        or (
          profiles.role = 'president'
          and profiles.club_id = proposals.club_id
        )
      )
  )
);

drop policy if exists proposals_insert_executive on public.proposals;
drop policy if exists proposals_insert_president on public.proposals;
create policy proposals_insert_president
on public.proposals
for insert
with check (
  auth.uid() = submitted_by
  and status::text in ('draft', 'pending_advisor_review')
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'president'
      and profiles.club_id = proposals.club_id
  )
);

drop policy if exists proposals_update_executive_editable on public.proposals;
drop policy if exists proposals_update_president_editable on public.proposals;
create policy proposals_update_president_editable
on public.proposals
for update
using (
  auth.uid() = submitted_by
  and status::text in ('draft', 'advisor_rejected', 'admin_rejected')
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'president'
      and profiles.club_id = proposals.club_id
  )
)
with check (
  auth.uid() = submitted_by
  and status::text in ('draft', 'advisor_rejected', 'admin_rejected', 'pending_advisor_review')
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'president'
      and profiles.club_id = proposals.club_id
  )
);

drop policy if exists event_reports_select_visible on public.event_reports;
create policy event_reports_select_visible
on public.event_reports
for select
using (
  submitted_by = auth.uid()
  or exists (
    select 1
    from public.clubs c
    where c.id = event_reports.club_id
      and c.advisor_id = auth.uid()
  )
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'admin'
        or (
          p.club_id = event_reports.club_id
          and p.role = 'president'
        )
      )
  )
);

drop policy if exists due_payments_select_visible on public.due_payments;
create policy due_payments_select_visible
on public.due_payments
for select
using (
  exists (
    select 1
    from public.club_members cm
    where cm.id = due_payments.member_id
      and cm.profile_id = auth.uid()
  )
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'admin'
        or (
          p.club_id = due_payments.club_id
          and p.role = 'president'
        )
      )
  )
);
