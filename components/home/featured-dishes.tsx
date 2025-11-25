'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'
import AddToCartModal from '@/components/menu/add-to-cart-modal'

export default function FeaturedDishes() {
  const [dishes, setDishes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showCartModal, setShowCartModal] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadFeaturedDishes()
  }, [])

  const loadFeaturedDishes = async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select(`
        *,
        modifiers:menu_modifiers!menu_modifiers_menu_item_id_fkey(
          *,
          options:modifier_options(*)
        ),
        upsells:menu_upsells!menu_upsells_menu_item_id_fkey(
          *,
          suggested_item:menu_items!menu_upsells_suggested_item_id_fkey(*)
        )
      `)
      .eq('featured', true)
      .eq('available', true)
      .limit(6)
      .order('order_index')

    if (data) {
      setDishes(data)
    }
    setLoading(false)
  }

  const handleAddToCartClick = (dish: any) => {
    setSelectedItem(dish)
    setShowCartModal(true)
  }

  const handleAddToCart = (cartItem: any) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    cart.push(cartItem)
    localStorage.setItem('cart', JSON.stringify(cart))
    toast.success(`${cartItem.name} added to cart!`)
  }

  if (loading) {
    return (
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Featured Dishes</h2>
            <p className="text-lg opacity-70">Loading...</p>
          </div>
        </div>
      </section>
    )
  }

  if (dishes.length === 0) {
    return null // Don't show section if no featured dishes
  }

  return (
    <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 bg-gradient-to-r from-red-600 to-yellow-500 text-white text-sm font-bold rounded-full mb-4">
            ⭐ CUSTOMER FAVORITES
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">Featured Dishes</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Our most popular and beloved dishes, handpicked for you
          </p>
        </div>

        {/* Green Background Container - Only for dishes */}
        <div className="relative py-12 px-4 mb-8 overflow-hidden rounded-3xl">
          {/* Deep Green Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-700 via-green-600 to-emerald-600"></div>
          
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>

          {/* Dishes Grid - Relative positioning */}
          <div className="relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {dishes.map((dish) => (
            <div
              key={dish.id}
              className="group cursor-pointer"
              onClick={() => handleAddToCartClick(dish)}
            >
              <div className="relative w-full aspect-square rounded-full overflow-hidden border-4 border-white shadow-2xl mb-3 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_20px_50px_rgba(255,255,255,0.3)] group-hover:border-yellow-400">
                {dish.image_url ? (
                  <Image
                    src={dish.image_url}
                    alt={dish.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-600 to-yellow-500 flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">{dish.name.charAt(0)}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-gradient-to-r from-red-600 to-yellow-500 text-white p-4 rounded-full shadow-2xl transform group-hover:scale-110 transition-transform">
                    <Plus size={28} className="font-bold" />
                  </div>
                </div>
                {/* Centered Featured Badge */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="bg-yellow-400/95 backdrop-blur-sm text-black px-4 py-2 rounded-full text-sm font-black flex items-center gap-2 shadow-2xl border-2 border-white">
                    <Star size={16} className="fill-black" />
                    FEATURED
                  </div>
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-bold text-sm md:text-base mb-1 text-white group-hover:text-yellow-300 transition-colors drop-shadow">{dish.name}</h3>
                <p className="text-yellow-300 font-bold text-sm md:text-base drop-shadow">{formatPrice(parseFloat(dish.price))}</p>
              </div>
            </div>
          ))}
          </div>
        </div>
        </div>

        {/* View Full Menu Button - Outside green background */}
        {dishes.length > 0 && (
          <div className="text-center mt-8">
            <Link
              href="/menu"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-red-600 to-yellow-500 text-white px-10 py-4 rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-xl group"
            >
              <span>View Full Menu</span>
              <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
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
    </section>
  )
}
