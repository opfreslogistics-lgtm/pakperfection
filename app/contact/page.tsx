'use client'

import { useState, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Mail, Phone, MapPin, Clock, Send, Navigation as NavIcon } from 'lucide-react'
import Navigation from '@/components/navigation-new'
import Footer from '@/components/footer'
import dynamic from 'next/dynamic'

// Lazy load Google Map component
const GoogleMap = dynamic(() => import('@/components/contact/google-map'), {
  ssr: false,
  loading: () => <div className="w-full h-[400px] bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
})

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Insert contact submission - SAME AS EVENT BOOKINGS (client-side insert)
      const { data: submission, error } = await supabase
        .from('contact_submissions')
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          subject: formData.subject || null,
          message: formData.message,
        })
        .select()
        .single()

      if (error) throw error

      // Send confirmation emails
      if (submission?.id) {
        try {
          await fetch('/api/email/send-contact-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ submissionId: submission.id }),
          })
        } catch (emailError) {
          console.error('Email error:', emailError)
          // Don't fail if email fails
        }
      }

      toast.success('Message sent successfully! You will receive a confirmation email shortly.')
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      })
    } catch (error: any) {
      console.error('Contact form error:', error)
      toast.error(error.message || 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }, [supabase, formData])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation branding={null} navSettings={null} theme={null} />
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-green-600 via-yellow-500 to-green-600 py-20">
          <div className="container mx-auto px-4 text-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Get In Touch</h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto">
              We'd love to hear from you. Visit us, call us, or send us a message.
            </p>
          </div>
        </section>

        {/* Contact Information Cards */}
        <section className="py-16 px-4 -mt-10">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {/* Address Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="text-green-600 dark:text-green-400" size={28} />
                </div>
                <h3 className="font-semibold text-lg mb-2">Address</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  1502 OAKLAND PKWY<br />
                  LIMA, OH 45805
                </p>
              </div>

              {/* Phone Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                <div className="bg-yellow-100 dark:bg-yellow-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="text-yellow-600 dark:text-yellow-400" size={28} />
                </div>
                <h3 className="font-semibold text-lg mb-2">Phone</h3>
                <a 
                  href="tel:+14195168739" 
                  className="text-primary hover:underline font-semibold block"
                >
                  +1 (419) 516-8739
                </a>
              </div>

              {/* Email Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="text-blue-600 dark:text-blue-400" size={28} />
                </div>
                <h3 className="font-semibold text-lg mb-2">Email</h3>
                <a 
                  href="mailto:info@pakperfectioninter.com" 
                    className="text-primary hover:underline text-sm block break-all"
                  >
                    info@pakperfectioninter.com
                </a>
              </div>

              {/* Hours Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                <div className="bg-red-100 dark:bg-red-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="text-red-600 dark:text-red-400" size={28} />
                </div>
                <h3 className="font-semibold text-lg mb-2">Hours</h3>
                <div className="text-gray-600 dark:text-gray-400 text-sm space-y-1">
                  <p>Mon-Thu: 11am-10pm</p>
                  <p>Fri-Sat: 11am-11pm</p>
                  <p>Sun: 12pm-9pm</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map and Form Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Google Map */}
              <div className="order-2 lg:order-1">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-primary text-secondary p-2 rounded-lg">
                      <NavIcon size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Find Us</h2>
                      <p className="text-gray-600 dark:text-gray-400">Visit our restaurant in Lima, Ohio</p>
                    </div>
                  </div>
                  <GoogleMap />
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Directions:</strong> Located on Oakland Parkway, easily accessible with ample parking available.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="order-1 lg:order-2">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-3">Send Us a Message</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Have a question or feedback? We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Your Name *</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 transition-all"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Your Email *</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 transition-all"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 transition-all"
                          placeholder="+1 (419) 000-0000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Subject</label>
                        <input
                          type="text"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 transition-all"
                          placeholder="How can we help?"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Your Message *</label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 transition-all resize-none"
                        placeholder="Tell us what's on your mind..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-green-600 to-yellow-500 text-white py-4 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={20} />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer footer={null} branding={null} theme={null} />
    </div>
  )
}
