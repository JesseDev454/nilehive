-- Club Services removable demo showcase seed.
-- Optional staging/local data only. Do not run in production unless the team
-- intentionally wants demo showcase content visible there.
--
-- Prerequisites:
-- 1. Run all migrations.
-- 2. Run backend/supabase/bootstrap_clubs.sql.
-- 3. Run backend/supabase/demo_seed.sql so the fixed demo users exist.
--
-- Remove this content with backend/supabase/demo_showcase_cleanup.sql.

begin;

do $$
begin
  if (
    select count(*)
    from public.clubs
    where code in ('NBC', 'NBUC', 'NCC', 'NCIC', 'NCAC', 'NDC', 'NGC', 'NGD', 'NMUN', 'NPC', 'NSC', 'NTC', 'TEDX', 'WIT')
  ) < 14 then
    raise exception 'Run backend/supabase/bootstrap_clubs.sql before demo_showcase_seed.sql.';
  end if;

  if not exists (select 1 from public.profiles where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid and role = 'admin') then
    raise exception 'Run backend/supabase/demo_seed.sql before demo_showcase_seed.sql. Missing demo admin profile.';
  end if;

  if not exists (select 1 from public.profiles where id in ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid, '99999999-9999-9999-9999-999999999999'::uuid)) then
    raise exception 'Run backend/supabase/demo_seed.sql before demo_showcase_seed.sql. Missing demo student profiles.';
  end if;
end
$$;

with demo_profiles (
  code,
  description,
  categories,
  slug
) as (
  values
    ('NBC', 'Nile Book Club is a welcoming reading community for students who want to explore novels, African literature, personal development books, poetry, and thoughtful discussion. Members meet for reading circles, book swaps, author conversations, and relaxed debates about ideas that shape campus life.', array['Academics'], 'nile-book-club'),
    ('NBUC', 'Nile Business Club helps students understand entrepreneurship, finance, marketing, leadership, and business strategy through practical workshops, networking sessions, case discussions, and founder talks. It is a starting point for students who want to build commercial confidence before graduation.', array['Entrepreneurship'], 'nile-business-club'),
    ('NCC', 'Nile Charity Club brings students together for service, volunteering, donation drives, community outreach, and social impact projects. The club gives members a practical way to support people around them while learning teamwork, empathy, and responsible project coordination.', array['Volunteering','Academics','Arts'], 'nile-charity-club'),
    ('NCIC', 'Nile Climate Initiatives Club focuses on sustainability, recycling awareness, clean-campus campaigns, climate education, and practical environmental projects. Members collaborate on campus activities that make climate action visible, understandable, and achievable for students.', array['Tech','Volunteering','Arts'], 'nile-climate-initiatives-club'),
    ('NCAC', 'Nile Creative Arts Club gives artists, performers, designers, musicians, and curious beginners a place to create together. The club supports art workshops, performance rehearsals, creative showcases, open-mic style sessions, and collaborative projects across different forms of expression.', array['Music','Media','Arts'], 'nile-creative-arts-club'),
    ('NDC', 'Nile Debate Club helps students build confidence in public speaking, critical thinking, research, persuasion, and structured argument. Members prepare for debate nights, speaking drills, mock panels, and discussions on social, legal, political, and campus issues.', array['Academics','Leadership'], 'nile-debate-club'),
    ('NGC', 'Nile Games Club is a social and competitive space for board games, digital games, friendly tournaments, and strategy-based recreation. It gives students a healthier way to unwind, meet people, and build teamwork through games and light competition.', array['Gaming','Sports'], 'nile-games-club'),
    ('NGD', 'Nile Google Developers is a student developer community for software, cloud, AI, mobile development, product thinking, and hands-on technical learning. Members attend coding workshops, project demos, study groups, and collaborative sessions designed to help them build real skills.', array['Tech','Volunteering','Academics'], 'nile-google-developers'),
    ('NMUN', 'Nile Model United Nations Club introduces students to diplomacy, international relations, negotiation, public policy, and global affairs. Members participate in simulations, position paper practice, caucus sessions, and workshops that make global problem-solving practical.', array['Academics','Media','Leadership'], 'nile-model-united-nations-club'),
    ('NPC', 'Nile Photography Club helps students learn visual storytelling, camera basics, editing, campus photo walks, event coverage, and creative critique. Members practice photography in real campus settings while building portfolios and confidence behind the lens.', array['Media'], 'nile-photography-club'),
    ('NSC', 'Nile Startup Campus supports students interested in startups, innovation, product ideas, pitch practice, business models, and founder discipline. It gives aspiring builders a community for testing ideas, getting feedback, and learning how to move from concept to execution.', array['Entrepreneurship','Arts'], 'nile-startup-campus'),
    ('NTC', 'Nile Toastmaster''s Club helps students improve communication, presentation skills, confidence, meeting leadership, and prepared speaking. Members practice speeches, receive feedback, and learn how to communicate with clarity in academic, career, and social settings.', array['Academics','Leadership'], 'nile-toastmasters-club'),
    ('TEDX', 'TEDx Nile Club supports student-led ideas, speaker preparation, event production, storytelling, and campus conversations around innovation and impact. Members help curate talks, rehearse speakers, design experiences, and share meaningful ideas with the university community.', array['Media','Arts'], 'tedx-nile-club'),
    ('WIT', 'Women in Tech Club creates an inclusive space for women and allies interested in coding, product, design, mentorship, leadership, and technology careers. The club supports workshops, study sessions, peer mentoring, and confidence-building for students entering tech.', array['Tech','Entrepreneurship','Volunteering'], 'women-in-tech-club')
)
update public.clubs c
set
  description = p.description,
  categories = p.categories,
  logo_path = concat(p.code, '.png'),
  website_url = null,
  social_links = '{}'::jsonb,
  is_public_signup = true,
  dues_amount = 10000
from demo_profiles p
where c.code = p.code;

