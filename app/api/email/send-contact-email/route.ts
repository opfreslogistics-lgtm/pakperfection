import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/config'
import { contactFormTemplate } from '@/lib/email/templates'

export async function POST(request: NextRequest) {
  try {
    const { submissionId } = await request.json()

    if (!submissionId) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Fetch contact submission from database
    const { data: submission, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .eq('id', submissionId)
      .single()

    if (error || !submission) {
      return NextResponse.json(
        { error: 'Contact submission not found' },
        { status: 404 }
      )
    }

    if (!submission.email) {
      return NextResponse.json(
        { error: 'Email is required to send confirmation' },
        { status: 400 }
      )
    }

    // Send confirmation email to customer
    const customerHtml = contactFormTemplate(submission, 'customer')
    const customerResult = await sendEmail(
      submission.email,
      'Thank You for Contacting Pak Perfection',
      customerHtml
    )

    // Send notification email to admin
    const adminHtml = contactFormTemplate(submission, 'admin')
    const adminResult = await sendEmail(
      'info@pakperfectioninter.com', // Admin email
      `New Contact Form Submission: ${submission.subject || 'No Subject'}`,
      adminHtml
    )

    if (customerResult.success) {
      return NextResponse.json({ 
        success: true, 
        messageId: customerResult.messageId,
        adminEmailSent: adminResult.success
      })
    } else {
      return NextResponse.json(
        { 
          error: 'Failed to send email', 
          details: customerResult.error 
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Contact Email API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

