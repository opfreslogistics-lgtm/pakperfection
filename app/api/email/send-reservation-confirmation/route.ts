import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/config'
import { reservationConfirmationTemplate } from '@/lib/email/templates'

export async function POST(request: NextRequest) {
  try {
    const { reservationId } = await request.json()

    if (!reservationId) {
      return NextResponse.json(
        { error: 'Reservation ID is required' },
        { status: 400 }
      )
    }

    // Fetch reservation details from database
    const supabase = await createClient()
    const { data: reservation, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', reservationId)
      .single()

    if (error || !reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      )
    }

    // Generate email HTML - pass the full reservation object
    const emailHtml = reservationConfirmationTemplate(reservation)

    // Send confirmation email
    const result = await sendEmail(
      reservation.email,
      'Reservation Confirmation - Pak Perfection',
      emailHtml
    )

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        messageId: 'messageId' in result ? result.messageId : undefined,
        message: 'Reservation confirmation email sent successfully'
      })
    } else {
      return NextResponse.json(
        { 
          error: 'Failed to send email', 
          details: result.error 
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Reservation email API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}


