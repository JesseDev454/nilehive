-- Migration 0051: Revoke feedback_manager access
-- This safely prevents feedback_manager from seeing feedback without deleting the role from the enum.

drop policy if exists event_feedback_select_visible on public.event_feedback;
create policy event_feedback_select_visible
on public.event_feedback
for select
using (
  submitted_by = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'admin'
        or (
          p.club_id = event_feedback.club_id
          and p.role in ('president', 'executive')
        )
      )
  )
  or exists (
    select 1
    from public.clubs c
    where c.id = event_feedback.club_id
      and c.advisor_id = auth.uid()
  )
);
