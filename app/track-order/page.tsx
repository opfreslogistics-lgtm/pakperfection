'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Navigation from '@/components/navigation-new'
import Footer from '@/components/footer'
import { Search, Package, Clock, CheckCircle, XCircle, Truck, MapPin, Phone, Mail } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('')
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [branding, setBranding] = useState<any>(null)
  const [navSettings, setNavSettings] = useState<any>(null)
  const [footer, setFooter] = useState<any>(null)
  const [theme, setTheme] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const [brandingRes, navRes, footerRes, themeRes] = await Promise.all([
      supabase.from('branding').select('*').maybeSingle(),
      supabase.from('navigation_settings').select('*').maybeSingle(),
      supabase.from('footer_settings').select('*').maybeSingle(),
      supabase.from('theme_settings').select('*').maybeSingle(),
    ])

    if (brandingRes.data) setBranding(brandingRes.data)
    if (navRes.data) setNavSettings(navRes.data)
    if (footerRes.data) setFooter(footerRes.data)
    if (themeRes.data) setTheme(themeRes.data)
  }

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setOrder(null)

    try {
      // Clean up the order ID (remove # if present)
      const cleanOrderId = orderId.trim().replace(/^#/, '')

      if (!cleanOrderId) {
        setError('Please enter an Order ID.')
        setLoading(false)
        return
      }

      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser()
      
      // Try searching by order_number first (e.g., PAK-MI4OYZHD-1SS7CO)
      let { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('order_number', cleanOrderId)
        .maybeSingle()

      // If not found by order_number, try by UUID id
      if (!data && !fetchError) {
        // Check if it looks like a UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        if (uuidRegex.test(cleanOrderId)) {
          const result = await supabase
            .from('orders')
            .select(`
              *,
              items:order_items(*)
            `)
            .eq('id', cleanOrderId)
            .maybeSingle()
          
          data = result.data
          fetchError = result.error
        }
      }

      if (fetchError) {
        console.error('Track order error:', fetchError)
        setError('Error searching for order. Please try again.')
        setLoading(false)
        return
      }

      if (!data) {
        setError('Order not found. Please check your Order ID and try again.')
        setLoading(false)
        return
      }

      // If user is logged in, verify the order belongs to them (optional security check)
      if (user && data.user_id && data.user_id !== user.id) {
        // Order exists but doesn't belong to this user
        // Still show it (public tracking), but log for security
        console.log('Order tracked by different user:', { orderId: cleanOrderId, userId: user.id, orderUserId: data.user_id })
      }

      setOrder(data)
    } catch (err) {
      console.error('Track order error:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase().replace(/_/g, '') || 'pending'
    
    if (normalizedStatus.includes('pending') || normalizedStatus.includes('received')) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800'
    }
    if (normalizedStatus.includes('confirmed') || normalizedStatus.includes('payment')) {
      return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
    }
    if (normalizedStatus.includes('preparing') || normalizedStatus.includes('process')) {
      return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800'
    }
    if (normalizedStatus.includes('ready') || normalizedStatus.includes('pickup')) {
      return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
    }
    if (normalizedStatus.includes('delivery') || normalizedStatus.includes('transit')) {
      return 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800'
    }
    if (normalizedStatus.includes('delivered') || normalizedStatus.includes('completed')) {
      return 'bg-green-600 text-white border-green-700'
    }
    if (normalizedStatus.includes('cancelled') || normalizedStatus.includes('rejected')) {
      return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
    }
    return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
  }

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status?.toLowerCase().replace(/_/g, '') || 'pending'
    
    if (normalizedStatus.includes('pending') || normalizedStatus.includes('received')) {
      return <Clock className="w-6 h-6" />
    }
    if (normalizedStatus.includes('confirmed') || normalizedStatus.includes('preparing') || normalizedStatus.includes('process')) {
      return <Package className="w-6 h-6" />
    }
    if (normalizedStatus.includes('ready') || normalizedStatus.includes('completed') || normalizedStatus.includes('delivered')) {
      return <CheckCircle className="w-6 h-6" />
    }
    if (normalizedStatus.includes('delivery') || normalizedStatus.includes('transit')) {
      return <Truck className="w-6 h-6" />
    }
    if (normalizedStatus.includes('cancelled') || normalizedStatus.includes('rejected')) {
      return <XCircle className="w-6 h-6" />
    }
    return <Package className="w-6 h-6" />
  }

  const formatStatus = (status: string) => {
    return status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Pending'
  }

  return (
    <div className="min-h-screen">
      <Navigation branding={branding} navSettings={navSettings} theme={theme} />

      {/* Hero Section */}
      <section className="relative h-[250px] bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
        
        <div className="text-center z-10 px-4 max-w-4xl mx-auto">
          <div className="animate-fadeInUp">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent">
              Track Your Order
            </h1>
            <p className="text-base md:text-lg opacity-90">
              Enter your order ID to check the status
            </p>
          </div>
        </div>

        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
      </section>

      {/* Track Order Form */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12">
            <form onSubmit={handleTrackOrder} className="space-y-6">
              <div>
                <label htmlFor="orderId" className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Package size={18} className="text-red-600" />
                  Order ID
                </label>
                <div className="relative">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  id="orderId"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="PAK-MI4OYZHD-1SS7CO"
                  required
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white transition-all"
                />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Enter the order ID from your confirmation email
                </p>
              </div>

              {error && (
                <div className="bg-red-600 border-2 border-red-700 rounded-xl p-4 flex items-center gap-3">
                  <XCircle className="text-white flex-shrink-0" size={24} />
                  <p className="text-white font-semibold">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Tracking...
                  </>
                ) : (
                  <>
                    <Search size={24} />
                    Track Order
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Order Details */}
      {order && (
        <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto max-w-4xl">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
              {/* Order Header */}
              <div className="bg-gradient-to-r from-red-600 to-yellow-500 text-white p-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Order #{order.order_number || order.id.slice(0, 8).toUpperCase()}</h2>
                    <p className="opacity-90">Placed on {new Date(order.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>
                  <div className={`px-6 py-3 rounded-full border-2 font-bold flex items-center gap-2 ${getStatusColor(order.current_status || order.status)}`}>
                    {getStatusIcon(order.current_status || order.status)}
                    {formatStatus(order.current_status || order.status)}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-8">
                {/* Order ID Display */}
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Your Order ID</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 font-mono">
                        {order.order_number}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Use this ID to track your order anytime
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Order Type</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                        {order.order_type || 'Delivery'}
                      </p>
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                  <Package size={28} className="text-red-600" />
                  Order Items
                </h3>
                <div className="space-y-4">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-700 transition-all">
                      <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-yellow-500 rounded-lg flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 shadow-lg">
                        {item.item_name?.charAt(0) || 'P'}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white">{item.item_name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <span className="font-semibold">Quantity:</span> {item.quantity}
                        </p>
                        {item.modifiers && Object.keys(item.modifiers).length > 0 && (
                          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-semibold">Customizations:</span>
                            <div className="mt-1 space-y-1">
                              {Object.entries(item.modifiers).map(([key, value]: [string, any]) => (
                                <div key={key} className="flex items-start gap-2">
                                  <span className="text-red-600">•</span>
                                  <span>{key}: {typeof value === 'object' ? JSON.stringify(value) : value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-red-600">{formatPrice(parseFloat(item.price))}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatPrice(parseFloat(item.price) / item.quantity)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Status Timeline */}
                <div className="mt-8 pt-8 border-t-2 border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                    <Truck size={24} className="text-red-600" />
                    Order Status
                  </h3>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6">
                    <div className="flex items-center justify-center">
                      <div className={`px-8 py-4 rounded-2xl border-4 font-bold text-xl flex items-center gap-3 ${getStatusColor(order.current_status || order.status)}`}>
                        {getStatusIcon(order.current_status || order.status)}
                        <span className="text-2xl">{formatStatus(order.current_status || order.status)}</span>
                      </div>
                    </div>
                    <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                      Last updated: {new Date(order.updated_at || order.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="mt-8 pt-8 border-t-2 border-gray-200 dark:border-gray-700">
                  <div className="space-y-3">
                    <div className="flex justify-between text-lg">
                      <span className="text-gray-700 dark:text-gray-300">Subtotal:</span>
                      <span className="font-semibold">{formatPrice(parseFloat(order.subtotal))}</span>
                    </div>
                    {order.delivery_fee > 0 && (
                      <div className="flex justify-between text-lg">
                        <span className="text-gray-700 dark:text-gray-300">Delivery Fee:</span>
                        <span className="font-semibold">{formatPrice(parseFloat(order.delivery_fee))}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg">
                      <span className="text-gray-700 dark:text-gray-300">Tax:</span>
                      <span className="font-semibold">{formatPrice(parseFloat(order.tax))}</span>
                    </div>
                    <div className="flex justify-between text-2xl font-bold pt-3 border-t-2 border-gray-200 dark:border-gray-700">
                      <span>Total:</span>
                      <span className="text-red-600">{formatPrice(parseFloat(order.total))}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Info */}
                {order.delivery_address && (
                  <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                      <MapPin className="text-blue-600" size={24} />
                      Delivery Address
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{order.delivery_address}</p>
                  </div>
                )}

                {/* Contact Info */}
                <div className="mt-8 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border-2 border-yellow-200 dark:border-yellow-800">
                  <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Need Help?</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="text-yellow-600" size={20} />
                      <a href="tel:+14195168739" className="text-gray-700 dark:text-gray-300 hover:text-yellow-600">
                        +1 (419) 516-8739
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="text-yellow-600" size={20} />
                      <a href="mailto:info@pakperfectioninter.com" className="text-gray-700 dark:text-gray-300 hover:text-yellow-600">
                        info@pakperfectioninter.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer footer={footer} branding={branding} theme={theme} />
    </div>
  )
}