with media (id, code, storage_path, caption, display_order) as (
  values
    ('dd010000-0000-0000-0000-000000000001'::uuid, 'NBC', '/demo-club-gallery/nile-book-club/reading-circle.png', 'Demo preview: reading circle with students, open books, and discussion notes.', 1),
    ('dd010000-0000-0000-0000-000000000002'::uuid, 'NBC', '/demo-club-gallery/nile-book-club/book-discussion.png', 'Demo preview: book discussion table with shared notes and reading materials.', 2),
    ('dd010000-0000-0000-0000-000000000003'::uuid, 'NBUC', '/demo-club-gallery/nile-business-club/startup-workshop.png', 'Demo preview: startup workshop with laptops, charts, and planning notes.', 1),
    ('dd010000-0000-0000-0000-000000000004'::uuid, 'NBUC', '/demo-club-gallery/nile-business-club/networking-session.png', 'Demo preview: business networking session in a campus workspace.', 2),
    ('dd010000-0000-0000-0000-000000000005'::uuid, 'NCC', '/demo-club-gallery/nile-charity-club/donation-drive.png', 'Demo preview: donation drive with sorted books, supplies, and clothes.', 1),
    ('dd010000-0000-0000-0000-000000000006'::uuid, 'NCC', '/demo-club-gallery/nile-charity-club/community-outreach.png', 'Demo preview: students preparing materials for community outreach.', 2),
    ('dd010000-0000-0000-0000-000000000007'::uuid, 'NCIC', '/demo-club-gallery/nile-climate-initiatives-club/tree-planting.png', 'Demo preview: tree planting activity on a bright campus green space.', 1),
    ('dd010000-0000-0000-0000-000000000008'::uuid, 'NCIC', '/demo-club-gallery/nile-climate-initiatives-club/recycling-awareness.png', 'Demo preview: clean recycling awareness activity with color-coded bins.', 2),
    ('dd010000-0000-0000-0000-000000000009'::uuid, 'NCAC', '/demo-club-gallery/nile-creative-arts-club/art-workshop.png', 'Demo preview: creative arts workshop with sketchbooks and art materials.', 1),
    ('dd010000-0000-0000-0000-000000000010'::uuid, 'NCAC', '/demo-club-gallery/nile-creative-arts-club/performance-rehearsal.png', 'Demo preview: performance rehearsal with stage, music, and art props.', 2),
    ('dd010000-0000-0000-0000-000000000011'::uuid, 'NDC', '/demo-club-gallery/nile-debate-club/debate-practice.png', 'Demo preview: debate practice with podiums, microphones, and an audience.', 1),
    ('dd010000-0000-0000-0000-000000000012'::uuid, 'NDC', '/demo-club-gallery/nile-debate-club/public-speaking-session.png', 'Demo preview: public speaking session with podium and attentive audience.', 2),
    ('dd010000-0000-0000-0000-000000000013'::uuid, 'NGC', '/demo-club-gallery/nile-games-club/game-night.png', 'Demo preview: club game night with board games, cards, and controllers.', 1),
    ('dd010000-0000-0000-0000-000000000014'::uuid, 'NGC', '/demo-club-gallery/nile-games-club/friendly-tournament.png', 'Demo preview: friendly gaming tournament with students and controllers.', 2),
    ('dd010000-0000-0000-0000-000000000015'::uuid, 'NGD', '/demo-club-gallery/nile-google-developers/coding-workshop.png', 'Demo preview: coding workshop with laptops and projected code visuals.', 1),
    ('dd010000-0000-0000-0000-000000000016'::uuid, 'NGD', '/demo-club-gallery/nile-google-developers/project-demo.png', 'Demo preview: student technology project demo with laptops and prototypes.', 2),
    ('dd010000-0000-0000-0000-000000000017'::uuid, 'NMUN', '/demo-club-gallery/nile-model-united-nations-club/diplomacy-simulation.png', 'Demo preview: diplomacy simulation with placards, notes, and discussion.', 1),
    ('dd010000-0000-0000-0000-000000000018'::uuid, 'NMUN', '/demo-club-gallery/nile-model-united-nations-club/global-affairs-workshop.png', 'Demo preview: global affairs workshop with maps, notes, and group work.', 2),
    ('dd010000-0000-0000-0000-000000000019'::uuid, 'NPC', '/demo-club-gallery/nile-photography-club/photo-walk.png', 'Demo preview: campus photo walk with students carrying generic cameras.', 1),
    ('dd010000-0000-0000-0000-000000000020'::uuid, 'NPC', '/demo-club-gallery/nile-photography-club/editing-session.png', 'Demo preview: photo editing session with laptop thumbnails and camera gear.', 2),
    ('dd010000-0000-0000-0000-000000000021'::uuid, 'NSC', '/demo-club-gallery/nile-startup-campus/pitch-practice.png', 'Demo preview: startup pitch practice with charts, laptops, and sticky notes.', 1),
    ('dd010000-0000-0000-0000-000000000022'::uuid, 'NSC', '/demo-club-gallery/nile-startup-campus/founder-workshop.png', 'Demo preview: founder workshop with brainstorming boards and laptops.', 2),
    ('dd010000-0000-0000-0000-000000000023'::uuid, 'NTC', '/demo-club-gallery/nile-toastmasters-club/speaking-practice.png', 'Demo preview: speaking practice with microphone, podium, and audience.', 1),
    ('dd010000-0000-0000-0000-000000000024'::uuid, 'NTC', '/demo-club-gallery/nile-toastmasters-club/presentation-workshop.png', 'Demo preview: presentation workshop with note cards and audience chairs.', 2),
    ('dd010000-0000-0000-0000-000000000025'::uuid, 'TEDX', '/demo-club-gallery/tedx-nile-club/ideas-event-setup.png', 'Demo preview: ideas event setup with stage, microphone, and seating.', 1),
    ('dd010000-0000-0000-0000-000000000026'::uuid, 'TEDX', '/demo-club-gallery/tedx-nile-club/speaker-rehearsal.png', 'Demo preview: talk rehearsal with presentation setup and warm stage lighting.', 2),
    ('dd010000-0000-0000-0000-000000000027'::uuid, 'WIT', '/demo-club-gallery/women-in-tech-club/mentorship-workshop.png', 'Demo preview: inclusive tech mentorship workshop with laptops and notebooks.', 1),
    ('dd010000-0000-0000-0000-000000000028'::uuid, 'WIT', '/demo-club-gallery/women-in-tech-club/coding-session.png', 'Demo preview: inclusive coding session with laptops, code visuals, and teamwork.', 2)
),
actor as (
  select id as uploaded_by
  from public.profiles
  where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid
)
insert into public.club_media (id, club_id, storage_path, caption, display_order, uploaded_by)
select m.id, c.id, m.storage_path, m.caption, m.display_order, actor.uploaded_by
from media m
join public.clubs c on c.code = m.code
cross join actor
on conflict (storage_path) do update set
  caption = excluded.caption,
  display_order = excluded.display_order,
  uploaded_by = excluded.uploaded_by,
  updated_at = timezone('utc', now());

