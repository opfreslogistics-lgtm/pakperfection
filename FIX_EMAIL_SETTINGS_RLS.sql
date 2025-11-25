-- ================================================================
-- EMAIL SETTINGS RLS FIX
-- COPY THIS ENTIRE SCRIPT AND RUN IN SUPABASE SQL EDITOR
-- ================================================================
-- This fixes the "new row violates row-level security policy" error
-- when trying to save email settings in the admin panel

-- Step 1: Drop all existing policies on email_settings
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'email_settings') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON email_settings';
    END LOOP;
END $$;

-- Step 2: Enable RLS
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

-- Step 3: Admins can read email_settings
CREATE POLICY "Admins can read email settings"
  ON email_settings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Step 4: Admins can insert email_settings (first-time setup)
CREATE POLICY "Admins can insert email settings"
  ON email_settings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Step 5: Admins can update email_settings
CREATE POLICY "Admins can update email settings"
  ON email_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Step 6: Admins can delete email_settings
CREATE POLICY "Admins can delete email settings"
  ON email_settings
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Step 7: Ensure default row exists
INSERT INTO email_settings (id, smtp_host, smtp_port, smtp_from, smtp_from_name)
VALUES (1, 'smtp.gmail.com', '587', 'info@pakperfectioninter.com', 'Pak Perfection')
ON CONFLICT (id) DO NOTHING;

-- Step 8: Verify policies were created
SELECT 
  '✅ SUCCESS! Email settings policies created' as message,
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename = 'email_settings'
ORDER BY cmd;

-- You should see 4 policies:
-- 1. Admins can delete email settings (DELETE)
-- 2. Admins can insert email settings (INSERT)
-- 3. Admins can read email settings (SELECT)
-- 4. Admins can update email settings (UPDATE)

-- Now you can save email settings in the admin panel! ✅
