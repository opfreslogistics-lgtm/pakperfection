import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/config'

export async function POST(request: NextRequest) {
  try {
    const { to, settings } = await request.json()

    if (!to) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    // If settings are provided, temporarily use them
    // Otherwise, the config will use database settings
    const testEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #eab308 100%); padding: 30px; text-align: center; color: white; }
          .content { background: #f9fafb; padding: 30px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Test Email from Pak Perfection</h1>
          </div>
          <div class="content">
            <h2>Email Configuration Test</h2>
            <p>Congratulations! Your SMTP settings are working correctly.</p>
            <p>This is a test email to verify that your email configuration is set up properly.</p>
            <p>If you received this email, it means:</p>
            <ul>
              <li>✅ Your SMTP host and port are correct</li>
              <li>✅ Your email credentials are valid</li>
              <li>✅ Emails can be sent successfully</li>
            </ul>
            <p>Your customers will now receive automatic emails for:</p>
            <ul>
              <li>📧 Order confirmations</li>
              <li>📧 Order status updates</li>
              <li>📧 Reservation confirmations</li>
            </ul>
          </div>
          <div class="footer">
            <p>Pak Perfection International Cuisine LLC</p>
            <p>This is an automated test email</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Pass settings to sendEmail if provided, otherwise it will use database/env vars
    const result = await sendEmail(
      to,
      'Test Email - Pak Perfection SMTP Configuration',
      testEmailHtml,
      settings // Pass settings from request body
    )

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        messageId: 'messageId' in result ? result.messageId : undefined,
        message: 'Test email sent successfully'
      })
    } else {
      return NextResponse.json(
        { 
          error: 'Failed to send test email', 
          details: result.error 
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Test email API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}

