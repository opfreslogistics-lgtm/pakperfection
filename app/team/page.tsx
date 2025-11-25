import { createClient } from '@/lib/supabase/server'
import Navigation from '@/components/navigation-new'
import Footer from '@/components/footer'
import Image from 'next/image'
import { ChefHat, Award, Heart, Users } from 'lucide-react'

export default async function TeamPage() {
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

  // Dummy team members
  const teamMembers = [
    {
      name: 'Chef Kwame Osei',
      role: 'Head Chef',
      bio: 'With over 15 years of experience in African cuisine, Chef Kwame brings authentic flavors from Ghana to Lima.',
      image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400',
      specialties: ['African Cuisine', 'Traditional Recipes', 'Spice Blending']
    },
    {
      name: 'Maria Rodriguez',
      role: 'Sous Chef',
      bio: 'Maria specializes in international fusion cuisine, creating unique dishes that blend cultures.',
      image: 'https://images.unsplash.com/photo-1556910103-1c0275aae6d5?w=400',
      specialties: ['Fusion Cuisine', 'International Dishes', 'Plating']
    },
    {
      name: 'John Thompson',
      role: 'Restaurant Manager',
      bio: 'John ensures every guest has an exceptional dining experience with his attention to detail.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      specialties: ['Customer Service', 'Event Planning', 'Operations']
    },
    {
      name: 'Amina Hassan',
      role: 'Pastry Chef',
      bio: 'Amina creates delightful desserts that perfectly complement our African and international dishes.',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      specialties: ['Desserts', 'Baking', 'Presentation']
    },
  ]

  return (
    <div className="min-h-screen">
      <Navigation branding={branding} navSettings={navSettings} theme={theme} />
      
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-red-600 via-yellow-500 to-green-600 flex items-center justify-center text-white">
        <div className="text-center z-10">
          <Users size={64} className="mx-auto mb-4" />
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Meet Our Team</h1>
          <p className="text-xl opacity-90">The Passionate People Behind Pak Perfection</p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2"
              >
                <div className="relative h-64">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {member.role}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{member.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed">{member.bio}</p>
                  <div className="border-t pt-4">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">SPECIALTIES</p>
                    <div className="flex flex-wrap gap-2">
                      {member.specialties.map((spec, i) => (
                        <span
                          key={i}
                          className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded text-xs"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Our Team Section */}
      <section className="py-20 px-4 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">Why Our Team Stands Out</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 text-center shadow-lg">
              <ChefHat size={48} className="text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Expert Chefs</h3>
              <p className="text-gray-600 dark:text-gray-400">Trained in both traditional and modern culinary techniques</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 text-center shadow-lg">
              <Award size={48} className="text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Award Winning</h3>
              <p className="text-gray-600 dark:text-gray-400">Recognized for excellence in culinary arts and service</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 text-center shadow-lg">
              <Heart size={48} className="text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Passionate</h3>
              <p className="text-gray-600 dark:text-gray-400">Every dish is prepared with love and dedication</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-600 to-yellow-500 text-white">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-4xl font-bold mb-4">Join Our Team</h2>
          <p className="text-xl mb-8 opacity-90">We're always looking for passionate individuals to join our culinary family</p>
          <a
            href="/contact"
            className="inline-block bg-white text-green-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
          >
            View Open Positions
          </a>
        </div>
      </section>

      <Footer footer={footer} branding={branding} theme={theme} />
    </div>
  )
}





