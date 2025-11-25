import { createClient } from '@/lib/supabase/server'
import { 
  Package, 
  Users, 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  BarChart3,
  PieChart
} from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch comprehensive stats
  const [
    ordersResult,
    usersResult,
    menuItemsResult,
    reservationsResult,
    recentOrders,
    ordersByStatus,
    revenueResult
  ] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('menu_items').select('id', { count: 'exact', head: true }),
    supabase.from('reservations').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id, order_number, total, current_status, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('orders').select('current_status'),
    supabase.from('orders').select('total').eq('payment_status', 'confirmed')
  ])

  // Calculate revenue
  const totalRevenue = revenueResult.data?.reduce((sum, order) => sum + parseFloat(order.total || '0'), 0) || 0

  // Calculate orders by status
  const statusCounts = ordersByStatus.data?.reduce((acc: any, order: any) => {
    const status = order.current_status || 'pending'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {}) || {}

  const stats = [
    {
      title: 'Total Orders',
      value: ordersResult.count || 0,
      icon: ShoppingCart,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
      change: '+12%',
      changeType: 'up',
      link: '/admin/orders'
    },
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20',
      change: '+8.2%',
      changeType: 'up',
      link: '/admin/orders'
    },
    {
      title: 'Total Users',
      value: usersResult.count || 0,
      icon: Users,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
      change: '+5%',
      changeType: 'up',
      link: '/admin/users'
    },
    {
      title: 'Reservations',
      value: reservationsResult.count || 0,
      icon: Calendar,
      gradient: 'from-orange-500 to-red-600',
      bgGradient: 'from-orange-50 to-red-100 dark:from-orange-900/20 dark:to-red-800/20',
      change: '+3',
      changeType: 'up',
      link: '/admin/reservations'
    },
  ]

  const quickActions = [
    { label: 'New Menu Item', href: '/admin/menu', icon: Package, color: 'bg-blue-500 hover:bg-blue-600' },
    { label: 'View Orders', href: '/admin/orders', icon: ShoppingCart, color: 'bg-green-500 hover:bg-green-600' },
    { label: 'Manage Reservations', href: '/admin/reservations', icon: Calendar, color: 'bg-orange-500 hover:bg-orange-600' },
    { label: 'Site Settings', href: '/admin/settings', icon: Activity, color: 'bg-purple-500 hover:bg-purple-600' },
  ]

  const getStatusColor = (status: string) => {
    const normalized = status?.toLowerCase() || 'pending'
    if (normalized.includes('pending')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    if (normalized.includes('confirmed') || normalized.includes('preparing')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    if (normalized.includes('ready') || normalized.includes('delivered')) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    if (normalized.includes('cancelled')) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Dashboard Overview</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's what's happening with your business today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Last updated</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Link
              key={index}
              href={stat.link}
              className={`group relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:scale-105`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-lg`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  {stat.changeType === 'up' ? (
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <ArrowUpRight size={16} />
                      <span className="text-sm font-semibold">{stat.change}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                      <ArrowDownRight size={16} />
                      <span className="text-sm font-semibold">{stat.change}</span>
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
            </Link>
          )
        })}
      </div>

      {/* Charts and Data Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BarChart3 className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Order Status Distribution</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Current order breakdown</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {Object.entries(statusCounts).map(([status, count]: [string, any]) => {
              const total = ordersResult.count || 1
              const percentage = ((count / total) * 100).toFixed(1)
              return (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {status.replace('_', ' ')}
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getStatusColor(status)}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
            {Object.keys(statusCounts).length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <BarChart3 size={48} className="mx-auto mb-2 opacity-50" />
                <p>No order data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Activity className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Common tasks</p>
            </div>
          </div>
          <div className="space-y-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Link
                  key={index}
                  href={action.href}
                  className={`flex items-center gap-3 ${action.color} text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
                >
                  <Icon size={20} />
                  <span className="font-semibold">{action.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Clock className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Orders</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Latest 5 orders</p>
              </div>
            </div>
            <Link
              href="/admin/orders"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-md hover:shadow-lg"
            >
              View All
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentOrders.data && recentOrders.data.length > 0 ? (
                recentOrders.data.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                        {order.order_number || order.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-green-600 dark:text-green-400">
                        ${parseFloat(order.total || '0').toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.current_status || 'pending')}`}>
                        {(order.current_status || 'pending').replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <Package size={48} className="mx-auto mb-2 opacity-50" />
                    <p>No recent orders</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
