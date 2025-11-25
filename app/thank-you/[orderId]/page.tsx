'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, Package, Clock, MapPin, Phone, Mail, ArrowRight, FileCheck } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Navigation from '@/components/navigation-new'
import Footer from '@/components/footer'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function ThankYouPage() {
  const params = useParams()
  const [order, setOrder] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState<any>(null)
  const [paymentProof, setPaymentProof] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadOrder()
  }, [params.orderId])

  const loadOrder = async () => {
    const orderId = params.orderId as string
    const { data: orderData } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderData) {
      setOrder(orderData)
      
      // Send order confirmation email if not already sent
      if (orderData.email && !orderData.email_sent) {
        try {
          const emailResponse = await fetch('/api/email/send-order-confirmation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderId: orderData.id }),
          })

          const emailResult = await emailResponse.json()
          if (emailResult.success) {
            // Mark email as sent
            await supabase
              .from('orders')
              .update({ email_sent: true })
              .eq('id', orderId)
            toast.success('Order confirmation email sent! Check your inbox.')
          } else {
            console.error('Failed to send order confirmation email:', emailResult.error)
            toast.error('Order confirmed but email could not be sent. Please check your email settings in admin panel.')
          }
        } catch (emailError: any) {
          console.error('Error sending order confirmation email:', emailError)
          toast.error('Order confirmed but email could not be sent: ' + (emailError.message || 'Unknown error'))
        }
      }
      
      const { data: paymentData } = await supabase
        .from('payment_settings')
        .select('*')
        .eq('method', orderData.payment_method)
        .single()
      
      if (paymentData) {
        setPaymentMethod(paymentData)
      }
      
      // Check if payment proof was submitted
      const { data: proofData } = await supabase
        .from('payment_proofs')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (proofData) {
        setPaymentProof(proofData)
      }
    }
    setLoading(false)
  }

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      pending_payment: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      payment_confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      preparing: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      ready_pickup: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      ready_delivery: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      out_delivery: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    }
    return statusMap[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl">Order not found</p>
          <Link href="/home" className="text-primary hover:underline mt-4 inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const settings = paymentMethod?.settings || {}
  const items = Array.isArray(order?.items) ? order.items : []

  return (
    <div className="min-h-screen">
      <Navigation branding={null} navSettings={null} theme={null} />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full mb-6">
              <CheckCircle size={48} className="text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent">
              Thank You!
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Your order has been placed successfully
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Info Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <h2 className="text-2xl font-bold mb-6">Order Details</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="font-semibold">Order Number</span>
                    <span className="text-lg font-bold text-red-600">#{order.order_number}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="font-semibold">Order Status</span>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.current_status)}`}>
                      {order.current_status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="font-semibold">Order Type</span>
                    <span className="capitalize">{order.delivery_type?.replace('_', ' ') || order.ordering_method?.replace('_', ' ')}</span>
                  </div>
                  {order.table_number && (
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="font-semibold">Table Number</span>
                      <span>{order.table_number}</span>
                    </div>
                  )}
                  {order.pickup_time && (
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="font-semibold">Pickup Time</span>
                      <span>{new Date(order.pickup_time).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <h2 className="text-2xl font-bold mb-6">Order Items</h2>
                <div className="space-y-6">
                  {items.map((item: any, idx: number) => {
                    // Calculate item total (use totalPrice if available, otherwise calculate)
                    const itemTotal = item.totalPrice || (parseFloat(item.price) || 0) * (item.quantity || 1)
                    
                    return (
                      <div key={idx} className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-gray-50 dark:bg-gray-900/50">
                        <div className="flex items-start gap-4 mb-4">
                          {item.image_url && (
                            <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                              <Image
                                src={item.image_url}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-lg">{item.name}</h3>
                              <span className="text-xl font-bold text-red-600">{formatPrice(itemTotal)}</span>
                            </div>
                            {item.short_description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.short_description}</p>
                            )}
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Quantity: {item.quantity || 1}
                            </p>
                          </div>
                        </div>

                        {/* Selected Modifiers with Quantities */}
                        {item.selectedModifiers && Object.keys(item.selectedModifiers).length > 0 && (
                          <div className="mb-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Customizations:</p>
                            <div className="space-y-2">
                              {Object.entries(item.selectedModifiers).map(([groupId, options]: [string, any]) => {
                                const modifierGroup = item.modifiers?.find((m: any) => m.id === groupId)
                                if (!modifierGroup || !options) return null
                                
                                return (
                                  <div key={groupId} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                                    <p className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-1">{modifierGroup.group_name}:</p>
                                    <div className="flex flex-wrap gap-2">
                                      {Object.entries(options).map(([optionId, qty]: [string, any]) => {
                                        if (qty === 0) return null
                                        const option = modifierGroup.options?.find((o: any) => o.id === optionId)
                                        if (!option) return null
                                        
                                        return (
                                          <span
                                            key={optionId}
                                            className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full"
                                          >
                                            {option.name} × {qty}
                                            {parseFloat(option.price_modifier || 0) > 0 && (
                                              <span className="ml-1">(+{formatPrice(parseFloat(option.price_modifier) * qty)})</span>
                                            )}
                                          </span>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Selected Upsells with Quantities */}
                        {item.selectedUpsells && item.selectedUpsells.length > 0 && (
                          <div className="mb-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Add-ons:</p>
                            <div className="space-y-2">
                              {item.selectedUpsells.map((upsell: any, upsellIdx: number) => {
                                const upsellQty = upsell.quantity || 1
                                return (
                                  <div key={upsellIdx} className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                                    <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                                      {upsell.name} × {upsellQty} (+{formatPrice(parseFloat(upsell.price || 0) * upsellQty)})
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Special Requests */}
                        {item.specialRequests && (
                          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Special Request:</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 italic bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-lg">
                              "{item.specialRequests}"
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Payment Proof Status or Payment Instructions */}
              {(order.payment_method === 'zelle' || order.payment_method === 'cashapp') && paymentMethod && (
                <>
                  {paymentProof ? (
                    // Payment proof was submitted
                    <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl shadow-xl p-6 border-2 border-blue-200 dark:border-blue-800">
                      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <CheckCircle size={28} className="text-green-600 dark:text-green-400" />
                        Payment Proof Submitted
                      </h2>
                      <div className="space-y-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                          <p className="text-lg font-semibold mb-2">✅ Your payment proof has been submitted successfully!</p>
                          <div className="space-y-2 text-sm">
                            <p><strong>Order Number:</strong> <span className="font-mono text-lg">#{order.order_number}</span></p>
                            <p><strong>Payment Method:</strong> <span className="capitalize">{order.payment_method}</span></p>
                            <p><strong>Status:</strong> <span className="px-2 py-1 rounded bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 font-semibold">Pending Review</span></p>
                            <p className="text-gray-600 dark:text-gray-400 mt-3">
                              We have received your payment proof and are currently reviewing it. You will be notified once your payment is confirmed.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Payment proof not submitted - show instructions
                    <div className="bg-gradient-to-br from-yellow-50 to-red-50 dark:from-yellow-900/20 dark:to-red-900/20 rounded-2xl shadow-xl p-6 border-2 border-yellow-200 dark:border-yellow-800">
                      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <Package size={28} />
                        Payment Instructions
                      </h2>
                      <div className="space-y-4">
                        {settings.logo_url && (
                          <div className="flex justify-center">
                            <Image
                              src={settings.logo_url}
                              alt={paymentMethod.method}
                              width={120}
                              height={60}
                              className="object-contain"
                            />
                          </div>
                        )}
                        
                        {order.payment_method === 'zelle' && (
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-2">
                            {settings.phone && (
                              <div>
                                <p className="font-semibold mb-1">Send to Phone:</p>
                                <p className="text-lg font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">{settings.phone}</p>
                              </div>
                            )}
                            {settings.email && (
                              <div>
                                <p className="font-semibold mb-1">Send to Email (Alternative):</p>
                                <p className="text-lg font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">{settings.email}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {order.payment_method === 'cashapp' && (
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-4">
                            {settings.qr_code_url && (
                              <div className="flex justify-center">
                                <Image
                                  src={settings.qr_code_url}
                                  alt="CashApp QR Code"
                                  width={200}
                                  height={200}
                                  className="rounded-lg"
                                />
                              </div>
                            )}
                            {settings.cashtag && (
                              <div>
                                <p className="font-semibold mb-1">CashApp Cashtag:</p>
                                <p className="text-2xl font-bold font-mono bg-gray-100 dark:bg-gray-700 p-3 rounded text-center">
                                  {settings.cashtag}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {settings.instructions && (
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                            <p className="text-sm leading-relaxed">{settings.instructions}</p>
                          </div>
                        )}

                        <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-4 border border-red-300 dark:border-red-800">
                          <p className="font-bold text-red-800 dark:text-red-200">
                            ⚠️ Important: Include Order Number <span className="text-lg">#{order.order_number}</span> in your payment
                          </p>
                        </div>

                        <Link
                          href={`/payment-proof/${order.id}`}
                          className="block w-full bg-gradient-to-r from-red-600 to-yellow-500 text-white py-4 rounded-lg font-bold text-center hover:opacity-90 transition-opacity"
                        >
                          Upload Payment Proof
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Cash Payment */}
              {order.payment_method === 'cash' && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl shadow-xl p-6 border-2 border-green-200 dark:border-green-800">
                  <h2 className="text-2xl font-bold mb-4">Cash Payment</h2>
                  <p className="text-lg">
                    No action needed. Please have cash ready when you arrive for pickup or when the delivery driver arrives.
                  </p>
                </div>
              )}
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sticky top-24">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold">
                      {formatPrice(items.reduce((sum: number, item: any) => {
                        // Use totalPrice if available (includes modifiers and upsells)
                        if (item.totalPrice) return sum + item.totalPrice
                        // Fallback calculation
                        return sum + (parseFloat(item.price) || 0) * (item.quantity || 1)
                      }, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span className="font-semibold">
                      {formatPrice(items.reduce((sum: number, item: any) => {
                        const itemTotal = item.totalPrice || (parseFloat(item.price) || 0) * (item.quantity || 1)
                        return sum + itemTotal
                      }, 0) * 0.08)}
                    </span>
                  </div>
                  {order.delivery_type === 'delivery' && (
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span className="font-semibold">$5.00</span>
                    </div>
                  )}
                  {order.tip_amount && parseFloat(order.tip_amount) > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Tip</span>
                      <span className="font-semibold">{formatPrice(parseFloat(order.tip_amount))}</span>
                    </div>
                  )}
                  <div className="border-t pt-4 flex justify-between text-2xl font-bold">
                    <span>Total</span>
                    <span className="text-red-600">{formatPrice(parseFloat(order.total_amount))}</span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold mb-4">Need Help?</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-red-600" />
                      <a href="tel:+14195168739" className="hover:underline">+1 (419) 516-8739</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-yellow-500" />
                      <a href="mailto:info@pakperfectioninter.com" className="hover:underline">info@pakperfectioninter.com</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-green-600" />
                      <span>1502 OAKLAND PKWY, LIMA, OH 45805</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 space-y-3">
                  <Link
                    href="/account"
                    className="block w-full bg-gradient-to-r from-red-600 to-yellow-500 text-white py-3 rounded-lg font-semibold text-center hover:opacity-90 transition-opacity"
                  >
                    View My Orders
                  </Link>
                  <Link
                    href="/menu"
                    className="block w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-3 rounded-lg font-semibold text-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer footer={null} branding={null} theme={null} />
    </div>
  )
}
