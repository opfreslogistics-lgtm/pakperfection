-- Fix blog_posts table - add missing columns if they don't exist
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS author_name TEXT,
ADD COLUMN IF NOT EXISTS featured_image_url TEXT,
ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS excerpt TEXT,
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;

-- Ensure blog_categories table has all needed columns
ALTER TABLE blog_categories
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Generate slugs for existing categories that don't have them
UPDATE blog_categories 
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

-- Make slug unique if not already
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'blog_categories_slug_key'
  ) THEN
    ALTER TABLE blog_categories ADD CONSTRAINT blog_categories_slug_key UNIQUE (slug);
  END IF;
END $$;

-- Ensure featured_image_url can be null
ALTER TABLE blog_posts ALTER COLUMN featured_image_url DROP NOT NULL;

-- Update existing blog posts to have published = false if null
UPDATE blog_posts SET published = false WHERE published IS NULL;





