-- profiles: one row per auth user
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  phone       TEXT,
  region      TEXT,          -- e.g. 'Dhaka', 'Rajshahi'
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- auto-create profile on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  CREATE TABLE public.diagnoses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  crop_type    TEXT NOT NULL,          -- 'ধান', 'পাট', 'আলু' …
  region       TEXT NOT NULL,          -- 'ঢাকা', 'চট্টগ্রাম' …
  disease_name TEXT,                   -- NULL if healthy
  severity     TEXT CHECK (severity IN ('low','medium','high')),
  confidence   NUMERIC(5,2),           -- 0.00–100.00
  treatment    TEXT,                   -- Gemini response (Bangla)
  prevention   TEXT,                   -- Gemini response (Bangla)
  is_healthy   BOOLEAN DEFAULT false,
  image_url    TEXT,                   -- Supabase Storage path
  created_at   TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for Person 3's aggregation queries
CREATE INDEX idx_diagnoses_region_date
  ON public.diagnoses (region, created_at DESC);

CREATE INDEX idx_diagnoses_crop_disease
  ON public.diagnoses (crop_type, disease_name)
  WHERE disease_name IS NOT NULL;


-- Enable RLS on both tables
ALTER TABLE public.profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnoses  ENABLE ROW LEVEL SECURITY;

-- Profiles: users see/edit only their own row
CREATE POLICY "users: own profile"
  ON public.profiles FOR ALL
  USING (auth.uid() = id);

-- Diagnoses: users see/insert only their own
CREATE POLICY "users: own diagnoses"
  ON public.diagnoses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users: insert own diagnosis"
  ON public.diagnoses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Dashboard (Person 3) reads ALL diagnoses via service role
-- (service role bypasses RLS — no extra policy needed)

-- Allow authenticated users to upload to their own folder
CREATE POLICY "upload own images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'leaf-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to read their own images
CREATE POLICY "read own images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'leaf-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );