
-- Create demo users with proper password hashing
INSERT INTO auth.users (
  id, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at, 
  raw_user_meta_data,
  aud,
  role
) VALUES 
(
  '11111111-1111-1111-1111-111111111111',
  'user1@demo.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"username": "user1", "name": "User Panjar", "role": "panjar"}'::jsonb,
  'authenticated',
  'authenticated'
),
(
  '22222222-2222-2222-2222-222222222222',
  'user2@demo.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"username": "user2", "name": "User Karung", "role": "karung"}'::jsonb,
  'authenticated',
  'authenticated'
),
(
  '33333333-3333-3333-3333-333333333333',
  'user3@demo.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"username": "user3", "name": "Admin/Supervisor", "role": "admin"}'::jsonb,
  'authenticated',
  'authenticated'
);
