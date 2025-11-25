-- Ensure there's at least one branding row
INSERT INTO branding (id, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- If the above doesn't work, try this alternative:
-- Insert a default branding row if none exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM branding LIMIT 1) THEN
    INSERT INTO branding (created_at, updated_at)
    VALUES (NOW(), NOW());
  END IF;
END $$;




