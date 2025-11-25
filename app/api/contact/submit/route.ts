import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message } = body

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    // Use server-side Supabase client (bypasses RLS issues)
    const supabase = await createClient()

    // Insert contact submission using service role (server-side)
    const { data: submission, error: insertError } = await supabase
      .from('contact_submissions')
      .insert({
        name,
        email,
        phone: phone || null,
        subject: subject || null,
        message,
        read: false,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Contact submission insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to submit contact form', details: insertError.message },
        { status: 500 }
      )
    }

    // Send confirmation emails
    if (submission?.id) {
      try {
        const emailResponse = await fetch(`${request.nextUrl.origin}/api/email/send-contact-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ submissionId: submission.id }),
        })

        const emailResult = await emailResponse.json()
        
        return NextResponse.json({
          success: true,
          submissionId: submission.id,
          emailSent: emailResult.success || false,
        })
      } catch (emailError) {
        console.error('Email sending error:', emailError)
        // Return success even if email fails
        return NextResponse.json({
          success: true,
          submissionId: submission.id,
          emailSent: false,
          emailError: 'Email could not be sent',
        })
      }
    }

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
    })
  } catch (error: any) {
    console.error('Contact form API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
