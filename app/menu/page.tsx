'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Navigation from '@/components/navigation-new'
import Footer from '@/components/footer'
import Image from 'next/image'
import { Plus, Search, Filter, Grid, List, ChevronLeft, ChevronRight, Star, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import AddToCartModal from '@/components/menu/add-to-cart-modal'

export default function MenuPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'carousel'>('grid')
  const [featuredItems, setFeaturedItems] = useState<any[]>([])
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showCartModal, setShowCartModal] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadMenuData()
  }, [])

  const loadMenuData = async () => {
    try {
      const [categoriesRes, itemsRes] = await Promise.all([
        supabase.from('menu_categories').select('*').order('order_index'),
        supabase.from('menu_items')
          .select(`
            *,
            modifiers:menu_modifiers(
              *,
              options:modifier_options(*)
            ),
            upsells:menu_upsells!menu_upsells_menu_item_id_fkey(
              *,
              suggested_item:menu_items!menu_upsells_suggested_item_id_fkey(*)
            )
          `)
          .eq('available', true)
          .order('order_index'),
      ])

      if (categoriesRes.error) {
        console.error('Error loading categories:', categoriesRes.error)
        toast.error('Failed to load categories')
      } else if (categoriesRes.data) {
        setCategories(categoriesRes.data || [])
      }

      if (itemsRes.error) {
        console.error('Error loading menu items:', itemsRes.error)
        toast.error('Failed to load menu items: ' + itemsRes.error.message)
        setMenuItems([])
        setFeaturedItems([])
      } else {
        const items = itemsRes.data || []
        console.log('Loaded menu items for frontend:', items.length)
        setMenuItems(items)
        setFeaturedItems(items.filter((item: any) => item.featured).slice(0, 6))
      }
    } catch (error: any) {
      console.error('Error in loadMenuData:', error)
      toast.error('Failed to load menu: ' + error.message)
    }
  }

  const handleAddToCartClick = (item: any) => {
    setSelectedItem(item)
    setShowCartModal(true)
  }

  const addToCart = (cartItem: any) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    
    // Create a unique key for this cart item based on item ID and selected modifiers
    const itemKey = `${cartItem.id}_${JSON.stringify(cartItem.selectedModifiers)}_${JSON.stringify(cartItem.selectedUpsells?.map((u: any) => u.id) || [])}`
    
    const existingItem = cart.find((i: any) => {
      const iKey = `${i.id}_${JSON.stringify(i.selectedModifiers || {})}_${JSON.stringify(i.selectedUpsells?.map((u: any) => u.id) || [])}`
      return iKey === itemKey
    })
    
    if (existingItem) {
      existingItem.quantity += cartItem.quantity
    } else {
      cart.push(cartItem)
    }
    
    localStorage.setItem('cart', JSON.stringify(cart))
    toast.success(`${cartItem.quantity} ${cartItem.quantity === 1 ? 'item' : 'items'} added to cart!`)
  }

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = !selectedCategory || item.category_id === selectedCategory
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const filteredCategories = categories.filter((cat) => {
    if (!selectedCategory && !searchQuery) return true
    return menuItems.some((item) => item.category_id === cat.id && 
      (!searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase())))
  })


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation branding={null} navSettings={null} theme={null} />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-yellow-500 text-white py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Our Menu</h1>
          <p className="text-xl opacity-90">Discover our delicious selection of authentic dishes</p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sticky top-24">
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search menu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="mb-6">
                <label className="block mb-2 font-semibold">View Mode</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 p-2 rounded-lg transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Grid size={20} className="mx-auto" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 p-2 rounded-lg transition-colors ${
                      viewMode === 'list'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <List size={20} className="mx-auto" />
                  </button>
                  <button
                    onClick={() => setViewMode('carousel')}
                    className={`flex-1 p-2 rounded-lg transition-colors ${
                      viewMode === 'carousel'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Filter size={20} className="mx-auto" />
                  </button>
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Filter size={20} />
                  Categories
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      !selectedCategory
                        ? 'bg-red-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    All Items
                  </button>
                  {filteredCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                        selectedCategory === category.id
                          ? 'bg-red-600 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Featured Items Carousel */}
            {featuredItems.length > 0 && (
              <div className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <Star className="text-yellow-500" size={32} />
                  Featured Dishes
                </h2>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {featuredItems.map((item) => (
                      <div
                        key={item.id}
                        className="group cursor-pointer"
                        onClick={() => handleAddToCartClick(item)}
                      >
                        <div className="relative w-full aspect-square rounded-full overflow-hidden border-4 border-red-600 shadow-xl mb-3 transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl group-hover:border-yellow-500">
                          <Image
                            src={item.image_url || 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400'}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="bg-gradient-to-r from-red-600 to-yellow-500 text-white p-4 rounded-full shadow-2xl transform group-hover:scale-110 transition-transform">
                              <Plus size={28} className="font-bold" />
                            </div>
                          </div>
                          <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                            <Star size={12} className="fill-black" />
                            Featured
                          </div>
                        </div>
                        <div className="text-center">
                          <h3 className="font-bold text-sm mb-1 group-hover:text-red-600 transition-colors">{item.name}</h3>
                          <p className="text-red-600 font-bold text-sm">{formatPrice(parseFloat(item.price))}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Menu Items */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">
                  {selectedCategory 
                    ? categories.find(c => c.id === selectedCategory)?.name || 'Menu Items'
                    : 'All Menu Items'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
                </p>
              </div>

              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all group"
                    >
                      <div className="relative h-48">
                        <Image
                          src={item.image_url || 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400'}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {item.featured && (
                          <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <Star size={12} className="fill-current" />
                            Featured
                          </div>
                        )}
                        <button
                          onClick={() => handleAddToCartClick(item)}
                          className="absolute bottom-3 right-3 bg-red-600 text-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-xl">{item.name}</h3>
                          <span className="text-2xl font-bold text-red-600">{formatPrice(parseFloat(item.price))}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{item.description}</p>
                        {item.dietary_labels && item.dietary_labels.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {item.dietary_labels.map((label: string, idx: number) => (
                              <span key={idx} className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                                {label}
                              </span>
                            ))}
                          </div>
                        )}
                        <button
                          onClick={() => handleAddToCartClick(item)}
                          className="w-full bg-gradient-to-r from-red-600 to-yellow-500 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        >
                          <Plus size={18} />
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className="space-y-4">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex gap-6 hover:shadow-xl transition-all group"
                    >
                      <div className="relative w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden">
                        <Image
                          src={item.image_url || 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400'}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-xl mb-1">{item.name}</h3>
                            {item.featured && (
                              <span className="inline-flex items-center gap-1 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
                                <Star size={12} className="fill-current" />
                                Featured
                              </span>
                            )}
                          </div>
                          <span className="text-2xl font-bold text-red-600">{formatPrice(parseFloat(item.price))}</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">{item.description}</p>
                        {item.dietary_labels && item.dietary_labels.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {item.dietary_labels.map((label: string, idx: number) => (
                              <span key={idx} className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                                {label}
                              </span>
                            ))}
                          </div>
                        )}
                        <button
                          onClick={() => handleAddToCartClick(item)}
                          className="bg-gradient-to-r from-red-600 to-yellow-500 text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
                        >
                          <Plus size={18} />
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Carousel View */}
              {viewMode === 'carousel' && (
                <MenuCarousel items={filteredItems} onAddToCartClick={handleAddToCartClick} />
              )}

              {filteredItems.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                  <p className="text-xl text-gray-600 dark:text-gray-400">No items found</p>
                  <p className="text-sm text-gray-500 mt-2">Try adjusting your search or category filter</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer footer={null} branding={null} theme={null} />

      {/* Add to Cart Modal */}
      {selectedItem && (
        <AddToCartModal
          item={selectedItem}
          isOpen={showCartModal}
          onClose={() => {
            setShowCartModal(false)
            setSelectedItem(null)
          }}
          onAddToCart={addToCart}
        />
      )}
    </div>
  )
}

// Carousel Component
function MenuCarousel({ items, onAddToCartClick }: { items: any[], onAddToCartClick: (item: any) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerView = 3

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + itemsPerView >= items.length ? 0 : prev + itemsPerView))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - itemsPerView < 0 ? Math.max(0, items.length - itemsPerView) : prev - itemsPerView))
  }

  if (items.length === 0) return null

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
        >
          {items.map((item) => (
            <div key={item.id} className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all group h-full">
                <div className="relative h-64">
                  <Image
                    src={item.image_url || 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400'}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {item.featured && (
                    <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      Featured
                    </div>
                  )}
                    <button
                      onClick={() => onAddToCartClick(item)}
                      className="absolute bottom-3 right-3 bg-red-600 text-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                    >
                      <Plus size={20} />
                    </button>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-red-600">{formatPrice(parseFloat(item.price))}</span>
                    <button
                      onClick={() => onAddToCartClick(item)}
                      className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {items.length > itemsPerView && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
    </div>
  )
}
