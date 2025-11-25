'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navigation from '@/components/navigation-new'
import Footer from '@/components/footer'
import { User, Package, Clock, MapPin, LogOut } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function AccountPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) {
      router.push('/login')
      return
    }

    setUser(currentUser)

    // Fetch profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .maybeSingle()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError)
    } else {
      setProfile(profileData)
    }

    // Fetch orders
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })

    setOrders(ordersData || [])
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Logged out successfully')
    router.push('/home')
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
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navigation branding={null} navSettings={null} theme={null} />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-yellow-500 rounded-2xl p-8 mb-8 text-white shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">My Account</h1>
                <p className="text-lg opacity-90">
                  Welcome back, <span className="font-semibold">{profile?.name || user?.email}</span>
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white text-red-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold shadow-lg"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col items-center text-center mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-yellow-500 text-white flex items-center justify-center text-3xl font-bold mb-4 shadow-lg">
                    {profile?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                  </div>
                  <h2 className="text-2xl font-bold mb-1">{profile?.name || 'User'}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="bg-green-500 text-white p-3 rounded-lg">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Role</p>
                      <p className="font-bold text-green-600 dark:text-green-400 capitalize">{profile?.role || 'user'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="bg-yellow-500 text-white p-3 rounded-lg">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Orders</p>
                      <p className="font-bold text-yellow-600 dark:text-yellow-400 text-xl">{orders.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Orders */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Order History</h2>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                  </div>
                </div>
                
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">No orders yet</p>
                    <Link
                      href="/menu"
                      className="inline-block bg-primary text-secondary px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Browse Menu
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-xl hover:border-red-500 dark:hover:border-red-500 transition-all bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900"
                      >
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                          <div>
                            <p className="font-bold text-lg text-gray-900 dark:text-white">Order #{order.order_number}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                              <Clock size={14} />
                              {new Date(order.created_at).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-2xl text-green-600 dark:text-green-400 mb-2">
                              {formatPrice(parseFloat(order.total_amount))}
                            </p>
                            <span className={`px-4 py-2 rounded-full text-xs font-bold ${getStatusColor(order.current_status)}`}>
                              {order.current_status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mb-4">
                          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Package size={16} className="text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                              {order.items?.length || 0} items
                            </span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <MapPin size={16} className="text-yellow-600 dark:text-yellow-400" />
                            <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 capitalize">
                              {order.delivery_type?.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <Clock size={16} className="text-green-600 dark:text-green-400" />
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400 capitalize">
                              {order.payment_method}
                            </span>
                          </div>
                        </div>

                        {order.items && order.items.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-sm font-bold mb-3 text-gray-700 dark:text-gray-300 uppercase tracking-wide">Order Items:</p>
                            <ul className="space-y-2">
                              {order.items.slice(0, 3).map((item: any, idx: number) => (
                                <li key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                  <span className="text-sm font-medium">
                                    {item.name} <span className="text-gray-500">x{item.quantity}</span>
                                  </span>
                                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                    {formatPrice(parseFloat(item.price) * item.quantity)}
                                  </span>
                                </li>
                              ))}
                              {order.items.length > 3 && (
                                <li className="text-sm text-gray-500 italic text-center py-2">
                                  +{order.items.length - 3} more items
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer footer={null} branding={null} theme={null} />
    </div>
  )
}

