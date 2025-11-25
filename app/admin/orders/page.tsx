'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Download,
  Search,
  Filter,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Clock,
  BarChart3,
  RefreshCw
} from 'lucide-react'
import Image from 'next/image'

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [customerInfo, setCustomerInfo] = useState<any>(null)
  const [paymentProof, setPaymentProof] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const supabase = createClient()

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setOrders(data)
    }
    setLoading(false)
  }

  const loadOrderDetails = async (order: any) => {
    setSelectedOrder(order)
    
    // Load customer info from profile
    if (order.user_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email, phone')
        .eq('id', order.user_id)
        .single()
      
      setCustomerInfo(profile)
    } else {
      setCustomerInfo(null)
    }
    
    // Load payment proof if payment method requires it
    if (order.payment_method === 'zelle' || order.payment_method === 'cashapp') {
      const { data: proof } = await supabase
        .from('payment_proofs')
        .select('*')
        .eq('order_id', order.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      setPaymentProof(proof || null)
    } else {
      setPaymentProof(null)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    // Get current order to get old status
    const currentOrder = orders.find(o => o.id === orderId)
    const oldStatus = currentOrder?.current_status || currentOrder?.status || 'pending'

    const { error } = await supabase
      .from('orders')
      .update({ current_status: status })
      .eq('id', orderId)

    if (!error) {
      // Send status update email
      if (currentOrder?.email) {
        try {
          const emailResponse = await fetch('/api/email/send-status-update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              orderId: orderId,
              oldStatus: oldStatus
            }),
          })

          const emailResult = await emailResponse.json()
          if (!emailResult.success) {
            console.error('Failed to send status update email:', emailResult.error)
          }
        } catch (emailError) {
          console.error('Error sending status update email:', emailError)
        }
      }

      loadOrders()
      setSelectedOrder(null)
    }
  }

  const approvePayment = async (orderId: string) => {
    const { error } = await supabase
      .from('orders')
      .update({
        payment_status: 'confirmed',
        current_status: 'payment_confirmed',
      })
      .eq('id', orderId)

    if (!error) {
      loadOrders()
    }
  }

  const rejectPayment = async (orderId: string) => {
    const { error } = await supabase
      .from('orders')
      .update({
        payment_status: 'rejected',
      })
      .eq('id', orderId)

    if (!error) {
      loadOrders()
    }
  }

  // Calculate stats
  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total || order.total_amount || '0'), 0)
  const pendingOrders = orders.filter(o => (o.current_status || o.status || '').includes('pending')).length
  const confirmedOrders = orders.filter(o => (o.current_status || o.status || '').includes('confirmed') || (o.current_status || o.status || '').includes('preparing')).length
  const completedOrders = orders.filter(o => (o.current_status || o.status || '').includes('delivered') || (o.current_status || o.status || '').includes('completed')).length

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.order_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.id || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
      (order.current_status || order.status || '').toLowerCase().includes(statusFilter.toLowerCase())
    
    const matchesPayment = paymentFilter === 'all' || 
      (order.payment_status || '').toLowerCase() === paymentFilter.toLowerCase()

    return matchesSearch && matchesStatus && matchesPayment
  })

  const getStatusColor = (status: string) => {
    const normalized = (status || '').toLowerCase().replace(/_/g, '')
    if (normalized.includes('pending')) return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800'
    if (normalized.includes('confirmed') || normalized.includes('payment')) return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
    if (normalized.includes('preparing') || normalized.includes('process')) return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800'
    if (normalized.includes('ready') || normalized.includes('pickup')) return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
    if (normalized.includes('delivery') || normalized.includes('transit')) return 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800'
    if (normalized.includes('delivered') || normalized.includes('completed')) return 'bg-green-600 text-white border-green-700'
    if (normalized.includes('cancelled') || normalized.includes('rejected')) return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
    return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Loading orders...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Orders Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and track all customer orders</p>
        </div>
        <button
          onClick={loadOrders}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
        >
          <RefreshCw size={20} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl shadow-lg p-6 border-2 border-blue-200 dark:border-blue-800 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <ShoppingCart className="text-white" size={28} />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{orders.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl shadow-lg p-6 border-2 border-green-200 dark:border-green-800 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
              <DollarSign className="text-white" size={28} />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-2xl shadow-lg p-6 border-2 border-yellow-200 dark:border-yellow-800 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg">
              <Clock className="text-white" size={28} />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Pending</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{pendingOrders}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl shadow-lg p-6 border-2 border-purple-200 dark:border-purple-800 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <CheckCircle className="text-white" size={28} />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Completed</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{completedOrders}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <Filter className="text-red-600 dark:text-red-400" size={20} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Search & Filter</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Order ID..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 dark:bg-gray-700 transition-all"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 dark:bg-gray-700 transition-all font-medium"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 dark:bg-gray-700 transition-all font-medium"
            >
              <option value="all">All Payment Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <BarChart3 className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">All Orders</h3>
            <span className="ml-auto px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300">
              {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-b-2 border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Order #</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Payment Method</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <ShoppingCart size={48} className="mx-auto mb-2 opacity-50" />
                    <p>No orders found</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                        {order.order_number || order.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {order.user_id ? 'User' : 'Guest'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-green-600 dark:text-green-400">
                        ${parseFloat(order.total || order.total_amount || '0').toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {order.payment_method || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getStatusColor(order.current_status || order.status || 'pending')}`}>
                        {(order.current_status || order.status || 'pending').replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => loadOrderDetails(order)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeInUp">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border-2 border-gray-200 dark:border-gray-700">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-red-600 to-yellow-500 text-white p-6 rounded-t-2xl z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-1">Order Details</h2>
                  <p className="text-white/90">Order #{selectedOrder.order_number || selectedOrder.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedOrder(null)
                    setCustomerInfo(null)
                    setPaymentProof(null)
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <XCircle size={28} className="text-white" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Order Information */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-3">
                <h3 className="text-lg font-bold mb-3">Order Information</h3>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Order Number:</span>
                  <p className="font-semibold text-lg">#{selectedOrder.order_number}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Amount:</span>
                  <p className="font-bold text-xl text-red-600">{formatPrice(parseFloat(selectedOrder.total_amount))}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                  <p className="font-semibold capitalize">{selectedOrder.current_status.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Payment Method:</span>
                  <p className="font-semibold capitalize">{selectedOrder.payment_method}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Payment Status:</span>
                  <p className="font-semibold capitalize">{selectedOrder.payment_status || 'pending'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Delivery Type:</span>
                  <p className="font-semibold capitalize">{selectedOrder.delivery_type?.replace('_', ' ') || selectedOrder.ordering_method?.replace('_', ' ')}</p>
                </div>
                {selectedOrder.created_at && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Order Date:</span>
                    <p className="font-semibold">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                  </div>
                )}
              </div>

              {/* Customer Information */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-3">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <User size={20} />
                  Customer Information
                </h3>
                {customerInfo ? (
                  <>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <User size={14} />
                        Full Name:
                      </span>
                      <p className="font-semibold">{customerInfo.full_name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Mail size={14} />
                        Email:
                      </span>
                      <p className="font-semibold break-all">{customerInfo.email || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Phone size={14} />
                        Phone:
                      </span>
                      <p className="font-semibold">{customerInfo.phone || 'N/A'}</p>
                    </div>
                  </>
                ) : (
                  <div>
                    <p className="text-sm text-gray-500">Guest Order</p>
                    {selectedOrder.items?.[0] && (
                      <p className="text-xs text-gray-400 mt-2">
                        Contact info may be in order notes
                      </p>
                    )}
                  </div>
                )}
                
                {/* Delivery Address */}
                {selectedOrder.delivery_type === 'delivery' && selectedOrder.delivery_address && (
                  <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <MapPin size={14} />
                      Delivery Address:
                    </span>
                    <p className="font-semibold mt-1">{selectedOrder.delivery_address}</p>
                    {selectedOrder.delivery_instructions && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {selectedOrder.delivery_instructions}
                      </p>
                    )}
                  </div>
                )}
                
                {/* Pickup/Dine-in Info */}
                {selectedOrder.delivery_type === 'pickup' && selectedOrder.pickup_time && (
                  <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Pickup Time:</span>
                    <p className="font-semibold">{new Date(selectedOrder.pickup_time).toLocaleString()}</p>
                  </div>
                )}
                
                {selectedOrder.delivery_type === 'dine_in' && selectedOrder.table_number && (
                  <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Table Number:</span>
                    <p className="font-semibold">{selectedOrder.table_number}</p>
                  </div>
                )}
                
                {/* Special Instructions */}
                {selectedOrder.special_instructions && (
                  <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <FileText size={14} />
                      Special Instructions:
                    </span>
                    <p className="font-semibold mt-1 italic bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                      {selectedOrder.special_instructions}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Proof Section */}
            {(selectedOrder.payment_method === 'zelle' || selectedOrder.payment_method === 'cashapp') && (
              <div className="mb-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <FileText size={20} />
                  Payment Proof
                </h3>
                {paymentProof ? (
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Submitted:</p>
                          <p className="font-semibold">{new Date(paymentProof.created_at).toLocaleString()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          paymentProof.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          paymentProof.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {paymentProof.status || 'Pending Review'}
                        </span>
                      </div>
                      
                      {paymentProof.proof_url && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Proof Image/File:</p>
                          <div className="relative w-full max-w-md h-64 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-700">
                            <Image
                              src={paymentProof.proof_url}
                              alt="Payment Proof"
                              fill
                              className="object-contain"
                            />
                          </div>
                          <a
                            href={paymentProof.proof_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <Download size={16} />
                            Download Full Size
                          </a>
                        </div>
                      )}
                      
                      {paymentProof.comments && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Customer Comments:</p>
                          <p className="text-sm bg-gray-50 dark:bg-gray-900 p-2 rounded italic">
                            {paymentProof.comments}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {selectedOrder.payment_status === 'pending' && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => approvePayment(selectedOrder.id)}
                          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <CheckCircle size={20} />
                          Approve Payment
                        </button>
                        <button
                          onClick={() => rejectPayment(selectedOrder.id)}
                          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <XCircle size={20} />
                          Reject Payment
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      ⚠️ Payment proof not yet submitted. Waiting for customer to upload proof.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Order Items with Full Details */}
            <div className="border-t pt-4">
              <h3 className="text-xl font-bold mb-4">Order Items</h3>
              <div className="space-y-4">
                {selectedOrder.items?.map((item: any, idx: number) => {
                  const itemTotal = item.totalPrice || (parseFloat(item.price) || 0) * (item.quantity || 1)
                  return (
                    <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                      <div className="flex items-start gap-4 mb-3">
                        {item.image_url && (
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-lg">{item.name}</h4>
                            <span className="font-bold text-red-600">{formatPrice(itemTotal)}</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Quantity: {item.quantity || 1}</p>
                          {item.short_description && (
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{item.short_description}</p>
                          )}
                        </div>
                      </div>

                      {/* Modifiers/Customizations */}
                      {item.selectedModifiers && Object.keys(item.selectedModifiers).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">Customizations:</p>
                          <div className="space-y-2">
                            {Object.entries(item.selectedModifiers).map(([groupId, options]: [string, any]) => {
                              const modifierGroup = item.modifiers?.find((m: any) => m.id === groupId)
                              if (!modifierGroup || !options) return null
                              return (
                                <div key={groupId} className="bg-blue-50 dark:bg-blue-900/20 rounded p-2">
                                  <p className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-1">{modifierGroup.group_name}:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {Object.entries(options).map(([optionId, qty]: [string, any]) => {
                                      if (qty === 0) return null
                                      const option = modifierGroup.options?.find((o: any) => o.id === optionId)
                                      if (!option) return null
                                      const modifierPrice = parseFloat(option.price_modifier || 0) * qty
                                      return (
                                        <span
                                          key={optionId}
                                          className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full"
                                        >
                                          {option.name} × {qty}
                                          {modifierPrice > 0 && (
                                            <span className="ml-1 font-semibold">(+{formatPrice(modifierPrice)})</span>
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

                      {/* Upsells/Add-ons */}
                      {item.selectedUpsells && item.selectedUpsells.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">Add-ons:</p>
                          <div className="space-y-2">
                            {item.selectedUpsells.map((upsell: any, uIdx: number) => {
                              const upsellQty = upsell.quantity || 1
                              const upsellPrice = parseFloat(upsell.price || 0) * upsellQty
                              return (
                                <div key={uIdx} className="bg-green-50 dark:bg-green-900/20 rounded p-2">
                                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                                    {upsell.name} × {upsellQty} (+{formatPrice(upsellPrice)})
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Special Requests */}
                      {item.specialRequests && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-400 mb-1">Special Request:</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 italic bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                            "{item.specialRequests}"
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Order Summary Breakdown */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-xl font-bold mb-4">Order Summary</h3>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal (Items)</span>
                  <span className="font-semibold">
                    {formatPrice(selectedOrder.items?.reduce((sum: number, item: any) => {
                      return sum + (item.totalPrice || (parseFloat(item.price) || 0) * (item.quantity || 1))
                    }, 0) || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span className="font-semibold">
                    {formatPrice((selectedOrder.items?.reduce((sum: number, item: any) => {
                      return sum + (item.totalPrice || (parseFloat(item.price) || 0) * (item.quantity || 1))
                    }, 0) || 0) * 0.08)}
                  </span>
                </div>
                {selectedOrder.delivery_type === 'delivery' && (
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="font-semibold">$5.00</span>
                  </div>
                )}
                {selectedOrder.tip_amount && parseFloat(selectedOrder.tip_amount) > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Tip</span>
                    <span className="font-semibold">{formatPrice(parseFloat(selectedOrder.tip_amount))}</span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2 flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-red-600">{formatPrice(parseFloat(selectedOrder.total_amount))}</span>
                </div>
              </div>
            </div>

            {/* Order Status Update */}
            <div className="mb-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <h3 className="text-lg font-bold mb-3">Update Order Status</h3>
              <select
                onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                value={selectedOrder.current_status}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="pending_payment">Pending Payment</option>
                <option value="payment_confirmed">Payment Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="ready_pickup">Ready for Pickup</option>
                <option value="ready_delivery">Ready for Delivery</option>
                <option value="out_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setSelectedOrder(null)
                  setCustomerInfo(null)
                  setPaymentProof(null)
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 py-3 rounded-xl font-semibold transition-colors"
              >
                Close
              </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
