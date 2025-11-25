-- ================================================================
-- ALL RLS FIXES - RUN THIS ONCE IN SUPABASE SQL EDITOR
-- ================================================================
-- This script fixes ALL RLS issues in your application:
-- 1. Contact form submissions
-- 2. Email settings (admin panel)
-- 3. Hero owner image (branding)
-- ================================================================

-- ==========================
-- 1. CONTACT SUBMISSIONS FIX
-- ==========================
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'contact_submissions') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON contact_submissions';
    END LOOP;
END $$;

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own contact submissions"
  ON contact_submissions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create contact submissions"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update contact submissions"
  ON contact_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete contact submissions"
  ON contact_submissions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_read ON contact_submissions(read);

-- ==========================
-- 2. EMAIL SETTINGS FIX
-- ==========================
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'email_settings') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON email_settings';
    END LOOP;
END $$;

ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read email settings"
  ON email_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert email settings"
  ON email_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update email settings"
  ON email_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete email settings"
  ON email_settings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

INSERT INTO email_settings (id, smtp_host, smtp_port, smtp_from, smtp_from_name)
VALUES (1, 'smtp.gmail.com', '587', 'info@pakperfectioninter.com', 'Pak Perfection')
ON CONFLICT (id) DO NOTHING;

-- ==========================
-- 3. BRANDING (HERO OWNER IMAGE) FIX
-- ==========================
ALTER TABLE branding
ADD COLUMN IF NOT EXISTS hero_owner_image TEXT;

ALTER TABLE branding ENABLE ROW LEVEL SECURITY;

-- Drop existing branding policies
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'branding') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON branding';
    END LOOP;
END $$;

-- Allow public to read branding (for hero slider, logos, etc.)
CREATE POLICY "Allow public read access to branding"
  ON branding FOR SELECT
  USING (true);

-- Allow admins to update branding
CREATE POLICY "Admins can update branding"
  ON branding FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow admins to insert branding
CREATE POLICY "Admins can insert branding"
  ON branding FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Set hero owner image
UPDATE branding
SET hero_owner_image = 'https://opanykhlbusuwmnbswkb.supabase.co/storage/v1/object/public/media/pages/about_story_image_1763490479316_rth33.png',
    updated_at = now()
WHERE EXISTS (SELECT 1 FROM branding);

INSERT INTO branding (hero_owner_image, created_at, updated_at)
SELECT 
  'https://opanykhlbusuwmnbswkb.supabase.co/storage/v1/object/public/media/pages/about_story_image_1763490479316_rth33.png',
  now(),
  now()
WHERE NOT EXISTS (SELECT 1 FROM branding);

-- ==========================
-- VERIFICATION
-- ==========================
SELECT '===========================' as section;
SELECT '✅ CONTACT SUBMISSIONS' as status;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'contact_submissions' ORDER BY cmd;

SELECT '===========================' as section;
SELECT '✅ EMAIL SETTINGS' as status;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'email_settings' ORDER BY cmd;

SELECT '===========================' as section;
SELECT '✅ BRANDING' as status;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'branding' ORDER BY cmd;

SELECT '===========================' as section;
SELECT '✅ HERO OWNER IMAGE SET' as status;
SELECT hero_owner_image FROM branding;

-- ================================================================
-- DONE! All RLS policies are now configured correctly.
-- ================================================================
-- You should see:
-- - 4 policies for contact_submissions (SELECT, INSERT, UPDATE, DELETE)
-- - 4 policies for email_settings (SELECT, INSERT, UPDATE, DELETE)
-- - 3 policies for branding (SELECT, INSERT, UPDATE)
-- - Hero owner image URL displayed
-- ================================================================
