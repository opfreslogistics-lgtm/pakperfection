'use client'

import { useState } from 'react'
import AdminSidebar from '@/components/admin/sidebar'
import AdminAuthGuard from '@/components/admin/auth-guard'
import { Menu } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex">
          <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          
          <div className="flex-1 flex flex-col min-h-screen">
            {/* Mobile Header */}
            <header className="lg:hidden sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Open menu"
                >
                  <Menu size={24} />
                </button>
                <h1 className="text-lg font-bold">Admin Panel</h1>
                <div className="w-10" /> {/* Spacer for centering */}
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  )
}