with demo_events (id, code, title, description, offset_days, event_time, location, aim_objectives, proposed_activity, participants, budget) as (
  values
    ('dd030000-0000-0000-0000-000000000001'::uuid, 'NBC', 'Book Discussion: Stories That Shape Us', 'Demo approved proposal for a guided reading discussion and reflection session.', 9, '15:00'::time, 'Library Reading Room', 'Encourage reading culture and discussion confidence.', 'Book discussion', 45, 80000::numeric),
    ('dd030000-0000-0000-0000-000000000002'::uuid, 'NSC', 'Startup Pitch Night', 'Demo approved proposal for student founders to pitch early ideas and receive feedback.', 14, '16:00'::time, 'Innovation Hub', 'Help students practice pitching and business storytelling.', 'Pitch night', 80, 180000::numeric),
    ('dd030000-0000-0000-0000-000000000003'::uuid, 'NPC', 'Golden Hour Campus Photo Walk', 'Demo approved proposal for a guided campus photo walk and editing clinic.', 18, '17:00'::time, 'Senate Building Courtyard', 'Teach composition, visual storytelling, and editing basics.', 'Photo walk', 35, 60000::numeric),
    ('dd030000-0000-0000-0000-000000000004'::uuid, 'NDC', 'Debate Night: Ideas and Impact', 'Demo approved proposal for a structured debate night with prepared speakers.', 21, '17:30'::time, 'LT A', 'Build research, confidence, and respectful argument skills.', 'Debate night', 70, 90000::numeric),
    ('dd030000-0000-0000-0000-000000000005'::uuid, 'NGD', 'Build Your First Campus App Workshop', 'Demo approved proposal for a practical software workshop by Nile Google Developers.', 25, '11:00'::time, 'Computer Lab 2', 'Introduce students to app prototyping and developer collaboration.', 'Tech workshop', 60, 150000::numeric),
    ('dd030000-0000-0000-0000-000000000006'::uuid, 'WIT', 'Women in Tech Mentorship Lab', 'Demo approved proposal for mentorship, career stories, and practical tech guidance.', 28, '13:00'::time, 'Engineering Seminar Room', 'Support women and allies entering technical careers.', 'Mentorship workshop', 55, 120000::numeric),
    ('dd030000-0000-0000-0000-000000000007'::uuid, 'NBUC', 'Campus Business Case Clinic', 'Demo approved proposal for teams to solve a practical campus business case with mentor feedback.', 11, '14:00'::time, 'Business School Seminar Room', 'Help students practice commercial thinking, teamwork, and presentation skills.', 'Business case clinic', 50, 95000::numeric),
    ('dd030000-0000-0000-0000-000000000008'::uuid, 'NCC', 'Community Care Planning Day', 'Demo approved proposal for planning a donation drive and assigning service teams.', 12, '12:00'::time, 'Student Affairs Lounge', 'Coordinate responsible student volunteering and community support.', 'Community service planning', 45, 70000::numeric),
    ('dd030000-0000-0000-0000-000000000009'::uuid, 'NCIC', 'Clean Campus Climate Action', 'Demo approved proposal for a hands-on sustainability awareness and recycling activity.', 16, '09:30'::time, 'Main Campus Walkway', 'Make climate action practical through cleanup, recycling, and peer education.', 'Climate action activity', 65, 110000::numeric),
    ('dd030000-0000-0000-0000-000000000010'::uuid, 'NCAC', 'Creative Showcase Rehearsal', 'Demo approved proposal for artists, performers, and designers to rehearse a student showcase.', 17, '15:30'::time, 'Arts Studio', 'Support creative confidence and collaborative campus performance.', 'Creative showcase rehearsal', 55, 100000::numeric),
    ('dd030000-0000-0000-0000-000000000011'::uuid, 'NGC', 'Friendly Games Tournament', 'Demo approved proposal for a relaxed board and digital games tournament.', 19, '16:30'::time, 'Student Centre', 'Create a healthy social space for teamwork, strategy, and recreation.', 'Games tournament', 70, 85000::numeric),
    ('dd030000-0000-0000-0000-000000000012'::uuid, 'NMUN', 'Diplomacy Simulation Workshop', 'Demo approved proposal for a guided Model United Nations simulation and caucus practice.', 23, '13:30'::time, 'International Relations Lab', 'Build negotiation, policy research, and diplomacy confidence.', 'Diplomacy simulation', 60, 120000::numeric),
    ('dd030000-0000-0000-0000-000000000013'::uuid, 'NTC', 'Speak With Confidence Session', 'Demo approved proposal for prepared speeches, peer feedback, and meeting leadership practice.', 26, '17:00'::time, 'Lecture Theatre B', 'Improve public speaking, listening, and structured feedback skills.', 'Public speaking session', 50, 65000::numeric),
    ('dd030000-0000-0000-0000-000000000014'::uuid, 'TEDX', 'Ideas Worth Sharing Rehearsal', 'Demo approved proposal for speaker coaching, stage rehearsal, and event planning.', 30, '15:00'::time, 'Main Auditorium', 'Help students shape clear, meaningful talks for a campus ideas event.', 'Speaker rehearsal', 75, 160000::numeric)
),
actors as (
  select
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid as admin_id,
    coalesce((select id from public.profiles where role = 'advisor' order by created_at limit 1), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid) as advisor_id,
    coalesce((select id from public.profiles where role in ('president', 'executive') order by created_at limit 1), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid) as submitter_id
)
insert into public.proposals (
  id,
  club_id,
  submitted_by,
  title,
  description,
  event_date,
  event_time,
  location,
  status,
  aim_objectives,
  proposed_activity,
  number_of_participants,
  budget_estimate,
  budget_line_items,
  responsible_members,
  submitted_at,
  revision_count,
  advisor_remarks,
  advisor_decided_at,
  advisor_decided_by,
  admin_remarks,
  admin_decided_at,
  admin_decided_by
)
select
  e.id,
  c.id,
  actors.submitter_id,
  e.title,
  e.description || ' Marker: demo_showcase_2026.',
  (current_date + e.offset_days)::date,
  e.event_time,
  e.location,
  'approved'::public.proposal_status,
  e.aim_objectives,
  e.proposed_activity,
  e.participants,
  e.budget,
  jsonb_build_array(jsonb_build_object('item', 'Demo event materials', 'quantity', 1, 'description', 'Showcase placeholder budget line', 'amount', e.budget)),
  jsonb_build_array(jsonb_build_object('name', 'Demo Club Executive', 'student_id', '020303344', 'phone_number', '08000000002', 'position', 'Event lead')),
  timezone('utc', now()) - interval '14 days',
  0,
  'Demo showcase: advisor recommended this proposal.',
  timezone('utc', now()) - interval '12 days',
  actors.advisor_id,
  'Demo showcase: approved by Club Services.',
  timezone('utc', now()) - interval '10 days',
  actors.admin_id
from demo_events e
join public.clubs c on c.code = e.code
cross join actors
on conflict (id) do update set
  club_id = excluded.club_id,
  title = excluded.title,
  description = excluded.description,
  event_date = excluded.event_date,
  event_time = excluded.event_time,
  location = excluded.location,
  status = excluded.status,
  aim_objectives = excluded.aim_objectives,
  proposed_activity = excluded.proposed_activity,
  number_of_participants = excluded.number_of_participants,
  budget_estimate = excluded.budget_estimate,
  budget_line_items = excluded.budget_line_items,
  responsible_members = excluded.responsible_members,
  advisor_remarks = excluded.advisor_remarks,
  advisor_decided_at = excluded.advisor_decided_at,
  advisor_decided_by = excluded.advisor_decided_by,
  admin_remarks = excluded.admin_remarks,
  admin_decided_at = excluded.admin_decided_at,
  admin_decided_by = excluded.admin_decided_by,
  updated_at = timezone('utc', now());

with demo_approvals (id, proposal_id, reviewer_id, reviewer_role, decision, remarks, decided_at) as (
  values
    ('dd031000-0000-0000-0000-000000000001'::uuid, 'dd030000-0000-0000-0000-000000000001'::uuid, coalesce((select id from public.profiles where role = 'advisor' order by created_at limit 1), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid), 'advisor'::public.app_role, 'approve'::public.approval_decision, 'Demo showcase: advisor approval for book discussion.', timezone('utc', now()) - interval '12 days'),
    ('dd032000-0000-0000-0000-000000000001'::uuid, 'dd030000-0000-0000-0000-000000000001'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'admin'::public.app_role, 'approve'::public.approval_decision, 'Demo showcase: admin final approval.', timezone('utc', now()) - interval '10 days'),
    ('dd031000-0000-0000-0000-000000000002'::uuid, 'dd030000-0000-0000-0000-000000000002'::uuid, coalesce((select id from public.profiles where role = 'advisor' order by created_at limit 1), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid), 'advisor'::public.app_role, 'approve'::public.approval_decision, 'Demo showcase: advisor approval for pitch night.', timezone('utc', now()) - interval '12 days'),
    ('dd032000-0000-0000-0000-000000000002'::uuid, 'dd030000-0000-0000-0000-000000000002'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'admin'::public.app_role, 'approve'::public.approval_decision, 'Demo showcase: admin final approval.', timezone('utc', now()) - interval '10 days'),
    ('dd031000-0000-0000-0000-000000000003'::uuid, 'dd030000-0000-0000-0000-000000000003'::uuid, coalesce((select id from public.profiles where role = 'advisor' order by created_at limit 1), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid), 'advisor'::public.app_role, 'approve'::public.approval_decision, 'Demo showcase: advisor approval for photo walk.', timezone('utc', now()) - interval '12 days'),
    ('dd032000-0000-0000-0000-000000000003'::uuid, 'dd030000-0000-0000-0000-000000000003'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'admin'::public.app_role, 'approve'::public.approval_decision, 'Demo showcase: admin final approval.', timezone('utc', now()) - interval '10 days'),
    ('dd031000-0000-0000-0000-000000000004'::uuid, 'dd030000-0000-0000-0000-000000000004'::uuid, coalesce((select id from public.profiles where role = 'advisor' order by created_at limit 1), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid), 'advisor'::public.app_role, 'approve'::public.approval_decision, 'Demo showcase: advisor approval for debate night.', timezone('utc', now()) - interval '12 days'),
    ('dd032000-0000-0000-0000-000000000004'::uuid, 'dd030000-0000-0000-0000-000000000004'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'admin'::public.app_role, 'approve'::public.approval_decision, 'Demo showcase: admin final approval.', timezone('utc', now()) - interval '10 days'),
    ('dd031000-0000-0000-0000-000000000005'::uuid, 'dd030000-0000-0000-0000-000000000005'::uuid, coalesce((select id from public.profiles where role = 'advisor' order by created_at limit 1), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid), 'advisor'::public.app_role, 'approve'::public.approval_decision, 'Demo showcase: advisor approval for developer workshop.', timezone('utc', now()) - interval '12 days'),
    ('dd032000-0000-0000-0000-000000000005'::uuid, 'dd030000-0000-0000-0000-000000000005'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'admin'::public.app_role, 'approve'::public.approval_decision, 'Demo showcase: admin final approval.', timezone('utc', now()) - interval '10 days'),
    ('dd031000-0000-0000-0000-000000000006'::uuid, 'dd030000-0000-0000-0000-000000000006'::uuid, coalesce((select id from public.profiles where role = 'advisor' order by created_at limit 1), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid), 'advisor'::public.app_role, 'approve'::public.approval_decision, 'Demo showcase: advisor approval for mentorship lab.', timezone('utc', now()) - interval '12 days'),
    ('dd032000-0000-0000-0000-000000000006'::uuid, 'dd030000-0000-0000-0000-000000000006'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'admin'::public.app_role, 'approve'::public.approval_decision, 'Demo showcase: admin final approval.', timezone('utc', now()) - interval '10 days'),
    ('dd031000-0000-0000-0000-000000000007'::uuid, 'dd030000-0000-0000-0000-000000000007'::uuid, coalesce((select id from public.profiles where role = 'advisor' order by created_at limit 1), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid), 'advisor'::public.app_role, 'approve'::public.approval_decision, 'Demo showcase: advisor approval for business case clinic.', timezone('utc', now()) - interval '12 days'),
    ('dd032000-0000-0000-0000-000000000007'::uuid, 'dd030000-0000-0000-0000-000000000007'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'admin'::public.app_role, 'approve'::public.approval_decision, 'Demo showcase: admin final approval.', timezone('utc', now()) - interval '10 days'),
    ('dd031000-0000-0000-0000-000000000008'::uuid, 'dd030000-0000-0000-0000-000000000008'::uuid, coalesce((select id from public.profiles where role = 'advisor' order by created_at limit 1), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid), 'advisor'::public.app_role, 'approve'::public.approval_decision, 'Demo showcase: advisor approval for community care planning.', timezone('utc', now()) - interval '12 days'),
    ('dd032000-0000-0000-0000-000000000008'::uuid, 'dd030000-0000-0000-0000-000000000008'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'admin'::public.app_role, 'approve'::public.approval_decision, 'Demo showcase: admin final approval.', timezone('utc', now()) - interval '10 days'),
    ('dd031000-0000-0000-0000-000000000009'::uuid, 'dd030000-0000-0000-0000-000000000009'::uuid, coalesce((select id from public.profiles where role = 'advisor' order by created_at limit 1), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid), 'advisor'::public.app_role, 'approve'::public.approval_decision, 'Demo showcase: advisor approval for climate action.', timezone('utc', now()) - interval '12 days'),
    ('dd032000-0000-0000-0000-000000000009'::uuid, 'dd030000-0000-0000-0000-000000000009'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'admin'::public.app_role, 'approve'::public.approval_decision, 'Demo showcase: admin final approval.', timezone('utc', now()) - interval '10 days'),
    ('dd031000-0000-0000-0000-000000000010'::uuid, 'dd030000-0000-0000-0000-000000000010'::uuid, coalesce((select id from public.profiles where role = 'advisor' order by created_at limit 1), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid), 'advisor'::public.app_role, 'approve'::public.approval_decision, 'Demo showcase: advisor approval for creative showcase rehearsal.', timezone('utc', now()) - interval '12 days'),
    ('dd032000-0000-0000-0000-000000000010'::uuid, 'dd030000-0000-0000-0000-000000000010'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'admin'::public.app_role, 'approve'::public.approval_decision, 'Demo showcase: admin final approval.', timezone('utc', now()) - interval '10 days'),
    ('dd031000-0000-0000-0000-000000000011'::uuid, 'dd030000-0000-0000-0000-000000000011'::uuid, coalesce((select id from public.profiles where role = 'advisor' order by created_at limit 1), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid), 'advisor'::public.app_role, 'approve'::public.approval_decision, 'Demo showcase: advisor approval for games tournament.', timezone('utc', now()) - interval '12 days'),
    ('dd032000-0000-0000-0000-000000000011'::uuid, 'dd030000-0000-0000-0000-000000000011'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'admin'::public.app_role, 'approve'::public.approval_decision, 'Demo showcase: admin final approval.', timezone('utc', now()) - interval '10 days'),
    ('dd031000-0000-0000-0000-000000000012'::uuid, 'dd030000-0000-0000-0000-000000000012'::uuid, coalesce((select id from public.profiles where role = 'advisor' order by created_at limit 1), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid), 'advisor'::public.app_role, 'approve'::public.approval_decision, 'Demo showcase: advisor approval for diplomacy simulation.', timezone('utc', now()) - interval '12 days'),
    ('dd032000-0000-0000-0000-000000000012'::uuid, 'dd030000-0000-0000-0000-000000000012'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'admin'::public.app_role, 'approve'::public.approval_decision, 'Demo showcase: admin final approval.', timezone('utc', now()) - interval '10 days'),
    ('dd031000-0000-0000-0000-000000000013'::uuid, 'dd030000-0000-0000-0000-000000000013'::uuid, coalesce((select id from public.profiles where role = 'advisor' order by created_at limit 1), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid), 'advisor'::public.app_role, 'approve'::public.approval_decision, 'Demo showcase: advisor approval for public speaking session.', timezone('utc', now()) - interval '12 days'),
    ('dd032000-0000-0000-0000-000000000013'::uuid, 'dd030000-0000-0000-0000-000000000013'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'admin'::public.app_role, 'approve'::public.approval_decision, 'Demo showcase: admin final approval.', timezone('utc', now()) - interval '10 days'),
    ('dd031000-0000-0000-0000-000000000014'::uuid, 'dd030000-0000-0000-0000-000000000014'::uuid, coalesce((select id from public.profiles where role = 'advisor' order by created_at limit 1), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid), 'advisor'::public.app_role, 'approve'::public.approval_decision, 'Demo showcase: advisor approval for ideas rehearsal.', timezone('utc', now()) - interval '12 days'),
    ('dd032000-0000-0000-0000-000000000014'::uuid, 'dd030000-0000-0000-0000-000000000014'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'admin'::public.app_role, 'approve'::public.approval_decision, 'Demo showcase: admin final approval.', timezone('utc', now()) - interval '10 days')
)
insert into public.approvals (id, proposal_id, reviewer_id, reviewer_role, decision, remarks, decided_at)
select id, proposal_id, reviewer_id, reviewer_role, decision, remarks, decided_at
from demo_approvals
on conflict (id) do nothing;

