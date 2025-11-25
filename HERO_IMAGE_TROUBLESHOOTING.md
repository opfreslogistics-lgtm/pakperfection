# Hero Slider Owner Image Troubleshooting

The fixed owner image is not showing on your homepage slider. Let's diagnose and fix this!

## Step 1: Check Database

Run this SQL in your **Supabase SQL Editor** to check if the image is set:

```sql
-- Check if branding table has the hero_owner_image
SELECT id, hero_owner_image, created_at, updated_at 
FROM branding;
```

### Expected Result:
You should see a row with `hero_owner_image` containing:
```
https://opanykhlbusuwmnbswkb.supabase.co/storage/v1/object/public/media/pages/about_story_image_1763490479316_rth33.png
```

### If NULL or Empty:
Run this SQL to set the image:

```sql
-- Set the hero owner image
UPDATE branding
SET hero_owner_image = 'https://opanykhlbusuwmnbswkb.supabase.co/storage/v1/object/public/media/pages/about_story_image_1763490479316_rth33.png',
    updated_at = now();

-- If no rows were updated, insert a new row
INSERT INTO branding (hero_owner_image, created_at, updated_at)
SELECT 
  'https://opanykhlbusuwmnbswkb.supabase.co/storage/v1/object/public/media/pages/about_story_image_1763490479316_rth33.png',
  now(),
  now()
WHERE NOT EXISTS (SELECT 1 FROM branding);

-- Verify it was set
SELECT id, hero_owner_image FROM branding;
```

## Step 2: Check Browser Console

1. Open your homepage in the browser
2. Open Developer Tools (F12)
3. Go to the **Console** tab
4. Look for these logs:

```
Hero owner image data: { hero_owner_image: "https://..." }
Setting owner image: https://...
```

### If you see:
- ✅ `"Setting owner image"` - Image is loading correctly
- ❌ `"No hero_owner_image found"` - Database not updated (go to Step 1)
- ❌ Error messages - Check RLS policies (go to Step 3)

## Step 3: Check RLS Policies

The `branding` table needs to allow public SELECT access:

```sql
-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'branding';

-- Enable RLS on branding table
ALTER TABLE branding ENABLE ROW LEVEL SECURITY;

-- Allow public to read branding
DROP POLICY IF EXISTS "Allow public read access to branding" ON branding;
CREATE POLICY "Allow public read access to branding"
  ON branding FOR SELECT
  USING (true);

-- Allow authenticated users to update branding (for admins)
DROP POLICY IF EXISTS "Allow authenticated users to update branding" ON branding;
CREATE POLICY "Allow authenticated users to update branding"
  ON branding FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

## Step 4: Check Image URL

Verify the image is accessible:

1. Open this URL in your browser:
   ```
   https://opanykhlbusuwmnbswkb.supabase.co/storage/v1/object/public/media/pages/about_story_image_1763490479316_rth33.png
   ```

2. You should see the image load

3. If 403 Forbidden - check storage bucket permissions in Supabase

## Step 5: Clear Cache & Reload

1. **Clear browser cache**: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
2. **Hard refresh**: Ctrl+F5 (or Cmd+Shift+R on Mac)
3. **Restart browser** if needed

## Step 6: Wait for Vercel Deployment

The latest code changes have been pushed. Check:

1. Go to your Vercel Dashboard
2. Check if the latest deployment is complete
3. Wait 2-5 minutes for the build to finish
4. Then refresh your homepage

## Quick Fix SQL (Run All at Once)

If nothing else works, run this complete fix:

```sql
-- Ensure column exists
ALTER TABLE branding
ADD COLUMN IF NOT EXISTS hero_owner_image TEXT;

-- Enable RLS
ALTER TABLE branding ENABLE ROW LEVEL SECURITY;

-- Set the image
UPDATE branding
SET hero_owner_image = 'https://opanykhlbusuwmnbswkb.supabase.co/storage/v1/object/public/media/pages/about_story_image_1763490479316_rth33.png',
    updated_at = now();

-- Insert if no rows exist
INSERT INTO branding (hero_owner_image, created_at, updated_at)
SELECT 
  'https://opanykhlbusuwmnbswkb.supabase.co/storage/v1/object/public/media/pages/about_story_image_1763490479316_rth33.png',
  now(),
  now()
WHERE NOT EXISTS (SELECT 1 FROM branding);

-- Allow public read
DROP POLICY IF EXISTS "Allow public read access to branding" ON branding;
CREATE POLICY "Allow public read access to branding"
  ON branding FOR SELECT
  USING (true);

-- Verify
SELECT 'Image set to: ' || hero_owner_image as status FROM branding;
```

## Expected Result

After completing these steps, you should see:

✅ The owner image displayed at the **bottom-right** of the homepage slider  
✅ Image stays fixed while slides change  
✅ Beautiful floating animation  
✅ Glowing aura effect behind the image  

## Still Not Working?

Check browser console logs and share:
1. Any error messages
2. The result of: `SELECT * FROM branding;`
3. Screenshot of the homepage

## Development Debug Indicator

In development mode, you'll see a small indicator at the top-left of the slider:
- ✅ `Owner Image: ✅ Loaded` - Working!
- ❌ `Owner Image: ❌ Not Set` - Database not updated

This debug indicator won't show in production.
