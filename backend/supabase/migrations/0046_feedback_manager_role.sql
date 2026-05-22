-- Migration 0046: Add a seeded app-feedback reviewer role.

alter type public.app_role add value if not exists 'feedback_manager';

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
          p.role::text = 'feedback_manager'
          and event_feedback.proposal_id is null
          and event_feedback.category in (
            'general',
            'onboarding',
            'club_joining',
            'dues_payment',
            'login_access'
          )
        )
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
