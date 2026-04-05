-- Seed data for local Supabase development.
-- If your managed Supabase project blocks direct writes into auth.users,
-- create these users through the dashboard and keep the same UUIDs here.

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
) values
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
  )
on conflict (id) do nothing;

insert into public.clubs (id, name, code)
values (
  '33333333-3333-3333-3333-333333333333',
  'Nile Innovators Club',
  'NIC'
)
on conflict (id) do nothing;

insert into public.profiles (id, full_name, role, club_id)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'Amina Executive',
    'executive',
    '33333333-3333-3333-3333-333333333333'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Daniel Advisor',
    'advisor',
    null
  )
on conflict (id) do update set
  full_name = excluded.full_name,
  role = excluded.role,
  club_id = excluded.club_id;

update public.clubs
set advisor_id = '22222222-2222-2222-2222-222222222222'
where id = '33333333-3333-3333-3333-333333333333';

