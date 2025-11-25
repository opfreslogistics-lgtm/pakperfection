-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  text TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  profile_image_url TEXT,
  position TEXT DEFAULT 'Verified Customer',
  order_index INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Policies for testimonials
DROP POLICY IF EXISTS "Anyone can view testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admins can manage testimonials" ON testimonials;

CREATE POLICY "Anyone can view testimonials" ON testimonials 
FOR SELECT USING (true);

CREATE POLICY "Admins can manage testimonials" ON testimonials 
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Insert default testimonials
INSERT INTO testimonials (name, text, rating, position, order_index, featured) VALUES
  ('Sarah Johnson', 'Absolutely amazing food! The flavors are authentic and the service is outstanding. Highly recommend!', 5, 'Verified Customer', 1, true),
  ('Michael Chen', 'Best restaurant in town! The biryani is to die for. Will definitely be coming back soon.', 5, 'Verified Customer', 2, true),
  ('Emily Rodriguez', 'The atmosphere is wonderful and the food is incredible. A perfect dining experience!', 5, 'Verified Customer', 3, true)
ON CONFLICT DO NOTHING;




