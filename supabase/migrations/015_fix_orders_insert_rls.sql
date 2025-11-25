-- Fix orders RLS to allow both guest and authenticated users to create orders
-- This allows guest checkout and logged-in checkout

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can create orders" ON orders;

-- Allow anyone to create orders (guest checkout + logged-in checkout)
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Note: The SELECT policies for viewing orders are already set up in migration 009:
-- - "Anyone can view orders by order_number" (for tracking)
-- - "Users can view their own orders" (for account page)
-- - "Admins can view all orders" (for admin panel)
