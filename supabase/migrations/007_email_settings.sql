-- Create email_settings table for SMTP configuration
CREATE TABLE IF NOT EXISTS email_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  smtp_host TEXT NOT NULL DEFAULT 'smtp.gmail.com',
  smtp_port TEXT NOT NULL DEFAULT '587',
  smtp_user TEXT NOT NULL DEFAULT '',
  smtp_pass TEXT NOT NULL DEFAULT '',
  smtp_from TEXT NOT NULL DEFAULT 'info@pakperfectioninter.com',
  smtp_from_name TEXT NOT NULL DEFAULT 'Pak Perfection',
  smtp_secure BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row_check CHECK (id = 1)
);

-- Insert default settings
INSERT INTO email_settings (id, smtp_host, smtp_port, smtp_from, smtp_from_name)
VALUES (1, 'smtp.gmail.com', '587', 'info@pakperfectioninter.com', 'Pak Perfection')
ON CONFLICT (id) DO NOTHING;

-- Add RLS policies
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read email settings
CREATE POLICY "Admins can read email settings"
  ON email_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can update email settings
CREATE POLICY "Admins can update email settings"
  ON email_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can insert email settings
CREATE POLICY "Admins can insert email settings"
  ON email_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );


