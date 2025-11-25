-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Function to automatically assign admin role to first user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Count existing users
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  -- Insert profile with role based on count
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.email,
    CASE WHEN user_count = 0 THEN 'admin' ELSE 'user' END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Global settings table
CREATE TABLE IF NOT EXISTS global_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Branding settings
CREATE TABLE IF NOT EXISTS branding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  logo_url TEXT,
  dark_logo_url TEXT,
  favicon_url TEXT,
  footer_logo_url TEXT,
  loading_logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Theme settings
CREATE TABLE IF NOT EXISTS theme_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  primary_color TEXT DEFAULT '#000000',
  secondary_color TEXT DEFAULT '#ffffff',
  heading_font TEXT DEFAULT 'Inter',
  body_font TEXT DEFAULT 'Inter',
  button_radius TEXT DEFAULT '8px',
  section_spacing TEXT DEFAULT '80px',
  container_width TEXT DEFAULT '1200px',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Navigation settings
CREATE TABLE IF NOT EXISTS navigation_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  top_bar_text TEXT,
  top_bar_links JSONB DEFAULT '[]'::jsonb,
  top_bar_bg_color TEXT DEFAULT '#000000',
  top_bar_text_color TEXT DEFAULT '#ffffff',
  main_nav_links JSONB DEFAULT '[]'::jsonb,
  sticky_nav BOOLEAN DEFAULT true,
  mobile_menu_bg_color TEXT DEFAULT '#ffffff',
  mobile_menu_text_color TEXT DEFAULT '#000000',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Footer settings
CREATE TABLE IF NOT EXISTS footer_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  logo_url TEXT,
  bg_color TEXT DEFAULT '#000000',
  text_color TEXT DEFAULT '#ffffff',
  links JSONB DEFAULT '[]'::jsonb,
  social_links JSONB DEFAULT '[]'::jsonb,
  about_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Pop-ups table
CREATE TABLE IF NOT EXISTS popups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('promotional', 'newsletter', 'cookie', 'exit_intent')),
  title TEXT,
  text TEXT,
  image_url TEXT,
  button_text TEXT,
  button_link TEXT,
  enabled BOOLEAN DEFAULT true,
  trigger_type TEXT DEFAULT 'on_load',
  colors JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- SEO settings
CREATE TABLE IF NOT EXISTS seo_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_path TEXT UNIQUE NOT NULL,
  title TEXT,
  description TEXT,
  og_image_url TEXT,
  keywords TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Media library
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  alt_text TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Pages table
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content JSONB DEFAULT '{}'::jsonb,
  seo_settings_id UUID REFERENCES seo_settings(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Menu categories
CREATE TABLE IF NOT EXISTS menu_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Menu items
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES menu_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  featured BOOLEAN DEFAULT false,
  dietary_labels JSONB DEFAULT '[]'::jsonb,
  available BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Blog categories
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  category_id UUID REFERENCES blog_categories(id),
  author_id UUID REFERENCES profiles(id),
  tags TEXT[],
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Gallery categories
CREATE TABLE IF NOT EXISTS gallery_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Gallery items
CREATE TABLE IF NOT EXISTS gallery_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES gallery_categories(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Team members
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Events
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  price DECIMAL(10, 2),
  available_spots INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- FAQ items
CREATE TABLE IF NOT EXISTS faq_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Payment settings
CREATE TABLE IF NOT EXISTS payment_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  method TEXT UNIQUE NOT NULL CHECK (method IN ('zelle', 'cashapp', 'cash')),
  enabled BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  order_number TEXT UNIQUE NOT NULL,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'confirmed', 'rejected')),
  delivery_type TEXT NOT NULL CHECK (delivery_type IN ('pickup', 'dine_in', 'delivery')),
  delivery_address JSONB,
  total_amount DECIMAL(10, 2) NOT NULL,
  current_status TEXT DEFAULT 'pending_payment' CHECK (current_status IN ('pending_payment', 'payment_confirmed', 'preparing', 'ready_pickup', 'ready_delivery', 'out_delivery', 'delivered', 'cancelled', 'refunded')),
  items JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Payment proofs
CREATE TABLE IF NOT EXISTS payment_proofs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  comments TEXT,
  verified BOOLEAN DEFAULT false,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Order status history
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Reservations
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  reservation_date TIMESTAMP WITH TIME ZONE NOT NULL,
  number_of_guests INTEGER NOT NULL,
  special_requests TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Contact submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE popups ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (is_admin(auth.uid()));

-- Public read policies (for frontend)
CREATE POLICY "Public can read global settings"
  ON global_settings FOR SELECT
  USING (true);

CREATE POLICY "Public can read branding"
  ON branding FOR SELECT
  USING (true);

