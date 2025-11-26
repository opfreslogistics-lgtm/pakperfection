'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus, Star } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'
import AddToCartModal from './add-to-cart-modal'

interface MenuDisplayProps {
  categories: any[]
  items: any[]
}

export default function MenuDisplay({ categories, items }: MenuDisplayProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showCartModal, setShowCartModal] = useState(false)

  const filteredItems = selectedCategory
    ? items.filter(item => item.category_id === selectedCategory)
    : items

  const handleItemClick = (item: any) => {
    setSelectedItem(item)
    setShowCartModal(true)
  }

  const handleAddToCart = (cartItem: any) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    cart.push(cartItem)
    localStorage.setItem('cart', JSON.stringify(cart))
    toast.success(`${cartItem.name} added to cart!`)
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
              className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer group"
              onClick={() => handleItemClick(item)}
            >
              {item.image_url && (
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {item.featured && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Star size={14} className="fill-current" />
                      Featured
                    </div>
                  )}
                  {item.promo_active && item.promo_price && parseFloat(item.promo_price) < parseFloat(item.price) && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      SALE
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-full font-bold">
                      Click to View Details
                    </div>
                  </div>
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">{item.name}</h3>
                  <div className="flex flex-col items-end">
                    {item.promo_active && item.promo_price && parseFloat(item.promo_price) < parseFloat(item.price) ? (
                      <>
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(parseFloat(item.price))}
                        </span>
                        <span className="text-2xl font-bold text-red-600">
                          {formatPrice(parseFloat(item.promo_price))}
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-primary">
                        {formatPrice(parseFloat(item.price))}
                      </span>
                    )}
                  </div>
                </div>
                {item.short_description && (
                  <p className="text-sm opacity-70 mb-3">{item.short_description}</p>
                )}
                {item.dietary_labels && item.dietary_labels.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {item.dietary_labels.slice(0, 3).map((label: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded"
                      >
                        {label}
                      </span>
                    ))}
                    {item.dietary_labels.length > 3 && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                        +{item.dietary_labels.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                {item.prep_time_minutes && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    ⏱️ {item.prep_time_minutes} mins prep time
                  </p>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleItemClick(item)
                  }}
                  className="w-full bg-primary text-secondary py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 group-hover:scale-105 transition-transform"
                >
                  <Plus size={20} />
                  View Details & Add to Cart
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

      {/* Add to Cart Modal */}
      {selectedItem && (
        <AddToCartModal
          item={selectedItem}
          isOpen={showCartModal}
          onClose={() => {
            setShowCartModal(false)
            setSelectedItem(null)
          }}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  )
}



