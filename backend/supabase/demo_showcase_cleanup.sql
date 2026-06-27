-- Cleanup for backend/supabase/demo_showcase_seed.sql.
-- Removes only deterministic demo_showcase_2026 rows and demo static media refs.

begin;

delete from public.announcement_reads
where announcement_id in (
  select id from public.announcements
  where id between 'dd040000-0000-0000-0000-000000000001'::uuid and 'dd040000-0000-0000-0000-000000000014'::uuid
);

delete from public.notifications
where proposal_id in (
  select id from public.proposals
  where id between 'dd030000-0000-0000-0000-000000000001'::uuid and 'dd030000-0000-0000-0000-000000000014'::uuid
)
or announcement_id in (
  select id from public.announcements
  where id between 'dd040000-0000-0000-0000-000000000001'::uuid and 'dd040000-0000-0000-0000-000000000014'::uuid
);

delete from public.event_reminders
where proposal_id in (
  select id from public.proposals
  where id between 'dd030000-0000-0000-0000-000000000001'::uuid and 'dd030000-0000-0000-0000-000000000014'::uuid
);

delete from public.event_attendance
where id between 'dd090000-0000-0000-0000-000000000001'::uuid and 'dd090000-0000-0000-0000-000000000002'::uuid
   or proposal_id in (
    select id from public.proposals
    where id between 'dd030000-0000-0000-0000-000000000001'::uuid and 'dd030000-0000-0000-0000-000000000014'::uuid
  );

delete from public.event_rsvps
where id between 'dd080000-0000-0000-0000-000000000001'::uuid and 'dd080000-0000-0000-0000-000000000003'::uuid
   or proposal_id in (
    select id from public.proposals
    where id between 'dd030000-0000-0000-0000-000000000001'::uuid and 'dd030000-0000-0000-0000-000000000014'::uuid
  );

delete from public.event_feedback
where id between 'dd0a0000-0000-0000-0000-000000000001'::uuid and 'dd0a0000-0000-0000-0000-000000000002'::uuid
   or comment ilike '%demo_showcase_2026%';

delete from public.approvals
where id between 'dd031000-0000-0000-0000-000000000001'::uuid and 'dd032000-0000-0000-0000-000000000014'::uuid
   or proposal_id in (
    select id from public.proposals
    where id between 'dd030000-0000-0000-0000-000000000001'::uuid and 'dd030000-0000-0000-0000-000000000014'::uuid
  );

delete from public.proposals
where id between 'dd030000-0000-0000-0000-000000000001'::uuid and 'dd030000-0000-0000-0000-000000000014'::uuid
   or description ilike '%demo_showcase_2026%';

delete from public.announcements
where id between 'dd040000-0000-0000-0000-000000000001'::uuid and 'dd040000-0000-0000-0000-000000000014'::uuid
   or message ilike '%demo_showcase_2026%';

delete from public.task_status_history
where task_id between 'dd0b0000-0000-0000-0000-000000000001'::uuid and 'dd0b0000-0000-0000-0000-000000000014'::uuid;

delete from public.tasks
where id between 'dd0b0000-0000-0000-0000-000000000001'::uuid and 'dd0b0000-0000-0000-0000-000000000014'::uuid
   or description ilike '%demo showcase task:%';

delete from public.membership_requests
where id between 'dd070000-0000-0000-0000-000000000001'::uuid and 'dd070000-0000-0000-0000-000000000004'::uuid
   or remarks ilike '%demo showcase%';

delete from public.due_payments
where id between 'dd060000-0000-0000-0000-000000000001'::uuid and 'dd060000-0000-0000-0000-000000000003'::uuid
   or payment_reference like 'DEMO-%';

delete from public.club_members
where id between 'dd050000-0000-0000-0000-000000000001'::uuid and 'dd050000-0000-0000-0000-000000000014'::uuid;

delete from public.club_media
where id between 'dd010000-0000-0000-0000-000000000001'::uuid and 'dd010000-0000-0000-0000-000000000028'::uuid
   or storage_path like '/demo-club-gallery/%';

with demo_metrics(activity_date, feature, event_count) as (
  values
    (current_date - 6, 'club_discovery_view', 18::bigint),
    (current_date - 5, 'club_detail_view', 24::bigint),
    (current_date - 4, 'event_view', 11::bigint),
    (current_date - 3, 'notifications_view', 9::bigint),
    (current_date - 2, 'announcements_view', 13::bigint),
    (current_date - 1, 'feedback_view', 4::bigint),
    (current_date - 1, 'dashboard_view', 21::bigint)
)
update public.usage_daily_metrics m
set
  event_count = greatest(m.event_count - d.event_count, 0),
  updated_at = timezone('utc', now())
from demo_metrics d
where m.activity_date = d.activity_date
  and m.feature = d.feature;

delete from public.usage_daily_metrics
where event_count = 0
  and activity_date between current_date - 6 and current_date
  and feature in (
    'club_discovery_view',
    'club_detail_view',
    'event_view',
    'notifications_view',
    'feedback_view',
    'announcements_view',
    'dashboard_view'
  );

delete from public.usage_daily_active_users
where activity_date between current_date - 6 and current_date
  and user_id in (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid,
    'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid,
    '99999999-9999-9999-9999-999999999999'::uuid
  );

update public.clubs
set website_url = null
where website_url like 'https://clubs.campusone.com.ng/demo/%';

update public.clubs
set social_links = '{}'::jsonb
where social_links::text like '%example.com/demo/%';

commit;
