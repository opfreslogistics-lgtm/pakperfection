# Vercel Deployment Guide - Pak Perfection

## 🚀 Quick Deployment Steps

### Step 1: Push to GitHub

1. **Initialize Git (if not already done)**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Pak Perfection Restaurant Website"
   ```

2. **Add GitHub Remote**
   ```bash
   git remote add origin https://github.com/opfreslogistics-lgtm/pakperfection.git
   git branch -M main
   ```

3. **Push to GitHub**
   ```bash
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import Project**
   - Click "Add New Project"
   - Select your repository: `opfreslogistics-lgtm/pakperfection`
   - Click "Import"

3. **Configure Project**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

4. **Add Environment Variables**
   Click "Environment Variables" and add:

   **Required:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

   **Optional (for email):**
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=your-email@gmail.com
   SMTP_FROM_NAME=Pak Perfection
   ```

   **Google Maps:**
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBrtDjXYcK6iMTYEZcv6E_lL4-2-Q-4BM
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (2-5 minutes)
   - Your site will be live at `https://your-project.vercel.app`

### Step 3: Configure Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## 📋 Pre-Deployment Checklist

- [ ] All environment variables are set in Vercel
- [ ] Supabase migrations have been run
- [ ] Storage bucket `media` is created in Supabase
- [ ] Google Maps API key is added
- [ ] SMTP settings are configured (or use admin panel)
- [ ] Test the site locally before deploying

## 🔧 Post-Deployment Steps

1. **Run Database Migrations**
   - Go to Supabase SQL Editor
   - Run all migration files in order:
     - `001_initial_schema.sql`
     - `002_enhance_orders.sql`
     - `003_enhance_menu_and_orders.sql`
     - ... (all other migrations)
     - `010_add_events_featured.sql`
     - `011_event_bookings.sql`

2. **Create Storage Bucket**
   - Go to Supabase → Storage
   - Create bucket named `media`
   - Set to Public
   - Add RLS policies if needed

3. **Set Up First Admin User**
   - Visit your deployed site
   - Go to `/register`
   - Create account (first user becomes admin)
   - Log in and access `/admin`

4. **Configure Settings**
   - Upload logo and branding
   - Set up payment methods
   - Configure email settings
   - Add menu items
   - Create events

## 🐛 Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Ensure all dependencies are in `package.json`
- Check build logs in Vercel dashboard

### Database Connection Issues
- Verify Supabase URL and keys are correct
- Check RLS policies are set up
- Ensure migrations have been run

### Email Not Working
- Check SMTP settings in admin panel
- Verify environment variables
- Test email from admin panel

### Images Not Loading
- Verify storage bucket is public
- Check image URLs in database
- Ensure Supabase storage is configured

## 📞 Support

If you encounter issues:
1. Check Vercel build logs
2. Check Supabase logs
3. Review environment variables
4. Test locally first

---

**Your site will be live at:** `https://your-project.vercel.app`

