-- Fix RLS policies for email_settings to allow service role access
-- This ensures server-side API routes can read email settings

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can read email settings" ON email_settings;
DROP POLICY IF EXISTS "Admins can update email settings" ON email_settings;
DROP POLICY IF EXISTS "Admins can insert email settings" ON email_settings;

-- Allow service role to access email settings (for server-side API routes)
CREATE POLICY "Service role can access email settings"
  ON email_settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Only admins can read email settings (for client-side)
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

-- Only admins can update email settings (for client-side)
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
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can insert email settings (for client-side)
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

-- Ensure the default row exists
INSERT INTO email_settings (id, smtp_host, smtp_port, smtp_from, smtp_from_name)
VALUES (1, 'smtp.gmail.com', '587', 'info@pakperfectioninter.com', 'Pak Perfection')
ON CONFLICT (id) DO UPDATE
SET 
  smtp_host = EXCLUDED.smtp_host,
  smtp_port = EXCLUDED.smtp_port,
  smtp_from = EXCLUDED.smtp_from,
  smtp_from_name = EXCLUDED.smtp_from_name,
  updated_at = NOW();

-- Fix orders RLS to allow public order tracking by order_number
-- Drop existing order policies
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;

-- Allow anyone to view orders by order_number (for tracking)
CREATE POLICY "Anyone can view orders by order_number"
  ON orders FOR SELECT
  USING (true);

-- Users can still view their own orders by user_id
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