with demo_announcements (id, code, title, message, priority) as (
  values
    ('dd040000-0000-0000-0000-000000000001'::uuid, 'NBC', 'Demo preview: Book discussion reminder', 'Our upcoming book discussion is visible here as sample announcement content for the showcase.', 'normal'),
    ('dd040000-0000-0000-0000-000000000002'::uuid, 'NSC', 'Demo preview: Pitch night prep', 'Startup Campus members should review pitch slides and arrival time for the approved pitch night.', 'high'),
    ('dd040000-0000-0000-0000-000000000003'::uuid, 'NPC', 'Demo preview: Photo walk update', 'Photography Club members can check the event page for location and RSVP details.', 'normal'),
    ('dd040000-0000-0000-0000-000000000004'::uuid, 'NDC', 'Demo preview: Debate night speakers', 'Debate Club speakers should confirm their talking points before the next practice session.', 'normal'),
    ('dd040000-0000-0000-0000-000000000005'::uuid, 'NGD', 'Demo preview: Tech workshop RSVP', 'Seats for the developer workshop are limited. RSVP from the event page to help planning.', 'high'),
    ('dd040000-0000-0000-0000-000000000006'::uuid, 'WIT', 'Demo preview: Mentorship onboarding', 'Approved members will see onboarding instructions in their membership status after verification.', 'normal'),
    ('dd040000-0000-0000-0000-000000000007'::uuid, 'NCC', 'Demo preview: Dues verification reminder', 'Members with submitted proof should wait for Club Services verification before receiving the paid badge.', 'normal'),
    ('dd040000-0000-0000-0000-000000000008'::uuid, 'NBUC', 'Demo preview: Case clinic teams', 'Business Club teams should bring one practical campus problem for the case clinic activity.', 'normal'),
    ('dd040000-0000-0000-0000-000000000009'::uuid, 'NCIC', 'Demo preview: Climate action volunteers', 'Climate Initiatives members can sign up for recycling and awareness teams before the activity starts.', 'normal'),
    ('dd040000-0000-0000-0000-000000000010'::uuid, 'NCAC', 'Demo preview: Creative showcase rehearsal', 'Creative Arts members should confirm rehearsal slots and bring any materials needed for the showcase.', 'normal'),
    ('dd040000-0000-0000-0000-000000000011'::uuid, 'NGC', 'Demo preview: Tournament sign-up', 'Games Club members can RSVP early so brackets and game stations are ready before the tournament.', 'normal'),
    ('dd040000-0000-0000-0000-000000000012'::uuid, 'NMUN', 'Demo preview: Simulation preparation', 'Model United Nations members should review their country notes before the diplomacy simulation.', 'normal'),
    ('dd040000-0000-0000-0000-000000000013'::uuid, 'NTC', 'Demo preview: Speaking roles', 'Toastmasters members can choose speaking, evaluator, and meeting leadership roles for the next session.', 'normal'),
    ('dd040000-0000-0000-0000-000000000014'::uuid, 'TEDX', 'Demo preview: Speaker rehearsal', 'TEDx Nile members should review speaker notes, stage timing, and rehearsal responsibilities.', 'high')
)
insert into public.announcements (id, club_id, created_by, title, message, audience, priority, target_role)
select a.id, c.id, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, a.title, a.message || ' Marker: demo_showcase_2026.', 'club', a.priority, null
from demo_announcements a
join public.clubs c on c.code = a.code
on conflict (id) do update set
  title = excluded.title,
  message = excluded.message,
  audience = excluded.audience,
  priority = excluded.priority,
  target_role = excluded.target_role,
  updated_at = timezone('utc', now());

