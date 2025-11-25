# SMTP Email Setup Guide for Pak Perfection

## Overview
This guide will help you set up automatic email notifications for your restaurant. Customers will receive beautiful, professional emails for order confirmations and status updates.

## Features
- ✅ Order Confirmation Emails
- ✅ Order Status Update Emails
- ✅ Beautiful HTML Email Templates
- ✅ Admin Panel for SMTP Configuration
- ✅ Test Email Functionality

## Quick Setup Steps

### 1. Install Required Package
First, install nodemailer for sending emails:

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

### 2. Configure SMTP Settings

#### Option A: Using Gmail
1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Generate an "App Password":
   - Go to Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other" (name it "Pak Perfection")
   - Copy the generated 16-character password

4. In the admin panel (`/admin/email-settings`), enter:
   - SMTP Host: `smtp.gmail.com`
   - SMTP Port: `587`
   - SMTP User: Your Gmail address
   - SMTP Password: The app password you generated
   - From Email: `info@pakperfectioninter.com`
   - From Name: `Pak Perfection`

#### Option B: Using Outlook/Hotmail
- SMTP Host: `smtp-mail.outlook.com`
- SMTP Port: `587`
- SMTP User: Your Outlook email
- SMTP Password: Your Outlook password

#### Option C: Using SendGrid (Recommended for Production)
1. Sign up at https://sendgrid.com
2. Create an API Key
3. Use these settings:
   - SMTP Host: `smtp.sendgrid.net`
   - SMTP Port: `587`
   - SMTP User: `apikey`
   - SMTP Password: Your SendGrid API key

#### Option D: Using Mailgun
1. Sign up at https://www.mailgun.com
2. Get SMTP credentials from your domain settings
3. Use the provided SMTP settings

### 3. Set Environment Variables (Optional)
You can also set these in your `.env.local` file:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=info@pakperfectioninter.com
SMTP_FROM_NAME=Pak Perfection
SMTP_SECURE=false
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 4. Run Database Migration
Apply the email settings migration:

```bash
# If using Supabase CLI
supabase migration up

# Or manually run the SQL in supabase/migrations/007_email_settings.sql
```

### 5. Access Email Settings
1. Log in as admin
2. Navigate to `/admin/email-settings`
3. Enter your SMTP credentials
4. Click "Save Settings"
5. Send a test email to verify

## How It Works

### Automatic Email Triggers

#### 1. Order Confirmation
When a customer places an order, they automatically receive:
- Order details with items
- Total amount
- Delivery address (if applicable)
- Order tracking link
- Contact information

#### 2. Status Updates
When you update an order status in the admin panel, customers receive:
- Status change notification
- Updated delivery timeline
- Relevant action items
- Support contact information

### Email Templates

#### Order Confirmation Template
```typescript
// Automatically sent when order is created
// Includes: Order ID, Items, Total, Delivery info, Track link
```

#### Status Update Template
```typescript
// Automatically sent when status changes
// Includes: Old status, New status, Timeline, Actions
```

## Admin Panel Guide

### Accessing Email Settings
1. Log in to admin panel
2. Navigate to "Email Settings" in the sidebar
3. Configure SMTP credentials

### Testing Emails
1. Enter your SMTP settings
2. Enter a test email address
3. Click "Test" button
4. Check the inbox for test email

### Monitoring
- Check admin orders page to see if emails were sent
- View email logs in your SMTP provider's dashboard
- Test with different email providers (Gmail, Outlook, etc.)

## Troubleshooting

### Common Issues

#### 1. "Authentication Failed"
- **Gmail**: Make sure you're using an App Password, not your regular password
- **Outlook**: Enable "Less secure app access" or use app-specific password
- Double-check username and password

#### 2. "Connection Timeout"
- Check your firewall settings
- Try different ports (587, 465, 25)
- Ensure your hosting provider allows SMTP connections

#### 3. "Email Not Received"
- Check spam/junk folder
- Verify the recipient email address
- Test with different email providers
- Check SMTP provider's sending limits

#### 4. "SSL/TLS Errors"
- Try toggling the "Use Secure Connection" checkbox
- For port 587, usually leave it unchecked
- For port 465, check the box

### Debug Mode
To see detailed email sending logs:
1. Check browser console for errors
2. Check server logs
3. Enable debug mode in nodemailer config

## Production Recommendations
i got an error rror: Failed to run sql query: ERROR: 42710: policy "Anyone can create reservations" for table "reservations" already exists



### 1. Use a Dedicated Email Service
For production, use services like:
- **SendGrid** (12,000 free emails/month)
- **Mailgun** (5,000 free emails/month)
- **AWS SES** (62,000 free emails/month)
- **Postmark** (Best deliverability)

### 2. Set Up SPF and DKIM
To improve deliverability:
1. Add SPF record to your domain's DNS
2. Set up DKIM authentication
3. Configure DMARC policy

### 3. Monitor Bounce Rates
- Keep bounce rate < 5%
- Remove invalid email addresses
- Use email verification services

### 4. Respect Email Best Practices
- Include unsubscribe links
- Don't send to spam traps
- Maintain clean email lists
- Follow CAN-SPAM Act guidelines

## Email Template Customization

### Modifying Templates
Edit the templates in `lib/email/templates.ts`:

```typescript
// Customize colors, layout, content
// Templates use inline CSS for email client compatibility
```

### Adding New Email Types
1. Create template in `templates.ts`
2. Add sender function in `send-order-emails.ts`
3. Create API route in `app/api/email/`
4. Call from your application

## Security Notes

⚠️ **Important Security Tips:**
- Never commit SMTP passwords to Git
- Use environment variables for sensitive data
- Rotate passwords regularly
- Use app-specific passwords when available
- Limit SMTP access to trusted IPs (if possible)
- Enable 2FA on your email account

## Support

If you need help:
1. Check the troubleshooting section above
2. Review SMTP provider documentation
3. Test with Gmail first (easiest setup)
4. Check server logs for detailed errors

## License

Part of Pak Perfection Restaurant Management System


