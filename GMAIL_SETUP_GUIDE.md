# Gmail SMTP Setup Guide - Step by Step

## ⚠️ Common Issues & Solutions

If emails are failing to send with Gmail, follow these steps:

---

## Step 1: Enable 2-Step Verification

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click **2-Step Verification**
3. Follow the prompts to enable it (you'll need your phone)

**Why?** Gmail requires 2-Step Verification to create App Passwords.

---

## Step 2: Create an App Password

1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Or: Google Account → Security → 2-Step Verification → App Passwords
2. Select app: **Mail**
3. Select device: **Other (Custom name)** → Type "Pak Perfection Website"
4. Click **Generate**
5. **Copy the 16-character password** (it looks like: `abcd efgh ijkl mnop`)
   - ⚠️ **Remove all spaces** when pasting (should be: `abcdefghijklmnop`)
   - ⚠️ You can only see this password once!

---

## Step 3: Configure in Admin Panel

Go to `/admin/email-settings` and enter:

| Field | Value |
|-------|-------|
| **SMTP Host** | `smtp.gmail.com` |
| **SMTP Port** | `587` |
| **SMTP Username** | Your full Gmail address (e.g., `yourname@gmail.com`) |
| **SMTP Password** | The 16-character App Password (no spaces) |
| **From Email** | **MUST match your Gmail address exactly** (e.g., `yourname@gmail.com`) |
| **From Name** | `Pak Perfection` (or any name) |
| **Secure Connection** | **UNCHECKED** (OFF) - Important! |

---

## Step 4: Test Email

1. Enter your email address in the "Test Email" field
2. Click **Test** button
3. Check your inbox (and spam folder)

---

## 🔴 Common Errors & Fixes

### Error: "Authentication failed" (EAUTH or 535)
**Fix:**
- ✅ Make sure you're using an **App Password**, not your regular Gmail password
- ✅ Make sure 2-Step Verification is enabled
- ✅ Remove all spaces from the App Password
- ✅ Make sure "From Email" matches "SMTP Username" exactly

### Error: "Email rejected" (550)
**Fix:**
- ✅ The "From Email" field **must** match your Gmail account email exactly
- ✅ If your Gmail is `john@gmail.com`, "From Email" must be `john@gmail.com`
- ✅ You cannot send from a different email address with Gmail SMTP

### Error: "Connection failed" (ECONNECTION)
**Fix:**
- ✅ Check your internet connection
- ✅ Make sure port 587 is not blocked by firewall
- ✅ Try port 465 with "Secure Connection" checked (SSL)

### Error: "Invalid login" or "Username and password not accepted"
**Fix:**
- ✅ Make sure you copied the App Password correctly (no spaces)
- ✅ Make sure you're using the App Password, not your regular password
- ✅ Regenerate the App Password if needed

---

## ✅ Quick Checklist

Before testing, make sure:

- [ ] 2-Step Verification is enabled on your Google Account
- [ ] You created an App Password (16 characters, no spaces)
- [ ] SMTP Host: `smtp.gmail.com`
- [ ] SMTP Port: `587`
- [ ] SMTP Username: Your full Gmail address
- [ ] SMTP Password: The App Password (no spaces)
- [ ] From Email: **Same as SMTP Username** (must match!)
- [ ] Secure Connection: **UNCHECKED** (OFF)
- [ ] You saved the settings
- [ ] You sent a test email

---

## 🔄 Alternative: Use Port 465 (SSL)

If port 587 doesn't work, try:

| Field | Value |
|-------|-------|
| **SMTP Port** | `465` |
| **Secure Connection** | **CHECKED** (ON) |

Everything else stays the same.

---

## 📧 Still Not Working?

1. **Check the browser console** (F12) for detailed error messages
2. **Check server logs** for SMTP connection details
3. **Try a different Gmail account** to rule out account-specific issues
4. **Wait 5-10 minutes** after creating App Password (sometimes takes time to activate)
5. **Regenerate App Password** and try again

---

## 💡 Pro Tips

- **Use a dedicated Gmail account** for your restaurant (e.g., `pakperfection@gmail.com`)
- **Don't share App Passwords** - they're like master keys
- **Test regularly** to make sure emails are still working
- **Check spam folder** - sometimes emails go there initially

---

## 🚀 Alternative: Use Resend (Easier!)

If Gmail continues to give you trouble, consider using **Resend**:
- ✅ No SMTP configuration needed
- ✅ Just an API key
- ✅ Better deliverability
- ✅ Free tier: 3,000 emails/month

See `EMAIL_SERVICE_RECOMMENDATIONS.md` for details.

---

## Need Help?

If you're still having issues:
1. Check the error message in the admin panel (it will show specific details)
2. Check your server logs for detailed SMTP connection info
3. Make sure all fields are filled correctly
4. Try regenerating the App Password

Good luck! 🎉