CREATE POLICY "Public can read theme settings"
  ON theme_settings FOR SELECT
  USING (true);

CREATE POLICY "Public can read navigation settings"
  ON navigation_settings FOR SELECT
  USING (true);

CREATE POLICY "Public can read footer settings"
  ON footer_settings FOR SELECT
  USING (true);

CREATE POLICY "Public can read enabled popups"
  ON popups FOR SELECT
  USING (enabled = true);

CREATE POLICY "Public can read SEO settings"
  ON seo_settings FOR SELECT
  USING (true);

CREATE POLICY "Public can read media"
  ON media FOR SELECT
  USING (true);

CREATE POLICY "Public can read pages"
  ON pages FOR SELECT
  USING (true);

CREATE POLICY "Public can read menu categories"
  ON menu_categories FOR SELECT
  USING (true);

CREATE POLICY "Public can read menu items"
  ON menu_items FOR SELECT
  USING (available = true);

CREATE POLICY "Public can read blog categories"
  ON blog_categories FOR SELECT
  USING (true);

CREATE POLICY "Public can read published blog posts"
  ON blog_posts FOR SELECT
  USING (published = true);

CREATE POLICY "Public can read gallery categories"
  ON gallery_categories FOR SELECT
  USING (true);

CREATE POLICY "Public can read gallery items"
  ON gallery_items FOR SELECT
  USING (true);

CREATE POLICY "Public can read team members"
  ON team_members FOR SELECT
  USING (true);

CREATE POLICY "Public can read events"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Public can read FAQ items"
  ON faq_items FOR SELECT
  USING (true);

CREATE POLICY "Public can read enabled payment settings"
  ON payment_settings FOR SELECT
  USING (enabled = true);

-- Admin write policies
CREATE POLICY "Admins can manage global settings"
  ON global_settings FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage branding"
  ON branding FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage theme settings"
  ON theme_settings FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage navigation settings"
  ON navigation_settings FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage footer settings"
  ON footer_settings FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage popups"
  ON popups FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage SEO settings"
  ON seo_settings FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage media"
  ON media FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage pages"
  ON pages FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage menu categories"
  ON menu_categories FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage menu items"
  ON menu_items FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage blog categories"
  ON blog_categories FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage blog posts"
  ON blog_posts FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage gallery categories"
  ON gallery_categories FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage gallery items"
  ON gallery_items FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage team members"
  ON team_members FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage events"
  ON events FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage FAQ items"
  ON faq_items FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage payment settings"
  ON payment_settings FOR ALL
  USING (is_admin(auth.uid()));

-- Orders policies
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING (is_admin(auth.uid()));

-- Payment proofs policies
CREATE POLICY "Users can view their own payment proofs"
  ON payment_proofs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = payment_proofs.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all payment proofs"
  ON payment_proofs FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Users can create payment proofs for their orders"
  ON payment_proofs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = payment_proofs.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update payment proofs"
  ON payment_proofs FOR UPDATE
  USING (is_admin(auth.uid()));

-- Order status history policies
CREATE POLICY "Users can view their own order history"
  ON order_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_status_history.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all order history"
  ON order_status_history FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can create order history"
  ON order_status_history FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Reservations policies
CREATE POLICY "Users can view their own reservations"
  ON reservations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all reservations"
  ON reservations FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Users can create reservations"
  ON reservations FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can update reservations"
  ON reservations FOR UPDATE
  USING (is_admin(auth.uid()));

-- Contact submissions policies
CREATE POLICY "Users can create contact submissions"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all contact submissions"
  ON contact_submissions FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update contact submissions"
  ON contact_submissions FOR UPDATE
  USING (is_admin(auth.uid()));

-- Insert default data
INSERT INTO branding DEFAULT VALUES ON CONFLICT DO NOTHING;
INSERT INTO theme_settings DEFAULT VALUES ON CONFLICT DO NOTHING;
INSERT INTO navigation_settings DEFAULT VALUES ON CONFLICT DO NOTHING;
INSERT INTO footer_settings DEFAULT VALUES ON CONFLICT DO NOTHING;

-- Insert default payment settings
INSERT INTO payment_settings (method, enabled, settings) VALUES
  ('zelle', true, '{"email": "", "phone": "", "logo_url": "", "instructions": "Send payment to this Zelle email. Include your order ID as the description."}'::jsonb),
  ('cashapp', true, '{"cashtag": "", "qr_code_url": "", "instructions": "Scan the QR code or send to our cashtag. Include your order number in the note."}'::jsonb),
  ('cash', true, '{"image_url": "", "instructions": "Pay with cash upon pickup or delivery."}'::jsonb)
ON CONFLICT (method) DO NOTHING;



