'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, Upload, Star, CheckCircle, Package } from 'lucide-react'
import Image from 'next/image'
import ModifierEditor from '@/components/admin/modifier-editor'
import { formatPrice } from '@/lib/utils'

export default function MenuManagementPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', image_url: '' })
  const [currentTab, setCurrentTab] = useState(0) // Tab state for form
  const [itemForm, setItemForm] = useState({
    name: '',
    short_description: '',
    description: '',
    price: '',
    promo_price: '',
    promo_active: false,
    category_id: '',
    image_url: '',
    featured: false,
    available: true,
    dietary_labels: [] as string[],
    // Advanced fields
    variants: [] as any[],
    ingredients: [] as string[],
    allergen_flags: [] as string[],
    inventory_linked: false,
    current_stock: null as number | null,
    low_stock_threshold: 10,
    prep_time_minutes: null as number | null,
    availability_schedule: {} as any,
    menu_types: ['dine-in', 'delivery', 'takeaway'] as string[],
    visible: true,
    homepage_featured: false,
    meta_title: '',
    meta_description: '',
    internal_notes: '',
    tags: [] as string[],
  })
  const [modifiers, setModifiers] = useState<any[]>([])
  const [upsells, setUpsells] = useState<any[]>([])
  const [allMenuItems, setAllMenuItems] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
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
          .order('order_index'),
      ])

      if (categoriesRes.error) {
        console.error('Error loading categories:', categoriesRes.error)
        toast.error('Failed to load categories')
      } else if (categoriesRes.data) {
        setCategories(categoriesRes.data)
      }

      if (itemsRes.error) {
        console.error('Error loading items:', itemsRes.error)
        toast.error('Failed to load menu items: ' + itemsRes.error.message)
        setItems([])
        setAllMenuItems([])
      } else {
        const loadedItems = itemsRes.data || []
        console.log('Loaded menu items:', loadedItems.length)
        setItems(loadedItems)
        setAllMenuItems(loadedItems) // Store all items for upsell selection
      }
    } catch (error: any) {
      console.error('Error in loadData:', error)
      toast.error('Failed to load data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file: File, type: 'category' | 'item' = 'item') => {
    try {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return null
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid file type. Please upload an image (JPEG, PNG, GIF, or WebP)')
        return null
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${type}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${type}/${fileName}`

      toast.loading('Uploading image...')

      // Check if file already exists and delete it first
      const { data: existingFiles } = await supabase.storage.from('media').list(`${type}/`, {
        search: fileName
      })

      // Upload the file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        toast.dismiss()
        
        // Provide more specific error messages
        if (uploadError.message.includes('Bucket not found')) {
          toast.error('Storage bucket not configured. Please run the storage migration.')
        } else if (uploadError.message.includes('duplicate')) {
          toast.error('File already exists. Please try again.')
        } else if (uploadError.message.includes('JWT')) {
          toast.error('Authentication error. Please log in again.')
        } else {
          toast.error(`Upload failed: ${uploadError.message}`)
        }
        return null
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath)
      
      toast.dismiss()
      toast.success('Image uploaded successfully!')
      
      return urlData.publicUrl
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.dismiss()
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`)
      return null
    }
  }

  const saveCategory = async () => {
    if (!categoryForm.name) {
      toast.error('Category name is required')
      return
    }

    const data = editingCategory
      ? await supabase.from('menu_categories').update(categoryForm).eq('id', editingCategory.id)
      : await supabase.from('menu_categories').insert(categoryForm)

    if (data.error) {
      toast.error('Failed to save category')
    } else {
      toast.success('Category saved!')
      setShowCategoryModal(false)
      setCategoryForm({ name: '', description: '', image_url: '' })
      setEditingCategory(null)
      loadData()
    }
  }

  const saveItem = async () => {
    if (!itemForm.name || !itemForm.price || !itemForm.category_id) {
      toast.error('Please fill all required fields')
      return
    }

    setLoading(true)
    try {
      // Build itemData object - include all fields
      const itemData: any = {
        name: itemForm.name,
        description: itemForm.description || null,
        short_description: itemForm.short_description || null,
        price: parseFloat(itemForm.price),
        promo_price: itemForm.promo_price ? parseFloat(itemForm.promo_price) : null,
        promo_active: itemForm.promo_active || false,
        category_id: itemForm.category_id,
        image_url: itemForm.image_url || null,
        featured: itemForm.featured,
        available: itemForm.available,
        dietary_labels: itemForm.dietary_labels || [],
        // Advanced fields
        variants: itemForm.variants || [],
        ingredients: itemForm.ingredients || [],
        allergen_flags: itemForm.allergen_flags || [],
        inventory_linked: itemForm.inventory_linked || false,
        current_stock: itemForm.current_stock,
        low_stock_threshold: itemForm.low_stock_threshold || 10,
        prep_time_minutes: itemForm.prep_time_minutes,
        availability_schedule: itemForm.availability_schedule || {},
        menu_types: itemForm.menu_types || ['dine-in', 'delivery', 'takeaway'],
        visible: itemForm.visible !== false,
        homepage_featured: itemForm.homepage_featured || false,
        meta_title: itemForm.meta_title || null,
        meta_description: itemForm.meta_description || null,
        internal_notes: itemForm.internal_notes || null,
        tags: itemForm.tags || [],
      }

      let itemId: string
      
      // Try to save with short_description first
      if (editingItem) {
        const { data, error } = await supabase
          .from('menu_items')
          .update(itemData)
          .eq('id', editingItem.id)
          .select()
          .single()
        
        if (error) {
          // If error is about missing column, try without short_description
          if (error.message?.includes('short_description') || error.message?.includes('column')) {
            const { short_description, ...itemDataWithoutShortDesc } = itemData
            const { data: retryData, error: retryError } = await supabase
              .from('menu_items')
              .update(itemDataWithoutShortDesc)
              .eq('id', editingItem.id)
              .select()
              .single()
            
            if (retryError) throw retryError
            itemId = retryData.id
            toast.error('short_description column not found. Please run migration 007_add_short_description_to_menu_items.sql')
          } else {
            throw error
          }
        } else {
          itemId = data.id
        }
      } else {
        const { data, error } = await supabase
          .from('menu_items')
          .insert(itemData)
          .select()
          .single()
        
        if (error) {
          // If error is about missing column, try without short_description
          if (error.message?.includes('short_description') || error.message?.includes('column')) {
            const { short_description, ...itemDataWithoutShortDesc } = itemData
            const { data: retryData, error: retryError } = await supabase
              .from('menu_items')
              .insert(itemDataWithoutShortDesc)
              .select()
              .single()
            
            if (retryError) throw retryError
            itemId = retryData.id
            toast.error('short_description column not found. Please run migration 007_add_short_description_to_menu_items.sql')
          } else {
            throw error
          }
        } else {
          itemId = data.id
        }
      }

      // Save modifiers
      if (modifiers.length > 0) {
        // Delete existing modifiers
        if (editingItem) {
          await supabase.from('menu_modifiers').delete().eq('menu_item_id', itemId)
        }

        // Insert new modifiers
        for (const modifier of modifiers) {
          const { data: modifierData, error: modifierError } = await supabase
            .from('menu_modifiers')
            .insert({
              menu_item_id: itemId,
              group_name: modifier.group_name,
              is_required: modifier.is_required,
              min_selections: modifier.min_selections || 0,
              max_selections: modifier.max_selections || 1,
              order_index: modifier.order_index || 0,
            })
            .select()
            .single()

          if (modifierError) {
            console.error('Modifier error:', modifierError)
            continue
          }

          // Insert modifier options
          if (modifier.options && modifier.options.length > 0) {
            const optionsToInsert = modifier.options.map((opt: any) => ({
              modifier_id: modifierData.id,
              name: opt.name,
              price_modifier: parseFloat(opt.price_modifier || 0),
              is_default: opt.is_default || false,
              order_index: opt.order_index || 0,
            }))

            await supabase.from('modifier_options').insert(optionsToInsert)
          }
        }
      }

      // Save upsells
      if (upsells.length > 0) {
        // Delete existing upsells
        if (editingItem) {
          await supabase.from('menu_upsells').delete().eq('menu_item_id', itemId)
        }

        // Insert new upsells
        const upsellsToInsert = upsells.map((upsell: any) => ({
          menu_item_id: itemId,
          suggested_item_id: upsell.suggested_item_id,
          message: upsell.message || null,
          description_override: upsell.description_override || null,
          order_index: upsell.order_index || 0,
        }))

        await supabase.from('menu_upsells').insert(upsellsToInsert)
      }

      toast.success('Menu item saved!')
      setShowItemModal(false)
      setItemForm({
        name: '',
        short_description: '',
        description: '',
        price: '',
        promo_price: '',
        promo_active: false,
        category_id: '',
        image_url: '',
        featured: false,
        available: true,
        dietary_labels: [],
        variants: [],
        ingredients: [],
        allergen_flags: [],
        inventory_linked: false,
        current_stock: null,
        low_stock_threshold: 10,
        prep_time_minutes: null,
        availability_schedule: {},
        menu_types: ['dine-in', 'delivery', 'takeaway'],
        visible: true,
        homepage_featured: false,
        meta_title: '',
        meta_description: '',
        internal_notes: '',
        tags: [],
      })
      setModifiers([])
      setUpsells([])
      setEditingItem(null)
      setCurrentTab(0)
      
      // Reload data to show the new item
      console.log('Item saved, reloading data...')
      await loadData()
      console.log('Data reloaded')
      
      // Force a small delay to ensure UI updates
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
    } catch (error: any) {
      toast.error('Failed to save item: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteCategory = async (id: string) => {
    if (!confirm('Are you sure? This will delete all items in this category.')) return

    const { error } = await supabase.from('menu_categories').delete().eq('id', id)
    if (error) {
      toast.error('Failed to delete category')
    } else {
      toast.success('Category deleted!')
      loadData()
    }
  }

  const deleteItem = async (id: string) => {
    if (!confirm('Are you sure?')) return

    const { error } = await supabase.from('menu_items').delete().eq('id', id)
    if (error) {
      toast.error('Failed to delete item')
    } else {
      toast.success('Item deleted!')
      loadData()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">Menu Management</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Create and manage your menu categories and items</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={() => {
              setEditingCategory(null)
              setCategoryForm({ name: '', description: '', image_url: '' })
              setShowCategoryModal(true)
            }}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base font-semibold"
          >
            <Plus size={18} />
            Add Category
          </button>
          <button
            onClick={() => {
              setEditingItem(null)
              setItemForm({
                name: '',
                short_description: '',
                description: '',
                price: '',
                promo_price: '',
                promo_active: false,
                category_id: categories[0]?.id || '',
                image_url: '',
                featured: false,
                available: true,
                dietary_labels: [],
                variants: [],
                ingredients: [],
                allergen_flags: [],
                inventory_linked: false,
                current_stock: null,
                low_stock_threshold: 10,
                prep_time_minutes: null,
                availability_schedule: {},
                menu_types: ['dine-in', 'delivery', 'takeaway'],
                visible: true,
                homepage_featured: false,
                meta_title: '',
                meta_description: '',
                internal_notes: '',
                tags: [],
              })
              setCurrentTab(0)
              setModifiers([])
              setUpsells([])
              setEditingItem(null)
              setShowItemModal(true)
            }}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base font-semibold"
          >
            <Plus size={18} />
            Add Item
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border-2 border-blue-200 dark:border-blue-800 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl shadow-lg">
              <Package className="text-white" size={20} />
            </div>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Total Items</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{items.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border-2 border-green-200 dark:border-green-800 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl shadow-lg">
              <Star className="text-white" size={20} />
            </div>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Featured Items</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{items.filter(i => i.featured).length}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border-2 border-purple-200 dark:border-purple-800 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-xl shadow-lg">
              <Upload className="text-white" size={20} />
            </div>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Categories</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{categories.length}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border-2 border-orange-200 dark:border-orange-800 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg sm:rounded-xl shadow-lg">
              <CheckCircle className="text-white" size={20} />
            </div>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Available</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{items.filter(i => i.available).length}</p>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Categories</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Organize your menu into categories</p>
          </div>
          <button
            onClick={() => {
              setEditingCategory(null)
              setCategoryForm({ name: '', description: '', image_url: '' })
              setShowCategoryModal(true)
            }}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base font-semibold"
          >
            <Plus size={18} />
            Add Category
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all group">
              <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                {category.image_url ? (
                  <Image
                    src={category.image_url}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Upload size={48} />
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-white">{category.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{category.description || 'No description'}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingCategory(category)
                      setCategoryForm({
                        name: category.name,
                        description: category.description || '',
                        image_url: category.image_url || '',
                      })
                      setShowCategoryModal(true)
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCategory(category.id)}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Menu Items</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage all your menu items and their details</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 sm:px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
              {items.length} {items.length === 1 ? 'item' : 'items'} total
            </div>
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg sm:rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all shadow-md hover:shadow-lg text-xs sm:text-sm font-semibold"
            >
              <Upload size={14} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
        
        {loading && items.length === 0 && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p>Loading menu items...</p>
          </div>
        )}
        
        {!loading && items.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">No menu items yet</p>
            <p className="text-sm text-gray-500 mb-4">Click "Add Item" to create your first menu item</p>
          </div>
        )}
        
        {/* Group items by category */}
        {!loading && items.length > 0 && categories.length > 0 && categories.map((category) => {
          const categoryItems = items.filter((item) => item.category_id === category.id)
          if (categoryItems.length === 0) return null
          
          return (
            <div key={category.id} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                {category.image_url && (
                  <Image
                    src={category.image_url}
                    alt={category.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 object-cover rounded-lg"
                  />
                )}
                <h3 className="text-xl font-bold">{category.name}</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({categoryItems.length} {categoryItems.length === 1 ? 'item' : 'items'})
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all group"
                  >
                    <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Upload size={48} />
                        </div>
                      )}
                      {item.featured && (
                        <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <Star size={12} className="fill-current" />
                          Featured
                        </div>
                      )}
                      {!item.available && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          Unavailable
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg line-clamp-1">{item.name}</h3>
                        <span className="text-xl font-bold text-red-600 whitespace-nowrap ml-2">
                          ${parseFloat(item.price).toFixed(2)}
                        </span>
                      </div>
                      
                      {item.short_description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                          {item.short_description}
                        </p>
                      )}
                      
                      <p className="text-sm text-gray-500 dark:text-gray-500 mb-3 line-clamp-2">
                        {item.description}
                      </p>
                      
                      {/* Show modifiers and upsells count */}
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {item.modifiers && item.modifiers.length > 0 && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                            {item.modifiers.length} {item.modifiers.length === 1 ? 'modifier' : 'modifiers'}
                          </span>
                        )}
                        {item.upsells && item.upsells.length > 0 && (
                          <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                            {item.upsells.length} {item.upsells.length === 1 ? 'upsell' : 'upsells'}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            setEditingItem(item)
                            setItemForm({
                              name: item.name,
                              short_description: item.short_description || '',
                              description: item.description || '',
                              price: item.price.toString(),
                              promo_price: item.promo_price ? item.promo_price.toString() : '',
                              promo_active: item.promo_active || false,
                              category_id: item.category_id,
                              image_url: item.image_url || '',
                              featured: item.featured,
                              available: item.available,
                              dietary_labels: item.dietary_labels || [],
                              variants: item.variants || [],
                              ingredients: item.ingredients || [],
                              allergen_flags: item.allergen_flags || [],
                              inventory_linked: item.inventory_linked || false,
                              current_stock: item.current_stock,
                              low_stock_threshold: item.low_stock_threshold || 10,
                              prep_time_minutes: item.prep_time_minutes,
                              availability_schedule: item.availability_schedule || {},
                              menu_types: item.menu_types || ['dine-in', 'delivery', 'takeaway'],
                              visible: item.visible !== false,
                              homepage_featured: item.homepage_featured || false,
                              meta_title: item.meta_title || '',
                              meta_description: item.meta_description || '',
                              internal_notes: item.internal_notes || '',
                              tags: item.tags || [],
                            })
                            
                            setCurrentTab(0)
                            // Load modifiers and upsells
                            if (item.modifiers) {
                              setModifiers(item.modifiers)
                            } else {
                              setModifiers([])
                            }
                            
                            if (item.upsells) {
                              setUpsells(item.upsells.map((u: any) => ({
                                suggested_item_id: u.suggested_item_id,
                                message: u.message || '',
                                description_override: u.description_override || '',
                                order_index: u.order_index || 0,
                              })))
                            } else {
                              setUpsells([])
                            }
                            
                            setShowItemModal(true)
                          }}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-red-600 hover:to-red-700 transition-all flex items-center justify-center"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
        
        {/* Items without category */}
        {!loading && items.filter((item) => !item.category_id).length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">Uncategorized Items</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.filter((item) => !item.category_id).map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all group"
                >
                  <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Upload size={48} />
                      </div>
                    )}
                    {item.featured && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        Featured
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{item.name}</h3>
                    <p className="text-sm opacity-70 mb-2 line-clamp-2">{item.description}</p>
                    <p className="font-bold text-red-600 mb-4">${parseFloat(item.price).toFixed(2)}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          setEditingItem(item)
                          setItemForm({
                            name: item.name,
                            short_description: item.short_description || '',
                            description: item.description || '',
                            price: item.price.toString(),
                            promo_price: item.promo_price ? item.promo_price.toString() : '',
                            promo_active: item.promo_active || false,
                            category_id: item.category_id,
                            image_url: item.image_url || '',
                            featured: item.featured,
                            available: item.available,
                            dietary_labels: item.dietary_labels || [],
                            variants: item.variants || [],
                            ingredients: item.ingredients || [],
                            allergen_flags: item.allergen_flags || [],
                            inventory_linked: item.inventory_linked || false,
                            current_stock: item.current_stock,
                            low_stock_threshold: item.low_stock_threshold || 10,
                            prep_time_minutes: item.prep_time_minutes,
                            availability_schedule: item.availability_schedule || {},
                            menu_types: item.menu_types || ['dine-in', 'delivery', 'takeaway'],
                            visible: item.visible !== false,
                            homepage_featured: item.homepage_featured || false,
                            meta_title: item.meta_title || '',
                            meta_description: item.meta_description || '',
                            internal_notes: item.internal_notes || '',
                            tags: item.tags || [],
                          })
                          setCurrentTab(0)
                          setModifiers(item.modifiers || [])
                          setUpsells(item.upsells?.map((u: any) => ({
                            suggested_item_id: u.suggested_item_id,
                            message: u.message || '',
                            description_override: u.description_override || '',
                            order_index: u.order_index || 0,
                          })) || [])
                          setEditingItem(item)
                          setShowItemModal(true)
                        }}
                        className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="flex-1 bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Category Name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
              />
              <textarea
                placeholder="Description"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                rows={3}
              />
              {categoryForm.image_url && (
                <Image
                  src={categoryForm.image_url}
                  alt="Category"
                  width={200}
                  height={150}
                  className="w-full h-32 object-cover rounded mb-2"
                />
              )}
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const url = await handleFileUpload(file, 'category')
                    if (url) setCategoryForm({ ...categoryForm, image_url: url })
                  }
                }}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
              />
              <div className="flex gap-4">
                <button
                  onClick={saveCategory}
                  className="flex-1 bg-primary text-secondary py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowCategoryModal(false)
                    setEditingCategory(null)
                    setCategoryForm({ name: '', description: '', image_url: '' })
                  }}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b p-4 sm:p-6 z-10">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
            </div>
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6">
              <div className="flex gap-1 sm:gap-2 overflow-x-auto">
                {['Basic Info', 'Pricing & Tags', 'Modifiers', 'Upsells'].map((tab, index) => (
                  <button
                    key={tab}
                    onClick={() => setCurrentTab(index)}
                    className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap border-b-2 ${
                      currentTab === index
                        ? 'border-red-600 text-red-600'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-red-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* TAB 0: Basic Info */}
              {currentTab === 0 && (
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 font-semibold">Item Name *</label>
                    <input
                      type="text"
                      placeholder="e.g., Chicken Curry"
                      value={itemForm.name}
                      onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-semibold">Short Description</label>
                    <input
                      type="text"
                      placeholder="e.g., (Choose Goat or Beef)"
                      value={itemForm.short_description}
                      onChange={(e) => setItemForm({ ...itemForm, short_description: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-semibold">Full Description</label>
                    <textarea
                      placeholder="Describe the dish..."
                      value={itemForm.description}
                      onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-semibold">Category *</label>
                    <select
                      value={itemForm.category_id}
                      onChange={(e) => setItemForm({ ...itemForm, category_id: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 font-semibold">Image</label>
                    {itemForm.image_url && (
                      <Image
                        src={itemForm.image_url}
                        alt="Item"
                        width={200}
                        height={150}
                        className="w-full h-48 object-cover rounded-lg mb-3"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const url = await handleFileUpload(file, 'item')
                          if (url) setItemForm({ ...itemForm, image_url: url })
                        }
                      }}
                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-red-500 transition-colors">
                      <input
                        type="checkbox"
                        checked={itemForm.featured}
                        onChange={(e) => setItemForm({ ...itemForm, featured: e.target.checked })}
                        className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600"
                      />
                      <span className="font-semibold">Featured</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-red-500 transition-colors">
                      <input
                        type="checkbox"
                        checked={itemForm.available}
                        onChange={(e) => setItemForm({ ...itemForm, available: e.target.checked })}
                        className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600"
                      />
                      <span className="font-semibold">Available</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-red-500 transition-colors">
                      <input
                        type="checkbox"
                        checked={itemForm.visible}
                        onChange={(e) => setItemForm({ ...itemForm, visible: e.target.checked })}
                        className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600"
                      />
                      <span className="font-semibold">Visible</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-red-500 transition-colors">
                      <input
                        type="checkbox"
                        checked={itemForm.homepage_featured}
                        onChange={(e) => setItemForm({ ...itemForm, homepage_featured: e.target.checked })}
                        className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600"
                      />
                      <span className="font-semibold">Homepage Featured</span>
                    </label>
                  </div>

                  <div>
                    <label className="block mb-2 font-semibold">Internal Notes (Shows in cart)</label>
                    <textarea
                      placeholder="Important information for customers when adding to cart..."
                      value={itemForm.internal_notes}
                      onChange={(e) => setItemForm({ ...itemForm, internal_notes: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* TAB 1: Pricing & Tags */}
              {currentTab === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 font-semibold">Regular Price *</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={itemForm.price}
                        onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 font-semibold">Promo Price</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={itemForm.promo_price}
                        onChange={(e) => setItemForm({ ...itemForm, promo_price: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-red-500 transition-colors">
                    <input
                      type="checkbox"
                      checked={itemForm.promo_active}
                      onChange={(e) => setItemForm({ ...itemForm, promo_active: e.target.checked })}
                      className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600"
                    />
                    <span className="font-semibold">Promo Active</span>
                  </label>

                  <div>
                    <label className="block mb-2 font-semibold">Tags (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g., spicy, vegan, popular, chef-special"
                      value={itemForm.tags.join(', ')}
                      onChange={(e) => setItemForm({ ...itemForm, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-semibold">Allergen Flags</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Dairy', 'Nuts', 'Gluten', 'Soy', 'Eggs', 'Shellfish', 'Fish', 'Wheat'].map(allergen => (
                        <label key={allergen} className="flex items-center gap-2 cursor-pointer p-2 border border-gray-300 dark:border-gray-600 rounded hover:border-red-500 transition-colors">
                          <input
                            type="checkbox"
                            checked={itemForm.allergen_flags.includes(allergen)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setItemForm({ ...itemForm, allergen_flags: [...itemForm.allergen_flags, allergen] })
                              } else {
                                setItemForm({ ...itemForm, allergen_flags: itemForm.allergen_flags.filter(a => a !== allergen) })
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{allergen}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 font-semibold">Ingredients (comma-separated)</label>
                    <textarea
                      placeholder="e.g., chicken, rice, tomatoes, onions, spices"
                      value={itemForm.ingredients.join(', ')}
                      onChange={(e) => setItemForm({ ...itemForm, ingredients: e.target.value.split(',').map(i => i.trim()).filter(Boolean) })}
                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 font-semibold">Prep Time (minutes)</label>
                      <input
                        type="number"
                        placeholder="15"
                        value={itemForm.prep_time_minutes || ''}
                        onChange={(e) => setItemForm({ ...itemForm, prep_time_minutes: e.target.value ? parseInt(e.target.value) : null })}
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 font-semibold">Current Stock</label>
                      <input
                        type="number"
                        placeholder="100"
                        value={itemForm.current_stock || ''}
                        onChange={(e) => setItemForm({ ...itemForm, current_stock: e.target.value ? parseInt(e.target.value) : null })}
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 font-semibold">Menu Types</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['dine-in', 'delivery', 'takeaway'].map(type => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer p-2 border border-gray-300 dark:border-gray-600 rounded hover:border-red-500 transition-colors">
                          <input
                            type="checkbox"
                            checked={itemForm.menu_types.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setItemForm({ ...itemForm, menu_types: [...itemForm.menu_types, type] })
                              } else {
                                setItemForm({ ...itemForm, menu_types: itemForm.menu_types.filter(t => t !== type) })
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm capitalize">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Modifiers */}
              {currentTab === 2 && (
                <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Required Customizations (Modifiers)</h3>
                    <button
                      type="button"
                      onClick={() => setModifiers([...modifiers, {
                        id: Date.now().toString(),
                        group_name: '',
                        is_required: true,
                        min_selections: 0,
                        max_selections: 1,
                        order_index: modifiers.length,
                        options: []
                      }])}
                      className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Plus size={16} />
                      Add Modifier
                    </button>
                  </div>
                  <div className="space-y-3">
                    {modifiers.map((modifier, modIndex) => (
                      <ModifierEditor
                        key={modifier.id || modIndex}
                        modifier={modifier}
                        onUpdate={(updated) => {
                          const newModifiers = [...modifiers]
                          newModifiers[modIndex] = updated
                          setModifiers(newModifiers)
                        }}
                        onDelete={() => {
                          setModifiers(modifiers.filter((_, i) => i !== modIndex))
                        }}
                      />
                    ))}
                    {modifiers.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No modifiers added. Click "Add Modifier" to create customization options.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: Upsells */}
              {currentTab === 3 && (
                <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Recommended Add-Ons (Goes Well With)</h3>
                    <button
                      type="button"
                      onClick={() => setUpsells([...upsells, {
                        suggested_item_id: '',
                        message: '',
                        description_override: '',
                        order_index: upsells.length
                      }])}
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Plus size={16} />
                      Add Upsell
                    </button>
                  </div>
                  <div className="space-y-3">
                    {upsells.map((upsell, upsellIndex) => (
                      <div key={upsellIndex} className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-900/50">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold">Upsell {upsellIndex + 1}</h4>
                          <button
                            type="button"
                            onClick={() => setUpsells(upsells.filter((_, i) => i !== upsellIndex))}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <label className="block mb-1 text-sm font-semibold">Suggested Item *</label>
                            <select
                              value={upsell.suggested_item_id}
                              onChange={(e) => {
                                const newUpsells = [...upsells]
                                newUpsells[upsellIndex].suggested_item_id = e.target.value
                                setUpsells(newUpsells)
                              }}
                              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            >
                              <option value="">Select Menu Item</option>
                              {allMenuItems.filter(item => item.id !== editingItem?.id).map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name} - {formatPrice(parseFloat(item.price))}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block mb-1 text-sm font-semibold">Description Override</label>
                            <textarea
                              placeholder="e.g., Delicious ripe fried plantain on the go"
                              value={upsell.description_override}
                              onChange={(e) => {
                                const newUpsells = [...upsells]
                                newUpsells[upsellIndex].description_override = e.target.value
                                setUpsells(newUpsells)
                              }}
                              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {upsells.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No upsells added. Click "Add Upsell" to suggest items that go well with this dish.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={saveItem}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-red-600 to-yellow-500 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Menu Item'}
                </button>
                <button
                  onClick={() => {
                    setShowItemModal(false)
                    setEditingItem(null)
                    setItemForm({
                      name: '',
                      short_description: '',
                      description: '',
                      price: '',
                      promo_price: '',
                      promo_active: false,
                      category_id: '',
                      image_url: '',
                      featured: false,
                      available: true,
                      dietary_labels: [],
                      variants: [],
                      ingredients: [],
                      allergen_flags: [],
                      inventory_linked: false,
                      current_stock: null,
                      low_stock_threshold: 10,
                      prep_time_minutes: null,
                      availability_schedule: {},
                      menu_types: ['dine-in', 'delivery', 'takeaway'],
                      visible: true,
                      homepage_featured: false,
                      meta_title: '',
                      meta_description: '',
                      internal_notes: '',
                      tags: [],
                    })
                    setModifiers([])
                    setUpsells([])
                    setCurrentTab(0)
                    setShowItemModal(false)
                  }}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
