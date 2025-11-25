-- ========================================
-- EMERGENCY FIX FOR CONTACT FORM
-- Copy and paste this ENTIRE script into Supabase SQL Editor
-- Then click RUN
-- ========================================

-- Step 1: Disable RLS temporarily to clean up
ALTER TABLE contact_submissions DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies (clean slate)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'contact_submissions') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON contact_submissions';
    END LOOP;
END $$;

-- Step 3: Re-enable RLS
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Step 4: Create the INSERT policy (MOST IMPORTANT - allows form submissions)
CREATE POLICY "contact_submissions_insert_policy"
  ON contact_submissions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Step 5: Create admin policies
CREATE POLICY "contact_submissions_admin_select"
  ON contact_submissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "contact_submissions_admin_update"
  ON contact_submissions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "contact_submissions_admin_delete"
  ON contact_submissions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Step 6: Verify policies were created
SELECT 
  '✅ SUCCESS! Policies created:' as status,
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename = 'contact_submissions'
ORDER BY cmd;

-- You should see 4 rows:
-- 1. contact_submissions_admin_delete | DELETE
-- 2. contact_submissions_insert_policy | INSERT  <- This is the important one!
-- 3. contact_submissions_admin_select | SELECT
-- 4. contact_submissions_admin_update | UPDATE

-- If you see these 4 policies, your contact form will work! ✅
