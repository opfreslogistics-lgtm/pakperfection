-- Enhance branding table to ensure all fields exist
ALTER TABLE branding 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS dark_logo_url TEXT,
ADD COLUMN IF NOT EXISTS favicon_url TEXT,
ADD COLUMN IF NOT EXISTS footer_logo_url TEXT,
ADD COLUMN IF NOT EXISTS loading_logo_url TEXT;

-- Enhance theme_settings with full color customization
ALTER TABLE theme_settings
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#ef4444',
ADD COLUMN IF NOT EXISTS button_color TEXT DEFAULT '#ef4444',
ADD COLUMN IF NOT EXISTS button_hover_color TEXT DEFAULT '#dc2626',
ADD COLUMN IF NOT EXISTS text_color TEXT DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS header_color TEXT DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS footer_color TEXT DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS heading_font TEXT DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS body_font TEXT DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS button_radius TEXT DEFAULT '8px',
ADD COLUMN IF NOT EXISTS section_spacing TEXT DEFAULT '80px',
ADD COLUMN IF NOT EXISTS container_width TEXT DEFAULT '1200px';

-- Create page_content table for storing page-specific content
CREATE TABLE IF NOT EXISTS page_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_slug TEXT UNIQUE NOT NULL,
  page_name TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enhance blog_posts table - add missing columns if they don't exist
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS author_name TEXT,
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Convert content from TEXT to JSONB if needed (only if column exists as TEXT)
DO $$ 
BEGIN
  -- Check if content column exists and is TEXT type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' 
    AND column_name = 'content' 
    AND data_type = 'text'
  ) THEN
    -- Convert TEXT to JSONB
    ALTER TABLE blog_posts 
    ALTER COLUMN content TYPE JSONB USING content::jsonb;
    
    -- Set default if not set
    ALTER TABLE blog_posts 
    ALTER COLUMN content SET DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Convert tags from TEXT[] to JSONB if needed
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blog_posts' 
    AND column_name = 'tags' 
    AND data_type = 'ARRAY'
  ) THEN
    -- Convert TEXT[] to JSONB
    ALTER TABLE blog_posts 
    ALTER COLUMN tags TYPE JSONB USING to_jsonb(tags);
    
    -- Set default if not set
    ALTER TABLE blog_posts 
    ALTER COLUMN tags SET DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Enhance blog_categories table - add missing columns if they don't exist
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

-- RLS for new tables
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

-- Policies for page_content
DROP POLICY IF EXISTS "Anyone can view published page content" ON page_content;
DROP POLICY IF EXISTS "Admins can manage page content" ON page_content;
CREATE POLICY "Anyone can view published page content" ON page_content FOR SELECT USING (true);
CREATE POLICY "Admins can manage page content" ON page_content FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policies for blog_posts
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can manage blog posts" ON blog_posts;
CREATE POLICY "Anyone can view published blog posts" ON blog_posts FOR SELECT USING (published = true OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage blog posts" ON blog_posts FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policies for blog_categories
DROP POLICY IF EXISTS "Anyone can view blog categories" ON blog_categories;
DROP POLICY IF EXISTS "Admins can manage blog categories" ON blog_categories;
CREATE POLICY "Anyone can view blog categories" ON blog_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage blog categories" ON blog_categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Insert default page content entries
INSERT INTO page_content (page_slug, page_name, content) VALUES
  ('home', 'Home', '{"hero_slider": [], "sections": []}'::jsonb),
  ('about', 'About', '{"hero": {}, "story": {}, "mission": {}, "vision": {}, "values": []}'::jsonb),
  ('contact', 'Contact', '{"hero": {}, "form": {}, "info": {}}'::jsonb),
  ('menu', 'Menu', '{"hero": {}, "description": ""}'::jsonb),
  ('gallery', 'Gallery', '{"hero": {}, "images": []}'::jsonb),
  ('services', 'Services', '{"hero": {}, "services": []}'::jsonb),
  ('reservation', 'Reservation', '{"hero": {}, "form": {}}'::jsonb),
  ('team', 'Team', '{"hero": {}, "members": []}'::jsonb),
  ('events', 'Events', '{"hero": {}, "events": []}'::jsonb),
  ('faq', 'FAQ', '{"hero": {}, "faqs": []}'::jsonb),
  ('blog', 'Blog', '{"hero": {}, "description": ""}'::jsonb),
  ('privacy-policy', 'Privacy Policy', '{"content": ""}'::jsonb),
  ('terms', 'Terms of Service', '{"content": ""}'::jsonb)
ON CONFLICT (page_slug) DO NOTHING;

