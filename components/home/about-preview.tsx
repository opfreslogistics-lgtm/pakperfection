'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function AboutPreview() {
  const [storyImage, setStoryImage] = useState<string>('https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800')
  const supabase = createClient()

  useEffect(() => {
    loadStoryImage()
  }, [])

  const loadStoryImage = async () => {
    const { data } = await supabase
      .from('page_content')
      .select('images')
      .eq('page_slug', 'home')
      .maybeSingle()

    if (data?.images?.about_story_image) {
      setStoryImage(data.images.about_story_image)
    }
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Image container with fixed aspect ratio */}
          <div className="relative">
            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-700">
              <Image
                src={storyImage}
                alt="Our Story"
                fill
                className="object-contain bg-gray-100 dark:bg-gray-800"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-red-600 to-yellow-500 rounded-full blur-2xl opacity-50 -z-10"></div>
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-purple-600 to-red-600 rounded-full blur-2xl opacity-30 -z-10"></div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div>
              <span className="inline-block px-4 py-1 bg-gradient-to-r from-red-600 to-yellow-500 text-white text-sm font-semibold rounded-full mb-4">
                About Us
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-600 to-yellow-600 bg-clip-text text-transparent">
                Our Story
              </h2>
            </div>
            
            <p className="text-lg leading-relaxed opacity-80">
              Pak Perfection brings the vibrant flavors of Africa and the world to Lima, Ohio. 
              Our restaurant celebrates the rich culinary heritage of African cuisine while offering 
              an array of international dishes that satisfy every palate.
            </p>
            <p className="text-lg leading-relaxed opacity-80">
              Located at 1502 Oakland Parkway, we craft every dish with authentic spices, fresh ingredients, 
              and traditional cooking methods. From savory African stews to international favorites, 
              we create memorable dining experiences that bring communities together.
            </p>
            
            <Link
              href="/about"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-yellow-500 text-white px-8 py-4 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Learn More About Us
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
