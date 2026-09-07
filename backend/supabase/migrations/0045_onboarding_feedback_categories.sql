-- Migration 0045: Add onboarding/app feedback categories.
-- Non-event onboarding feedback can be submitted before a student has an active club.

alter table public.event_feedback
  alter column club_id drop not null;

alter table public.event_feedback
  drop constraint if exists event_feedback_category_check;

alter table public.event_feedback
  add constraint event_feedback_category_check
  check (
    category in (
      'general',
      'event',
      'club',
      'onboarding',
      'club_joining',
      'dues_payment',
      'login_access'
    )
  );
