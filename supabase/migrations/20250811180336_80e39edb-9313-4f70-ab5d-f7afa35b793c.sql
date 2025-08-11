
-- 1) Remove invalid demo users that were directly inserted into auth.users (and identities)
-- NOTE: Modifying auth schema is generally discouraged, but necessary here to undo bad data.
-- These deletes are safe and idempotent.

-- Delete identities first (if any exist)
delete from auth.identities
where user_id in (
  select id from auth.users
  where email in ('user1@demo.com', 'user2@demo.com', 'user3@demo.com')
     or email like '%@demo.com'
);

-- Delete the users themselves; profiles will cascade delete via FK
delete from auth.users
where email in ('user1@demo.com', 'user2@demo.com', 'user3@demo.com')
   or email like '%@demo.com';

-- 2) Recreate a robust handle_new_user function and trigger

-- Drop the existing trigger and function if they exist
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user cascade;

-- Create a new SECURITY DEFINER function with safe search_path and idempotent insert
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'name', new.email),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'panjar'::public.user_role)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Recreate the trigger on auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3) Ensure RLS allows the insert via the trigger
-- Profiles table should already have RLS enabled from your migration.
-- Recreate a strict INSERT policy so the trigger (running as definer) can work safely.
drop policy if exists "Users can insert their own profile" on public.profiles;

create policy "Users can insert their own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);
