'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus, Star } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

interface MenuDisplayProps {
  categories: any[]
  items: any[]
}

export default function MenuDisplay({ categories, items }: MenuDisplayProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredItems = selectedCategory
    ? items.filter(item => item.category_id === selectedCategory)
    : items

  const addToCart = (item: any) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = cart.find((i: any) => i.id === item.id)
    
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart.push({ ...item, quantity: 1 })
    }
    
    localStorage.setItem('cart', JSON.stringify(cart))
    toast.success(`${item.name} added to cart!`)
  }

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">Our Menu</h1>
        <p className="text-lg opacity-70">Discover our delicious offerings</p>
      </div>

      {/* Category Tabs */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              selectedCategory === null
                ? 'bg-primary text-secondary'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary text-secondary'
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              {item.image_url && (
                <div className="relative h-48">
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                  {item.featured && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Featured
                    </div>
                  )}
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-semibold">{item.name}</h3>
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(parseFloat(item.price))}
                  </span>
                </div>
                {item.description && (
                  <p className="text-sm opacity-70 mb-4">{item.description}</p>
                )}
                {item.dietary_labels && item.dietary_labels.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    {item.dietary_labels.map((label: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => addToCart(item)}
                  className="w-full bg-primary text-secondary py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Add to Cart
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-lg opacity-70">No menu items available yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}



