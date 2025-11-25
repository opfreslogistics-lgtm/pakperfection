import AdminSidebar from '@/components/admin/sidebar'
import AdminAuthGuard from '@/components/admin/auth-guard'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  )
}

