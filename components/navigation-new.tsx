'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from './theme-provider'
import { Menu, X, Moon, Sun, User, LogOut, ShoppingCart, Phone, Mail, MapPin, Search } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface NavigationProps {
  branding?: any
  navSettings?: any
  theme?: any
}

export default function NavigationNew({ branding: propBranding, navSettings, theme }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [cartCount, setCartCount] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [localTheme, setLocalTheme] = useState<'light' | 'dark'>('light')
  const supabase = createClient()
  const router = useRouter()

  // Always call useTheme hook (required by React rules)
  const { theme: activeTheme, toggleTheme: toggleThemeFn } = useTheme()

  useEffect(() => {
    setMounted(true)
    
    // Set initial theme
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
      if (savedTheme) {
        setLocalTheme(savedTheme)
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setLocalTheme(prefersDark ? 'dark' : 'light')
      }
    }
    
    checkUser()
    updateCartCount()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        checkUser()
      } else {
        setUser(null)
        setUserRole(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    // Listen for cart changes
    const interval = setInterval(updateCartCount, 1000)
    return () => clearInterval(interval)
  }, [])

  const updateCartCount = () => {
    if (typeof window !== 'undefined') {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      setCartCount(cart.length)
    }
  }

  const checkUser = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (currentUser) {
      setUser(currentUser)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single()
      setUserRole(profile?.role || null)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserRole(null)
    toast.success('Logged out successfully')
    router.push('/home')
    router.refresh()
  }

  // Use the provided logo URL directly
  const logoUrl = 'https://opanykhlbusuwmnbswkb.supabase.co/storage/v1/object/public/branding/PAK-LOGO-2-scaled.png'

  // Default navigation links - always available
  const defaultNavLinks = [
    { label: 'Home', href: '/home' },
    { label: 'About', href: '/about' },
    { label: 'Menu', href: '/menu' },
    { label: 'Events', href: '/events' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Reservation', href: '/reservation' },
    { label: 'My Orders', href: '/track-order' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ]
  
  // Use settings if available, otherwise use defaults
  const navLinks = (navSettings?.main_nav_links && 
                   Array.isArray(navSettings.main_nav_links) && 
                   navSettings.main_nav_links.length > 0)
    ? navSettings.main_nav_links
    : defaultNavLinks

  return (
    <>
      {/* Top Bar - Black - Hidden on Mobile */}
      <div className="hidden md:block bg-black text-white py-2 text-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Phone size={14} />
                <a href="tel:+14195168739" className="hover:text-yellow-400 transition-colors">
                  +1 (419) 516-8739
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} />
                <a href="mailto:info@pakperfectioninter.com" className="hover:text-yellow-400 transition-colors">
                  info@pakperfectioninter.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} />
                <span className="hidden lg:inline">1502 OAKLAND PKWY, LIMA, OH</span>
                <span className="lg:hidden">LIMA, OH</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleThemeFn}
                className="hover:text-yellow-400 transition-colors"
                aria-label="Toggle theme"
              >
                {mounted && (activeTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />)}
              </button>
              {navSettings?.top_bar_links?.map((link: any, idx: number) => (
                <Link key={idx} href={link.href || '#'} className="hover:text-yellow-400 transition-colors text-xs">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Middle Bar - White */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-3 md:py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/home" className="flex items-center flex-shrink-0">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Pak Perfection Logo"
                  width={180}
                  height={60}
                  className="h-10 md:h-14 w-auto object-contain"
                  priority
                />
              ) : (
                <div>
                  <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-yellow-500 bg-clip-text text-transparent">
                    Pak Perfection
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400 hidden md:block">African & International Cuisine</p>
                </div>
              )}
            </Link>

            {/* Search Bar - Hidden on Mobile */}
            <div className="hidden lg:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800"
                />
              </div>
            </div>

            {/* Mobile Contact Info - Visible only on mobile */}
            <div className="md:hidden flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <a href="tel:+14195168739" className="flex items-center gap-1">
                <Phone size={14} />
              </a>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 md:gap-4">
              {user ? (
                <>
                  {userRole === 'admin' && (
                    <Link
                      href="/admin"
                      className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                    >
                      <User size={18} />
                      Admin
                    </Link>
                  )}
                  <Link
                    href="/account"
                    className="hidden md:flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                  >
                    <User size={20} />
                    Account
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="hidden md:flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-red-600 transition-colors"
                  >
                    <LogOut size={20} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hidden md:flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="hidden md:flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors font-semibold"
                  >
                    Sign Up
                  </Link>
                </>
              )}
              <Link
                href="/cart"
                className="relative flex items-center gap-2 px-2 md:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                <ShoppingCart size={18} className="md:w-5 md:h-5" />
                <span className="hidden md:inline">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-yellow-500 text-black text-xs font-bold rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center text-[10px] md:text-xs">
                    {cartCount}
                  </span>
                )}
              </Link>
              
              {/* Mobile Theme Toggle */}
              <button
                onClick={toggleThemeFn}
                className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Toggle theme"
              >
                {mounted && (activeTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />)}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar - Red */}
      <nav className="bg-red-600 text-white sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link: any, idx: number) => (
                <Link
                  key={idx}
                  href={link.href || '#'}
                  className="px-4 py-2 hover:bg-red-700 rounded-lg transition-colors font-medium text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 hover:bg-red-700 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Order Button */}
            <div className="hidden md:block">
              <Link
                href="/menu"
                className="px-6 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors font-bold"
              >
                Order Now
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-red-700 bg-red-600">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link: any, idx: number) => (
                <Link
                  key={idx}
                  href={link.href || '#'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 hover:bg-red-700 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  {userRole === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-2 hover:bg-red-700 rounded-lg transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    Account
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleLogout()
                    }}
                    className="px-4 py-2 hover:bg-red-700 rounded-lg transition-colors text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors font-semibold text-center"
                  >
                    Sign Up
                  </Link>
                </>
              )}
              <Link
                href="/menu"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors font-bold text-center mt-2"
              >
                Order Now
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}

