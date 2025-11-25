-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  reservation_date DATE NOT NULL,
  reservation_time TEXT NOT NULL,
  guests INTEGER NOT NULL DEFAULT 2,
  special_requests TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can create reservations" ON reservations;
DROP POLICY IF EXISTS "Users can read their own reservations" ON reservations;
DROP POLICY IF EXISTS "Admins can read all reservations" ON reservations;
DROP POLICY IF EXISTS "Admins can update all reservations" ON reservations;
DROP POLICY IF EXISTS "Admins can delete reservations" ON reservations;

-- Allow anyone to insert reservations
CREATE POLICY "Anyone can create reservations"
  ON reservations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated users to read their own reservations
CREATE POLICY "Users can read their own reservations"
  ON reservations
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');

-- Admins can read all reservations
CREATE POLICY "Admins can read all reservations"
  ON reservations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can update all reservations
CREATE POLICY "Admins can update all reservations"
  ON reservations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can delete reservations
CREATE POLICY "Admins can delete reservations"
  ON reservations
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for better performance (drop if exists first)
DROP INDEX IF EXISTS idx_reservations_date;
DROP INDEX IF EXISTS idx_reservations_email;
DROP INDEX IF EXISTS idx_reservations_status;

CREATE INDEX idx_reservations_date ON reservations(reservation_date);
CREATE INDEX idx_reservations_email ON reservations(email);
CREATE INDEX idx_reservations_status ON reservations(status);


