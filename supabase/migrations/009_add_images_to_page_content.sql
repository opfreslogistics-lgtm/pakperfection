-- Add images column to page_content table
ALTER TABLE page_content 
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '{}'::jsonb;

-- Update existing rows to have empty images object
UPDATE page_content 
SET images = '{}'::jsonb 
WHERE images IS NULL;




