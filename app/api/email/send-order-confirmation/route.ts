import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendOrderConfirmationEmail } from '@/lib/email/send-order-emails'

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
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

    // Fetch order items separately
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)

    // Attach items to order object
    const orderWithItems = {
      ...order,
      items: orderItems || []
    }

    // Check if email is required
    if (!orderWithItems.email) {
      return NextResponse.json(
        { error: 'Order email is required to send confirmation' },
        { status: 400 }
      )
    }

    // Send confirmation email
    const result = await sendOrderConfirmationEmail(orderWithItems)

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
    // Error logged silently in production
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

