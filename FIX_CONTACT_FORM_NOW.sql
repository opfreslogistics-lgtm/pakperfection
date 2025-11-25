-- ========================================
-- CONTACT FORM FIX - Run This Now!
-- ========================================
-- This fixes the "new row violates row-level security policy" error
-- when submitting the contact form

-- Step 1: Drop all existing policies on contact_submissions
DROP POLICY IF EXISTS "Anyone can create contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Public can insert contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Admins can view contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Admins can update contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Admins can delete contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Enable insert for public" ON contact_submissions;
DROP POLICY IF EXISTS "Allow public to insert" ON contact_submissions;

-- Step 2: Enable RLS on the table
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Step 3: Create INSERT policy - Allow ANYONE to submit contact forms
CREATE POLICY "Anyone can create contact submissions"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

-- Step 4: Create SELECT policy - Only admins can view submissions
CREATE POLICY "Admins can view contact submissions"
  ON contact_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Step 5: Create UPDATE policy - Only admins can update
CREATE POLICY "Admins can update contact submissions"
  ON contact_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Step 6: Create DELETE policy - Only admins can delete
CREATE POLICY "Admins can delete contact submissions"
  ON contact_submissions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Step 7: Add performance indexes
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_read ON contact_submissions(read);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);

-- Step 8: Verify the policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd as operation
FROM pg_policies
WHERE tablename = 'contact_submissions'
ORDER BY cmd;

-- You should see 4 policies:
-- 1. Anyone can create contact submissions (INSERT)
-- 2. Admins can view contact submissions (SELECT)
-- 3. Admins can update contact submissions (UPDATE)
-- 4. Admins can delete contact submissions (DELETE)

-- If you see the policies above, you're done!
-- Try submitting the contact form again - it should work now! ✅
