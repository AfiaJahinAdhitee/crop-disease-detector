-- Insert a fake user into auth.users first
INSERT INTO auth.users (id, email, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'test@krishok.app',
  now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  'authenticated',
  'authenticated'
);

-- The trigger you created in Day 1 will auto-insert into profiles.
-- Then run seed inserts normally.
INSERT INTO public.diagnoses
  (user_id, crop_type, region, disease_name, severity, confidence, is_healthy, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000001','ধান','ঢাকা','ব্লাস্ট রোগ','high',91.5,false, now() - interval '2 days'),
  ('00000000-0000-0000-0000-000000000001','পাট','রাজশাহী',NULL,NULL,98.2,true,  now() - interval '1 day'),
  ('00000000-0000-0000-0000-000000000001','আলু','চট্টগ্রাম','লেট ব্লাইট','medium',78.0,false,now()),
  ('00000000-0000-0000-0000-000000000001','ধান','খুলনা','শীথ ব্লাইট','low',65.3,false, now() - interval '5 days'),
  ('00000000-0000-0000-0000-000000000001','গম','ময়মনসিংহ','হলুদ মরিচা','high',88.7,false,now() - interval '3 days');