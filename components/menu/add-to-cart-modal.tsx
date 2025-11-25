'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, Plus, Minus, Star, Info, TrendingDown } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

interface AddToCartModalProps {
  item: any
  isOpen: boolean
  onClose: () => void
  onAddToCart: (cartItem: any) => void
}

export default function AddToCartModal({ item, isOpen, onClose, onAddToCart }: AddToCartModalProps) {
  // Store modifiers as { groupId: { optionId: quantity } }
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, Record<string, number>>>({})
  const [specialRequests, setSpecialRequests] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [selectedUpsells, setSelectedUpsells] = useState<Record<string, number>>({}) // { upsellId: quantity }

  if (!isOpen || !item) return null

  // Calculate total price (use promo price if active)
  const basePrice = (item.promo_active && item.promo_price && parseFloat(item.promo_price) < parseFloat(item.price))
    ? parseFloat(item.promo_price)
    : parseFloat(item.price) || 0
  let modifierPrice = 0
  
  // Calculate modifier prices (with quantities) - only if modifiers exist
  if (item.modifiers && item.modifiers.length > 0) {
    Object.entries(selectedModifiers).forEach(([groupId, options]) => {
      const modifierGroup = item.modifiers.find((m: any) => m.id === groupId)
      if (modifierGroup) {
        Object.entries(options).forEach(([optionId, qty]) => {
          const option = modifierGroup.options.find((o: any) => o.id === optionId)
          if (option && qty > 0) {
            modifierPrice += parseFloat(option.price_modifier || 0) * qty
          }
        })
      }
    })
  }

  // Calculate upsell prices (with quantities) - only if upsells exist
  let upsellPrice = 0
  if (item.upsells && item.upsells.length > 0) {
    item.upsells.forEach((upsell: any) => {
      const qty = selectedUpsells[upsell.id] || 0
      if (qty > 0) {
        upsellPrice += parseFloat(upsell.suggested_item?.price || 0) * qty
      }
    })
  }

  const itemTotal = (basePrice + modifierPrice + upsellPrice) * quantity
  const finalTotal = itemTotal

  const handleAddToCart = () => {
    // Validate required modifiers (only if modifiers exist and are not empty)
    if (item.modifiers && item.modifiers.length > 0) {
      const requiredModifiers = item.modifiers.filter((m: any) => m.is_required)
      for (const modifier of requiredModifiers) {
        const selected = selectedModifiers[modifier.id]
        if (!selected || Object.values(selected).reduce((sum, qty) => sum + qty, 0) === 0) {
          toast.error(`Please select at least one ${modifier.group_name}`)
          return
        }
      }
    }

    // Build selected upsells with quantities (only if upsells exist)
    const upsellsWithQty = (item.upsells && item.upsells.length > 0)
      ? item.upsells.filter((u: any) => selectedUpsells[u.id] > 0).map((u: any) => ({
          ...u.suggested_item,
          quantity: selectedUpsells[u.id]
        }))
      : []

    const cartItem = {
      ...item,
      quantity,
      selectedModifiers, // Now contains quantities
      specialRequests,
      selectedUpsells: upsellsWithQty,
      calculatedPrice: finalTotal / quantity, // Price per unit
      totalPrice: finalTotal,
    }

    onAddToCart(cartItem)
    onClose()
    // Reset form
    setSelectedModifiers({})
    setSpecialRequests('')
    setQuantity(1)
    setSelectedUpsells({})
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-yellow-500 text-white p-6 flex justify-between items-start z-10">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2">{item.name}</h2>
            {item.short_description && (
              <p className="text-lg opacity-90 mb-1">{item.short_description}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              {item.featured && (
                <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-bold">
                  <Star size={14} className="fill-current" />
                  Featured
                </span>
              )}
              {item.promo_active && item.promo_price && parseFloat(item.promo_price) < parseFloat(item.price) && (
                <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-bold">
                  <TrendingDown size={14} />
                  ON SALE - Save {formatPrice(parseFloat(item.price) - parseFloat(item.promo_price))}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors ml-4"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900/50">
          {/* Item Image - Larger and more prominent */}
          {item.image_url && (
            <div className="relative h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-700">
              <Image
                src={item.image_url}
                alt={item.name}
                fill
                className="object-cover"
                priority
              />
              {item.featured && (
                <div className="absolute top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                  <Star size={16} className="fill-current" />
                  Featured Item
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {item.description && (
            <div>
              <h3 className="font-semibold text-lg mb-2">What's in the Meal</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.description}</p>
            </div>
          )}

          {/* Internal Notes - Important Information from Staff */}
          {item.internal_notes && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-5">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <Info size={20} className="text-purple-600" />
                Important Information
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{item.internal_notes}</p>
            </div>
          )}

          {/* Required Customizations */}
          {item.modifiers && item.modifiers.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Customize Your Order</h3>
              {item.modifiers.map((modifier: any) => (
                <div key={modifier.id} className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-800 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                      {modifier.group_name}
                      {modifier.is_required && (
                        <span className="text-red-600 ml-2">*</span>
                      )}
                    </h3>
                    {modifier.is_required && (
                      <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded-full font-semibold">Required</span>
                    )}
                  </div>
                  <div className="space-y-3">
                    {modifier.options?.map((option: any) => {
                      const optionQty = selectedModifiers[modifier.id]?.[option.id] || 0
                      const isSelected = optionQty > 0
                      const priceModifier = parseFloat(option.price_modifier || 0)
                      const maxAllowed = modifier.max_selections || 10 // Allow up to 10 of same option
                      
                      return (
                        <div
                          key={option.id}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            isSelected
                              ? 'border-red-600 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 shadow-md'
                              : 'border-gray-300 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-1">
                              <span className="font-semibold text-gray-900 dark:text-white text-lg">{option.name}</span>
                              {priceModifier !== 0 && (
                                <span className={`ml-2 font-bold ${priceModifier > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                                  ({priceModifier > 0 ? '+' : ''}{formatPrice(priceModifier)})
                                </span>
                              )}
                            </div>
                            {isSelected && (
                              <span className="text-sm font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">
                                {optionQty} selected
                              </span>
                            )}
                          </div>
                          
                          {/* Quantity selector for this option */}
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                const current = selectedModifiers[modifier.id] || {}
                                const newQty = Math.max(0, (current[option.id] || 0) - 1)
                                if (newQty === 0) {
                                  const { [option.id]: removed, ...rest } = current
                                  if (Object.keys(rest).length === 0) {
                                    const { [modifier.id]: removedGroup, ...restGroups } = selectedModifiers
                                    setSelectedModifiers(restGroups)
                                  } else {
                                    setSelectedModifiers({
                                      ...selectedModifiers,
                                      [modifier.id]: rest
                                    })
                                  }
                                } else {
                                  setSelectedModifiers({
                                    ...selectedModifiers,
                                    [modifier.id]: {
                                      ...current,
                                      [option.id]: newQty
                                    }
                                  })
                                }
                              }}
                              className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={!isSelected}
                            >
                              <Minus size={18} />
                            </button>
                            <span className={`text-xl font-bold w-12 text-center ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                              {optionQty}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const current = selectedModifiers[modifier.id] || {}
                                const currentQty = current[option.id] || 0
                                const totalSelected = Object.values(current).reduce((sum, qty) => sum + qty, 0)
                                
                                // Check max selections limit
                                if (modifier.max_selections && totalSelected >= modifier.max_selections && currentQty === 0) {
                                  toast.error(`Maximum ${modifier.max_selections} selection${modifier.max_selections > 1 ? 's' : ''} allowed for ${modifier.group_name}`)
                                  return
                                }
                                
                                setSelectedModifiers({
                                  ...selectedModifiers,
                                  [modifier.id]: {
                                    ...current,
                                    [option.id]: currentQty + 1
                                  }
                                })
                              }}
                              className="w-10 h-10 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                            >
                              <Plus size={18} />
                            </button>
                            {isSelected && (
                              <span className="ml-auto text-sm font-semibold text-gray-600 dark:text-gray-400">
                                = {formatPrice(priceModifier * optionQty)}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Special Requests */}
          <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-800 shadow-sm">
            <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">Special Requests</h3>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Add special request (e.g., No onions, Extra spicy, Allergic to nuts)"
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
              rows={3}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 flex items-center gap-2">
              <span className="text-yellow-500">💡</span>
              We'll try our best to accommodate your requests
            </p>
          </div>

          {/* Goes Well With (Upsells) */}
          {item.upsells && item.upsells.length > 0 && (
            <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-800 shadow-sm">
              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Goes Well With</h3>
              <div className="space-y-3">
                {item.upsells.map((upsell: any) => {
                  const upsellQty = selectedUpsells[upsell.id] || 0
                  const isSelected = upsellQty > 0
                  const suggestedItem = upsell.suggested_item
                  if (!suggestedItem) return null

                  return (
                    <div
                      key={upsell.id}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-red-600 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 shadow-md'
                          : 'border-gray-300 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-700'
                      }`}
                    >
                      <div className="flex items-start gap-4 mb-3">
                        {suggestedItem.image_url && (
                          <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                            <Image
                              src={suggestedItem.image_url}
                              alt={suggestedItem.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-lg text-gray-900 dark:text-white">{suggestedItem.name}</h4>
                            <span className="font-bold text-xl text-red-600">{formatPrice(parseFloat(suggestedItem.price))}</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {upsell.description_override || suggestedItem.description}
                          </p>
                        </div>
                        {isSelected && (
                          <span className="text-sm font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">
                            {upsellQty} added
                          </span>
                        )}
                      </div>
                      
                      {/* Quantity selector for upsell */}
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            const newQty = Math.max(0, upsellQty - 1)
                            if (newQty === 0) {
                              const { [upsell.id]: removed, ...rest } = selectedUpsells
                              setSelectedUpsells(rest)
                            } else {
                              setSelectedUpsells({
                                ...selectedUpsells,
                                [upsell.id]: newQty
                              })
                            }
                          }}
                          className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!isSelected}
                        >
                          <Minus size={18} />
                        </button>
                        <span className={`text-xl font-bold w-12 text-center ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                          {upsellQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUpsells({
                              ...selectedUpsells,
                              [upsell.id]: (upsellQty || 0) + 1
                            })
                          }}
                          className="w-10 h-10 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                        >
                          <Plus size={18} />
                        </button>
                        {isSelected && (
                          <span className="ml-auto text-sm font-semibold text-gray-600 dark:text-gray-400">
                            = {formatPrice(parseFloat(suggestedItem.price) * upsellQty)}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Pay With Points (if user is logged in and has loyalty program) */}
          {/* This can be implemented later when loyalty program is added */}

          {/* Quantity Selector */}
          <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-800 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Quantity</h3>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center font-bold text-lg"
              >
                <Minus size={20} />
              </button>
              <span className="text-3xl font-bold w-16 text-center text-gray-900 dark:text-white">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center font-bold text-lg"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Total Price */}
          <div className="bg-gradient-to-r from-red-600 to-yellow-500 rounded-xl p-6 border-2 border-red-500 shadow-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xl font-bold text-white">Total</span>
              <span className="text-4xl font-bold text-white">{formatPrice(finalTotal)}</span>
            </div>
            {quantity > 1 && (
              <p className="text-sm text-white/90 text-right">
                {formatPrice(finalTotal / quantity)} each × {quantity}
              </p>
            )}
            {(modifierPrice > 0 || upsellPrice > 0) && (
              <div className="text-xs text-white/80 mt-2 space-y-1">
                <p>Base: {formatPrice(basePrice)}</p>
                {modifierPrice > 0 && <p>Modifiers: {formatPrice(modifierPrice)}</p>}
                {upsellPrice > 0 && <p>Add-ons: {formatPrice(upsellPrice)}</p>}
              </div>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-red-600 to-yellow-500 text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg"
          >
            <Plus size={24} />
            Add {quantity} {quantity === 1 ? 'Item' : 'Items'} to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

