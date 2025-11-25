# Database Fix Instructions

## Problem
The email settings are not being saved/read from the database due to RLS (Row Level Security) policies blocking server-side access.

## Solution
I've implemented a fix that uses a service role client to bypass RLS for server-side operations.

## Steps to Fix

### Step 1: Add Service Role Key to Environment Variables

1. Go to your Supabase Dashboard
2. Go to **Settings** → **API**
3. Copy the **service_role** key (NOT the anon key)
4. Add it to your `.env.local` file:

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

⚠️ **IMPORTANT:** Never expose this key in client-side code! It bypasses all RLS policies.

### Step 2: Run the Database Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- Fix RLS policies for email_settings to allow service role access
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
```

### Step 3: Restart Your Server

After adding the service role key, restart your Next.js server:

```bash
# Stop server (Ctrl+C)
npm run dev
```

### Step 4: Test

1. Go to `/admin/email-settings`
2. Fill in your Gmail SMTP settings
3. Click "Save Settings"
4. Click "Debug Settings" - you should now see:
   - `found: true` in the database section
   - `serviceRoleAvailable: true`
5. Test sending an email

## What Changed

1. **Created `lib/supabase/service.ts`**: Service role client that bypasses RLS
2. **Updated `lib/email/config.ts`**: Now uses service role client to read settings
3. **Updated `app/api/email/debug-settings/route.ts`**: Shows which client is being used
4. **Updated `app/admin/email-settings/page.tsx`**: Better error handling and auto-creates row if missing
5. **Created migration `009_fix_email_settings_rls.sql`**: Updates RLS policies

## Alternative: Use Environment Variables

If you don't want to use the service role key, you can continue using environment variables (which are already working). The system will:
1. Try to read from database (may fail due to RLS)
2. Fall back to environment variables (works!)

## Verification

After completing the steps, click "Debug Settings" in the admin panel. You should see:

```json
{
  "activeSource": "database",
  "sources": {
    "database": {
      "found": true,
      "hasCredentials": true,
      "serviceRoleAvailable": true
    }
  }
}
```

If you see `serviceRoleAvailable: false`, make sure you added `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` and restarted the server.


