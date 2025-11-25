'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Navigation from '@/components/navigation-new'
import Footer from '@/components/footer'
import Image from 'next/image'
import { Camera, Filter } from 'lucide-react'

export default function GalleryPage() {
  const [branding, setBranding] = useState<any>(null)
  const [navSettings, setNavSettings] = useState<any>(null)
  const [footer, setFooter] = useState<any>(null)
  const [theme, setTheme] = useState<any>(null)
  const [galleryImages, setGalleryImages] = useState<Array<{ id: string; url: string; category: string; title: string }>>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [brandingRes, navRes, footerRes, themeRes, mediaRes] = await Promise.all([
        supabase.from('branding').select('*').maybeSingle(),
        supabase.from('navigation_settings').select('*').maybeSingle(),
        supabase.from('footer_settings').select('*').maybeSingle(),
        supabase.from('theme_settings').select('*').maybeSingle(),
        supabase.from('media')
          .select('id, file_url, file_name, file_type')
          .like('file_type', 'image%')
          .order('created_at', { ascending: false })
      ])

      if (brandingRes.data) setBranding(brandingRes.data)
      if (navRes.data) setNavSettings(navRes.data)
      if (footerRes.data) setFooter(footerRes.data)
      if (themeRes.data) setTheme(themeRes.data)

      if (mediaRes.data && mediaRes.data.length > 0) {
        const images = mediaRes.data.map((item, index) => ({
          id: item.id,
          url: item.file_url,
          category: 'Gallery', // You can add category field to media table later
          title: item.file_name?.replace(/\.[^/.]+$/, '') || `Image ${index + 1}`
        }))
        setGalleryImages(images)
      } else {
        // Fallback to default images
        setGalleryImages([
          { id: '1', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800', category: 'Food', title: 'Delicious African Dishes' },
          { id: '2', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', category: 'Interior', title: 'Restaurant Ambiance' },
          { id: '3', url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', category: 'Food', title: 'Chef Special' },
          { id: '4', url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800', category: 'Events', title: 'Private Events' },
          { id: '5', url: 'https://images.unsplash.com/photo-1556910103-1c0275aae6d5?w=800', category: 'Food', title: 'Traditional Recipes' },
          { id: '6', url: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800', category: 'People', title: 'Happy Customers' },
          { id: '7', url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800', category: 'Interior', title: 'Cozy Dining' },
          { id: '8', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800', category: 'Food', title: 'Fresh Ingredients' },
          { id: '9', url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', category: 'Events', title: 'Celebrations' },
          { id: '10', url: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800', category: 'People', title: 'Family Dining' },
          { id: '11', url: 'https://images.unsplash.com/photo-1556910103-1c0275aae6d5?w=800', category: 'Food', title: 'International Cuisine' },
          { id: '12', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', category: 'Interior', title: 'Modern Design' },
        ])
      }
    } catch (error) {
      console.error('Error loading gallery data:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = ['All', 'Food', 'Interior', 'Events', 'People', 'Gallery']
  const filteredImages = selectedCategory === 'All' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === selectedCategory)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p>Loading gallery...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navigation branding={branding} navSettings={navSettings} theme={theme} />
      
      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[600px] bg-gradient-to-r from-red-600 via-yellow-500 to-green-600 flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
        
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="text-center z-10 px-4 max-w-4xl mx-auto">
          <div className="animate-fadeInUp">
            {/* Icon with animation */}
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse"></div>
              <Camera size={80} className="relative mx-auto animate-float" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent">
              Our Gallery
            </h1>
            <p className="text-xl md:text-2xl opacity-90 leading-relaxed">
              Capturing Moments of Culinary Excellence & Memorable Experiences
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
      </section>

      {/* Filter Section */}
      <section className="py-10 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 border-y border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-semibold mr-2">
              <Filter size={24} className="text-red-600" />
              <span className="hidden sm:inline">Filter by:</span>
            </div>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-3 rounded-full transition-all duration-300 font-semibold shadow-md hover:shadow-xl transform hover:scale-105 ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-red-600 to-yellow-500 text-white scale-105'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-600 hover:to-yellow-500 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16 px-4 bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto">
          {filteredImages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredImages.map((image, index) => (
                <div
                  key={image.id}
                  className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="aspect-square relative">
                    {/* Image */}
                    <Image
                      src={image.url}
                      alt="Gallery image"
                      fill
                      className="object-cover group-hover:scale-125 group-hover:rotate-2 transition-all duration-700"
                    />
                    
                    {/* Overlay - Only shows "Gallery" */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          <div className="bg-white/10 backdrop-blur-md px-8 py-4 rounded-full border-2 border-white/30">
                            <p className="font-bold text-white text-2xl tracking-wide">Gallery</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Corner accent */}
                      <div className="absolute top-3 right-3 w-10 h-10 border-t-2 border-r-2 border-white/50 rounded-tr-lg"></div>
                      <div className="absolute bottom-3 left-3 w-10 h-10 border-b-2 border-l-2 border-white/50 rounded-bl-lg"></div>
                    </div>

                    {/* Shine effect on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Camera size={64} className="mx-auto mb-4 text-gray-400" />
              <p className="text-xl text-gray-600 dark:text-gray-400">No images found in this category.</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Upload images to the media library to see them here.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 bg-gradient-to-br from-red-600 via-purple-600 to-yellow-500 text-white overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Visit Us Today</h2>
          <p className="text-xl md:text-2xl mb-10 opacity-90 max-w-2xl mx-auto leading-relaxed">
            Experience the flavors that make us special. Your culinary adventure awaits!
          </p>
          <a
            href="/menu"
            className="group inline-flex items-center gap-3 bg-white text-red-600 px-10 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-xl"
          >
            View Our Menu
            <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </section>

      <Footer footer={footer} branding={branding} theme={theme} />
    </div>
  )
}
