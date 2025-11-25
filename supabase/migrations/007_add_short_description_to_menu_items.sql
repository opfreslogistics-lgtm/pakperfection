-- Add short_description column to menu_items table
ALTER TABLE menu_items
ADD COLUMN IF NOT EXISTS short_description TEXT;

-- Add description_override column to menu_upsells table if it doesn't exist
ALTER TABLE menu_upsells
ADD COLUMN IF NOT EXISTS description_override TEXT;

-- Fix modifier_options: handle both 'price' and 'price_modifier' columns
DO $$ 
BEGIN
  -- Check if both 'price' and 'price_modifier' exist
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'modifier_options' 
    AND column_name = 'price'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'modifier_options' 
    AND column_name = 'price_modifier'
  ) THEN
    -- Both exist, drop the old 'price' column
    ALTER TABLE modifier_options DROP COLUMN price;
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'modifier_options' 
    AND column_name = 'price'
  ) THEN
    -- Only 'price' exists, rename it to 'price_modifier'
    ALTER TABLE modifier_options 
    RENAME COLUMN price TO price_modifier;
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'modifier_options' 
    AND column_name = 'price_modifier'
  ) THEN
    -- Neither exists, add 'price_modifier'
    ALTER TABLE modifier_options 
    ADD COLUMN price_modifier DECIMAL(10,2) DEFAULT 0;
  END IF;
  
  -- Ensure correct data type for price_modifier
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'modifier_options' 
    AND column_name = 'price_modifier'
    AND data_type != 'numeric'
  ) THEN
    ALTER TABLE modifier_options 
    ALTER COLUMN price_modifier TYPE DECIMAL(10,2) USING price_modifier::DECIMAL(10,2);
  END IF;
END $$;

