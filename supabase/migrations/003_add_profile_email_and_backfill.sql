-- Migration 003: add missing `email` column to profiles + fix grants + backfill broken rows
-- Run this in your Supabase SQL editor (Dashboard -> SQL Editor -> Run)
--
-- Root causes:
-- 1. app/api/auth/signup-verify/route.js writes {full_name, phone, email, region} to
--    public.profiles, but the table never had an `email` column.
-- 2. public.profiles was never GRANTed to service_role/authenticated (unlike public.diagnoses,
--    which works fine), so every app-side read/write against it fails with a Postgres
--    permission error ("permission denied for table profiles") regardless of columns.
--    Only the SECURITY DEFINER trigger (which runs as the table owner) could write to it,
--    which is why rows only ever had id/created_at populated.

-- 1. Add the missing column
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Grant table-level privileges (RLS policies still apply on top of these)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;

-- 3. Backfill existing rows from auth.users metadata (set at signup time)
UPDATE public.profiles p
SET
  full_name = COALESCE(p.full_name, u.raw_user_meta_data->>'name'),
  phone     = COALESCE(p.phone, u.raw_user_meta_data->>'phone'),
  region    = COALESCE(p.region, u.raw_user_meta_data->>'region'),
  email     = COALESCE(p.email, u.raw_user_meta_data->>'contact_email')
FROM auth.users u
WHERE p.id = u.id;
