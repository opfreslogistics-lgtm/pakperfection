# Email Setup Guide - Pak Perfection

This guide will help you configure SMTP email settings so that customers receive automatic emails for orders and reservations.

## 📧 Why Emails Aren't Sending

If customers aren't receiving emails, it's because **SMTP settings haven't been configured yet**. You need to set up your email provider's SMTP credentials in the admin panel.

## 🚀 Quick Setup Steps

### Step 1: Access Email Settings
1. Log in to your admin dashboard
2. Navigate to **Email Settings** in the sidebar (under Settings)
3. You'll see a form to configure SMTP settings

### Step 2: Configure SMTP Settings

#### For Gmail Users:
1. **SMTP Host:** `smtp.gmail.com`
2. **SMTP Port:** `587`
3. **SMTP User:** Your Gmail address (e.g., `yourname@gmail.com`)
4. **SMTP Password:** You need to create an **App Password** (not your regular password)
5. **SMTP Secure:** Leave unchecked (false)
6. **From Email:** Your Gmail address
7. **From Name:** Pak Perfection (or your business name)

**How to Create Gmail App Password:**
1. Go to your Google Account settings
2. Enable 2-Step Verification (required for app passwords)
3. Go to Security → App passwords
4. Create a new app password for "Mail"
5. Copy the 16-character password and use it in SMTP Password field

#### For Outlook/Hotmail Users:
1. **SMTP Host:** `smtp-mail.outlook.com`
2. **SMTP Port:** `587`
3. **SMTP User:** Your Outlook email address
4. **SMTP Password:** Your Outlook password
5. **SMTP Secure:** Leave unchecked (false)

#### For Other Email Providers:
- **Yahoo:** `smtp.mail.yahoo.com` (port 587)
- **Custom SMTP:** Check with your email provider for SMTP settings

### Step 3: Test Your Configuration
1. Enter your email address in the "Test Email" field
2. Click "Send Test Email"
3. Check your inbox - you should receive a test email
4. If you receive it, your configuration is working! ✅

### Step 4: Save Settings
1. Click "Save Settings" button
2. You should see a success message
3. Emails will now be sent automatically when:
   - Customers place orders
   - Order status is updated
   - Customers make reservations

## 🔧 Troubleshooting

### "SMTP credentials not configured" Error
- Make sure you've saved your SMTP settings in the admin panel
- Check that all required fields are filled (Host, Port, User, Password)

### "Failed to send email" Error
- Verify your SMTP credentials are correct
- For Gmail, make sure you're using an App Password, not your regular password
- Check that your email provider allows SMTP access
- Some email providers require you to enable "Less secure app access" (not recommended for Gmail - use App Passwords instead)

### Emails Going to Spam
- This is normal for new email configurations
- Ask customers to check their spam folder
- Over time, as you send more emails, deliverability will improve
- Consider using a professional email service (SendGrid, Mailgun) for better deliverability

### Test Email Works But Order/Reservation Emails Don't
- Check the browser console for errors
- Verify that orders/reservations have email addresses
- Check server logs for detailed error messages

## 📋 What Emails Are Sent Automatically?

1. **Order Confirmation Email**
   - Sent when a customer places an order
   - Includes order details, items, and total

2. **Order Status Update Email**
   - Sent when admin updates order status
   - Notifies customer of status changes (preparing, ready, delivered, etc.)

3. **Reservation Confirmation Email**
   - Sent when a customer makes a reservation
   - Includes reservation details and contact information

## 🔒 Security Notes

- **Never share your SMTP password** with anyone
- Use **App Passwords** for Gmail instead of your main password
- The password is stored securely in the database (encrypted)
- Only admins can view/edit email settings

## 💡 Best Practices

1. **Use a dedicated business email** for sending automated emails
2. **Test your configuration** before going live
3. **Monitor email delivery** - check if customers are receiving emails
4. **Keep SMTP credentials updated** if you change your email password
5. **Consider using a professional email service** (SendGrid, Mailgun, AWS SES) for better deliverability and higher sending limits

## 🆘 Still Having Issues?

If you're still experiencing problems:
1. Double-check all SMTP settings are correct
2. Try sending a test email first
3. Check your email provider's documentation for SMTP settings
4. Verify that your email account allows SMTP access
5. Check server logs for detailed error messages

## 📞 Support

For additional help, contact your developer or refer to your email provider's SMTP documentation.


