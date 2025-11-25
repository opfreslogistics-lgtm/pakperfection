-- ================================================================
-- COPY THIS ENTIRE SCRIPT INTO SUPABASE SQL EDITOR AND RUN IT
-- ================================================================
-- This is the EXACT same pattern as event_bookings
-- This will fix the contact form RLS error

-- Step 1: Drop all existing policies on contact_submissions
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'contact_submissions') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON contact_submissions';
    END LOOP;
END $$;

-- Step 2: Enable RLS
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Step 3: Users can view their own contact submissions
CREATE POLICY "Users can view their own contact submissions"
  ON contact_submissions FOR SELECT
  USING (true);

-- Step 4: Anyone can create contact submissions (SAME AS EVENT BOOKINGS)
CREATE POLICY "Anyone can create contact submissions"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

-- Step 5: Admins can update contact submissions
CREATE POLICY "Admins can update contact submissions"
  ON contact_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Step 6: Admins can delete contact submissions
CREATE POLICY "Admins can delete contact submissions"
  ON contact_submissions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Step 7: Create indexes
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_read ON contact_submissions(read);

-- Step 8: Verify policies were created
SELECT 
  '✅ SUCCESS! Contact form policies created' as message,
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename = 'contact_submissions'
ORDER BY cmd;

-- You should see 4 policies:
-- 1. Anyone can create contact submissions (INSERT) ← This one fixes the error!
-- 2. Users can view their own contact submissions (SELECT)
-- 3. Admins can update contact submissions (UPDATE)
-- 4. Admins can delete contact submissions (DELETE)
