'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, MapPin, Users, ArrowRight, Ticket } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import EventModal from './event-modal'

interface EventCardProps {
  event: {
    id: string
    title: string
    description: string | null
    image_url: string | null
    event_date: string
    location: string | null
    price: number | null
    available_spots: number | null
    created_at: string
  }
}

export default function EventCard({ event }: EventCardProps) {
  const [showModal, setShowModal] = useState(false)
  const eventDate = new Date(event.event_date)
  const isUpcoming = eventDate > new Date()
  const spotsLeft = event.available_spots || 0

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="group bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 cursor-pointer border-2 border-transparent hover:border-red-500/20"
      >
        {/* Image Section */}
        <div className="relative h-64 overflow-hidden">
          {event.image_url ? (
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-red-600 via-yellow-500 to-green-600 flex items-center justify-center">
              <Calendar size={64} className="text-white opacity-50" />
            </div>
          )}
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Badge */}
          <div className="absolute top-4 left-4">
            {isUpcoming ? (
              <span className="bg-gradient-to-r from-red-600 to-yellow-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                <Ticket size={16} />
                Upcoming
              </span>
            ) : (
              <span className="bg-gray-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                Past Event
              </span>
            )}
          </div>

          {/* Spots Left Badge */}
          {isUpcoming && spotsLeft > 0 && (
            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              {spotsLeft} spots left
            </div>
          )}

          {isUpcoming && spotsLeft === 0 && (
            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              Sold Out
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-6">
          {/* Title */}
          <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
            {event.title}
          </h3>

          {/* Event Details */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <Calendar size={16} className="text-red-600 dark:text-red-400" />
              </div>
              <span className="font-semibold">
                {eventDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <Clock size={16} className="text-yellow-600 dark:text-yellow-400" />
              </div>
              <span className="font-semibold">
                {eventDate.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </span>
            </div>

            {event.location && (
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <MapPin size={16} className="text-green-600 dark:text-green-400" />
                </div>
                <span className="font-semibold line-clamp-1">{event.location}</span>
              </div>
            )}

            {event.available_spots && (
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Users size={16} className="text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-semibold">
                  {event.available_spots} {event.available_spots === 1 ? 'spot' : 'spots'} available
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2 text-sm">
              {event.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              {event.price !== null && event.price > 0 ? (
                <span className="text-3xl font-bold bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent">
                  {formatPrice(event.price)}
                </span>
              ) : (
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  Free
                </span>
              )}
            </div>
            {isUpcoming && spotsLeft > 0 ? (
              <Link
                href={`/events/book/${event.id}`}
                className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-yellow-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all group"
              >
                Book Now
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <button className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-yellow-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all group">
                View Details
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showModal && (
        <EventModal
          event={event}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}

