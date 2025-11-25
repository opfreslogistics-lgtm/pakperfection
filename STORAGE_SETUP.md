# Storage Setup Instructions

## Step 1: Run the Storage Migration

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/006_setup_storage.sql`
4. Click **Run** to execute the migration

This will:
- Create a `media` storage bucket (if it doesn't exist)
- Set up public read access
- Configure upload permissions for authenticated users
- Set up admin delete permissions

## Step 2: Verify Storage Bucket in Dashboard

1. Go to **Storage** in your Supabase Dashboard
2. You should see a bucket named `media`
3. If it doesn't exist, you can create it manually:
   - Click **New bucket**
   - Name: `media`
   - Public bucket: **Yes** (checked)
   - File size limit: `52428800` (50MB)
   - Allowed MIME types: `image/jpeg,image/png,image/gif,image/webp,image/svg+xml,application/pdf`

## Step 3: Set Up Storage Policies (if migration didn't work)

If the migration didn't create the policies, set them up manually:

1. Go to **Storage** → **Policies** → **media** bucket
2. Create the following policies:

### Policy 1: Public Read Access
- Policy name: `Public can view media`
- Allowed operation: `SELECT`
- Policy definition:
```sql
bucket_id = 'media'
```

### Policy 2: Authenticated Upload
- Policy name: `Authenticated users can upload media`
- Allowed operation: `INSERT`
- Policy definition:
```sql
bucket_id = 'media' AND auth.role() = 'authenticated'
```

### Policy 3: Admin Delete
- Policy name: `Admins can delete media`
- Allowed operation: `DELETE`
- Policy definition:
```sql
bucket_id = 'media' AND 
EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
```

## Step 4: Test Upload

1. Log in as admin
2. Go to `/admin/menu`
3. Try uploading an image for a category or menu item
4. Check the browser console for any errors
5. Verify the image appears in the Supabase Storage dashboard

## Troubleshooting

### Error: "Bucket not found"
- Make sure the `media` bucket exists in Storage
- Run the migration SQL again

### Error: "JWT expired" or "Authentication error"
- Log out and log back in
- Check that your Supabase session is valid

### Error: "File size too large"
- The limit is 5MB per file
- Compress your images before uploading

### Error: "Invalid file type"
- Only JPEG, PNG, GIF, and WebP are allowed
- Convert your image to one of these formats

### Images not showing after upload
- Check that the bucket is set to **Public**
- Verify the public URL is correct
- Check browser console for CORS errors





