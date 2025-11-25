import { createClient } from '@/lib/supabase/server'
import Navigation from '@/components/navigation-new'
import Footer from '@/components/footer'
import Link from 'next/link'
import { Home, Search, Menu } from 'lucide-react'
import NotFoundBackButton from './not-found-back-button'

export default async function NotFound() {
  const supabase = await createClient()
  
  const { data: branding } = await supabase
    .from('branding')
    .select('*')
    .single()
  
  const { data: navSettings } = await supabase
    .from('navigation_settings')
    .select('*')
    .single()
  
  const { data: footer } = await supabase
    .from('footer_settings')
    .select('*')
    .single()
  
  const { data: theme } = await supabase
    .from('theme_settings')
    .select('*')
    .single()

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation branding={branding} navSettings={navSettings} theme={theme} />
      
      <div className="flex-1 flex items-center justify-center px-4 py-16 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center max-w-2xl mx-auto">
          {/* 404 Number */}
          <div className="mb-8">
            <h1 className="text-9xl md:text-[12rem] font-bold bg-gradient-to-r from-red-600 via-yellow-500 to-green-600 bg-clip-text text-transparent animate-pulse">
              404
            </h1>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Page Not Found
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
              Oops! The page you're looking for doesn't exist.
            </p>
            <p className="text-lg text-gray-500 dark:text-gray-500">
              It might have been moved, deleted, or you entered the wrong URL.
            </p>
          </div>

          {/* Illustration/Icon */}
          <div className="mb-12 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-yellow-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-red-100 to-yellow-100 dark:from-red-900/20 dark:to-yellow-900/20 rounded-full p-8">
                <Search className="w-24 h-24 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/"
              className="group flex items-center gap-2 bg-gradient-to-r from-red-600 to-yellow-500 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all shadow-lg"
            >
              <Home size={20} />
              Go Home
            </Link>
            <Link
              href="/blog"
              className="group flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-4 rounded-xl font-bold border-2 border-gray-300 dark:border-gray-700 hover:border-red-600 dark:hover:border-red-600 hover:shadow-xl hover:scale-105 transition-all"
            >
              <Menu size={20} />
              View Blog
            </Link>
            <NotFoundBackButton />
          </div>

          {/* Helpful Links */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">You might be looking for:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/" className="text-red-600 dark:text-red-400 hover:underline">
                Home
              </Link>
              <Link href="/menu" className="text-red-600 dark:text-red-400 hover:underline">
                Menu
              </Link>
              <Link href="/about" className="text-red-600 dark:text-red-400 hover:underline">
                About
              </Link>
              <Link href="/gallery" className="text-red-600 dark:text-red-400 hover:underline">
                Gallery
              </Link>
              <Link href="/contact" className="text-red-600 dark:text-red-400 hover:underline">
                Contact
              </Link>
              <Link href="/reservation" className="text-red-600 dark:text-red-400 hover:underline">
                Reservation
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer footer={footer} branding={branding} theme={theme} />
    </div>
  )
}

