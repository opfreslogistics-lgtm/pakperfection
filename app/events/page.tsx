import { createClient } from '@/lib/supabase/server'
import Navigation from '@/components/navigation-new'
import Footer from '@/components/footer'
import { Calendar } from 'lucide-react'
import EventsClient from './events-client'

export const dynamic = 'force-dynamic'

export default async function EventsPage() {
  const supabase = await createClient()
  
  const { data: branding } = await supabase
    .from('branding')
    .select('*')
    .single()
  
  const { data: navSettings } = await supabase
    .from('navigation_settings')
    .select('*')
    .single()
  
  const { data: footer } = await supabase
    .from('footer_settings')
    .select('*')
    .single()
  
  const { data: theme } = await supabase
    .from('theme_settings')
    .select('*')
    .single()

  // Fetch events from database
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true })

  const now = new Date()
  const upcomingEvents = (events || []).filter(event => new Date(event.event_date) >= now)
  const pastEvents = (events || []).filter(event => new Date(event.event_date) < now).reverse()

  return (
    <div className="min-h-screen">
      <Navigation branding={branding} navSettings={navSettings} theme={theme} />
      
      {/* Hero Section */}
      <section className="relative h-[400px] bg-gradient-to-r from-red-600 via-yellow-500 to-green-600 flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="text-center z-10 relative">
          <div className="mb-6 animate-float">
            <Calendar size={80} className="mx-auto drop-shadow-2xl" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-2xl">Events & Specials</h1>
          <p className="text-xl md:text-2xl opacity-90 drop-shadow-lg">Join Us for Memorable Culinary Experiences</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-gray-900 to-transparent"></div>
      </section>

      <EventsClient 
        upcomingEvents={upcomingEvents || []} 
        pastEvents={pastEvents || []} 
      />

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-600 to-yellow-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">Host Your Event With Us</h2>
          <p className="text-xl mb-8 opacity-90 drop-shadow-md">We provide exceptional catering and event hosting services for all occasions</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/contact"
              className="bg-white text-green-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-xl hover:scale-105"
            >
              Contact Us
            </a>
            <a
              href="/reservation"
              className="bg-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-all shadow-xl hover:scale-105"
            >
              Book Event
            </a>
          </div>
        </div>
      </section>

      <Footer footer={footer} branding={branding} theme={theme} />
    </div>
  )
}
