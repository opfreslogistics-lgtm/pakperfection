'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from './theme-provider'
import { Menu, X, Moon, Sun, User, LogOut } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface NavigationProps {
  branding?: any
  navSettings?: any
  theme?: any
}

export default function Navigation({ branding, navSettings, theme }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const { theme: currentTheme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    checkUser()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        checkUser()
      } else {
        setUser(null)
        setUserRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

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

  const logoUrl = currentTheme === 'dark' && branding?.dark_logo_url 
    ? branding.dark_logo_url 
    : branding?.logo_url

  const navLinks = navSettings?.main_nav_links || [
    { label: 'Home', href: '/home' },
    { label: 'About', href: '/about' },
    { label: 'Menu', href: '/menu' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ]

  const topBarLinks = navSettings?.top_bar_links || []

  return (
    <>
      {/* Top Bar */}
      {navSettings?.top_bar_text && (
        <div 
          className="py-2 px-4 text-sm text-center"
          style={{
            backgroundColor: navSettings.top_bar_bg_color || '#000000',
            color: navSettings.top_bar_text_color || '#ffffff'
          }}
        >
          <div className="container mx-auto flex items-center justify-between">
            <p>{navSettings.top_bar_text}</p>
            <div className="flex gap-4">
              {topBarLinks.map((link: any, idx: number) => (
                <Link key={idx} href={link.href || '#'} className="hover:underline">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav 
        className={`sticky top-0 z-50 border-b transition-colors ${
          currentTheme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}
        style={{
          position: navSettings?.sticky_nav ? 'sticky' : 'relative'
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/home" className="flex items-center">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Logo"
                  width={120}
                  height={40}
                  className="h-10 w-auto"
                />
              ) : (
                <span className="text-2xl font-bold">Pak Perfection</span>
              )}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link: any, idx: number) => (
                <Link
                  key={idx}
                  href={link.href || '#'}
                  className="hover:opacity-70 transition-opacity"
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Auth Links */}
              {user ? (
                <div className="flex items-center gap-4">
                  {userRole === 'admin' && (
                    <Link
                      href="/admin"
                      className="hover:opacity-70 transition-opacity"
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    href="/account"
                    className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                  >
                    <User size={20} />
                    Account
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                  >
                    <LogOut size={20} />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link
                    href="/login"
                    className="hover:opacity-70 transition-opacity"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-primary text-secondary px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
              
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {mounted && (currentTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />)}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Toggle theme"
              >
                {mounted && (currentTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />)}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className="md:hidden border-t py-4"
            style={{
              backgroundColor: navSettings?.mobile_menu_bg_color || (currentTheme === 'dark' ? '#1f2937' : '#ffffff'),
              color: navSettings?.mobile_menu_text_color || (currentTheme === 'dark' ? '#ffffff' : '#000000')
            }}
          >
            <div className="container mx-auto px-4 flex flex-col gap-4">
              {navLinks.map((link: any, idx: number) => (
                <Link
                  key={idx}
                  href={link.href || '#'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 hover:opacity-70 transition-opacity"
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
                      className="py-2 hover:opacity-70 transition-opacity"
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 hover:opacity-70 transition-opacity"
                  >
                    Account
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleLogout()
                    }}
                    className="py-2 text-left hover:opacity-70 transition-opacity"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 hover:opacity-70 transition-opacity"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 hover:opacity-70 transition-opacity"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}

