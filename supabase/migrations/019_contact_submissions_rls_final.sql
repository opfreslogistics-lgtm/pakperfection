-- ================================================================
-- CONTACT SUBMISSIONS RLS FIX (Same pattern as event_bookings)
-- ================================================================
-- This uses the EXACT same RLS pattern as event_bookings which works perfectly

-- Drop all existing policies on contact_submissions
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'contact_submissions') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON contact_submissions';
    END LOOP;
END $$;

-- Enable RLS
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can create contact submissions (SAME AS EVENT BOOKINGS)
CREATE POLICY "Anyone can create contact submissions"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

-- Admins can view contact submissions
CREATE POLICY "Admins can view contact submissions"
  ON contact_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can update contact submissions
CREATE POLICY "Admins can update contact submissions"
  ON contact_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can delete contact submissions
CREATE POLICY "Admins can delete contact submissions"
  ON contact_submissions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
