'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Globe, ChefHat } from 'lucide-react'

export default function CuisineShowcase() {
  const cuisines = [
    {
      title: 'African Cuisine',
      description: 'Authentic flavors from across the African continent',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600',
      dishes: ['Jollof Rice', 'Egusi Soup', 'Suya', 'Fufu', 'Pepper Soup'],
      color: 'from-yellow-500 to-orange-500'
    },
    {
      title: 'International Dishes',
      description: 'Global favorites from around the world',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
      dishes: ['Grilled Meats', 'Pasta', 'Curries', 'Stir Fry', 'Seafood'],
      color: 'from-green-500 to-blue-500'
    }
  ]

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ChefHat size={40} className="text-primary" />
            <h2 className="text-4xl md:text-5xl font-bold">Our Cuisines</h2>
          </div>
          <p className="text-lg opacity-70 max-w-2xl mx-auto">
            Experience the rich diversity of African flavors and international culinary excellence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cuisines.map((cuisine, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="relative h-64">
                <Image
                  src={cuisine.image}
                  alt={cuisine.title}
                  fill
                  className="object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${cuisine.color} opacity-80`} />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-3xl font-bold mb-2">{cuisine.title}</h3>
                  <p className="text-lg opacity-90">{cuisine.description}</p>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Globe size={20} className="text-primary" />
                  Popular Dishes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {cuisine.dishes.map((dish, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium"
                    >
                      {dish}
                    </span>
                  ))}
                </div>
                <Link
                  href="/menu"
                  className="mt-6 inline-block bg-primary text-secondary px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  View Full Menu
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}





