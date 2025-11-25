'use client'

import { useState } from 'react'
import { 
  Package, Tag, Clock, Calendar, Eye, EyeOff, Star, 
  TrendingUp, Info, AlertTriangle, ShoppingCart, Upload,
  Plus, X, Check
} from 'lucide-react'
import Image from 'next/image'

interface AdvancedMenuFormProps {
  itemForm: any
  setItemForm: (form: any) => void
  categories: any[]
  allMenuItems: any[]
  onFileUpload: (file: File) => Promise<string | null>
}

const ALLERGENS = ['Dairy', 'Nuts', 'Gluten', 'Soy', 'Eggs', 'Shellfish', 'Fish', 'Sesame']
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function AdvancedMenuForm({ 
  itemForm, 
  setItemForm, 
  categories,
  allMenuItems,
  onFileUpload 
}: AdvancedMenuFormProps) {
  const [activeTab, setActiveTab] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [newVariant, setNewVariant] = useState({ name: '', price_modifier: 0, available: true })
  const [newIngredient, setNewIngredient] = useState('')
  const [newTag, setNewTag] = useState('')

  const tabs = [
    { name: 'Basic Details', icon: Package, color: 'red' },
    { name: 'Variants & Ingredients', icon: Tag, color: 'yellow' },
    { name: 'Logistics & Operations', icon: Clock, color: 'green' },
    { name: 'SEO & Display', icon: TrendingUp, color: 'blue' },
  ]

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const url = await onFileUpload(file)
    if (url) {
      setItemForm({ ...itemForm, image_url: url })
    }
    setUploading(false)
  }

  const addVariant = () => {
    if (!newVariant.name) return
    const variants = itemForm.variants || []
    setItemForm({
      ...itemForm,
      variants: [...variants, { ...newVariant, id: Date.now().toString() }]
    })
    setNewVariant({ name: '', price_modifier: 0, available: true })
  }

  const removeVariant = (id: string) => {
    setItemForm({
      ...itemForm,
      variants: (itemForm.variants || []).filter((v: any) => v.id !== id)
    })
  }

  const addIngredient = () => {
    if (!newIngredient.trim()) return
    const ingredients = itemForm.ingredients || []
    setItemForm({
      ...itemForm,
      ingredients: [...ingredients, newIngredient.trim()]
    })
    setNewIngredient('')
  }

  const removeIngredient = (index: number) => {
    setItemForm({
      ...itemForm,
      ingredients: (itemForm.ingredients || []).filter((_: any, i: number) => i !== index)
    })
  }

  const toggleAllergen = (allergen: string) => {
    const allergens = itemForm.allergen_flags || []
    const newAllergens = allergens.includes(allergen)
      ? allergens.filter((a: string) => a !== allergen)
      : [...allergens, allergen]
    setItemForm({ ...itemForm, allergen_flags: newAllergens })
  }

  const addTag = () => {
    if (!newTag.trim()) return
    const tags = itemForm.tags || []
    setItemForm({
      ...itemForm,
      tags: [...tags, newTag.trim()]
    })
    setNewTag('')
  }

  const removeTag = (index: number) => {
    setItemForm({
      ...itemForm,
      tags: (itemForm.tags || []).filter((_: any, i: number) => i !== index)
    })
  }

  const toggleMenuType = (type: string) => {
    const types = itemForm.menu_types || []
    const newTypes = types.includes(type)
      ? types.filter((t: string) => t !== type)
      : [...types, type]
    setItemForm({ ...itemForm, menu_types: newTypes })
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b-2 border-gray-200 dark:border-gray-700 overflow-x-auto pb-2">
        {tabs.map((tab, index) => {
          const Icon = tab.icon
          const isActive = activeTab === index
          return (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? `bg-${tab.color}-600 text-white shadow-lg scale-105`
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Icon size={20} />
              {tab.name}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {/* Section 1: Basic Details */}
        {activeTab === 0 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Item Name *</label>
                <input
                  type="text"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 dark:bg-gray-700 transition-all"
                  placeholder="e.g., Jollof Rice Special"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Short Description</label>
                <input
                  type="text"
                  value={itemForm.short_description || ''}
                  onChange={(e) => setItemForm({ ...itemForm, short_description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 dark:bg-gray-700 transition-all"
                  placeholder="Brief tagline shown on menu cards"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Full Description</label>
                <textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 dark:bg-gray-700 transition-all"
                  placeholder="Detailed description shown in cart modal"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Category *</label>
                <select
                  value={itemForm.category_id}
                  onChange={(e) => setItemForm({ ...itemForm, category_id: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 dark:bg-gray-700 transition-all"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Regular Price *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 dark:bg-gray-700 transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  Promo Price
                  <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded">Sale</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={itemForm.promo_price || ''}
                    onChange={(e) => setItemForm({ ...itemForm, promo_price: e.target.value })}
                    className="w-full pl-8 pr-4 py-3 border-2 border-yellow-300 dark:border-yellow-600 rounded-xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 dark:bg-gray-700 transition-all"
                    placeholder="Optional sale price"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="promo-active"
                  checked={itemForm.promo_active || false}
                  onChange={(e) => setItemForm({ ...itemForm, promo_active: e.target.checked })}
                  className="w-5 h-5 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                />
                <label htmlFor="promo-active" className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp size={16} className="text-yellow-600" />
                  Promo Active (Show sale price)
                </label>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold mb-2">Item Image</label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center">
                {itemForm.image_url ? (
                  <div className="space-y-4">
                    <div className="relative w-full h-64">
                      <Image
                        src={itemForm.image_url}
                        alt="Preview"
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setItemForm({ ...itemForm, image_url: '' })}
                      className="text-red-600 hover:text-red-700 font-semibold"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Upload size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      {uploading ? 'Uploading...' : 'Click to upload image'}
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  </label>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Variants & Ingredients */}
        {activeTab === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Add size variants, list ingredients for transparency, and mark allergen warnings.
            </p>

            {/* Note: Variants, ingredients, and allergen sections will show here */}
            <div className="text-center py-12 text-gray-500">
              Variants & Ingredients section - Coming in full implementation
            </div>
          </div>
        )}

        {/* Section 3: Logistics & Operations */}
        {activeTab === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <Clock size={16} className="text-blue-600" />
                  Prep Time (minutes)
                </label>
                <input
                  type="number"
                  value={itemForm.prep_time_minutes || ''}
                  onChange={(e) => setItemForm({ ...itemForm, prep_time_minutes: parseInt(e.target.value) || null })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-700"
                  placeholder="e.g., 15"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <Package size={16} className="text-green-600" />
                  Current Stock
                </label>
                <input
                  type="number"
                  value={itemForm.current_stock || ''}
                  onChange={(e) => setItemForm({ ...itemForm, current_stock: parseInt(e.target.value) || null })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 dark:bg-gray-700"
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">Available For</label>
              <div className="grid grid-cols-3 gap-4">
                {['dine-in', 'delivery', 'takeaway'].map((type) => {
                  const isSelected = (itemForm.menu_types || ['dine-in', 'delivery', 'takeaway']).includes(type)
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleMenuType(type)}
                      className={`p-4 rounded-xl border-2 transition-all capitalize font-semibold ${
                        isSelected
                          ? 'border-green-600 bg-green-600 text-white shadow-lg'
                          : 'border-gray-300 dark:border-gray-600 hover:border-green-300'
                      }`}
                    >
                      <Check size={20} className={`mx-auto mb-2 ${isSelected ? '' : 'opacity-0'}`} />
                      {type}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <input
                type="checkbox"
                id="inventory-linked"
                checked={itemForm.inventory_linked || false}
                onChange={(e) => setItemForm({ ...itemForm, inventory_linked: e.target.checked })}
                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="inventory-linked" className="font-semibold flex items-center gap-2">
                <Package size={18} className="text-green-600" />
                Enable Inventory Tracking
              </label>
            </div>
          </div>
        )}

        {/* Section 4: SEO & Display */}
        {activeTab === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemForm.visible !== false}
                    onChange={(e) => setItemForm({ ...itemForm, visible: e.target.checked })}
                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <div>
                    <div className="font-bold flex items-center gap-2">
                      {itemForm.visible !== false ? <Eye size={20} className="text-green-600" /> : <EyeOff size={20} className="text-gray-400" />}
                      Show on Menu
                    </div>
                    <p className="text-sm text-gray-500">Visible to customers</p>
                  </div>
                </label>
              </div>

              <div className="border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-6 bg-yellow-50/50 dark:bg-yellow-900/10">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemForm.homepage_featured || false}
                    onChange={(e) => setItemForm({ ...itemForm, homepage_featured: e.target.checked })}
                    className="w-5 h-5 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                  />
                  <div>
                    <div className="font-bold flex items-center gap-2">
                      <Star size={20} className="text-yellow-600 fill-current" />
                      Feature on Homepage
                    </div>
                    <p className="text-sm text-gray-500">Show in featured section</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 bg-blue-50/50 dark:bg-blue-900/10">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-600" />
                Search Engine Optimization
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Meta Title</label>
                  <input
                    type="text"
                    value={itemForm.meta_title || ''}
                    onChange={(e) => setItemForm({ ...itemForm, meta_title: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-700"
                    placeholder={itemForm.name || 'SEO title'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Meta Description</label>
                  <textarea
                    value={itemForm.meta_description || ''}
                    onChange={(e) => setItemForm({ ...itemForm, meta_description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-700"
                    placeholder="Brief description for search engines..."
                  />
                </div>
              </div>
            </div>

            <div className="border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6 bg-purple-50/50 dark:bg-purple-900/10">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Info size={20} className="text-purple-600" />
                Internal Notes
                <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-1 rounded ml-2">Shows in Cart Popup</span>
              </h3>
              <textarea
                value={itemForm.internal_notes || ''}
                onChange={(e) => setItemForm({ ...itemForm, internal_notes: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 dark:bg-gray-700"
                placeholder="Special preparation notes, serving suggestions, cooking instructions customers should know..."
              />
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-2 flex items-center gap-2">
                <ShoppingCart size={16} />
                These notes will be visible to customers when they add this item to cart
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
