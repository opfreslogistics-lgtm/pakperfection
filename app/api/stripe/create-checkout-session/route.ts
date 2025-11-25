import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderData, successUrl, cancelUrl } = body

    if (!orderData || !orderData.items || orderData.items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid order data' },
        { status: 400 }
      )
    }

    // Create line items for Stripe
    const lineItems = orderData.items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.description || undefined,
          images: item.image_url ? [item.image_url] : undefined,
        },
        unit_amount: Math.round(parseFloat(item.price) * 100), // Convert to cents
      },
      quantity: item.quantity,
    }))

    // Add delivery fee if applicable
    if (orderData.delivery_fee && parseFloat(orderData.delivery_fee) > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Delivery Fee',
            description: 'Delivery charge',
          },
          unit_amount: Math.round(parseFloat(orderData.delivery_fee) * 100),
        },
        quantity: 1,
      })
    }

    // Add tax if applicable
    if (orderData.tax && parseFloat(orderData.tax) > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Tax',
            description: 'Sales tax',
          },
          unit_amount: Math.round(parseFloat(orderData.tax) * 100),
        },
        quantity: 1,
      })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/cancel`,
      customer_email: orderData.email,
      metadata: {
        order_type: orderData.order_type,
        customer_name: orderData.customer_name,
        customer_email: orderData.email,
        customer_phone: orderData.phone,
        delivery_address: orderData.delivery_address || '',
        special_instructions: orderData.special_instructions || '',
        // Store order details as JSON string
        order_details: JSON.stringify({
          items: orderData.items,
          subtotal: orderData.subtotal,
          delivery_fee: orderData.delivery_fee,
          tax: orderData.tax,
          total: orderData.total,
        }),
      },
      shipping_address_collection: orderData.order_type === 'delivery' ? {
        allowed_countries: ['US'],
      } : undefined,
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error: any) {
    console.error('Stripe session creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
