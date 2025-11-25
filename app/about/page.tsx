import { createClient } from '@/lib/supabase/server'
import Navigation from '@/components/navigation-new'
import Footer from '@/components/footer'
import Image from 'next/image'
import { Heart, Target, Award, Users, MapPin, Clock, Phone, Mail } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AboutPage() {
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

  const { data: teamMembers } = await supabase
    .from('team_members')
    .select('*')
    .order('order_index')

  // Fetch page images from admin
  const { data: pageContent } = await supabase
    .from('page_content')
    .select('images')
    .eq('page_slug', 'about')
    .maybeSingle()

  // Default images as fallback
  const heroImage = pageContent?.images?.hero_image || 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1920'
  const storyImage = pageContent?.images?.story_image || 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800'

  const values = [
    { icon: Heart, title: 'Passion', description: 'We cook with love and passion for authentic flavors' },
    { icon: Target, title: 'Quality', description: 'Only the finest ingredients make it to your plate' },
    { icon: Award, title: 'Excellence', description: 'Committed to culinary excellence in every dish' },
    { icon: Users, title: 'Community', description: 'Building connections through shared meals' },
  ]

  return (
    <div className="min-h-screen">
      <Navigation branding={branding} navSettings={navSettings} theme={theme} />
      
      {/* Hero Banner */}
      <section className="relative h-[500px] md:h-[600px] bg-gradient-to-r from-red-600 via-yellow-500 to-green-600 flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt="About Pak Perfection"
            fill
            className="object-cover opacity-30"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
        <div className="text-center z-10 px-4 max-w-4xl mx-auto">
          <div className="animate-fadeInUp">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent">
              About Pak Perfection
            </h1>
            <p className="text-xl md:text-2xl opacity-90 leading-relaxed">
              Where African Heritage Meets Culinary Excellence
            </p>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image with object-contain */}
            <div className="relative">
              <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-700">
                <Image
                  src={storyImage}
                  alt="Our Story"
                  fill
                  className="object-contain bg-gray-100 dark:bg-gray-800"
                  sizes="(max-width: 1024px) 100vw, 50vw"
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
                  Our Journey
                </span>
                <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-600 to-yellow-600 bg-clip-text text-transparent">
                  Welcome to Pak Perfection International Cuisine LLC
                </h2>
              </div>
              
              <div className="space-y-4 text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                <p className="italic text-xl font-medium text-red-600 dark:text-yellow-500">
                  "Where tradition meets taste — and every bite tells a story."
                </p>
                
                <p>
                  My name is <span className="font-bold text-gray-900 dark:text-white">Perfect Hatcher</span>, and I started this company with one heartfelt vision: to share the deep, soulful flavors of African and international cuisine with the world — served fresh, served right, and served with purpose.
                </p>
                
                <p>
                  For me, food is more than just a meal. It's culture, it's history, and it's love. Growing up around bold spices, hearty stews, and cherished family recipes, I knew early on that food had the power to bring people together. That same passion is what fuels Pak Perfection today.
                </p>
                
                <p>
                  At Pak Perfection, we specialize in delivering authentic African and international dishes — from Ghanaian banku and tilapia to Nigerian egusi soup, jollof rice, waakye, and more. Each recipe is prepared with care, combining traditional methods with a modern twist to ensure flavor, freshness, and satisfaction in every bite.
                </p>
                
                <p>
                  Whether you're coming home to a familiar dish or exploring something new, our mission is simple:
                </p>
                
                <p className="text-xl font-bold text-center py-4 px-6 bg-gradient-to-r from-red-50 to-yellow-50 dark:from-red-900/20 dark:to-yellow-900/20 rounded-xl border-l-4 border-red-600">
                  To serve food that feels like home — no matter where you're from.
                </p>
                
                <p>
                  We're proud to be part of your table, your events, and your memories. Thank you for supporting our journey. We can't wait to serve you perfection, one plate at a time.
                </p>
                
                <div className="pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                  <p className="text-gray-600 dark:text-gray-400 italic">With gratitude,</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">Perfect Hatcher</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Founder, Pak Perfection International Cuisine LLC</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl">
              <Target size={48} className="text-red-600 mb-4" />
              <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Our Mission</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                To provide exceptional dining experiences by combining authentic African flavors with international cuisine, 
                using only the freshest ingredients and traditional cooking methods. We strive to create a welcoming 
                atmosphere where every guest feels like family.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl">
              <Award size={48} className="text-yellow-500 mb-4" />
              <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Our Vision</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                To become the premier destination for African and international cuisine in the region, known for our 
                commitment to quality, authenticity, and exceptional service. We envision a future where our restaurant 
                serves as a cultural bridge, bringing people together through the universal language of great food.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, idx) => {
              const Icon = value.icon
              return (
                <div key={idx} className="text-center p-6 bg-gradient-to-br from-red-50 to-yellow-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all">
                  <div className="bg-gradient-to-br from-red-600 to-yellow-500 text-white p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <Icon size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{value.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-600 to-yellow-500 text-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-12">Why Choose Pak Perfection?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl">
              <div className="text-4xl font-bold mb-2">100+</div>
              <div className="text-xl mb-2">Menu Items</div>
              <p className="opacity-90">Extensive selection of African and international dishes</p>
            </div>
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl">
              <div className="text-4xl font-bold mb-2">5+</div>
              <div className="text-xl mb-2">Years Experience</div>
              <p className="opacity-90">Serving the Lima community with excellence</p>
            </div>
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl">
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-xl mb-2">Happy Customers</div>
              <p className="opacity-90">Join our growing family of satisfied diners</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-20 px-4 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">Visit Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 text-center shadow-xl">
              <MapPin size={48} className="text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Location</h3>
              <p className="text-gray-600 dark:text-gray-400">1502 OAKLAND PKWY<br />LIMA, OH 45805</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 text-center shadow-xl">
              <Phone size={48} className="text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Phone</h3>
              <p className="text-gray-600 dark:text-gray-400">
                <a href="tel:+14195168739" className="hover:text-red-600">+1 (419) 516-8739</a>
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 text-center shadow-xl">
              <Clock size={48} className="text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Hours</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Mon-Thu: 11am-10pm<br />
                Fri-Sat: 11am-11pm<br />
                Sun: 12pm-9pm
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer footer={footer} branding={branding} theme={theme} />
    </div>
  )
}
