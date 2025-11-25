import { createClient } from '@/lib/supabase/server'
import Navigation from '@/components/navigation-new'
import Footer from '@/components/footer'
import { Utensils, Users, Truck, Calendar, Gift, Coffee } from 'lucide-react'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default async function ServicesPage() {
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

  const services = [
    {
      icon: Utensils,
      title: 'Dine-In Experience',
      description: 'Enjoy our authentic African and international cuisine in our beautifully designed restaurant.',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
      features: ['Comfortable Seating', 'Full Bar Service', 'Live Music Weekends', 'Family Friendly']
    },
    {
      icon: Truck,
      title: 'Delivery Service',
      description: 'Get your favorite dishes delivered hot and fresh to your doorstep.',
      image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600',
      features: ['Fast Delivery', 'Online Ordering', 'Track Your Order', 'Contactless Delivery']
    },
    {
      icon: Calendar,
      title: 'Catering Services',
      description: 'Make your events memorable with our professional catering services.',
      image: 'https://images.unsplash.com/photo-1556910103-1c0275aae6d5?w=600',
      features: ['Custom Menus', 'Event Planning', 'Professional Staff', 'Flexible Packages']
    },
    {
      icon: Users,
      title: 'Private Events',
      description: 'Host your special occasions in our elegant private dining space.',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600',
      features: ['Private Rooms', 'Custom Decorations', 'Dedicated Staff', 'Audio/Visual Setup']
    },
    {
      icon: Gift,
      title: 'Gift Cards',
      description: 'Share the gift of great food with our restaurant gift cards.',
      image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600',
      features: ['Any Amount', 'No Expiration', 'Perfect Gift', 'Easy to Use']
    },
    {
      icon: Coffee,
      title: 'Breakfast & Brunch',
      description: 'Start your day right with our delicious breakfast and brunch options.',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600',
      features: ['Fresh Daily', 'African Specialties', 'International Options', 'Weekend Brunch']
    },
  ]

  return (
    <div className="min-h-screen">
      <Navigation branding={branding} navSettings={navSettings} theme={theme} />
      
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-green-600 via-yellow-500 to-red-600 flex items-center justify-center text-white">
        <div className="text-center z-10">
          <Utensils size={64} className="mx-auto mb-4" />
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Our Services</h1>
          <p className="text-xl opacity-90">Comprehensive Dining Solutions for Every Occasion</p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, idx) => {
              const Icon = service.icon
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2"
                >
                  <div className="relative h-48">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-red-600 text-white p-3 rounded-full">
                      <Icon size={24} />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{service.description}</p>
                    <ul className="space-y-2 mb-6">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button className="w-full bg-gradient-to-r from-red-600 to-yellow-500 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                      Learn More
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Experience Our Services?</h2>
          <p className="text-xl mb-8 text-gray-600 dark:text-gray-400">Contact us today to book your event or place an order</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/contact"
              className="bg-red-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition-colors"
            >
              Contact Us
            </a>
            <a
              href="/menu"
              className="bg-yellow-500 text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-600 transition-colors"
            >
              View Menu
            </a>
          </div>
        </div>
      </section>

      <Footer footer={footer} branding={branding} theme={theme} />
    </div>
  )
}





