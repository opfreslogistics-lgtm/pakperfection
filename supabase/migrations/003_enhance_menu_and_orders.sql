-- Enhance menu_items table with more fields
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS cooking_time INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS allergens JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS nutritional_info JSONB,
ADD COLUMN IF NOT EXISTS cogs DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS available_for_dine_in BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS available_for_pickup BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS available_for_delivery BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS special_packaging BOOLEAN DEFAULT false;

-- Create menu_modifiers table
CREATE TABLE IF NOT EXISTS menu_modifiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL,
  is_required BOOLEAN DEFAULT false,
  min_selections INTEGER DEFAULT 0,
  max_selections INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create modifier_options table
CREATE TABLE IF NOT EXISTS modifier_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  modifier_id UUID REFERENCES menu_modifiers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create menu_upsells table
CREATE TABLE IF NOT EXISTS menu_upsells (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  suggested_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  message TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enhance orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS ordering_method TEXT CHECK (ordering_method IN ('dine_in', 'pickup', 'delivery', 'reservation')),
ADD COLUMN IF NOT EXISTS table_number TEXT,
ADD COLUMN IF NOT EXISTS pickup_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivery_address TEXT,
ADD COLUMN IF NOT EXISTS delivery_instructions TEXT,
ADD COLUMN IF NOT EXISTS tip_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS special_instructions TEXT;

-- Create cart_items table for better cart management
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  modifiers JSONB DEFAULT '[]'::jsonb,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create reservations table if it doesn't exist
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  guests INTEGER DEFAULT 2,
  special_requests TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create media table if it doesn't exist
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  file_type TEXT,
  alt_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create popups table if it doesn't exist
CREATE TABLE IF NOT EXISTS popups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('promotional', 'newsletter', 'cookie_consent', 'exit_intent')),
  title TEXT,
  text TEXT,
  image_url TEXT,
  button_text TEXT,
  button_link TEXT,
  enabled BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enhance pages table - add missing columns if they don't exist
ALTER TABLE pages
ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT;

-- RLS Policies
ALTER TABLE menu_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifier_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_upsells ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE popups ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Policies for menu_modifiers
DROP POLICY IF EXISTS "Anyone can view modifiers" ON menu_modifiers;
DROP POLICY IF EXISTS "Admins can manage modifiers" ON menu_modifiers;
CREATE POLICY "Anyone can view modifiers" ON menu_modifiers FOR SELECT USING (true);
CREATE POLICY "Admins can manage modifiers" ON menu_modifiers FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policies for modifier_options
DROP POLICY IF EXISTS "Anyone can view modifier options" ON modifier_options;
DROP POLICY IF EXISTS "Admins can manage modifier options" ON modifier_options;
CREATE POLICY "Anyone can view modifier options" ON modifier_options FOR SELECT USING (true);
CREATE POLICY "Admins can manage modifier options" ON modifier_options FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policies for menu_upsells
DROP POLICY IF EXISTS "Anyone can view upsells" ON menu_upsells;
DROP POLICY IF EXISTS "Admins can manage upsells" ON menu_upsells;
CREATE POLICY "Anyone can view upsells" ON menu_upsells FOR SELECT USING (true);
CREATE POLICY "Admins can manage upsells" ON menu_upsells FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policies for cart_items
DROP POLICY IF EXISTS "Users can manage their own cart" ON cart_items;
CREATE POLICY "Users can manage their own cart" ON cart_items FOR ALL USING (auth.uid() = user_id);

-- Policies for reservations
DROP POLICY IF EXISTS "Anyone can create reservations" ON reservations;
DROP POLICY IF EXISTS "Users can view their own reservations" ON reservations;
DROP POLICY IF EXISTS "Admins can manage all reservations" ON reservations;
CREATE POLICY "Anyone can create reservations" ON reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own reservations" ON reservations FOR SELECT USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage all reservations" ON reservations FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policies for media
DROP POLICY IF EXISTS "Anyone can view media" ON media;
DROP POLICY IF EXISTS "Admins can manage media" ON media;
CREATE POLICY "Anyone can view media" ON media FOR SELECT USING (true);
CREATE POLICY "Admins can manage media" ON media FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policies for popups
DROP POLICY IF EXISTS "Anyone can view enabled popups" ON popups;
DROP POLICY IF EXISTS "Admins can manage popups" ON popups;
CREATE POLICY "Anyone can view enabled popups" ON popups FOR SELECT USING (enabled = true OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage popups" ON popups FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policies for pages
DROP POLICY IF EXISTS "Anyone can view published pages" ON pages;
DROP POLICY IF EXISTS "Admins can manage pages" ON pages;
-- Check if published column exists before using it in policy
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pages' AND column_name = 'published'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can view published pages" ON pages FOR SELECT USING (published = true OR 
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ''admin'')
    )';
  ELSE
    EXECUTE 'CREATE POLICY "Anyone can view published pages" ON pages FOR SELECT USING (true)';
  END IF;
END $$;
CREATE POLICY "Admins can manage pages" ON pages FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

