import { createClient } from '@/lib/supabase/server'
import Navigation from '@/components/navigation-new'
import Footer from '@/components/footer'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Lazy load components that are below the fold
const FeaturedDishes = dynamic(() => import('@/components/home/featured-dishes'), { ssr: true })
const FeaturedEvents = dynamic(() => import('@/components/home/featured-events'), { ssr: true })
const AboutPreview = dynamic(() => import('@/components/home/about-preview'), { ssr: true })
const CuisineShowcase = dynamic(() => import('@/components/home/cuisine-showcase'), { ssr: true })
const GalleryPreview = dynamic(() => import('@/components/home/gallery-preview'), { ssr: true })
const Testimonials = dynamic(() => import('@/components/home/testimonials'), { ssr: true })
const LocationSection = dynamic(() => import('@/components/home/location-section'), { ssr: true })
const NewsletterSignup = dynamic(() => import('@/components/home/newsletter-signup'), { ssr: true })
const CTA = dynamic(() => import('@/components/home/cta'), { ssr: true })

// Load hero immediately (above the fold)
import HeroSlider from '@/components/home/hero-slider'

// Enable caching - revalidate every 5 minutes
export const revalidate = 300

export default async function HomePage() {
  const supabase = await createClient()
  
  // Fetch branding with error handling
  let branding = null
  try {
    const { data, error } = await supabase
      .from('branding')
      .select('*')
      .maybeSingle()
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      // Error logged silently in production
    } else {
      branding = data
    }
  } catch (error) {
    // Error logged silently in production
  }
  
  // Fetch theme settings with error handling
  let theme = null
  try {
    const { data, error } = await supabase
      .from('theme_settings')
      .select('*')
      .maybeSingle()
    if (error && error.code !== 'PGRST116') {
      // Error logged silently in production
    } else {
      theme = data
    }
  } catch (error) {
    // Error logged silently in production
  }
  
  // Fetch navigation with error handling
  let navSettings = null
  try {
    const { data, error } = await supabase
      .from('navigation_settings')
      .select('*')
      .maybeSingle()
    if (error && error.code !== 'PGRST116') {
      // Error logged silently in production
    } else {
      navSettings = data
    }
  } catch (error) {
    // Error logged silently in production
  }
  
  // Fetch footer with error handling
  let footer = null
  try {
    const { data, error } = await supabase
      .from('footer_settings')
      .select('*')
      .maybeSingle()
    if (error && error.code !== 'PGRST116') {
      // Error logged silently in production
    } else {
      footer = data
    }
  } catch (error) {
    // Error logged silently in production
  }

  return (
    <div className="min-h-screen">
      <Navigation branding={branding} navSettings={navSettings} theme={theme} />
      <main>
        <HeroSlider />
        <Suspense fallback={<div className="h-96" />}>
          <FeaturedDishes />
        </Suspense>
        <Suspense fallback={<div className="h-96" />}>
          <FeaturedEvents />
        </Suspense>
        <Suspense fallback={<div className="h-96" />}>
          <AboutPreview />
        </Suspense>
        <Suspense fallback={<div className="h-96" />}>
          <CuisineShowcase />
        </Suspense>
        <Suspense fallback={<div className="h-96" />}>
          <GalleryPreview />
        </Suspense>
        <Suspense fallback={<div className="h-96" />}>
          <Testimonials />
        </Suspense>
        <Suspense fallback={<div className="h-96" />}>
          <LocationSection />
        </Suspense>
        <Suspense fallback={<div className="h-96" />}>
          <NewsletterSignup />
        </Suspense>
        <Suspense fallback={<div className="h-96" />}>
          <CTA />
        </Suspense>
      </main>
      <Footer footer={footer} branding={branding} theme={theme} />
    </div>
  )
}

