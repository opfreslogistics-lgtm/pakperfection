import nodemailer from 'nodemailer'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

// Only log in development
const isDev = process.env.NODE_ENV === 'development'
const log = (...args: any[]) => {
  if (isDev) console.log(...args)
}
const logError = (...args: any[]) => {
  if (isDev) console.error(...args)
}

// Get SMTP settings from database or provided settings
async function getSMTPSettings(providedSettings?: any) {
  // If settings are provided directly (e.g., from API request), use them first
  if (providedSettings && providedSettings.smtp_host && providedSettings.smtp_user && providedSettings.smtp_pass) {
    log('Using provided SMTP settings from request')
    return {
      host: providedSettings.smtp_host || 'smtp.gmail.com',
      port: parseInt((providedSettings.smtp_port || '587').toString()),
      secure: providedSettings.smtp_secure || false,
      user: providedSettings.smtp_user || '',
      password: providedSettings.smtp_pass || '',
      from: providedSettings.smtp_from || providedSettings.smtp_user || 'info@pakperfectioninter.com',
      fromName: providedSettings.smtp_from_name || 'Pak Perfection',
    }
  }

  // Try to get from database
  // Use service client to bypass RLS for server-side operations
  try {
    // First try service role client (bypasses RLS)
    const serviceClient = createServiceClient()
    if (serviceClient) {
      const { data, error } = await serviceClient
        .from('email_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle()

      if (!error && data && data.smtp_host && data.smtp_user && data.smtp_pass) {
        log('Using SMTP settings from database (service role)')
        return {
          host: data.smtp_host || 'smtp.gmail.com',
          port: parseInt((data.smtp_port || '587').toString()),
          secure: data.smtp_secure || false,
          user: data.smtp_user || '',
          password: data.smtp_pass || '',
          from: data.smtp_from || data.smtp_user || 'info@pakperfectioninter.com',
          fromName: data.smtp_from_name || 'Pak Perfection',
        }
      }
    }

    // Fallback to regular client (may be blocked by RLS)
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('email_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle()

    if (error) {
      logError('Error fetching SMTP settings from DB:', error)
    }

    if (data && data.smtp_host && data.smtp_user && data.smtp_pass) {
      log('Using SMTP settings from database (regular client)')
      return {
        host: data.smtp_host || 'smtp.gmail.com',
        port: parseInt((data.smtp_port || '587').toString()),
        secure: data.smtp_secure || false,
        user: data.smtp_user || '',
        password: data.smtp_pass || '',
        from: data.smtp_from || data.smtp_user || 'info@pakperfectioninter.com',
        fromName: data.smtp_from_name || 'Pak Perfection',
      }
    }
  } catch (error) {
    console.error('Error fetching SMTP settings from DB:', error)
  }

  // Fallback to environment variables
  log('Falling back to environment variables for SMTP settings')
  return {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'info@pakperfectioninter.com',
    fromName: process.env.SMTP_FROM_NAME || 'Pak Perfection',
  }
}

// Create reusable transporter object using SMTP transport
export const createEmailTransporter = async (providedSettings?: any) => {
  const settings = await getSMTPSettings(providedSettings)
  
  if (!settings.user || !settings.password) {
    logError('SMTP credentials missing:', {
      hasUser: !!settings.user,
      hasPassword: !!settings.password,
      host: settings.host,
    })
    throw new Error('SMTP credentials not configured. Please set up email settings in the admin panel or use environment variables (SMTP_USER, SMTP_PASS).')
  }

  // Gmail-specific configuration
  const isGmail = settings.host === 'smtp.gmail.com' || settings.host.includes('gmail.com')
  
  const transporterConfig: any = {
    host: settings.host,
    port: settings.port,
    secure: settings.secure, // true for 465 (SSL), false for 587 (STARTTLS)
    auth: {
      user: settings.user,
      pass: settings.password,
    },
    // Connection timeout
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 10000,
    // Debug mode (set to false in production if too verbose)
    debug: false,
    logger: false,
  }

  // For Gmail with port 587, we need STARTTLS (not SSL)
  if (isGmail && settings.port === 587) {
    transporterConfig.secure = false
    transporterConfig.requireTLS = true
    transporterConfig.tls = {
      rejectUnauthorized: false, // Allow self-signed certificates if needed
    }
  }

  // For Gmail with port 465, use SSL
  if (isGmail && settings.port === 465) {
    transporterConfig.secure = true
  }

  log('Creating email transporter with config:', {
    host: settings.host,
    port: settings.port,
    secure: transporterConfig.secure,
    user: settings.user,
    from: settings.from,
    isGmail,
  })

  return nodemailer.createTransport(transporterConfig)
}

// Email configuration
export const getEmailConfig = async (providedSettings?: any) => {
  const settings = await getSMTPSettings(providedSettings)
  return {
    from: settings.from,
    fromName: settings.fromName,
    replyTo: settings.from,
  }
}

// Helper function to send email
export const sendEmail = async (to: string, subject: string, html: string, providedSettings?: any) => {
  try {
    const transporter = await createEmailTransporter(providedSettings)
    const emailConfig = await getEmailConfig(providedSettings)
    
    // Verify connection first
    log('Verifying SMTP connection...')
    await transporter.verify()
    log('SMTP connection verified successfully')

    const mailOptions = {
      from: `"${emailConfig.fromName}" <${emailConfig.from}>`,
      to,
      subject,
      html,
      replyTo: emailConfig.replyTo,
    }

    log('Sending email:', {
      from: mailOptions.from,
      to,
      subject,
    })

    const info = await transporter.sendMail(mailOptions)

    log('Email sent successfully:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    logError('Error sending email:', error)
    
    // Provide more detailed error messages
    let errorMessage = 'Failed to send email. '
    
    if (error.code === 'EAUTH') {
      errorMessage += 'Authentication failed. Please check your email and app password. For Gmail, make sure you\'re using an App Password, not your regular password.'
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      errorMessage += 'Connection failed. Please check your SMTP host and port settings. Also check your internet connection.'
    } else if (error.code === 'EENVELOPE') {
      errorMessage += 'Invalid email address. Please check the recipient email address.'
    } else if (error.responseCode === 535) {
      errorMessage += 'Authentication failed. For Gmail, make sure: 1) 2-Step Verification is enabled, 2) You created an App Password (not your regular password), 3) The "From" email matches your Gmail account.'
    } else if (error.responseCode === 550) {
      errorMessage += 'Email rejected. The "From" email address must match your Gmail account email.'
    } else {
      errorMessage += error.message || 'Please check your SMTP settings in the admin panel.'
    }
    
    return { 
      success: false, 
      error: errorMessage,
      errorCode: error.code,
      errorDetails: error.response || error.responseCode,
    }
  }
}
