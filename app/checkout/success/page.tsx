'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navigation from '@/components/navigation-new'
import Footer from '@/components/footer'
import { CheckCircle, Loader2, Package, Mail, Phone } from 'lucide-react'
import Link from 'next/link'

export default function StripeSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID found')
      setLoading(false)
      return
    }

    // Wait for webhook to process and create order
    const checkOrder = async () => {
      // Give webhook time to process
      await new Promise(resolve => setTimeout(resolve, 2000))

      try {
        // Look for order with this Stripe session ID
        const { data, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('stripe_session_id', sessionId)
          .single()

        if (orderError) {
          // If order not found yet, wait and try again
          if (orderError.code === 'PGRST116') {
            setTimeout(checkOrder, 2000)
            return
          }
          throw orderError
        }

        setOrder(data)
        setLoading(false)
      } catch (err: any) {
        console.error('Error loading order:', err)
        setError(err.message || 'Failed to load order details')
        setLoading(false)
      }
    }

    checkOrder()
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navigation branding={null} navSettings={null} theme={null} />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-primary" />
            <h1 className="text-2xl font-bold mb-2">Processing your payment...</h1>
            <p className="text-gray-600 dark:text-gray-400">Please wait while we confirm your order</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navigation branding={null} navSettings={null} theme={null} />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your payment was processed successfully. We're preparing your order now.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                You should receive a confirmation email shortly.
              </p>
              <Link
                href="/menu"
                className="inline-block bg-gradient-to-r from-red-600 to-yellow-500 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Return to Menu
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation branding={null} navSettings={null} theme={null} />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-green-50">Thank you for your order</p>
          </div>

          {/* Order Details */}
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Order Details</h2>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Order Number:</span>
                  <span className="font-bold">{order.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Order Type:</span>
                  <span className="font-semibold capitalize">{order.order_type || order.delivery_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total:</span>
                  <span className="font-bold text-green-600">${parseFloat(order.total || order.total_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Payment Status:</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    Confirmed
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold mb-3">What's Next?</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Check your email</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      We've sent a confirmation to {order.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Order preparation</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Our kitchen will start preparing your order shortly
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Stay updated</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      We'll notify you via email about your order status
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Link
                href={`/track-order?order=${order.order_number}`}
                className="flex-1 text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Track Order
              </Link>
              <Link
                href="/menu"
                className="flex-1 text-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
