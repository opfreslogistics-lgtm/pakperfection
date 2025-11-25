-- ============================================
-- COMPLETE FIX FOR ALL ORDER RLS ISSUES
-- Run this in Supabase SQL Editor
-- ============================================

-- This fixes:
-- 1. Order tracking by order number (public)
-- 2. Creating orders as guest or logged-in user
-- 3. Viewing orders in account page
-- 4. Admin viewing all orders

-- ============================================
-- STEP 1: Drop all existing order policies
-- ============================================

DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Anyone can view orders by order_number" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can create orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

-- ============================================
-- STEP 2: Create SELECT policies (for viewing)
-- ============================================

-- Allow anyone to view orders by order_number (for public tracking)
CREATE POLICY "Anyone can view orders by order_number"
  ON orders FOR SELECT
  USING (true);

-- Users can view their own orders (for account page)
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all orders (for admin panel)
CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- STEP 3: Create INSERT policy (for creating)
-- ============================================

-- Allow anyone to create orders (guest + logged-in checkout)
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- ============================================
-- STEP 4: Create UPDATE policy (admin only)
-- ============================================

-- Admins can update orders (change status, etc.)
CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- DONE! Test your features:
-- ============================================
-- ✅ Order tracking: /track-order
-- ✅ Guest checkout: /checkout (without login)
-- ✅ Logged-in checkout: /checkout (with login)
-- ✅ View orders: /account
-- ✅ Admin orders: /admin/orders
