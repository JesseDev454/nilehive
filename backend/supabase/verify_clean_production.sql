-- Production verification queries
-- Run these only as read-only checks in the production Supabase SQL Editor.

select
  count(*) as innovator_club_count
from public.clubs
where lower(name) = lower('Nile Innovators Club');

select
  count(*) as nilehive_test_auth_users
from auth.users
where lower(coalesce(email, '')) like '%@nilehive.test';

select
  count(*) as nilehive_test_profiles
from public.profiles
where lower(coalesce(id::text, '')) is not null
  and lower(coalesce(id::text, '')) <> ''
  and exists (
    select 1
    from auth.users u
    where u.id = profiles.id
      and lower(coalesce(u.email, '')) like '%@nilehive.test'
  );

select count(*) as club_count from public.clubs;
select count(*) as profile_count from public.profiles;
select count(*) as proposal_count from public.proposals;
select count(*) as task_count from public.tasks;
select count(*) as due_payment_count from public.due_payments;
select count(*) as report_count from public.event_reports;
select count(*) as announcement_count from public.announcements;

select id, name, code, created_at
from public.clubs
order by name asc;
