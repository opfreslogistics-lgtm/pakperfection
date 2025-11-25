import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/config'
import { eventBookingConfirmationTemplate } from '@/lib/email/templates'

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json()

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Fetch booking with event details
    const { data: booking, error: bookingError } = await supabase
      .from('event_bookings')
      .select(`
        *,
        events:events(*)
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    if (!booking.email) {
      return NextResponse.json(
        { error: 'Booking email is required to send confirmation' },
        { status: 400 }
      )
    }

    const html = eventBookingConfirmationTemplate(booking)
    const result = await sendEmail(
      booking.email,
      `Event Booking Confirmation - ${booking.events?.title || 'Pak Perfection Event'}`,
      html
    )

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        messageId: 'messageId' in result ? result.messageId : undefined 
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Event Booking Email API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

