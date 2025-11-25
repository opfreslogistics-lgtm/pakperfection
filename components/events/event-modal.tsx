'use client'

import { X, Calendar, Clock, MapPin, Users, Ticket, Share2, Phone, Mail } from 'lucide-react'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

interface EventModalProps {
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
  onClose: () => void
}

export default function EventModal({ event, onClose }: EventModalProps) {
  const eventDate = new Date(event.event_date)
  const isUpcoming = eventDate > new Date()
  const spotsLeft = event.available_spots || 0

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description || '',
          url: window.location.href,
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeInUp"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-4 border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Image */}
        <div className="relative h-80 overflow-hidden">
          {event.image_url ? (
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-red-600 via-yellow-500 to-green-600 flex items-center justify-center">
              <Calendar size={80} className="text-white opacity-50" />
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-colors z-10"
          >
            <X size={24} className="text-white" />
          </button>

          {/* Badge */}
          <div className="absolute bottom-6 left-6">
            {isUpcoming ? (
              <span className="bg-gradient-to-r from-red-600 to-yellow-500 text-white px-5 py-2 rounded-full text-sm font-bold shadow-xl flex items-center gap-2">
                <Ticket size={18} />
                Upcoming Event
              </span>
            ) : (
              <span className="bg-gray-600 text-white px-5 py-2 rounded-full text-sm font-bold shadow-xl">
                Past Event
              </span>
            )}
          </div>

          {/* Title Overlay */}
          <div className="absolute bottom-6 right-6 text-right">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-2xl">
              {event.title}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Event Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl">
              <div className="p-3 bg-red-600 rounded-xl">
                <Calendar size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Date</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {eventDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl">
              <div className="p-3 bg-yellow-600 rounded-xl">
                <Clock size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Time</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {eventDate.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </p>
              </div>
            </div>

            {event.location && (
              <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl">
                <div className="p-3 bg-green-600 rounded-xl">
                  <MapPin size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Location</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {event.location}
                  </p>
                </div>
              </div>
            )}

            {event.available_spots !== null && (
              <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                <div className="p-3 bg-blue-600 rounded-xl">
                  <Users size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Availability</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {spotsLeft > 0 ? (
                      <span className="text-green-600 dark:text-green-400">
                        {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} left
                      </span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400">Sold Out</span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-yellow-50 dark:from-red-900/20 dark:to-yellow-900/20 rounded-2xl border-2 border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ticket Price</p>
                {event.price !== null && event.price > 0 ? (
                  <p className="text-4xl font-bold bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent">
                    {formatPrice(event.price)}
                  </p>
                ) : (
                  <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                    Free Entry
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">About This Event</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-line">
                {event.description}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            {isUpcoming && spotsLeft > 0 && (
              <Link
                href={`/events/book/${event.id}`}
                className="flex-1 bg-gradient-to-r from-red-600 to-yellow-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <Ticket size={24} />
                Book Now
              </Link>
            )}
            
            <Link
              href="/contact"
              className="flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-8 py-4 rounded-xl font-bold text-lg border-2 border-gray-300 dark:border-gray-600 hover:border-red-600 dark:hover:border-red-600 hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Phone size={20} />
              Contact Us
            </Link>

            <button
              onClick={handleShare}
              className="px-6 py-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <Share2 size={20} />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

