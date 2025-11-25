'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState<Array<{ image: string; title: string; subtitle: string; cta: string }>>([])
  const [ownerImage, setOwnerImage] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadSlides()
    loadOwnerImage()
  }, [])

  const loadSlides = async () => {
    const { data } = await supabase
      .from('page_content')
      .select('images')
      .eq('page_slug', 'home')
      .maybeSingle()

    const defaultSlides = [
      {
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920',
        title: 'Welcome to Pak Perfection',
        subtitle: 'Authentic African & International Cuisine in Lima, Ohio',
        cta: 'Order Now'
      },
      {
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920',
        title: 'African Flavors, Global Taste',
        subtitle: 'Experience the Richness of African Dishes & International Delights',
        cta: 'View Menu'
      },
      {
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920',
        title: 'Fresh Ingredients, Traditional Recipes',
        subtitle: 'Where African Heritage Meets Culinary Excellence',
        cta: 'Reserve Table'
      }
    ]

    if (data?.images?.hero_slider_images && Array.isArray(data.images.hero_slider_images) && data.images.hero_slider_images.length > 0) {
      // Use saved images with default titles
      const savedSlides = data.images.hero_slider_images.map((img: string, index: number) => ({
        image: img,
        title: defaultSlides[index]?.title || `Slide ${index + 1}`,
        subtitle: defaultSlides[index]?.subtitle || '',
        cta: defaultSlides[index]?.cta || 'Learn More'
      }))
      setSlides(savedSlides)
    } else {
      setSlides(defaultSlides)
    }
  }

  const loadOwnerImage = async () => {
    const { data } = await supabase
      .from('branding')
      .select('hero_owner_image')
      .maybeSingle()
    
    if (data?.hero_owner_image) {
      setOwnerImage(data.hero_owner_image)
    }
  }

  useEffect(() => {
    if (slides.length === 0) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  if (slides.length === 0) {
    return <div className="h-[600px] md:h-[700px] bg-gray-200 dark:bg-gray-800"></div>
  }

  return (
    <div className="relative h-[600px] md:h-[700px] lg:h-[800px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="relative w-full h-full">
            {/* Image with Ken Burns effect */}
            <div className={`absolute inset-0 ${index === currentSlide ? 'animate-ken-burns' : ''}`}>
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
            </div>
            
            {/* Enhanced gradient overlay - darker on the left for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />
            
            {/* Content - Left aligned */}
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-8 md:px-16 lg:px-20">
                <div className="text-left text-white max-w-3xl">
                  {/* Animated title */}
                  <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold mb-6 ${
                    index === currentSlide ? 'animate-fadeInUp' : 'opacity-0'
                  }`} style={{ animationDelay: '0.2s' }}>
                    <span className="inline-block bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent">
                      {slide.title}
                    </span>
                  </h1>
                  
                  {/* Animated subtitle */}
                  <p className={`text-xl md:text-3xl mb-10 font-light tracking-wide ${
                    index === currentSlide ? 'animate-fadeInUp' : 'opacity-0'
                  }`} style={{ animationDelay: '0.4s' }}>
                    {slide.subtitle}
                  </p>
                  
                  {/* Animated CTA button */}
                  <div className={index === currentSlide ? 'animate-fadeInUp' : 'opacity-0'} style={{ animationDelay: '0.6s' }}>
                    <button className="group relative bg-gradient-to-r from-red-600 via-red-500 to-yellow-500 text-white px-10 py-4 rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-xl overflow-hidden">
                      <span className="relative z-10 flex items-center gap-2">
                        {slide.cta}
                        <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
          </div>
        </div>
      ))}

      {/* Navigation buttons with enhanced styling */}
      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-3 md:p-4 rounded-full transition-all hover:scale-110 border border-white/20 shadow-xl"
        aria-label="Previous slide"
      >
        <ChevronLeft size={28} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-3 md:p-4 rounded-full transition-all hover:scale-110 border border-white/20 shadow-xl"
        aria-label="Next slide"
      >
        <ChevronRight size={28} />
      </button>

      {/* Enhanced pagination dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 bg-black/20 backdrop-blur-md px-4 py-3 rounded-full border border-white/20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'w-10 bg-gradient-to-r from-red-600 to-yellow-500 shadow-lg' 
                : 'w-2.5 bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Fixed Owner Image - Bottom Right with Animations */}
      {ownerImage && (
        <div className="absolute bottom-0 right-0 w-64 md:w-96 lg:w-[500px] h-auto pointer-events-none z-10">
          <div className="relative w-full h-full animate-float">
            {/* Glow effect behind the image */}
            <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/30 via-red-500/20 to-transparent blur-3xl animate-pulse-slow"></div>
            
            {/* Owner transparent image from admin settings */}
            <Image
              src={ownerImage}
              alt="Restaurant Owner"
              width={500}
              height={600}
              className="relative z-10 object-contain drop-shadow-2xl animate-fadeInRight"
              priority
              style={{
                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))',
              }}
            />
            
            {/* Decorative floating elements */}
            <div className="absolute top-10 -left-10 w-20 h-20 bg-yellow-500/20 rounded-full blur-xl animate-bounce-slow"></div>
            <div className="absolute bottom-20 -right-10 w-32 h-32 bg-red-500/20 rounded-full blur-xl animate-bounce-slow" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      )}
    </div>
  )
}
