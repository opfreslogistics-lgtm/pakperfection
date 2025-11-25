-- ================================================================
-- EMAIL SETTINGS RLS FIX - Allow admins to insert/update
-- ================================================================

-- Drop all existing policies first
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'email_settings') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON email_settings';
    END LOOP;
END $$;

-- Enable RLS
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

-- Admins can read email_settings
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

-- Admins can insert email_settings (for first-time setup)
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

-- Admins can update email_settings
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

-- Admins can delete email_settings
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

-- Ensure default row exists
INSERT INTO email_settings (id, smtp_host, smtp_port, smtp_from, smtp_from_name)
VALUES (1, 'smtp.gmail.com', '587', 'info@pakperfectioninter.com', 'Pak Perfection')
ON CONFLICT (id) DO NOTHING;
