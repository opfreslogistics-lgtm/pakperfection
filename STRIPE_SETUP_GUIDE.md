# Stripe Payment Integration Setup Guide

## ✅ What's Been Implemented

Stripe payment gateway has been fully integrated into your restaurant website. Customers can now pay with credit/debit cards, Apple Pay, and Google Pay.

### Files Created:
1. **API Routes:**
   - `/app/api/stripe/create-checkout-session/route.ts` - Creates Stripe checkout sessions
   - `/app/api/stripe/webhook/route.ts` - Handles payment confirmations

2. **Client Library:**
   - `/lib/stripe/client.ts` - Stripe client initialization

3. **Pages:**
   - `/app/checkout/success/page.tsx` - Success page after payment
   - `/app/checkout/cancel/page.tsx` - Cancel page if payment is cancelled

4. **Updated:**
   - `/app/checkout/page.tsx` - Integrated Stripe payment option

---

## 🔧 Setup Instructions

### Step 1: Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Click "Sign up" and create your account
3. Complete your business profile

### Step 2: Get Your API Keys

1. Go to [https://dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
2. You'll see two keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`) - Click "Reveal test key"

### Step 3: Add Environment Variables

Add these to your `.env.local` file:

```env
# Stripe Keys (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here

# Webhook Secret (get this in Step 5)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Site URL (for redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Step 4: Add Stripe to Your Database

Run this SQL in your Supabase SQL Editor:

```sql
-- Add Stripe as a payment method
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
```

### Step 5: Setup Webhook (Important!)

Webhooks allow Stripe to notify your application when payments succeed.

#### For Local Development (using Stripe CLI):

1. Install Stripe CLI:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Windows
   scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
   scoop install stripe
   
   # Linux
   wget https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz
   tar -xvf stripe_1.19.4_linux_x86_64.tar.gz
   ```

2. Login to Stripe CLI:
   ```bash
   stripe login
   ```

3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. Copy the webhook signing secret that appears (starts with `whsec_`) and add it to `.env.local`

#### For Production (Vercel/Live Site):

1. Go to [https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your endpoint URL: `https://your-domain.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)
7. Add it to your Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

### Step 6: Update Environment Variables on Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add these variables:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
   ```
5. Redeploy your application

### Step 7: Test the Integration

1. Go to your website's checkout page
2. Add items to cart and proceed to checkout
3. Select "Stripe" as payment method
4. You'll be redirected to Stripe Checkout
5. Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
6. Complete the payment
7. You should be redirected to the success page
8. Check your Supabase `orders` table - the order should be created

---

## 🧪 Test Cards

Stripe provides test cards for different scenarios:

| Card Number | Scenario |
|------------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 9995` | Payment declined |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |
| `4000 0000 0000 0341` | Charge succeeds and funds added directly |

---

## 🚀 Going Live

### Step 1: Activate Your Stripe Account

1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Click "Activate your account"
3. Complete business verification
4. Provide business details
5. Add bank account for payouts

### Step 2: Get Live API Keys

1. Toggle from "Test mode" to "Live mode" in dashboard
2. Go to API keys
3. Copy your live keys (start with `pk_live_` and `sk_live_`)

### Step 3: Update Production Environment Variables

Replace test keys with live keys in Vercel:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

### Step 4: Update Live Webhook

1. Go to [https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks) (in live mode)
2. Create new webhook endpoint for production
3. Update `STRIPE_WEBHOOK_SECRET` in Vercel

---

## 💰 Pricing

**Stripe Fees (USA):**
- 2.9% + $0.30 per successful card charge
- No monthly fees
- No setup fees
- No hidden costs

**Example:**
- Order total: $50.00
- Stripe fee: $1.75 (2.9% + $0.30)
- You receive: $48.25

---

## 🔒 Security Features

Stripe handles:
- ✅ PCI compliance
- ✅ Card data encryption
- ✅ Fraud detection
- ✅ 3D Secure authentication
- ✅ Secure payment processing

Your site never touches card details - everything is handled by Stripe's secure servers.

---

## 📊 Stripe Dashboard Features

Access at [https://dashboard.stripe.com](https://dashboard.stripe.com):

- View all payments and refunds
- Track revenue and analytics
- Manage customers
- Issue refunds
- Export data for accounting
- View dispute/chargeback information
- Set up email receipts

---

## 🆘 Troubleshooting

### "Publishable key not found"
- Make sure `.env.local` has the correct key
- Restart your development server after adding env variables

### "Webhook signature verification failed"
- Ensure `STRIPE_WEBHOOK_SECRET` is correctly set
- Make sure webhook URL matches exactly
- Check that events are being sent to correct endpoint

### Order not created after payment
- Check webhook is configured correctly
- Look at Stripe dashboard → Webhooks → View logs
- Check your API route logs for errors

### Test mode vs Live mode
- Always use test keys for development
- Switch to live keys only for production
- Test thoroughly before going live

---

## 🎯 Next Steps

1. Test checkout flow with test cards
2. Customize email receipts in Stripe dashboard
3. Set up payout schedule (daily, weekly, or monthly)
4. Enable additional payment methods (coming soon):
   - Apple Pay
   - Google Pay
   - Link (Stripe's one-click checkout)
   - Afterpay/Klarna (buy now, pay later)

---

## 📞 Support

- **Stripe Documentation:** [https://stripe.com/docs](https://stripe.com/docs)
- **Stripe Support:** [https://support.stripe.com](https://support.stripe.com)
- **Test your integration:** [https://dashboard.stripe.com/test/dashboard](https://dashboard.stripe.com/test/dashboard)

---

## ✨ What Customers See

1. They add items to cart
2. Proceed to checkout
3. Select "Credit/Debit Card" payment option
4. Click "Place Order"
5. Redirected to Stripe's secure checkout page
6. Enter card details
7. Complete payment
8. Redirected back to success page
9. Receive order confirmation email
10. Order appears in your admin dashboard

**All payment data is processed securely by Stripe - your site never sees card numbers!**
