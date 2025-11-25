'use client'

import { useState, useEffect, memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Instagram, Twitter, Youtube, Linkedin, Phone, Mail, MapPin, Clock, UtensilsCrossed, Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface FooterProps {
  footer?: any
  branding?: any
  theme?: any
}

function Footer({ footer: propFooter, branding: propBranding, theme }: FooterProps) {
  const [footer, setFooter] = useState<any>(propFooter || null)
  const supabase = createClient()

  // Use the provided logo URL directly
  const footerLogoUrl = 'https://opanykhlbusuwmnbswkb.supabase.co/storage/v1/object/public/branding/PAK-LOGO-2-scaled.png'

  useEffect(() => {
    // Only load footer if not provided as prop
    if (!propFooter) {
      loadFooter()
    }
  }, [propFooter])

  const loadFooter = async () => {
    try {
      const { data, error } = await supabase
        .from('footer_settings')
        .select('*')
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading footer:', error)
        return
      }

      if (data) {
        setFooter(data)
      }
    } catch (error) {
      console.error('Error loading footer:', error)
    }
  }

  const links = footer?.links || []
  const socialLinks = footer?.social_links || []

  const socialIcons: Record<string, any> = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    youtube: Youtube,
    linkedin: Linkedin,
  }

  const defaultQuickLinks = [
    { label: 'Home', href: '/home' },
    { label: 'About Us', href: '/about' },
    { label: 'Menu', href: '/menu' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
    { label: 'Reservations', href: '/reservations' },
    { label: 'Events', href: '/events' },
  ]

  const displayLinks = links.length > 0 ? links : defaultQuickLinks

  return (
    <footer
      className="relative mt-20 bg-gradient-to-b from-gray-900 to-black text-white"
      style={{
        backgroundColor: footer?.bg_color || undefined,
        color: footer?.text_color || undefined
      }}
    >
      {/* Decorative Top Border */}
      <div className="h-1 bg-gradient-to-r from-red-600 via-yellow-500 to-green-600"></div>
      
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* About Section */}
          <div className="space-y-4">
            <div>
              {footerLogoUrl ? (
                <div className="mb-4">
                  <Image
                    src={footerLogoUrl}
                    alt="Pak Perfection Logo"
                    width={160}
                    height={60}
                    className="h-12 w-auto object-contain brightness-0 invert"
                  />
                </div>
              ) : (
                <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-red-600 via-yellow-500 to-green-600 bg-clip-text text-transparent">
                  Pak Perfection
                </h3>
              )}
              <p className="text-sm text-gray-400 mb-2">Authentic African & International Cuisine</p>
            </div>
            
            {footer?.about_text ? (
              <p className="text-sm text-gray-300 leading-relaxed">{footer.about_text}</p>
            ) : (
              <p className="text-sm text-gray-300 leading-relaxed">
                Experience the rich flavors of authentic African cuisine and international dishes. 
                We bring you the best of traditional recipes with a modern twist.
              </p>
            )}
            
            {/* Social Media Icons */}
            <div className="pt-4">
              <h4 className="text-sm font-semibold mb-3 text-white">Follow Us</h4>
              <div className="flex gap-3">
                {socialLinks.length > 0 ? (
                  socialLinks.map((social: any, idx: number) => {
                    const Icon = socialIcons[social.platform?.toLowerCase()] || Facebook
                    return (
                      <a
                        key={idx}
                        href={social.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-gradient-to-r hover:from-red-600 hover:to-yellow-500 rounded-full transition-all duration-300 transform hover:scale-110"
                        aria-label={social.platform}
                      >
                        <Icon size={18} className="text-white" />
                      </a>
                    )
                  })
                ) : (
                  <>
                    <a href="#" className="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-blue-600 rounded-full transition-all duration-300 transform hover:scale-110">
                      <Facebook size={18} />
                    </a>
                    <a href="#" className="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-pink-600 rounded-full transition-all duration-300 transform hover:scale-110">
                      <Instagram size={18} />
                    </a>
                    <a href="#" className="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-blue-400 rounded-full transition-all duration-300 transform hover:scale-110">
                      <Twitter size={18} />
                    </a>
                    <a href="#" className="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-red-600 rounded-full transition-all duration-300 transform hover:scale-110">
                      <Youtube size={18} />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white flex items-center gap-2">
              <UtensilsCrossed size={20} className="text-yellow-500" />
              Quick Links
            </h3>
            <ul className="space-y-3">
              {displayLinks.map((link: any, idx: number) => (
                <li key={idx}>
                  <Link 
                    href={link.href || '#'} 
                    className="text-sm text-gray-300 hover:text-yellow-500 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-yellow-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-300">1502 OAKLAND PKWY</p>
                  <p className="text-sm text-gray-300">LIMA, OH 45805</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-yellow-500 flex-shrink-0" />
                <a 
                  href="tel:+14195168739" 
                  className="text-sm text-gray-300 hover:text-yellow-500 transition-colors"
                >
                  +1 (419) 516-8739
                </a>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-yellow-500 flex-shrink-0" />
                <a 
                  href="mailto:info@pakperfectioninter.com" 
                  className="text-sm text-gray-300 hover:text-yellow-500 transition-colors break-all"
                >
                  info@pakperfectioninter.com
                </a>
              </div>
              
              <div className="flex items-start gap-3 pt-2">
                <Clock size={18} className="text-yellow-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white mb-1">Opening Hours</p>
                  <p className="text-sm text-gray-300">Mon - Sat: 11:00 AM - 10:00 PM</p>
                  <p className="text-sm text-gray-300">Sunday: 12:00 PM - 9:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter / Additional Info */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Stay Connected</h3>
            <p className="text-sm text-gray-300 mb-4">
              Subscribe to our newsletter for special offers, new menu items, and exclusive events.
            </p>
            
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white placeholder-gray-400"
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-yellow-500 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Subscribe
              </button>
            </form>
            
            <div className="mt-6 pt-6 border-t border-gray-800">
              <p className="text-xs text-gray-400 flex items-center gap-2">
                <Heart size={14} className="text-red-500 fill-current" />
                Made with love for authentic flavors
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400 text-center md:text-left">
              <p>&copy; {new Date().getFullYear()} Pak Perfection. All rights reserved.</p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-6 text-sm">
              <Link href="/privacy-policy" className="text-gray-400 hover:text-yellow-500 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-yellow-500 transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-yellow-500 transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default memo(Footer)
