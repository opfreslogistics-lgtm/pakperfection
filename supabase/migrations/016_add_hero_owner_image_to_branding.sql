-- Add hero owner image field to branding table
-- This allows admins to upload the fixed owner image shown on the hero slider

ALTER TABLE branding
ADD COLUMN IF NOT EXISTS hero_owner_image TEXT;

-- Add comment for documentation
COMMENT ON COLUMN branding.hero_owner_image IS 'URL for the fixed owner/chef image displayed on the homepage hero slider (bottom right)';
