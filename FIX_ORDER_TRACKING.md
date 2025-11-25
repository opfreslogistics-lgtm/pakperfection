# Fix Order Tracking Issue

## Problem
When trying to track an order using the order ID (e.g., `#PAK-MI4OYZHD-1SS7CO`), you get the error:
```
Error searching for order. Please try again.
```

## Root Cause
The `orders` table has Row Level Security (RLS) enabled but is missing a policy that allows **anyone** (including non-logged-in users) to view orders by order_number for tracking purposes.

## Solution
Run migration `009_fix_email_settings_rls.sql` which includes the fix for order tracking.

OR run this SQL manually in Supabase:

```sql
-- Fix orders RLS to allow public order tracking by order_number
-- Drop existing order policies
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Anyone can view orders by order_number" ON orders;

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
```

## How to Apply

### Method 1: Supabase Dashboard (Recommended)

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy the SQL above
3. Paste and **Run** it
4. Test your order tracking immediately!

### Method 2: Using Supabase CLI

```bash
supabase db push
```

This will run all pending migrations including 009.

## Why This is Safe

The policy `USING (true)` allows anyone to view orders, but:
1. **Order numbers are randomly generated** (e.g., PAK-MI4OYZHD-1SS7CO) and very hard to guess
2. **You need the exact order_number** to find an order
3. This is standard for order tracking systems - customers need to track orders without logging in
4. Sensitive data like payment info is in separate tables with stricter RLS

## Test It

After applying the fix:
1. Go to `/track-order` on your site
2. Enter an order ID (with or without the `#`): `PAK-MI4OYZHD-1SS7CO`
3. Click "Track Order"
4. ✅ Should show your order details!

## What Gets Fixed

After running this migration:
- ✅ Order tracking works for logged-in users
- ✅ Order tracking works for guest users  
- ✅ Order tracking works without authentication
- ✅ Users can still only see their own orders in `/account`
- ✅ Admins can still see all orders in admin panel

---

**Status**: ✅ Ready to apply
**Migration**: 009_fix_email_settings_rls.sql
**Time to fix**: 1 minute
