import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendOrderStatusUpdateEmail } from '@/lib/email/send-order-emails'

export async function POST(request: NextRequest) {
  try {
    const { orderId, oldStatus } = await request.json()

    if (!orderId || !oldStatus) {
      return NextResponse.json(
        { error: 'Order ID and old status are required' },
        { status: 400 }
      )
    }

    // Fetch order details from database
    const supabase = await createClient()
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (error || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Send status update email
    const result = await sendOrderStatusUpdateEmail(order, oldStatus)

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
    console.error('Email API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}


