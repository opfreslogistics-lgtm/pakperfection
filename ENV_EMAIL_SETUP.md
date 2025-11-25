# Environment Variable Email Setup (Alternative Method)

If the admin panel isn't working, you can set up email directly using environment variables.

## 📝 Step 1: Create/Edit `.env.local` file

Create a file named `.env.local` in your project root (same folder as `package.json`).

## 📝 Step 2: Add Your Gmail SMTP Settings

Add these lines to `.env.local`:

```env
# Gmail SMTP Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM=your-email@gmail.com
SMTP_FROM_NAME=Pak Perfection
```

## ⚠️ Important Notes:

1. **SMTP_USER**: Your full Gmail address (e.g., `john@gmail.com`)
2. **SMTP_PASS**: Your 16-character App Password (NOT your regular password)
   - Get it from: https://myaccount.google.com/apppasswords
   - Remove all spaces when pasting
3. **SMTP_FROM**: Must match your Gmail address exactly
4. **SMTP_SECURE**: Set to `false` for port 587, `true` for port 465

## 📝 Example `.env.local`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=john@gmail.com
SMTP_PASS=abcdefghijklmnop
SMTP_FROM=john@gmail.com
SMTP_FROM_NAME=Pak Perfection
```

## 🔄 Step 3: Restart Your Server

After saving `.env.local`, restart your Next.js development server:

```bash
# Stop the server (Ctrl+C)
# Then start it again
npm run dev
```

## ✅ Step 4: Test

Go to `/admin/email-settings` and click "Test" button. It should now work!

---

## 🔒 Security Note

**NEVER commit `.env.local` to Git!** It's already in `.gitignore`, but make sure it stays there.

---

## 🆘 Still Not Working?

1. Make sure `.env.local` is in the project root (not in a subfolder)
2. Make sure you restarted the server after adding the file
3. Check that there are no spaces in your App Password
4. Verify 2-Step Verification is enabled on your Google Account
5. Make sure "From Email" matches your Gmail address exactly

---

## 💡 Pro Tip

You can use environment variables as a backup even if you're using the admin panel. The system will:
1. First try to use settings from the admin panel (database)
2. If that fails, use environment variables
3. If that fails, show an error

This gives you flexibility! 🎉


