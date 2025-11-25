-- Fix contact_submissions RLS policies
-- Allow anyone to submit contact forms (like event bookings)

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can create contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Public can insert contact submissions" ON contact_submissions;

-- Create INSERT policy to allow anyone to submit contact forms
CREATE POLICY "Anyone can create contact submissions"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

-- Admins can view all contact submissions
CREATE POLICY "Admins can view contact submissions"
  ON contact_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can update contact submissions (e.g., mark as read)
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_read ON contact_submissions(read);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
