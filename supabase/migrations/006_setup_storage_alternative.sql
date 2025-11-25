-- Alternative Storage Setup
-- If the above migration doesn't work, use this simpler version
-- OR set up the bucket manually in Supabase Dashboard

-- First, ensure the storage extension is enabled (usually enabled by default)
-- This is just a check - if it fails, storage extension needs to be enabled

-- Create bucket via SQL (if you have permissions)
-- Note: You may need to create the bucket manually in the Supabase Dashboard
-- Go to Storage → New Bucket → Name: "media" → Public: Yes

-- Storage policies (run these AFTER creating the bucket manually)
-- These policies allow:
-- 1. Anyone to view files (public read)
-- 2. Authenticated users to upload
-- 3. Admins to delete any file
-- 4. Users to delete their own files

-- Policy 1: Public Read Access
DROP POLICY IF EXISTS "Public can view media" ON storage.objects;
CREATE POLICY "Public can view media"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Policy 2: Authenticated Upload
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media' AND
  auth.role() = 'authenticated'
);

-- Policy 3: Users can update their own uploads
DROP POLICY IF EXISTS "Users can update their own uploads" ON storage.objects;
CREATE POLICY "Users can update their own uploads"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'media' AND
  auth.role() = 'authenticated'
);

-- Policy 4: Admin Delete
DROP POLICY IF EXISTS "Admins can delete media" ON storage.objects;
CREATE POLICY "Admins can delete media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'media' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policy 5: Users can delete their own uploads
DROP POLICY IF EXISTS "Users can delete their own uploads" ON storage.objects;
CREATE POLICY "Users can delete their own uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'media' AND
  auth.role() = 'authenticated' AND
  (owner = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
);





