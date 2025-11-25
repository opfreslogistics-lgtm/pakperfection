'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Camera } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function GalleryPreview() {
  const [galleryImages, setGalleryImages] = useState<Array<{ id: string; image: string; title: string; category: string }>>([])
  const supabase = createClient()

  useEffect(() => {
    loadGalleryImages()
  }, [])

  const loadGalleryImages = async () => {
    const { data, error } = await supabase
      .from('media')
      .select('id, file_url, file_name, file_type')
      .like('file_type', 'image%')
      .order('created_at', { ascending: false })
      .limit(6)

    if (error) {
      console.error('Error loading gallery images:', error)
      // Fallback to default images
      setGalleryImages([
        { id: '1', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600', title: 'Dining Experience', category: 'Restaurant' },
        { id: '2', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600', title: 'Happy Customers', category: 'People' },
        { id: '3', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600', title: 'Delicious Food', category: 'Food' },
        { id: '4', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600', title: 'Family Dining', category: 'People' },
        { id: '5', image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600', title: 'Chef Special', category: 'Food' },
        { id: '6', image: 'https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=600', title: 'Cozy Atmosphere', category: 'Restaurant' }
      ])
      return
    }

    if (data && data.length > 0) {
      const images = data.map((item, index) => ({
        id: item.id,
        image: item.file_url,
        title: item.file_name?.replace(/\.[^/.]+$/, '') || `Image ${index + 1}`,
        category: 'Gallery'
      }))
      setGalleryImages(images)
    } else {
      // Fallback to default images if no media library images
      setGalleryImages([
        { id: '1', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600', title: 'Dining Experience', category: 'Restaurant' },
        { id: '2', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600', title: 'Happy Customers', category: 'People' },
        { id: '3', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600', title: 'Delicious Food', category: 'Food' },
        { id: '4', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600', title: 'Family Dining', category: 'People' },
        { id: '5', image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600', title: 'Chef Special', category: 'Food' },
        { id: '6', image: 'https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=600', title: 'Cozy Atmosphere', category: 'Restaurant' }
      ])
    }
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block relative mb-4">
            <div className="absolute inset-0 bg-red-600/20 blur-2xl rounded-full"></div>
            <div className="relative flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent">
              <Camera size={48} className="text-red-600" />
              <h2 className="text-4xl md:text-6xl font-bold">Our Gallery</h2>
            </div>
          </div>
          <p className="text-lg md:text-xl opacity-70 max-w-2xl mx-auto leading-relaxed">
            Explore our culinary journey through stunning visuals of our restaurant, 
            delicious dishes, and memorable moments
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {galleryImages.map((item, index) => (
            <div
              key={item.id}
              className="group relative aspect-square overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <Image
                src={item.image}
                alt="Gallery image"
                fill
                className="object-cover group-hover:scale-125 group-hover:rotate-2 transition-all duration-700"
              />
              
              {/* Overlay - Only shows "Gallery" */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border-2 border-white/30">
                      <p className="font-bold text-white text-lg tracking-wide">Gallery</p>
                    </div>
                  </div>
                </div>
                
                {/* Corner accent */}
                <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-white/50 rounded-tr-lg"></div>
                <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-white/50 rounded-bl-lg"></div>
              </div>

              {/* Shine effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-red-600 via-red-500 to-yellow-500 text-white px-10 py-4 rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-xl group"
          >
            <Camera size={24} className="group-hover:rotate-12 transition-transform duration-300" />
            <span>View Full Gallery</span>
            <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
