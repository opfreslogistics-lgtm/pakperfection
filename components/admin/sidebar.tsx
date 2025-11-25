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
  Sparkles,
  X,
  LogOut
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
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

  const handleLinkClick = () => {
    // Close sidebar on mobile when a link is clicked
    if (window.innerWidth < 1024) {
      onClose()
    }
  }

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white dark:bg-gray-800 
          border-r border-gray-200 dark:border-gray-700 
          min-h-screen overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-6">
          {/* Header with close button on mobile */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/admin" className="flex items-center gap-2" onClick={handleLinkClick}>
              <Globe size={24} className="text-primary" />
              <span className="text-xl font-bold">Admin Panel</span>
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close sidebar"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-red-600 to-yellow-500 text-white shadow-lg'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/home"
              onClick={handleLinkClick}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mb-2 text-gray-700 dark:text-gray-300"
            >
              <Globe size={20} />
              <span className="font-medium">View Site</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors font-medium"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

