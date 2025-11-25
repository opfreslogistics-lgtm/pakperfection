'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Settings, 
  Menu as MenuIcon, 
  ShoppingCart, 
  Users, 
  Image as ImageIcon,
  FileText,
  CreditCard,
  Bell,
  Globe,
  BookOpen,
  MessageSquare,
  Mail,
  Calendar,
  Sparkles
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/menu', label: 'Menu', icon: MenuIcon },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/reservations', label: 'Reservations', icon: Calendar },
    { href: '/admin/events', label: 'Events', icon: Sparkles },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/blog', label: 'Blog', icon: BookOpen },
    { href: '/admin/testimonials', label: 'Testimonials', icon: MessageSquare },
    { href: '/admin/media', label: 'Media Library', icon: ImageIcon },
    { href: '/admin/pages', label: 'Pages', icon: FileText },
    { href: '/admin/payment-settings', label: 'Payment Settings', icon: CreditCard },
    { href: '/admin/email-settings', label: 'Email Settings', icon: Mail },
    { href: '/admin/popups', label: 'Pop-ups', icon: Bell },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Logged out successfully')
    router.push('/home')
    router.refresh()
  }

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
      <div className="p-6">
        <Link href="/admin" className="flex items-center gap-2 mb-8">
          <Globe size={24} />
          <span className="text-xl font-bold">Admin Panel</span>
        </Link>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-secondary'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/home"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mb-2"
          >
            <Globe size={20} />
            <span>View Site</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
          >
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

