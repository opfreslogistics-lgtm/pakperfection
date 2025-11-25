'use client'

import EventCard from '@/components/events/event-card'
import Image from 'next/image'

interface EventsClientProps {
  upcomingEvents: any[]
  pastEvents: any[]
}

export default function EventsClient({ upcomingEvents, pastEvents }: EventsClientProps) {
  return (
    <>
      {/* Upcoming Events */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent">
              Upcoming Events
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Don't miss out on these exciting culinary experiences
            </p>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-3xl">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">📅</span>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">No Upcoming Events</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Check back soon for exciting events and special occasions!
                </p>
                <a
                  href="/contact"
                  className="inline-block bg-gradient-to-r from-red-600 to-yellow-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Contact Us About Events
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Past Events Gallery */}
      {pastEvents.length > 0 && (
        <section className="py-20 px-4 bg-gray-100 dark:bg-gray-800">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                Past Events
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Relive our memorable culinary experiences
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event) => (
                <div
                  key={event.id}
                  className="relative h-80 rounded-3xl overflow-hidden shadow-xl group cursor-pointer transform hover:scale-105 transition-all duration-500"
                >
                  {event.image_url ? (
                    <Image
                      src={event.image_url}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-red-600 via-yellow-500 to-green-600 flex items-center justify-center">
                      <span className="text-6xl opacity-50">📅</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                        {event.title}
                      </h3>
                      <p className="text-white/80 drop-shadow-md">
                        {new Date(event.event_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

