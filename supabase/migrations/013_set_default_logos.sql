-- Set default logos for branding
-- Update existing branding record with logo URLs for header and footer

UPDATE branding
SET 
  logo_url = 'https://opanykhlbusuwmnbswkb.supabase.co/storage/v1/object/public/branding/PAK-LOGO-2-scaled.png',
  footer_logo_url = 'https://opanykhlbusuwmnbswkb.supabase.co/storage/v1/object/public/branding/PAK-LOGO-2-scaled.png',
  updated_at = NOW()
WHERE id = (SELECT id FROM branding LIMIT 1);

-- If no branding record exists, create one with the logos
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM branding LIMIT 1) THEN
    INSERT INTO branding (
      logo_url,
      footer_logo_url,
      created_at,
      updated_at
    )
    VALUES (
      'https://opanykhlbusuwmnbswkb.supabase.co/storage/v1/object/public/branding/PAK-LOGO-2-scaled.png',
      'https://opanykhlbusuwmnbswkb.supabase.co/storage/v1/object/public/branding/PAK-LOGO-2-scaled.png',
      NOW(),
      NOW()
    );
  END IF;
END $$;

