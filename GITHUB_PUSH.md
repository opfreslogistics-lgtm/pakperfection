# Push to GitHub - Step by Step

## 📋 Prerequisites

1. Git installed on your computer
2. GitHub account access
3. Repository URL: `https://github.com/opfreslogistics-lgtm/pakperfection.git`

## 🚀 Steps to Push

### Option 1: Using Command Line (Recommended)

Open PowerShell or Command Prompt in your project folder and run:

```bash
# Step 1: Initialize Git (if not already done)
git init

# Step 2: Add all files
git add .

# Step 3: Create initial commit
git commit -m "Initial commit - Pak Perfection Restaurant Website"

# Step 4: Add GitHub remote
git remote add origin https://github.com/opfreslogistics-lgtm/pakperfection.git

# Step 5: Rename branch to main (if needed)
git branch -M main

# Step 6: Push to GitHub
git push -u origin main
```

**If you get authentication errors:**
- Use GitHub Personal Access Token instead of password
- Or use GitHub Desktop app (see Option 2)

### Option 2: Using GitHub Desktop

1. Download [GitHub Desktop](https://desktop.github.com/)
2. Sign in with your GitHub account
3. Click "File" → "Add Local Repository"
4. Select your project folder
5. Click "Publish repository"
6. Repository name: `pakperfection`
7. Click "Publish Repository"

### Option 3: Using VS Code

1. Open VS Code in your project folder
2. Click the Source Control icon (left sidebar)
3. Click "Initialize Repository"
4. Stage all files (click + next to "Changes")
5. Enter commit message: "Initial commit"
6. Click "Commit"
7. Click "..." → "Remote" → "Add Remote"
8. Name: `origin`
9. URL: `https://github.com/opfreslogistics-lgtm/pakperfection.git`
10. Click "Publish Branch"

## ⚠️ Important Notes

- **Never commit `.env.local`** - It's already in `.gitignore`
- **Never commit sensitive keys** - Only use environment variables in Vercel
- **First push might take a few minutes** - Project has many files

## ✅ Verify Push

After pushing, visit:
`https://github.com/opfreslogistics-lgtm/pakperfection`

You should see all your files there!

## 🔄 Future Updates

After making changes:

```bash
git add .
git commit -m "Description of changes"
git push
```

---

**Next Step:** After pushing to GitHub, follow [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) to deploy to Vercel.

