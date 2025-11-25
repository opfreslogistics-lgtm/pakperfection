'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ChefHat, Package } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import Navigation from '@/components/navigation-new'
import Footer from '@/components/footer'
import toast from 'react-hot-toast'

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    loadCart()
    
    // Listen for cart updates from other pages
    const handleStorageChange = () => {
      loadCart()
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const loadCart = () => {
    const storedCart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCart(storedCart)
  }

  const updateQuantity = (index: number, change: number) => {
    const updated = [...cart]
    const item = updated[index]
    const newQuantity = item.quantity + change
    if (newQuantity < 1) {
      removeItem(index)
      return
    }
    item.quantity = newQuantity
    // Recalculate total price
    if (item.totalPrice) {
      item.totalPrice = (item.totalPrice / item.quantity) * newQuantity
    } else {
      item.totalPrice = (parseFloat(item.price) || 0) * newQuantity
    }
    setCart(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
    toast.success('Cart updated')
  }

  const removeItem = (index: number) => {
    const updated = cart.filter((_, i) => i !== index)
    setCart(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
    toast.success('Item removed from cart')
  }

  // Calculate totals using cart items' totalPrice if available
  const subtotal = cart.reduce((sum, item) => {
    if (item.totalPrice) {
      return sum + item.totalPrice
    }
    return sum + (parseFloat(item.price) || 0) * (item.quantity || 1)
  }, 0)
  const tax = subtotal * 0.08
  const deliveryFee = 5.00
  const total = subtotal + tax + deliveryFee

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navigation branding={null} navSettings={null} theme={null} />
        <main className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12">
            <ShoppingBag size={80} className="mx-auto mb-6 text-gray-400" />
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent">
              Your cart is empty
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Add some delicious items to get started!
            </p>
            <button
              onClick={() => router.push('/menu')}
              className="bg-gradient-to-r from-red-600 to-yellow-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mx-auto shadow-lg"
            >
              <ChefHat size={24} />
              Browse Menu
            </button>
          </div>
        </main>
        <Footer footer={null} branding={null} theme={null} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation branding={null} navSettings={null} theme={null} />
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent">
            Shopping Cart
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <div
                key={`${item.id}_${index}`}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
              >
                <div className="p-6 flex flex-col md:flex-row gap-6">
                  {/* Item Image */}
                  {item.image_url && (
                    <div className="relative w-full md:w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden">
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Item Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-1">{item.name}</h3>
                        {item.short_description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {item.short_description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700 dark:hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    {/* Selected Modifiers with Quantities */}
                    {item.selectedModifiers && Object.keys(item.selectedModifiers).length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Customizations:</p>
                        <div className="space-y-2">
                          {Object.entries(item.selectedModifiers).map(([groupId, options]: [string, any]) => {
                            // Find modifier group
                            const modifierGroup = item.modifiers?.find((m: any) => m.id === groupId)
                            if (!modifierGroup || !options) return null
                            
                            return (
                              <div key={groupId} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                                <p className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-1">{modifierGroup.group_name}:</p>
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(options).map(([optionId, qty]: [string, any]) => {
                                    if (qty === 0) return null
                                    const option = modifierGroup.options?.find((o: any) => o.id === optionId)
                                    if (!option) return null
                                    
                                    return (
                                      <span
                                        key={optionId}
                                        className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full"
                                      >
                                        {option.name} × {qty}
                                        {parseFloat(option.price_modifier || 0) > 0 && (
                                          <span className="ml-1">(+{formatPrice(parseFloat(option.price_modifier) * qty)})</span>
                                        )}
                                      </span>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Selected Upsells with Quantities */}
                    {item.selectedUpsells && item.selectedUpsells.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Add-ons:</p>
                        <div className="space-y-2">
                          {item.selectedUpsells.map((upsell: any, idx: number) => {
                            const upsellQty = upsell.quantity || 1
                            return (
                              <div key={idx} className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                                  {upsell.name} × {upsellQty} (+{formatPrice(parseFloat(upsell.price) * upsellQty)})
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Special Requests */}
                    {item.specialRequests && (
                      <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Special Request:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{item.specialRequests}"</p>
                      </div>
                    )}

                    {/* Quantity and Price */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 rounded-xl p-2">
                        <button
                          onClick={() => updateQuantity(index, -1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <Minus size={18} />
                        </button>
                        <span className="text-lg font-bold w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(index, 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-red-600">
                          {formatPrice(item.totalPrice || (parseFloat(item.price) || 0) * (item.quantity || 1))}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-sm text-gray-500">
                            {formatPrice((item.totalPrice || (parseFloat(item.price) || 0) * (item.quantity || 1)) / item.quantity)} each
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Package size={24} className="text-red-600" />
                <h2 className="text-2xl font-bold">Order Summary</h2>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax (8%)</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(deliveryFee)}</span>
                </div>
                <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-4 flex justify-between text-2xl font-bold">
                  <span>Total</span>
                  <span className="text-red-600">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="w-full bg-gradient-to-r from-red-600 to-yellow-500 text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg"
              >
                Proceed to Checkout
                <ArrowRight size={24} />
              </button>

              <button
                onClick={() => router.push('/menu')}
                className="w-full mt-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer footer={null} branding={null} theme={null} />
    </div>
  )
}
