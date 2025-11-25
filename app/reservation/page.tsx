'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Navigation from '@/components/navigation-new'
import Footer from '@/components/footer'
import toast from 'react-hot-toast'
import { Calendar, Clock, Users, Phone, Mail, MapPin, CheckCircle2 } from 'lucide-react'

export default function ReservationPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: '2',
    special_requests: '',
  })
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Insert reservation
      const { data: reservationData, error } = await supabase
        .from('reservations')
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          reservation_date: formData.date,
          reservation_time: formData.time,
          guests: parseInt(formData.guests),
          special_requests: formData.special_requests
        })
        .select()
        .single()

      if (error) throw error

      // Send confirmation email
      if (reservationData?.id) {
        try {
          const emailResponse = await fetch('/api/email/send-reservation-confirmation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reservationId: reservationData.id }),
          })

          const emailResult = await emailResponse.json()
          if (emailResult.success) {
            toast.success('Reservation confirmed! Check your email for confirmation details.')
          } else {
            console.error('Failed to send reservation email:', emailResult.error)
            // Don't fail the reservation if email fails, just log it
            toast.error('Reservation saved but email could not be sent. Please check your email settings in admin panel.')
          }
        } catch (emailError: any) {
          console.error('Error sending reservation email:', emailError)
          toast.error('Reservation saved but email could not be sent: ' + (emailError.message || 'Unknown error'))
          // Don't fail the reservation if email fails
        }
      }

      setShowSuccess(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        guests: '2',
        special_requests: '',
      })
      
      // Hide success modal after 5 seconds
      setTimeout(() => {
        setShowSuccess(false)
      }, 5000)
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit reservation')
    } finally {
      setLoading(false)
    }
  }

  const timeSlots = [
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
    '2:00 PM', '2:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM',
    '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM'
  ]

  return (
    <div className="min-h-screen">
      <Navigation branding={null} navSettings={null} theme={null} />
      
      {/* Hero Section */}
      <section className="relative h-[250px] bg-gradient-to-r from-red-600 via-yellow-500 to-green-600 flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
        
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="text-center z-10 px-4 max-w-4xl mx-auto">
          <div className="animate-fadeInUp">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent">
              Make a Reservation
            </h1>
            <p className="text-base md:text-lg opacity-90">
              Book your table and experience authentic flavors
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-red-600 to-yellow-500 text-white text-sm font-bold rounded-full mb-4">
              🍽️ RESERVE YOUR TABLE
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-600 to-yellow-600 bg-clip-text text-transparent">
              Secure Your Spot
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Fill in the details below and we'll confirm your reservation shortly
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Reservation Form */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-10 border-2 border-gray-100 dark:border-gray-700">
                <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white flex items-center gap-3">
                  <Calendar className="text-red-600" size={32} />
                  Reservation Details
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        <Users className="inline mr-2" size={16} />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        <Mail className="inline mr-2" size={16} />
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      <Phone className="inline mr-2" size={16} />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      placeholder="+1 (419) 000-0000"
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        <Calendar className="inline mr-2" size={16} />
                        Date *
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        <Clock className="inline mr-2" size={16} />
                        Time *
                      </label>
                      <select
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 transition-all"
                      >
                        <option value="">Select Time</option>
                        {timeSlots.map((time) => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        <Users className="inline mr-2" size={16} />
                        Guests *
                      </label>
                      <select
                        value={formData.guests}
                        onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 transition-all"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      💬 Special Requests (Optional)
                    </label>
                    <textarea
                      value={formData.special_requests}
                      onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 transition-all resize-none"
                      placeholder="Any dietary restrictions, allergies, or special occasions we should know about?"
                    />
                  </div>
                  
                  {/* Info Box */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      ℹ️ <strong>Note:</strong> Reservations are subject to availability. We'll confirm your booking via email or phone within 24 hours.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-red-600 to-yellow-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Calendar size={24} />
                        Book Reservation
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Info Sidebar */}
            <div className="space-y-6">
              {/* Contact Info Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border-2 border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                  <Phone className="text-red-600" size={24} />
                  Contact Info
                </h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <MapPin className="text-red-600 mt-1 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white mb-1">Address</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        1502 OAKLAND PKWY<br />
                        LIMA, OH 45805
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                    <Phone className="text-yellow-600 mt-1 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white mb-1">Phone</p>
                      <a href="tel:+14195168739" className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 font-semibold transition-colors">
                        +1 (419) 516-8739
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <Mail className="text-green-600 mt-1 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white mb-1">Email</p>
                      <a href="mailto:info@pakperfectioninter.com" className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 font-semibold transition-colors break-all">
                        info@pakperfectioninter.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Opening Hours Card */}
              <div className="bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 rounded-2xl shadow-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <Clock size={40} className="mb-4 animate-float" />
                  <h3 className="text-2xl font-bold mb-6">Opening Hours</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white/10 backdrop-blur-sm rounded-lg">
                      <span className="font-semibold">Mon - Thu</span>
                      <span className="font-bold">11am - 10pm</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/10 backdrop-blur-sm rounded-lg">
                      <span className="font-semibold">Fri - Sat</span>
                      <span className="font-bold">11am - 11pm</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/10 backdrop-blur-sm rounded-lg">
                      <span className="font-semibold">Sunday</span>
                      <span className="font-bold">12pm - 9pm</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl shadow-xl p-6 border-2 border-blue-200 dark:border-blue-700">
                <h3 className="text-lg font-bold mb-4 text-blue-900 dark:text-blue-100 flex items-center gap-2">
                  💡 Reservation Tips
                </h3>
                <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">✓</span>
                    <span>Book at least 24 hours in advance for best availability</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">✓</span>
                    <span>Large groups (8+)? Call us directly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">✓</span>
                    <span>We accommodate dietary restrictions - just let us know!</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer footer={null} branding={null} theme={null} />
      
      {/* Success Popup Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeInUp">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowSuccess(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-full">
                  <CheckCircle2 size={48} className="text-white" />
                </div>
              </div>
              
              <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                Reservation Confirmed! 🎉
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                Thank you for your reservation! We've received your request and will contact you shortly to confirm the details.
              </p>
              
              <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
                <p className="text-sm text-green-800 dark:text-green-200">
                  ✓ A confirmation email has been sent to your inbox<br />
                  ✓ We'll call you within 24 hours to confirm
                </p>
              </div>
              
              <button
                onClick={() => setShowSuccess(false)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Got it, Thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}




