import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/service'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutSessionCompleted(session)
        break

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('PaymentIntent succeeded:', paymentIntent.id)
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent
        console.log('Payment failed:', failedPayment.id)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    const supabase = createClient()
    
    // Extract metadata
    const metadata = session.metadata || {}
    const orderDetails = metadata.order_details ? JSON.parse(metadata.order_details) : {}

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: metadata.customer_name || session.customer_details?.name || 'Guest',
        email: session.customer_email || metadata.customer_email,
        phone: metadata.customer_phone || session.customer_details?.phone || '',
        order_type: metadata.order_type || 'pickup',
        delivery_address: metadata.delivery_address || session.shipping_details?.address ? 
          `${session.shipping_details.address.line1}, ${session.shipping_details.address.city}, ${session.shipping_details.address.state} ${session.shipping_details.address.postal_code}` : 
          null,
        special_instructions: metadata.special_instructions || '',
        items: orderDetails.items || [],
        subtotal: orderDetails.subtotal || '0',
        delivery_fee: orderDetails.delivery_fee || '0',
        tax: orderDetails.tax || '0',
        total: (session.amount_total! / 100).toFixed(2), // Convert from cents
        payment_method: 'stripe',
        payment_status: 'confirmed',
        current_status: 'payment_confirmed',
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent as string,
      })
      .select()
      .single()

    if (orderError) {
      console.error('Failed to create order:', orderError)
      throw orderError
    }

    console.log('Order created successfully:', order.id)

    // Send confirmation email
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/email/send-order-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: order.id }),
      })
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't throw - order is created, email is optional
    }

    return order
  } catch (error) {
    console.error('Error handling checkout session:', error)
    throw error
  }
}
