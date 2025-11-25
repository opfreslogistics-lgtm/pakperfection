'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, MapPin, ArrowRight, Ticket } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import EventModal from '@/components/events/event-modal'

export default function FeaturedEvents() {
  const [events, setEvents] = useState<any[]>([])
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    loadFeaturedEvents()
  }, [])

  const loadFeaturedEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('featured', true)
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(3)

    if (data) {
      setEvents(data)
    }
  }

  if (events.length === 0) {
    return null
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent">
            Featured Events
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Don't miss out on these exciting culinary experiences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => {
            const eventDate = new Date(event.event_date)
            const spotsLeft = event.available_spots || 0

            return (
              <div
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="group bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 cursor-pointer border-2 border-transparent hover:border-red-500/20"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  {event.image_url ? (
                    <Image
                      src={event.image_url}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-red-600 via-yellow-500 to-green-600 flex items-center justify-center">
                      <Calendar size={48} className="text-white opacity-50" />
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  
                  {/* Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-gradient-to-r from-red-600 to-yellow-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                      <Ticket size={16} />
                      Featured
                    </span>
                  </div>

                  {spotsLeft > 0 && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      {spotsLeft} spots left
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                    {event.title}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar size={16} className="text-red-600" />
                      <span className="font-semibold">
                        {eventDate.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock size={16} className="text-yellow-600" />
                      <span className="font-semibold">
                        {eventDate.toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin size={16} className="text-green-600" />
                        <span className="font-semibold line-clamp-1">{event.location}</span>
                      </div>
                    )}
                  </div>

                  {event.description && (
                    <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2 text-sm">
                      {event.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      {event.price !== null && event.price > 0 ? (
                        <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent">
                          {formatPrice(event.price)}
                        </span>
                      ) : (
                        <span className="text-xl font-bold text-green-600 dark:text-green-400">
                          Free
                        </span>
                      )}
                    </div>
                    <button className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-yellow-500 text-white px-5 py-2 rounded-xl font-bold hover:shadow-lg transition-all group">
                      View Details
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-yellow-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            View All Events
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>

      {/* Event Modal */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </section>
  )
}

