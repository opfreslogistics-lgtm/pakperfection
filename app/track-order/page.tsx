'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navigation from '@/components/navigation-new'
import Footer from '@/components/footer'
import { Lock, LogIn, Package, CheckCircle } from 'lucide-react'

export default function TrackOrderPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // User is logged in, redirect to account page to see orders
      router.replace('/account')
    }
  }

  const handleLogin = () => {
    router.push('/login?redirect=/account')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation branding={null} navSettings={null} theme={null} />

      {/* Hero Section */}
      <section className="relative h-[300px] bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
        
        <div className="text-center z-10 px-4 max-w-4xl mx-auto">
          <div className="animate-fadeInUp">
            <Lock className="w-20 h-20 mx-auto mb-6 text-white" />
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              Track Your Orders
            </h1>
            <p className="text-base md:text-lg opacity-90">
              Sign in to view your order history and track deliveries
            </p>
          </div>
        </div>
      </section>

      {/* Login Prompt */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12 text-center">
            <div className="bg-gradient-to-br from-red-100 to-yellow-100 dark:from-red-900/20 dark:to-yellow-900/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>

            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Login Required
            </h2>
            
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto">
              To view your orders and track deliveries, please sign in to your account.
            </p>

            <div className="space-y-4">
              <button
                onClick={handleLogin}
                className="w-full max-w-md mx-auto block bg-gradient-to-r from-red-600 to-yellow-500 text-white py-4 px-8 rounded-xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <span className="flex items-center justify-center gap-3">
                  <LogIn size={24} />
                  Sign In to View Orders
                </span>
              </button>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <button
                  onClick={() => router.push('/register')}
                  className="text-red-600 dark:text-red-400 font-semibold hover:underline"
                >
                  Create one here
                </button>
              </p>
            </div>

            <div className="mt-12 pt-8 border-t-2 border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                After Signing In
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">View All Orders</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">See your complete order history</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                    <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Track Status</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Real-time order tracking</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-lg">
                    <LogIn className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Quick Reorder</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Easily reorder your favorites</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer footer={null} branding={null} theme={null} />
    </div>
  )
}
