# 🚀 Quick Start - Deploy to Vercel

## Step 1: Push to GitHub

Run these commands in your terminal (PowerShell):

```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit - Pak Perfection Restaurant Website"

# Add GitHub remote
git remote add origin https://github.com/opfreslogistics-lgtm/pakperfection.git

# Push to GitHub
git push -u origin main
```

**If you get authentication error:**
- Use GitHub Personal Access Token (not password)
- Or use GitHub Desktop app

## Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Select repository: `opfreslogistics-lgtm/pakperfection`
4. Click "Import"

5. **Add Environment Variables:**
   - `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase Anon Key
   - `SUPABASE_SERVICE_ROLE_KEY` = Your Service Role Key
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` = AIzaSyBrtDjXYcK6iMTYEZcv6E_lL4-2-Q-4BM

6. Click "Deploy"
7. Wait 2-5 minutes
8. Your site is live! 🎉

## Step 3: Post-Deployment

1. Run all database migrations in Supabase SQL Editor
2. Create `media` storage bucket in Supabase
3. Visit your site and register (first user = admin)
4. Configure settings in admin panel

---

**Need help?** See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions.

