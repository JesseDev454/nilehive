-- Production club bootstrap.
-- Use this only to insert the real official clubs for a clean production project.
-- Do not add demo/test clubs here.
-- Safe to rerun: it upserts by club name.
--
-- Run this in the production Supabase SQL Editor after migrations.

insert into public.clubs (name, description, code, is_public_signup)
values
  (
    'Nile Book Club',
    'Dive into the world of literature with fellow bookworms. Discover new genres, share your favourite reads, and engage in lively discussions that will broaden your horizons.',
    'NBC',
    true
  ),
  (
    'Nile Business Club',
    'Explore the world of entrepreneurship and business. This club offers networking opportunities, workshops, and events to help you develop your entrepreneurial skills and business acumen.',
    'NBUC',
    true
  ),
  (
    'Nile Charity Club',
    'Make a meaningful impact on the community by participating in philanthropic endeavours. Join hands with fellow students to contribute to social causes and promote compassion.',
    'NCC',
    true
  ),
  (
    'Nile Climate Initiatives Club',
    'Be part of the solution to environmental challenges. Join this club to engage in sustainability projects, raise awareness about climate issues, and work towards a greener future.',
    'NCIC',
    true
  ),
  (
    'Nile Creative Arts Club',
    'Unleash your creativity and explore various forms of artistic expression. This club is a hub for aspiring artists, musicians, and performers to collaborate and showcase their talents.',
    'NCAC',
    true
  ),
  (
    'Nile Debate Club',
    'Sharpen your argumentative skills, engage in thought-provoking discussions, and let your voice be heard. Whether you are passionate about politics, and philosophy, or simply love a good debate, this club is the perfect platform for you.',
    'NDC',
    true
  ),
  (
    'Nile Games Club',
    'Embrace your competitive spirit and love for games. Whether you''re into board games, video games, or sports, this club offers a fun way to relax and connect with others who share your passion.',
    'NGC',
    true
  ),
  (
    'Nile Google Developers',
    'Join a global community of developers and tech enthusiasts. This club offers opportunities to learn, collaborate on projects, and stay updated with the latest in technology from Google.',
    'NGD',
    true
  ),
  (
    'Nile Model United Nations Club',
    'Become a global diplomat and tackle pressing international issues. Model UN offers you a chance to develop your negotiation, research, and diplomacy skills while simulating the workings of the United Nations.',
    'NMUN',
    true
  ),
  (
    'Nile Photography Club',
    'Capture the world through your lens. Whether you''re a seasoned photographer or a novice with a camera, this club is the perfect place to learn and showcase your photography skills.',
    'NPC',
    true
  ),
  (
    'Nile Startup Campus',
    'Dive into the world of startups, innovation, and entrepreneurship. Connect with like-minded individuals, learn from successful entrepreneurs, and turn your ideas into reality.',
    'NSC',
    true
  ),
  (
    'Nile Toastmaster''s Club',
    'Unleash your inner orator and conquer your fear of public speaking. Toastmasters is where you can refine your communication skills, boost your confidence, and become a captivating speaker.',
    'NTC',
    true
  ),
  (
    'TEDx Nile Club',
    'Inspire and be inspired. This club brings the power of TED Talks to your university, allowing you to organize and participate in TEDx events that showcase groundbreaking ideas.',
    'TEDX',
    true
  ),
  (
    'Women in Tech Club',
    'Break boundaries and inspire innovation. Join a community of like-minded women who are shaping the future of technology and making strides in a traditionally male-dominated field.',
    'WIT',
    true
  )
on conflict (name) do update set
  description = excluded.description,
  code = excluded.code,
  is_public_signup = excluded.is_public_signup;

select id, name, code, is_public_signup
from public.clubs
order by name asc;