with member_rows (id, code, profile_id, full_name, student_id, email, status) as (
  values
    ('dd050000-0000-0000-0000-000000000001'::uuid, 'WIT', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'Ada Student', '242124563', 'student@nilehive.test', 'active'::public.membership_status),
    ('dd050000-0000-0000-0000-000000000002'::uuid, 'NSC', '99999999-9999-9999-9999-999999999999'::uuid, 'Dues Student', '020303346', 'dues.student@nilehive.test', 'inactive'::public.membership_status),
    ('dd050000-0000-0000-0000-000000000003'::uuid, 'NCC', '99999999-9999-9999-9999-999999999999'::uuid, 'Dues Student', '020303346', 'dues.student@nilehive.test', 'inactive'::public.membership_status),
    ('dd050000-0000-0000-0000-000000000004'::uuid, 'NBC', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'Ada Student', '242124563', 'student@nilehive.test', 'active'::public.membership_status),
    ('dd050000-0000-0000-0000-000000000005'::uuid, 'NBUC', 'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid, 'Tomi Student', '020303345', 'second.student@nilehive.test', 'active'::public.membership_status),
    ('dd050000-0000-0000-0000-000000000006'::uuid, 'NCIC', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'Ada Student', '242124563', 'student@nilehive.test', 'active'::public.membership_status),
    ('dd050000-0000-0000-0000-000000000007'::uuid, 'NCAC', 'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid, 'Tomi Student', '020303345', 'second.student@nilehive.test', 'active'::public.membership_status),
    ('dd050000-0000-0000-0000-000000000008'::uuid, 'NDC', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'Ada Student', '242124563', 'student@nilehive.test', 'active'::public.membership_status),
    ('dd050000-0000-0000-0000-000000000009'::uuid, 'NGC', 'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid, 'Tomi Student', '020303345', 'second.student@nilehive.test', 'active'::public.membership_status),
    ('dd050000-0000-0000-0000-000000000010'::uuid, 'NGD', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'Ada Student', '242124563', 'student@nilehive.test', 'active'::public.membership_status),
    ('dd050000-0000-0000-0000-000000000011'::uuid, 'NMUN', 'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid, 'Tomi Student', '020303345', 'second.student@nilehive.test', 'active'::public.membership_status),
    ('dd050000-0000-0000-0000-000000000012'::uuid, 'NPC', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'Ada Student', '242124563', 'student@nilehive.test', 'active'::public.membership_status),
    ('dd050000-0000-0000-0000-000000000013'::uuid, 'NTC', 'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid, 'Tomi Student', '020303345', 'second.student@nilehive.test', 'active'::public.membership_status),
    ('dd050000-0000-0000-0000-000000000014'::uuid, 'TEDX', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'Ada Student', '242124563', 'student@nilehive.test', 'active'::public.membership_status)
)
insert into public.club_members (id, club_id, profile_id, full_name, student_id, email, phone_number, club_role, membership_status, created_at)
select m.id, c.id, m.profile_id, m.full_name, m.student_id, m.email, '08000000003', 'member', m.status, timezone('utc', now()) - interval '9 days'
from member_rows m
join public.clubs c on c.code = m.code
on conflict (club_id, student_id) do update set
  profile_id = excluded.profile_id,
  full_name = excluded.full_name,
  email = excluded.email,
  phone_number = excluded.phone_number,
  club_role = excluded.club_role,
  membership_status = excluded.membership_status,
  updated_at = timezone('utc', now());

with payment_rows (id, member_id, code, amount, reference, proof_url, status, verified_at, submitted_offset) as (
  values
    ('dd060000-0000-0000-0000-000000000001'::uuid, 'dd050000-0000-0000-0000-000000000001'::uuid, 'WIT', 10000::numeric, 'DEMO-WIT-PAID-001', 'dues-receipts/demo_showcase_2026/wit-paid-proof.pdf', 'paid'::public.due_payment_status, timezone('utc', now()) - interval '5 days', 7),
    ('dd060000-0000-0000-0000-000000000002'::uuid, 'dd050000-0000-0000-0000-000000000002'::uuid, 'NSC', 10000::numeric, 'DEMO-NSC-SUBMITTED-001', 'dues-receipts/demo_showcase_2026/nsc-submitted-proof.pdf', 'submitted'::public.due_payment_status, null::timestamptz, 2),
    ('dd060000-0000-0000-0000-000000000003'::uuid, 'dd050000-0000-0000-0000-000000000003'::uuid, 'NCC', 10000::numeric, 'DEMO-NCC-REJECTED-001', 'dues-receipts/demo_showcase_2026/ncc-rejected-proof.pdf', 'rejected'::public.due_payment_status, null::timestamptz, 4)
)
insert into public.due_payments (
  id,
  club_id,
  member_id,
  amount,
  academic_session,
  payment_reference,
  payment_account_name,
  payment_paid_at,
  payer_note,
  proof_url,
  submitted_at,
  status,
  verified_by,
  verified_at,
  created_at
)
select
  p.id,
  c.id,
  p.member_id,
  p.amount,
  '2025/2026',
  p.reference,
  'Ada Student',
  current_date - p.submitted_offset,
  'Demo showcase payment status example.',
  p.proof_url,
  timezone('utc', now()) - (p.submitted_offset || ' days')::interval,
  p.status,
  case when p.status = 'paid' then 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid else null end,
  p.verified_at,
  timezone('utc', now()) - (p.submitted_offset || ' days')::interval
from payment_rows p
join public.clubs c on c.code = p.code
on conflict (id) do update set
  payment_reference = excluded.payment_reference,
  payment_account_name = excluded.payment_account_name,
  payment_paid_at = excluded.payment_paid_at,
  payer_note = excluded.payer_note,
  proof_url = excluded.proof_url,
  submitted_at = excluded.submitted_at,
  status = excluded.status,
  verified_by = excluded.verified_by,
  verified_at = excluded.verified_at,
  updated_at = timezone('utc', now());

with request_rows (
  id,
  profile_id,
  code,
  status,
  remarks,
  decision_remarks,
  member_id,
  due_payment_id,
  whatsapp_status,
  whatsapp_notes,
  created_offset
) as (
  values
    ('dd070000-0000-0000-0000-000000000001'::uuid, 'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid, 'NBC', 'pending'::public.membership_request_status, 'Demo showcase: student wants to join Book Club.', null, null::uuid, null::uuid, 'not_ready', null, 1),
    ('dd070000-0000-0000-0000-000000000002'::uuid, '99999999-9999-9999-9999-999999999999'::uuid, 'NSC', 'approved_pending_dues'::public.membership_request_status, 'Demo showcase: approved request waiting for dues verification.', 'Dues proof has been submitted and is under review.', 'dd050000-0000-0000-0000-000000000002'::uuid, 'dd060000-0000-0000-0000-000000000002'::uuid, 'not_ready', null, 2),
    ('dd070000-0000-0000-0000-000000000003'::uuid, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'WIT', 'active'::public.membership_request_status, 'Demo showcase: active paid member.', 'Dues verified. Membership is active.', 'dd050000-0000-0000-0000-000000000001'::uuid, 'dd060000-0000-0000-0000-000000000001'::uuid, 'ready', 'Demo onboarding note: approved members receive private onboarding instructions from club leaders.', 7),
    ('dd070000-0000-0000-0000-000000000004'::uuid, '99999999-9999-9999-9999-999999999999'::uuid, 'NCC', 'approved_pending_dues'::public.membership_request_status, 'Demo showcase: proof was rejected and can be uploaded again.', 'Receipt image was unclear. Please upload a clearer proof of payment.', 'dd050000-0000-0000-0000-000000000003'::uuid, 'dd060000-0000-0000-0000-000000000003'::uuid, 'not_ready', null, 4)
)
insert into public.membership_requests (
  id,
  profile_id,
  club_id,
  requested_role,
  status,
  remarks,
  decision_remarks,
  reviewed_by,
  reviewed_at,
  member_id,
  due_payment_id,
  dues_amount,
  academic_session,
  student_type,
  join_reason,
  whatsapp_onboarding_status,
  whatsapp_added_by,
  whatsapp_added_at,
  whatsapp_onboarding_notes,
  created_at
)
select
  r.id,
  r.profile_id,
  c.id,
  'member',
  r.status,
  r.remarks,
  r.decision_remarks,
  case when r.status <> 'pending' then 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid else null end,
  case when r.status <> 'pending' then timezone('utc', now()) - interval '3 days' else null end,
  r.member_id,
  r.due_payment_id,
  case when r.status = 'pending' then null else 10000 end,
  case when r.status = 'pending' then null else '2025/2026' end,
  'returning',
  'Demo showcase interest in club activity.',
  r.whatsapp_status,
  null,
  null,
  r.whatsapp_notes,
  timezone('utc', now()) - (r.created_offset || ' days')::interval
from request_rows r
join public.clubs c on c.code = r.code
on conflict (id) do update set
  status = excluded.status,
  remarks = excluded.remarks,
  decision_remarks = excluded.decision_remarks,
  reviewed_by = excluded.reviewed_by,
  reviewed_at = excluded.reviewed_at,
  member_id = excluded.member_id,
  due_payment_id = excluded.due_payment_id,
  dues_amount = excluded.dues_amount,
  academic_session = excluded.academic_session,
  student_type = excluded.student_type,
  join_reason = excluded.join_reason,
  whatsapp_onboarding_status = excluded.whatsapp_onboarding_status,
  whatsapp_onboarding_notes = excluded.whatsapp_onboarding_notes,
  updated_at = timezone('utc', now());

insert into public.event_rsvps (id, proposal_id, club_id, user_id, status, created_at)
select
  r.id,
  r.proposal_id,
  p.club_id,
  r.user_id,
  'going',
  timezone('utc', now()) - interval '2 days'
from (
  values
    ('dd080000-0000-0000-0000-000000000001'::uuid, 'dd030000-0000-0000-0000-000000000001'::uuid, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid),
    ('dd080000-0000-0000-0000-000000000002'::uuid, 'dd030000-0000-0000-0000-000000000002'::uuid, '99999999-9999-9999-9999-999999999999'::uuid),
    ('dd080000-0000-0000-0000-000000000003'::uuid, 'dd030000-0000-0000-0000-000000000005'::uuid, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid)
) as r(id, proposal_id, user_id)
join public.proposals p on p.id = r.proposal_id
on conflict (proposal_id, user_id) do update set
  status = excluded.status,
  updated_at = timezone('utc', now());

insert into public.event_attendance (id, proposal_id, club_id, user_id, attended, checked_in_by, checked_in_at, created_at)
select
  a.id,
  a.proposal_id,
  p.club_id,
  a.user_id,
  true,
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  timezone('utc', now()) - interval '1 day',
  timezone('utc', now()) - interval '1 day'
from (
  values
    ('dd090000-0000-0000-0000-000000000001'::uuid, 'dd030000-0000-0000-0000-000000000001'::uuid, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid),
    ('dd090000-0000-0000-0000-000000000002'::uuid, 'dd030000-0000-0000-0000-000000000005'::uuid, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid)
) as a(id, proposal_id, user_id)
join public.proposals p on p.id = a.proposal_id
on conflict (proposal_id, user_id) do update set
  attended = excluded.attended,
  checked_in_by = excluded.checked_in_by,
  checked_in_at = excluded.checked_in_at,
  updated_at = timezone('utc', now());

insert into public.event_feedback (id, club_id, proposal_id, submitted_by, category, rating, comment, status, created_at)
select f.id, c.id, f.proposal_id, f.submitted_by, f.category, f.rating, f.comment, 'open', timezone('utc', now()) - interval '2 days'
from (
  values
    ('dd0a0000-0000-0000-0000-000000000001'::uuid, 'WIT', 'dd030000-0000-0000-0000-000000000006'::uuid, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'event', 5, 'Demo showcase feedback: mentorship session was easy to understand.'),
    ('dd0a0000-0000-0000-0000-000000000002'::uuid, 'NCC', null::uuid, '99999999-9999-9999-9999-999999999999'::uuid, 'dues_payment', 3, 'Demo showcase feedback: dues proof rejection message was helpful.')
) as f(id, code, proposal_id, submitted_by, category, rating, comment)
join public.clubs c on c.code = f.code
on conflict (id) do update set
  category = excluded.category,
  rating = excluded.rating,
  comment = excluded.comment,
  status = excluded.status,
  updated_at = timezone('utc', now());

with task_rows (id, code, title, description, priority, status, due_offset) as (
  values
    ('dd0b0000-0000-0000-0000-000000000001'::uuid, 'NBC', 'Prepare discussion guide', 'Demo showcase task: draft three conversation prompts for the book discussion.', 'medium'::public.task_priority, 'in_progress'::public.task_status, 5),
    ('dd0b0000-0000-0000-0000-000000000002'::uuid, 'NBUC', 'Confirm case clinic mentors', 'Demo showcase task: confirm mentor availability and prepare feedback sheets.', 'high'::public.task_priority, 'pending'::public.task_status, 6),
    ('dd0b0000-0000-0000-0000-000000000003'::uuid, 'NCC', 'Sort outreach materials', 'Demo showcase task: organize donated items and confirm volunteer teams.', 'medium'::public.task_priority, 'pending'::public.task_status, 4),
    ('dd0b0000-0000-0000-0000-000000000004'::uuid, 'NCIC', 'Print recycling station labels', 'Demo showcase task: prepare simple labels for recycling awareness points.', 'low'::public.task_priority, 'completed'::public.task_status, 3),
    ('dd0b0000-0000-0000-0000-000000000005'::uuid, 'NCAC', 'Build rehearsal schedule', 'Demo showcase task: collect performance slots and publish the rehearsal order.', 'medium'::public.task_priority, 'in_progress'::public.task_status, 7),
    ('dd0b0000-0000-0000-0000-000000000006'::uuid, 'NDC', 'Assign speaker positions', 'Demo showcase task: confirm opening, rebuttal, and closing speaker roles.', 'high'::public.task_priority, 'pending'::public.task_status, 5),
    ('dd0b0000-0000-0000-0000-000000000007'::uuid, 'NGC', 'Set up tournament brackets', 'Demo showcase task: prepare bracket sheets and station assignments.', 'medium'::public.task_priority, 'pending'::public.task_status, 6),
    ('dd0b0000-0000-0000-0000-000000000008'::uuid, 'NGD', 'Prepare starter project repo', 'Demo showcase task: upload workshop starter files and setup notes.', 'high'::public.task_priority, 'in_progress'::public.task_status, 8),
    ('dd0b0000-0000-0000-0000-000000000009'::uuid, 'NMUN', 'Share country brief template', 'Demo showcase task: send delegates a short research template before simulation.', 'medium'::public.task_priority, 'completed'::public.task_status, 4),
    ('dd0b0000-0000-0000-0000-000000000010'::uuid, 'NPC', 'Confirm photo walk route', 'Demo showcase task: pick campus stops and safety notes for the photo walk.', 'medium'::public.task_priority, 'pending'::public.task_status, 7),
    ('dd0b0000-0000-0000-0000-000000000011'::uuid, 'NSC', 'Collect pitch night slides', 'Demo showcase task: remind presenters to submit their pitch decks before review.', 'high'::public.task_priority, 'in_progress'::public.task_status, 6),
    ('dd0b0000-0000-0000-0000-000000000012'::uuid, 'NTC', 'Assign meeting roles', 'Demo showcase task: assign speaker, evaluator, timer, and host roles.', 'medium'::public.task_priority, 'pending'::public.task_status, 5),
    ('dd0b0000-0000-0000-0000-000000000013'::uuid, 'TEDX', 'Review speaker timing', 'Demo showcase task: time each talk and note coaching points for rehearsal.', 'high'::public.task_priority, 'pending'::public.task_status, 8),
    ('dd0b0000-0000-0000-0000-000000000014'::uuid, 'WIT', 'Prepare mentorship sign-in', 'Demo showcase task: prepare sign-in sheet and mentor pairing notes.', 'medium'::public.task_priority, 'completed'::public.task_status, 3)
),
actors as (
  select
    coalesce((select id from public.profiles where role in ('president', 'admin') order by case role when 'president' then 0 else 1 end, created_at limit 1), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid) as assigned_by,
    coalesce((select id from public.profiles where role = 'executive' order by created_at limit 1), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid) as assigned_to
)
insert into public.tasks (id, club_id, assigned_by, assigned_to, title, description, priority, status, due_date, created_at)
select
  t.id,
  c.id,
  actors.assigned_by,
  actors.assigned_to,
  t.title,
  t.description,
  t.priority,
  t.status,
  current_date + t.due_offset,
  timezone('utc', now()) - interval '2 days'
from task_rows t
join public.clubs c on c.code = t.code
cross join actors
on conflict (id) do update set
  club_id = excluded.club_id,
  assigned_by = excluded.assigned_by,
  assigned_to = excluded.assigned_to,
  title = excluded.title,
  description = excluded.description,
  priority = excluded.priority,
  status = excluded.status,
  due_date = excluded.due_date,
  updated_at = timezone('utc', now());

with daily_users(activity_date, user_id, role) as (
  values
    (current_date - 6, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'admin'),
    (current_date - 6, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'student'),
    (current_date - 5, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'student'),
    (current_date - 5, 'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid, 'student'),
    (current_date - 4, '99999999-9999-9999-9999-999999999999'::uuid, 'student'),
    (current_date - 3, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'admin'),
    (current_date - 3, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'student'),
    (current_date - 2, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'president'),
    (current_date - 2, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'student'),
    (current_date - 1, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'admin'),
    (current_date - 1, '99999999-9999-9999-9999-999999999999'::uuid, 'student')
)
insert into public.usage_daily_active_users (activity_date, user_id, role)
select activity_date, user_id, role
from daily_users
on conflict (activity_date, user_id) do update set role = excluded.role;

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
insert into public.usage_daily_metrics (activity_date, feature, event_count)
select activity_date, feature, event_count
from demo_metrics
on conflict (activity_date, feature) do update set
  event_count = greatest(public.usage_daily_metrics.event_count, excluded.event_count),
  updated_at = timezone('utc', now());

commit;
