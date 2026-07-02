-- Migration 002: fix severity constraint + relax region NOT NULL
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor → Run)

-- 1. Widen severity to include all values the AI actually returns
ALTER TABLE public.diagnoses
  DROP CONSTRAINT IF EXISTS diagnoses_severity_check;

ALTER TABLE public.diagnoses
  ADD CONSTRAINT diagnoses_severity_check
  CHECK (severity IN ('none', 'low', 'medium', 'high', 'critical'));

-- 2. Allow region to be NULL (submitted without a district)
ALTER TABLE public.diagnoses
  ALTER COLUMN region DROP NOT NULL;
