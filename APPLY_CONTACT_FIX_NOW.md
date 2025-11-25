# 🔧 Apply Contact Form Fix Now (2 Minutes)

## The Problem
Your contact form is showing: **"new row violates row-level security policy for table 'contact_submissions'"**

## The Fix (Choose One Method)

### Method 1: Supabase Dashboard (Easiest) ⭐

1. **Go to Supabase Dashboard**
   - Open: https://supabase.com/dashboard
   - Select your Pak Perfection project

2. **Open SQL Editor**
   - Click on **"SQL Editor"** in the left sidebar
   - Click **"New query"**

3. **Run the Migration**
   - Copy ALL the SQL below
   - Paste it into the SQL editor
   - Click **"Run"** (or press Ctrl/Cmd + Enter)

```sql
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
```

4. **Test It!**
   - Go to your live site's contact page
   - Fill out the form
   - Click "Send Message"
   - ✅ Should work now!

### Method 2: Supabase CLI

If you have Supabase CLI installed:

```bash
cd /path/to/your/project
supabase db push
```

The migration file is already in: `supabase/migrations/014_fix_contact_submissions_rls.sql`

## What This Does

✅ Allows **anyone** (including non-logged-in users) to submit contact forms
✅ Allows **admins only** to view, update, and delete submissions
✅ Adds performance indexes for faster queries
✅ Matches the same security pattern as your event bookings and reservations

## Verify It Works

After applying the fix:

1. Visit your contact page: `https://your-site.vercel.app/contact`
2. Fill out the form with:
   - Your name
   - Your email
   - A test message
3. Click "Send Message"
4. You should see: ✅ **"Message sent successfully! You will receive a confirmation email shortly."**

## View Submissions in Admin

1. Log in to your admin account
2. Go to `/admin` (you'll need to add a contact submissions admin page, or check database directly)
3. Query in Supabase: 
   ```sql
   SELECT * FROM contact_submissions ORDER BY created_at DESC;
   ```

## Why Did This Happen?

Your event bookings work because they have this policy:
```sql
CREATE POLICY "Anyone can create event bookings"
  ON event_bookings FOR INSERT
  WITH CHECK (true);
```

But `contact_submissions` was missing its INSERT policy! Now it's fixed. 🎉

## Need More Help?

See the detailed documentation in: `CONTACT_FORM_FIX.md`

---

**Time to fix**: ⏱️ 2 minutes
**Status**: ✅ Ready to apply
**Files updated**: 
- `supabase/migrations/014_fix_contact_submissions_rls.sql`
- `CONTACT_FORM_FIX.md` (detailed docs)
- `APPLY_CONTACT_FIX_NOW.md` (this file)
