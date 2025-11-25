# Email System Configuration Guide

## Problem: Emails Not Sending

The email system is configured but emails are not being sent because:
1. Environment variables are not set
2. Emails are not being triggered after order creation
3. SMTP credentials may be incorrect

## Solution Steps

### Step 1: Configure Environment Variables

Create a `.env.local` file in your project root with these settings:

```env
# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-here

# Email Settings
SMTP_FROM=info@pakperfectioninter.com
SMTP_FROM_NAME=Pak Perfection
SMTP_REPLY_TO=info@pakperfectioninter.com
```

### Step 2: Get Gmail App Password (If Using Gmail)

1. Go to your Google Account: https://myaccount.google.com
2. Select "Security" from the navigation
3. Under "Signing in to Google," select "2-Step Verification" (enable if not already)
4. At the bottom, select "App passwords"
5. Select "Mail" and "Other (Custom name)"
6. Name it "Pak Perfection"
7. Click "Generate"
8. Copy the 16-character password (no spaces)
9. Use this as your `SMTP_PASS` value

### Step 3: Alternative Email Providers

#### Using Office 365 / Outlook
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### Using Custom Domain (e.g., cPanel, hosting provider)
```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=info@pakperfectioninter.com
SMTP_PASS=your-email-password
```

Contact your hosting provider for exact SMTP settings.

### Step 4: Test Email Configuration

1. Go to `/admin/email-settings`
2. Fill in your SMTP details
3. Click "Save Settings"
4. Enter a test email address
5. Click "Send Test Email"
6. Check if you receive the test email

### Step 5: Verify Email Triggers

The system needs to call the email API after order creation. The email API route exists at:
- `/api/email/send-order-confirmation`
- `/api/email/send-status-update`

These need to be triggered in the checkout process.

## Common Issues

### Issue 1: "Authentication failed"
**Solution**: 
- For Gmail: Use App Password, not regular password
- For other providers: Verify username and password are correct
- Enable "Less secure app access" if required by provider

### Issue 2: "Connection timeout"
**Solution**:
- Check SMTP_HOST is correct
- Verify SMTP_PORT (usually 587 for TLS, 465 for SSL)
- Check if your hosting blocks outgoing SMTP connections
- Try different port (587, 465, or 25)

### Issue 3: "Certificate error"
**Solution**:
- Set `SMTP_SECURE=false` for port 587
- Set `SMTP_SECURE=true` for port 465

### Issue 4: Emails go to spam
**Solution**:
- Use a custom domain email that matches your website
- Set up SPF and DKIM records for your domain
- Use a verified email address

## Testing Checklist

- [ ] Environment variables are set in `.env.local`
- [ ] SMTP credentials are correct
- [ ] Test email works from admin panel
- [ ] Order confirmation email sends after checkout
- [ ] Status update email sends when order status changes
- [ ] Emails arrive in inbox (not spam)

## Need Help?

If emails still don't work:
1. Check server logs for error messages
2. Verify nodemailer is installed: `npm list nodemailer`
3. Try sending from a terminal/command line to test SMTP credentials
4. Contact your hosting provider for SMTP settings
5. Consider using a transactional email service (SendGrid, Mailgun, etc.)


