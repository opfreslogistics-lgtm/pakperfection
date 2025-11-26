-- ================================================================
-- FIX MENU ITEMS - ADD MISSING ADVANCED FIELDS
-- Run this in your Supabase SQL Editor to fix the schema
-- ================================================================

-- Section 1: Promo Pricing
ALTER TABLE menu_items
ADD COLUMN IF NOT EXISTS promo_price NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS promo_active BOOLEAN DEFAULT false;

-- Section 2: Variants & Ingredients
ALTER TABLE menu_items
ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS ingredients TEXT[],
ADD COLUMN IF NOT EXISTS allergen_flags TEXT[];

COMMENT ON COLUMN menu_items.variants IS 'Array of variants: [{id, name, price_modifier, available}]';
COMMENT ON COLUMN menu_items.ingredients IS 'List of ingredients for transparency';
COMMENT ON COLUMN menu_items.allergen_flags IS 'Allergen warnings: ["dairy", "nuts", "gluten", "soy", "eggs"]';

-- Section 3: Logistics & Operations  
ALTER TABLE menu_items
ADD COLUMN IF NOT EXISTS inventory_linked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS current_stock INTEGER,
ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS prep_time_minutes INTEGER,
ADD COLUMN IF NOT EXISTS availability_schedule JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS menu_types TEXT[] DEFAULT ARRAY['dine-in', 'delivery', 'takeaway'];

COMMENT ON COLUMN menu_items.inventory_linked IS 'Whether this item tracks inventory';
COMMENT ON COLUMN menu_items.current_stock IS 'Current stock quantity (null = unlimited)';
COMMENT ON COLUMN menu_items.prep_time_minutes IS 'Estimated preparation time in minutes';
COMMENT ON COLUMN menu_items.availability_schedule IS 'Schedule: {monday: {start: "09:00", end: "22:00"}, ...}';
COMMENT ON COLUMN menu_items.menu_types IS 'Available for: dine-in, delivery, takeaway';

-- Section 4: SEO & Display
ALTER TABLE menu_items
ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS homepage_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS internal_notes TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[];

COMMENT ON COLUMN menu_items.visible IS 'Show/Hide on menu';
COMMENT ON COLUMN menu_items.homepage_featured IS 'Feature on homepage';
COMMENT ON COLUMN menu_items.meta_title IS 'SEO meta title';
COMMENT ON COLUMN menu_items.meta_description IS 'SEO meta description';
COMMENT ON COLUMN menu_items.internal_notes IS 'Notes visible in cart popup for staff/customers';
COMMENT ON COLUMN menu_items.tags IS 'Search tags and filters';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_menu_items_visible ON menu_items(visible);
CREATE INDEX IF NOT EXISTS idx_menu_items_homepage_featured ON menu_items(homepage_featured);
CREATE INDEX IF NOT EXISTS idx_menu_items_promo_active ON menu_items(promo_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_inventory_linked ON menu_items(inventory_linked);
CREATE INDEX IF NOT EXISTS idx_menu_items_tags ON menu_items USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_menu_items_allergen_flags ON menu_items USING gin(allergen_flags);
CREATE INDEX IF NOT EXISTS idx_menu_items_ingredients ON menu_items USING gin(ingredients);

-- Update existing items to have default values
UPDATE menu_items
SET 
  visible = COALESCE(visible, true),
  homepage_featured = COALESCE(homepage_featured, false),
  promo_active = COALESCE(promo_active, false),
  inventory_linked = COALESCE(inventory_linked, false),
  menu_types = COALESCE(menu_types, ARRAY['dine-in', 'delivery', 'takeaway']),
  variants = COALESCE(variants, '[]'::jsonb),
  availability_schedule = COALESCE(availability_schedule, '{}'::jsonb)
WHERE 
  visible IS NULL 
  OR homepage_featured IS NULL 
  OR promo_active IS NULL 
  OR inventory_linked IS NULL 
  OR menu_types IS NULL 
  OR variants IS NULL 
  OR availability_schedule IS NULL;

-- Verify the columns exist
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'menu_items'
  AND column_name IN (
    'availability_schedule', 
    'variants', 
    'inventory_linked',
    'visible',
    'homepage_featured',
    'promo_price',
    'promo_active',
    'tags',
    'ingredients',
    'allergen_flags',
    'menu_types',
    'prep_time_minutes',
    'current_stock',
    'low_stock_threshold',
    'meta_title',
    'meta_description',
    'internal_notes'
  )
ORDER BY column_name;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration complete! All advanced menu fields have been added to menu_items table.';
END $$;
