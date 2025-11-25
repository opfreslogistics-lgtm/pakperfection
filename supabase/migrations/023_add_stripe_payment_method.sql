-- Add 'stripe' to the payment_settings method check constraint

-- Drop the existing check constraint
ALTER TABLE payment_settings DROP CONSTRAINT IF EXISTS payment_settings_method_check;

-- Add the new check constraint with 'stripe' included
ALTER TABLE payment_settings ADD CONSTRAINT payment_settings_method_check 
  CHECK (method IN ('zelle', 'cashapp', 'cash', 'stripe'));

-- Now insert/update the Stripe payment method
INSERT INTO payment_settings (method, enabled, settings)
VALUES (
  'stripe',
  true,
  '{
    "display_name": "Credit/Debit Card",
    "description": "Pay securely with Stripe",
    "logo_url": "https://cdn.brandfolder.io/KGT2DTA4/at/8vbr8k4mr5xjwk4hxq4t9vs/Stripe_wordmark_-_blurple.svg"
  }'::jsonb
)
ON CONFLICT (method) DO UPDATE
SET enabled = true,
    settings = EXCLUDED.settings;
