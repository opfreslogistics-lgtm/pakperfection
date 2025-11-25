'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navigation from '@/components/navigation-new'
import Footer from '@/components/footer'
import { Calendar, Clock, MapPin, Users, Ticket, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import toast from 'react-hot-toast'

export default function EventBookingPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.eventId as string
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    guests: '1',
    special_requests: '',
  })
  const supabase = createClient()

  useEffect(() => {
    loadEvent()
  }, [eventId])

  const loadEvent = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (error || !data) {
      toast.error('Event not found')
      router.push('/events')
      return
    }

    setEvent(data)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Check if event is still available
      if (event.available_spots !== null && parseInt(formData.guests) > event.available_spots) {
        toast.error(`Only ${event.available_spots} spots available`)
        setSubmitting(false)
        return
      }

      // Insert booking
      const { data: booking, error } = await supabase
        .from('event_bookings')
        .insert({
          event_id: eventId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          guests: parseInt(formData.guests),
          special_requests: formData.special_requests || null,
          status: 'pending',
        })
        .select()
        .single()

      if (error) throw error

      // Update available spots
      if (event.available_spots !== null) {
        await supabase
          .from('events')
          .update({
            available_spots: event.available_spots - parseInt(formData.guests)
          })
          .eq('id', eventId)
      }

      // Send confirmation email
      try {
        await fetch('/api/email/send-event-booking-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: booking.id }),
        })
      } catch (emailError) {
        console.error('Email error:', emailError)
      }

      setShowSuccess(true)
      toast.success('Event booking submitted successfully!')
    } catch (error: any) {
      toast.error('Error booking event: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p>Loading event...</p>
        </div>
      </div>
    )
  }

  if (!event) return null

  const eventDate = new Date(event.event_date)
  const spotsLeft = event.available_spots || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navigation branding={null} navSettings={null} theme={null} />
      
      {/* Hero Section */}
      <section className="relative h-64 bg-gradient-to-r from-red-600 via-yellow-500 to-green-600 flex items-center justify-center text-white">
        <div className="text-center z-10">
          <Ticket size={48} className="mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Book Your Spot</h1>
          <p className="text-xl opacity-90">Reserve your place at this amazing event</p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 sticky top-24">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-6 hover:text-red-600 transition-colors"
              >
                <ArrowLeft size={20} />
                Back to Events
              </button>

              {event.image_url && (
                <div className="relative h-48 rounded-2xl overflow-hidden mb-6">
                  <Image src={event.image_url} alt={event.title} fill className="object-cover" />
                </div>
              )}

              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{event.title}</h2>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <Calendar size={20} className="text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {eventDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                    <Clock size={20} className="text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Time</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {eventDate.toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </p>
                  </div>
                </div>

                {event.location && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <MapPin size={20} className="text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{event.location}</p>
                    </div>
                  </div>
                )}

                {event.available_spots !== null && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Users size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Availability</p>
                      <p className={`font-semibold ${spotsLeft > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Sold Out'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Price</p>
                {event.price !== null && event.price > 0 ? (
                  <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent">
                    {formatPrice(event.price)}
                  </p>
                ) : (
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">Free</p>
                )}
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Booking Information</h2>

              {showSuccess ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={48} className="text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Booking Confirmed!</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    We've received your booking request. You'll receive a confirmation email shortly.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => router.push('/events')}
                      className="bg-gradient-to-r from-red-600 to-yellow-500 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                      View All Events
                    </button>
                    <button
                      onClick={() => router.push('/home')}
                      className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Go Home
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                        Number of Guests *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={spotsLeft > 0 ? spotsLeft : undefined}
                        value={formData.guests}
                        onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                      {spotsLeft > 0 && (
                        <p className="text-sm text-gray-500 mt-1">{spotsLeft} spots available</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                      Special Requests or Dietary Requirements
                    </label>
                    <textarea
                      value={formData.special_requests}
                      onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Any special requests, dietary restrictions, or questions..."
                    />
                  </div>

                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                      <span className="text-3xl font-bold bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent">
                        {event.price !== null && event.price > 0
                          ? formatPrice(event.price * parseInt(formData.guests || '1'))
                          : 'Free'}
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || (spotsLeft === 0)}
                      className="w-full bg-gradient-to-r from-red-600 to-yellow-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Ticket size={24} />
                          Confirm Booking
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer footer={null} branding={null} theme={null} />
    </div>
  )
}

