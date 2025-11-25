-- Remove public order tracking policy
-- Users must now log in to see their orders

-- Drop the public tracking policy
DROP POLICY IF EXISTS "Anyone can view orders by order_number" ON orders;

-- Keep policies for:
-- 1. Users viewing their own orders (logged in)
-- 2. Admins viewing all orders
-- 3. Anyone creating orders (guest checkout)
-- 4. Admins updating orders

-- These policies should already exist from previous migrations
-- Just ensuring they're documented here:

-- Users can view their own orders (account page - logged in only)
-- Already exists: "Users can view their own orders"

-- Admins can view all orders (admin panel)
-- Already exists: "Admins can view all orders"

-- Allow anyone to create orders (guest + logged-in checkout)
-- Already exists: "Anyone can create orders"

-- Admins can update orders
-- Already exists: "Admins can update orders"
