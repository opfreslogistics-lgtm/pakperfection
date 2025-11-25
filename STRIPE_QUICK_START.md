# 🚀 Stripe Payment - Quick Start

## ✅ What's Done

Stripe payment gateway is now fully integrated into your website! 

**Pushed to production** ✓

---

## ⚡ Quick Setup (5 minutes)

### 1. Get Stripe Account
- Go to https://stripe.com and sign up
- It's free - no monthly fees

### 2. Get Your Keys
- Visit https://dashboard.stripe.com/test/apikeys
- Copy your **Publishable key** (pk_test_...)
- Copy your **Secret key** (sk_test_...)

### 3. Add to Vercel
Go to Vercel → Your Project → Settings → Environment Variables

Add these:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_temp_for_now
NEXT_PUBLIC_SITE_URL=https://your-site.vercel.app
```

### 4. Add Stripe to Database
In Supabase SQL Editor, run:

```sql
INSERT INTO payment_settings (method, enabled, settings)
VALUES (
  'stripe',
  true,
  '{"display_name": "Credit/Debit Card", "description": "Pay securely with Stripe"}'::jsonb
)
ON CONFLICT (method) DO UPDATE SET enabled = true;
```

### 5. Redeploy on Vercel
- Vercel will automatically redeploy
- Wait 2-3 minutes

---

## 🧪 Test It

1. Go to your website
2. Add items to cart
3. Go to checkout
4. Select "Credit/Debit Card" (Stripe)
5. Use test card: **4242 4242 4242 4242**
6. Any future expiry date, any CVC, any ZIP
7. Complete payment
8. You should see success page!

---

## 📋 Webhook Setup (Required for Production)

### Option A: For Testing (Local)
Skip this for now, test with the steps above first

### Option B: For Production
1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. URL: `https://your-site.vercel.app/api/stripe/webhook`
4. Select events: `checkout.session.completed`
5. Copy the webhook secret
6. Update `STRIPE_WEBHOOK_SECRET` in Vercel
7. Redeploy

---

## 💰 Costs

- **2.9% + $0.30** per successful payment
- **$0** setup fee
- **$0** monthly fee

Example: $50 order = $1.75 fee (you get $48.25)

---

## 🎯 What Customers See

1. Click "Place Order" at checkout
2. Redirected to Stripe's secure page
3. Enter card details
4. Payment processed
5. Redirected back to your site
6. Order confirmed!

**Your site never sees card numbers - 100% secure!**

---

## 🆘 Need Help?

Read the full guide: **STRIPE_SETUP_GUIDE.md**

Or contact Stripe support: https://support.stripe.com

---

## ✨ You're Done!

Stripe is ready to accept payments. Test it now! 🎉
