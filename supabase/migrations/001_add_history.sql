-- Migration: add plant_part column + delete RLS policy
-- Run this in your Supabase SQL editor

-- 1. Add plant_part column (safely, idempotent)
ALTER TABLE public.diagnoses
  ADD COLUMN IF NOT EXISTS plant_part TEXT;

-- 2. Allow users to delete their own diagnoses
CREATE POLICY "users: delete own diagnosis"
  ON public.diagnoses FOR DELETE
  USING (auth.uid() = user_id);

-- 3. (Optional) Fix any confidence values stored as 0-1 scale instead of 0-100
--    Only run this if you have existing rows with confidence < 2
-- UPDATE public.diagnoses SET confidence = confidence * 100 WHERE confidence < 2;
