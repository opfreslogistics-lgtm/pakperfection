# Pak Perfection - Complete Setup Guide

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- Google Maps API key (optional, for delivery addresses)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned (takes a few minutes)

### 3. Run Database Migration

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and click **Run**
5. Verify all tables are created by checking the **Table Editor**

### 4. Set Up Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. Click **New bucket**
3. Name it: `media`
4. Make it **Public**
5. Click **Create bucket**

### 5. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GOOGLE_MAPS_API_KEY=your-google-maps-key
```

To find these values:
- Go to **Settings** > **API** in Supabase
- Copy the **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- Copy the **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy the **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 7. Create Your Admin Account

1. Navigate to `/register`
2. Fill in your details and create an account
3. **The first user automatically becomes admin!**
4. Log in and you'll be redirected to `/admin` dashboard

## Admin Dashboard Access

- URL: `/admin`
- First registered user automatically gets admin role
- Admin can manage all site content, orders, and settings

## Key Features Implemented

✅ **Authentication System**
- User registration and login
- First user becomes admin automatically
- Secure role-based access control

✅ **Admin Dashboard**
- Menu management (categories and items)
- Order management with status updates
- Payment settings (Zelle, CashApp, Cash)
- User management

✅ **Frontend Pages**
- Home page with hero slider, featured dishes, testimonials
- Menu page with categories and items
- About page
- Contact page with form
- Cart and checkout
- Payment proof upload
- Thank you page

✅ **Order System**
- Add items to cart
- Checkout with delivery options
- Payment method selection
- Payment proof upload for Zelle/CashApp
- Order status tracking

✅ **Theme System**
- Light/Dark mode toggle
- Theme persistence in localStorage
- Customizable colors

## Next Steps (Optional Enhancements)

The following features are partially implemented or can be added:

1. **Admin Settings Pages**
   - Branding upload (logo, favicon)
   - Theme customization
   - Navigation settings
   - Footer settings
   - SEO settings
   - Pop-up management

2. **Additional Pages**
   - Services page
   - Gallery page
   - Blog pages
   - Reservation page
   - Team page
   - Events page
   - FAQ page

3. **Google Maps Integration**
   - Address autocomplete on checkout
   - Delivery address map view in admin

4. **Email Notifications**
   - Order confirmation emails
   - Payment proof received notifications
   - Status update emails

## Troubleshooting

### "Failed to fetch" errors
- Check your Supabase URL and keys in `.env.local`
- Ensure Supabase project is active
- Check browser console for specific errors

### Images not uploading
- Verify `media` bucket exists and is public
- Check storage policies allow uploads
- Ensure file size is within limits

### Admin access denied
- Only the first registered user becomes admin
- Check `profiles` table to verify role
- You can manually update role in Supabase dashboard if needed

### RLS Policy Errors
- Ensure all RLS policies were created from migration
- Check that `is_admin()` function exists
- Verify user has correct role in `profiles` table

## Database Schema Overview

Key tables:
- `profiles` - User profiles with roles
- `orders` - Customer orders
- `payment_settings` - Payment method configurations
- `payment_proofs` - Uploaded payment screenshots
- `menu_categories` - Menu categories
- `menu_items` - Menu items
- `pages` - Custom pages
- `media` - Media library
- `global_settings` - Site-wide settings
- `branding` - Logo and branding assets
- `theme_settings` - Theme customization
- `navigation_settings` - Navigation configuration
- `footer_settings` - Footer configuration

## Security Notes

- RLS (Row-Level Security) is enabled on all tables
- Admin operations are secured at database level
- Service role key should never be exposed to frontend
- Payment proofs are stored securely in Supabase Storage

## Support

For issues or questions:
1. Check the browser console for errors
2. Check Supabase logs in dashboard
3. Verify all environment variables are set correctly
4. Ensure database migration ran successfully





