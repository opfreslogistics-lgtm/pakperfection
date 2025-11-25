-- Set the hero owner image for the homepage slider
-- Using the image from the media storage

-- First ensure the column exists
ALTER TABLE branding
ADD COLUMN IF NOT EXISTS hero_owner_image TEXT;

-- Update or insert the hero owner image
-- Using the actual Supabase storage URL (not the Next.js optimized URL)
DO $$
BEGIN
  -- Check if branding row exists
  IF EXISTS (SELECT 1 FROM branding LIMIT 1) THEN
    -- Update existing row
    UPDATE branding
    SET hero_owner_image = 'https://opanykhlbusuwmnbswkb.supabase.co/storage/v1/object/public/media/pages/about_story_image_1763490479316_rth33.png',
        updated_at = now()
    WHERE id = (SELECT id FROM branding LIMIT 1);
  ELSE
    -- Insert new row if none exists
    INSERT INTO branding (hero_owner_image, created_at, updated_at)
    VALUES (
      'https://opanykhlbusuwmnbswkb.supabase.co/storage/v1/object/public/media/pages/about_story_image_1763490479316_rth33.png',
      now(),
      now()
    );
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN branding.hero_owner_image IS 'URL for the fixed owner/chef image displayed on the homepage hero slider (bottom right corner)';
