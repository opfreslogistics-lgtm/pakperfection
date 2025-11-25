'use client'

import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Array<{
    id: string
    name: string
    text: string
    rating: number
    profile_image_url?: string
    position: string
  }>>([])
  const supabase = createClient()

  useEffect(() => {
    loadTestimonials()
  }, [])

  const loadTestimonials = async () => {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('featured', true)
      .order('order_index', { ascending: true })
      .limit(3)

    if (error) {
      console.error('Error loading testimonials:', error)
      // Fallback to default testimonials
      setTestimonials([
        {
          id: '1',
          name: 'Sarah Johnson',
          rating: 5,
          text: 'Absolutely amazing food! The flavors are authentic and the service is outstanding. Highly recommend!',
          position: 'Verified Customer'
        },
        {
          id: '2',
          name: 'Michael Chen',
          rating: 5,
          text: 'Best restaurant in town! The biryani is to die for. Will definitely be coming back soon.',
          position: 'Verified Customer'
        },
        {
          id: '3',
          name: 'Emily Rodriguez',
          rating: 5,
          text: 'The atmosphere is wonderful and the food is incredible. A perfect dining experience!',
          position: 'Verified Customer'
        }
      ])
      return
    }

    if (data && data.length > 0) {
      setTestimonials(data)
    } else {
      // Fallback to default testimonials
      setTestimonials([
        {
          id: '1',
          name: 'Sarah Johnson',
          rating: 5,
          text: 'Absolutely amazing food! The flavors are authentic and the service is outstanding. Highly recommend!',
          position: 'Verified Customer'
        },
        {
          id: '2',
          name: 'Michael Chen',
          rating: 5,
          text: 'Best restaurant in town! The biryani is to die for. Will definitely be coming back soon.',
          position: 'Verified Customer'
        },
        {
          id: '3',
          name: 'Emily Rodriguez',
          rating: 5,
          text: 'The atmosphere is wonderful and the food is incredible. A perfect dining experience!',
          position: 'Verified Customer'
        }
      ])
    }
  }

  return (
    <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-lg opacity-70">Real reviews from real customers</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                "{testimonial.text}"
              </p>
              <div className="flex items-center gap-3">
                {testimonial.profile_image_url ? (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={testimonial.profile_image_url}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-yellow-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {testimonial.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm opacity-70">{testimonial.position}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
