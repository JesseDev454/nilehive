-- Seed data for local Supabase development.
-- If your managed Supabase project blocks direct writes into auth.users,
-- create these users through the dashboard and keep the same UUIDs here.

with seed_users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) as (
  values
    (
      '00000000-0000-0000-0000-000000000000',
      '11111111-1111-1111-1111-111111111111',
      'authenticated',
      'authenticated',
      'executive@nilehive.test',
      crypt('password123', gen_salt('bf')),
      timezone('utc', now()),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Amina Executive"}',
      timezone('utc', now()),
      timezone('utc', now()),
      '',
      '',
      '',
      ''
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      '22222222-2222-2222-2222-222222222222',
      'authenticated',
      'authenticated',
      'advisor@nilehive.test',
      crypt('password123', gen_salt('bf')),
      timezone('utc', now()),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Daniel Advisor"}',
      timezone('utc', now()),
      timezone('utc', now()),
      '',
      '',
      '',
      ''
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      '44444444-4444-4444-4444-444444444444',
      'authenticated',
      'authenticated',
      'president@nilehive.test',
      crypt('password123', gen_salt('bf')),
      timezone('utc', now()),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Tomi President"}',
      timezone('utc', now()),
      timezone('utc', now()),
      '',
      '',
      '',
      ''
    )
)
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
select
  su.instance_id::uuid,
  su.id::uuid,
  su.aud,
  su.role,
  su.email,
  su.encrypted_password,
  su.email_confirmed_at,
  su.raw_app_meta_data::jsonb,
  su.raw_user_meta_data::jsonb,
  su.created_at,
  su.updated_at,
  su.confirmation_token,
  su.email_change,
  su.email_change_token_new,
  su.recovery_token
from seed_users su
where not exists (
  select 1
  from auth.users u
  where u.id = su.id::uuid or lower(u.email) = lower(su.email)
);

insert into public.clubs (id, name, description, code)
values (
  '33333333-3333-3333-3333-333333333333',
  'Nile Innovators Club',
  'A club dedicated to building tech projects and leading innovation. (Test Club)',
  'NIC'
),
(
  '33333333-3333-3333-3333-000000000001',
  'Nile Book Club',
  'Dive into the world of literature with fellow bookworms. Discover new genres, share your favourite reads, and engage in lively discussions that will broaden your horizons.',
  'NBC'
),
(
  '33333333-3333-3333-3333-000000000002',
  'Nile Business Club',
  'Explore the world of entrepreneurship and business. This club offers networking opportunities, workshops, and events to help you develop your entrepreneurial skills and business acumen.',
  'NBUC'
),
(
  '33333333-3333-3333-3333-000000000003',
  'Nile Charity Club',
  'Make a meaningful impact on the community by participating in philanthropic endeavours. Join hands with fellow students to contribute to social causes and promote compassion.',
  'NCC'
),
(
  '33333333-3333-3333-3333-000000000004',
  'Nile Climate Initiatives Club',
  'Be part of the solution to environmental challenges. Join this club to engage in sustainability projects, raise awareness about climate issues, and work towards a greener future.',
  'NCIC'
),
(
  '33333333-3333-3333-3333-000000000005',
  'Nile Creative Arts Club',
  'Unleash your creativity and explore various forms of artistic expression. This club is a hub for aspiring artists, musicians, and performers to collaborate and showcase their talents.',
  'NCAC'
),
(
  '33333333-3333-3333-3333-000000000006',
  'Nile Debate Club',
  'Sharpen your argumentative skills, engage in thought-provoking discussions, and let your voice be heard. Whether you are passionate about politics, and philosophy, or simply love a good debate, this club is the perfect platform for you.',
  'NDC'
),
(
  '33333333-3333-3333-3333-000000000007',
  'Nile Games Club',
  'Embrace your competitive spirit and love for games. Whether you''re into board games, video games, or sports, this club offers a fun way to relax and connect with others who share your passion.',
  'NGC'
),
(
  '33333333-3333-3333-3333-000000000008',
  'Nile Google Developers',
  'Join a global community of developers and tech enthusiasts. This club offers opportunities to learn, collaborate on projects, and stay updated with the latest in technology from Google.',
  'NGD'
),
(
  '33333333-3333-3333-3333-000000000009',
  'Nile Model United Nations Club',
  'Become a global diplomat and tackle pressing international issues. Model UN offers you a chance to develop your negotiation, research, and diplomacy skills while simulating the workings of the United Nations.',
  'NMUN'
),
(
  '33333333-3333-3333-3333-000000000010',
  'Nile Photography Club',
  'Capture the world through your lens. Whether you''re a seasoned photographer or a novice with a camera, this club is the perfect place to learn and showcase your photography skills.',
  'NPC'
),
(
  '33333333-3333-3333-3333-000000000011',
  'Nile Startup Campus',
  'Dive into the world of startups, innovation, and entrepreneurship. Connect with like-minded individuals, learn from successful entrepreneurs, and turn your ideas into reality.',
  'NSC'
),
(
  '33333333-3333-3333-3333-000000000012',
  'Nile Toastmaster''s Club',
  'Unleash your inner orator and conquer your fear of public speaking. Toastmasters is where you can refine your communication skills, boost your confidence, and become a captivating speaker.',
  'NTC'
),
(
  '33333333-3333-3333-3333-000000000013',
  'TEDx Nile Club',
  'Inspire and be inspired. This club brings the power of TED Talks to your university, allowing you to organize and participate in TEDx events that showcase groundbreaking ideas.',
  'TEDX'
),
(
  '33333333-3333-3333-3333-000000000014',
  'Women in Tech Club',
  'Break boundaries and inspire innovation. Join a community of like-minded women who are shaping the future of technology and making strides in a traditionally male-dominated field.',
  'WIT'
)
on conflict (name) do update set
  description = excluded.description,
  code = excluded.code;

update public.clubs
set is_public_signup = false
where name = 'Nile Innovators Club';

insert into public.profiles (id, full_name, role, club_id)
select
  u.id,
  'Amina Executive',
  'executive'::app_role,
  (select c.id from public.clubs c where c.name = 'Nile Innovators Club')
from auth.users u
where lower(u.email) = lower('executive@nilehive.test')
union all
select
  u.id,
  'Tomi President',
  'president'::app_role,
  (select c.id from public.clubs c where c.name = 'Nile Innovators Club')
from auth.users u
where lower(u.email) = lower('president@nilehive.test')
union all
select
  u.id,
  'Daniel Advisor',
  'advisor'::app_role,
  null
from auth.users u
where lower(u.email) = lower('advisor@nilehive.test')
on conflict (id) do update set
  full_name = excluded.full_name,
  role = excluded.role,
  club_id = excluded.club_id;

update public.clubs c
set advisor_id = u.id
from auth.users u
where c.name = 'Nile Innovators Club'
  and lower(u.email) = lower('advisor@nilehive.test');
