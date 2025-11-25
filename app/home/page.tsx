import { createClient } from '@/lib/supabase/server'
import Navigation from '@/components/navigation-new'
import Footer from '@/components/footer'
import HeroSlider from '@/components/home/hero-slider'
import FeaturedDishes from '@/components/home/featured-dishes'
import FeaturedEvents from '@/components/home/featured-events'
import AboutPreview from '@/components/home/about-preview'
import CuisineShowcase from '@/components/home/cuisine-showcase'
import GalleryPreview from '@/components/home/gallery-preview'
import Testimonials from '@/components/home/testimonials'
import LocationSection from '@/components/home/location-section'
import NewsletterSignup from '@/components/home/newsletter-signup'
import CTA from '@/components/home/cta'

export const revalidate = 0 // Disable caching for this page

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
        <FeaturedDishes />
        <FeaturedEvents />
        <AboutPreview />
        <CuisineShowcase />
        <GalleryPreview />
        <Testimonials />
        <LocationSection />
        <NewsletterSignup />
        <CTA />
      </main>
      <Footer footer={footer} branding={branding} theme={theme} />
    </div>
  )
}

