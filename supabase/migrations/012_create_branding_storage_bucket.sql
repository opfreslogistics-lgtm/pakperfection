-- Create branding storage bucket for logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'branding',
  'branding',
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for branding bucket
-- Drop existing policies if they exist (to allow re-running migration)
DROP POLICY IF EXISTS "Public can view branding images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload branding images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update branding images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete branding images" ON storage.objects;

-- Allow public read access
CREATE POLICY "Public can view branding images"
ON storage.objects FOR SELECT
USING (bucket_id = 'branding');

-- Allow authenticated admins to upload
CREATE POLICY "Admins can upload branding images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'branding' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Allow authenticated admins to update
CREATE POLICY "Admins can update branding images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'branding' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Allow authenticated admins to delete
CREATE POLICY "Admins can delete branding images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'branding' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

