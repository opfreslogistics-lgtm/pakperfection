'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Edit, Save, X, Eye, Upload, Image as ImageIcon, FileText } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

// Define actual images used on each page
const PAGE_IMAGES: Record<string, { field: string; label: string; type: 'single' | 'array'; count?: number }[]> = {
  home: [
    { field: 'hero_slider_images', label: 'Hero Slider Images (Exactly 3 images)', type: 'array', count: 3 },
    { field: 'about_story_image', label: 'Our Story Image', type: 'single' },
  ],
  about: [
    { field: 'hero_image', label: 'Hero Image', type: 'single' },
    { field: 'story_image', label: 'Our Story Image', type: 'single' },
    { field: 'mission_image', label: 'Mission Image', type: 'single' },
    { field: 'vision_image', label: 'Vision Image', type: 'single' },
    { field: 'team_gallery_images', label: 'Team Gallery Images', type: 'array' },
  ],
  menu: [
    { field: 'hero_image', label: 'Hero Image', type: 'single' },
  ],
  gallery: [
    { field: 'hero_image', label: 'Hero Image', type: 'single' },
  ],
  services: [
    { field: 'hero_image', label: 'Hero Image', type: 'single' },
  ],
  contact: [
    { field: 'hero_image', label: 'Hero Image', type: 'single' },
  ],
  reservation: [
    { field: 'hero_image', label: 'Hero Image', type: 'single' },
  ],
  team: [
    { field: 'hero_image', label: 'Hero Image', type: 'single' },
  ],
  events: [
    { field: 'hero_image', label: 'Hero Image', type: 'single' },
  ],
  'privacy-policy': [
    { field: 'hero_image', label: 'Hero Image', type: 'single' },
  ],
  terms: [
    { field: 'hero_image', label: 'Hero Image', type: 'single' },
  ],
}

const PAGE_LIST = [
  { slug: 'home', name: 'Home', icon: '🏠' },
  { slug: 'about', name: 'About', icon: '📖' },
  { slug: 'menu', name: 'Menu', icon: '🍽️' },
  { slug: 'gallery', name: 'Gallery', icon: '📸' },
  { slug: 'services', name: 'Services', icon: '🎯' },
  { slug: 'contact', name: 'Contact', icon: '📞' },
  { slug: 'reservation', name: 'Reservation', icon: '📅' },
  { slug: 'team', name: 'Team', icon: '👥' },
  { slug: 'events', name: 'Events', icon: '🎉' },
  { slug: 'privacy-policy', name: 'Privacy Policy', icon: '🔒' },
  { slug: 'terms', name: 'Terms of Service', icon: '📄' },
]

export default function PagesPage() {
  const [pages, setPages] = useState<any[]>([])
  const [editingPage, setEditingPage] = useState<string | null>(null)
  const [pageImages, setPageImages] = useState<Record<string, string | string[]>>({})
  const [uploading, setUploading] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadPages()
  }, [])

  useEffect(() => {
    if (editingPage) {
      loadPageImages()
    }
  }, [editingPage])

  const loadPages = async () => {
    const { data } = await supabase
      .from('page_content')
      .select('*')
      .order('page_name')

    if (data) {
      setPages(data)
    }
  }

  const loadPageImages = async () => {
    if (!editingPage) return

    const { data } = await supabase
      .from('page_content')
      .select('images')
      .eq('page_slug', editingPage)
      .maybeSingle()

    if (data?.images) {
      setPageImages(data.images)
    } else {
      // Initialize with empty values
      const initialImages: Record<string, string | string[]> = {}
      PAGE_IMAGES[editingPage]?.forEach((img) => {
        if (img.type === 'array') {
          initialImages[img.field] = []
        } else {
          initialImages[img.field] = ''
        }
      })
      setPageImages(initialImages)
    }
  }

  const handleFileUpload = async (file: File, field: string): Promise<string | null> => {
    try {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return null
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${editingPage}_${field}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `pages/${fileName}`

      setUploading(field)
      toast.loading('Uploading image...')

      const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

      if (uploadError) {
        toast.dismiss()
        toast.error('Failed to upload: ' + uploadError.message)
        setUploading(null)
        return null
      }

      const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath)
      toast.dismiss()
      toast.success('Image uploaded!')
      setUploading(null)
      return urlData.publicUrl
    } catch (error: any) {
      toast.dismiss()
      toast.error('Upload failed: ' + error.message)
      setUploading(null)
      return null
    }
  }

  const savePageImages = async () => {
    if (!editingPage) return

    try {
      // Validate hero slider images (must be exactly 3)
      if (editingPage === 'home') {
        const sliderImages = pageImages['hero_slider_images'] as string[] || []
        if (sliderImages.length !== 3) {
          toast.error('Hero Slider must have exactly 3 images. Please add or remove images to have exactly 3.')
          return
        }
        // Remove empty strings from array
        const validSliderImages = sliderImages.filter(img => img && img.trim() !== '')
        if (validSliderImages.length !== 3) {
          toast.error('Hero Slider must have exactly 3 valid images. Please upload all 3 images.')
          return
        }
        // Update with cleaned array
        pageImages['hero_slider_images'] = validSliderImages
      }

      const pageInfo = PAGE_LIST.find(p => p.slug === editingPage)
      
      const { error } = await supabase
        .from('page_content')
        .upsert({
          page_slug: editingPage,
          page_name: pageInfo?.name || editingPage,
          images: pageImages,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'page_slug'
        })

      if (error) {
        console.error('Save error:', error)
        throw error
      }
      
      toast.success('Images saved successfully!')
      setEditingPage(null)
      setPageImages({})
      loadPages()
    } catch (error: any) {
      console.error('Failed to save:', error)
      toast.error('Failed to save: ' + (error.message || 'Unknown error'))
    }
  }

  const updateImage = (field: string, value: string | string[]) => {
    setPageImages(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addImageToArray = (field: string) => {
    const current = (pageImages[field] as string[]) || []
    const imgConfig = editingPage ? PAGE_IMAGES[editingPage]?.find(img => img.field === field) : null
    const maxCount = imgConfig?.count || 10
    
    if (current.length >= maxCount) {
      toast.error(`Maximum ${maxCount} image${maxCount > 1 ? 's' : ''} allowed for ${imgConfig?.label || field}`)
      return
    }
    
    updateImage(field, [...current, ''])
  }

  const removeImageFromArray = (field: string, index: number) => {
    const current = (pageImages[field] as string[]) || []
    updateImage(field, current.filter((_, i) => i !== index))
  }

  const updateImageInArray = (field: string, index: number, url: string) => {
    const current = (pageImages[field] as string[]) || []
    const newArray = [...current]
    newArray[index] = url
    updateImage(field, newArray)
  }

  const renderImageField = (imgConfig: { field: string; label: string; type: 'single' | 'array'; count?: number }) => {
    const { field, label, type } = imgConfig
    const currentValue = pageImages[field]

    if (type === 'single') {
      const imageUrl = currentValue as string || ''
      return (
        <div key={field} className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
          <label className="block font-bold text-lg mb-4">{label}</label>
          {imageUrl && (
            <div className="mb-4 relative group">
              <div className="relative w-full h-64 rounded-lg overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={label}
                  fill
                  className="object-cover"
                />
              </div>
              <button
                onClick={() => updateImage(field, '')}
                className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <X size={20} />
              </button>
            </div>
          )}
          <label className={`flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-yellow-500 text-white px-6 py-3 rounded-lg cursor-pointer w-full hover:opacity-90 transition-opacity ${uploading === field ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <Upload size={20} />
            {uploading === field ? 'Uploading...' : (imageUrl ? 'Replace Image' : 'Upload Image')}
            <input
              type="file"
              accept="image/*"
              disabled={uploading === field}
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const url = await handleFileUpload(file, field)
                  if (url) updateImage(field, url)
                }
              }}
              className="hidden"
            />
          </label>
        </div>
      )
    }

    if (type === 'array') {
      const images = (currentValue as string[]) || []
      const maxCount = imgConfig.count || 10
      const isExactCount = imgConfig.count !== undefined
      
      return (
        <div key={field} className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <label className="block font-bold text-lg">{label}</label>
            {!isExactCount && images.length < maxCount && (
              <button
                onClick={() => addImageToArray(field)}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <ImageIcon size={18} />
                Add Image
              </button>
            )}
            {isExactCount && images.length < maxCount && (
              <button
                onClick={() => addImageToArray(field)}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <ImageIcon size={18} />
                Add Image ({images.length}/{maxCount})
              </button>
            )}
            {isExactCount && images.length === maxCount && (
              <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                ✓ {maxCount} images selected
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((url: string, index: number) => (
              <div key={index} className="relative group">
                <div className="relative w-full h-40 rounded-lg overflow-hidden">
                  <Image
                    src={url || '/placeholder.jpg'}
                    alt={`${label} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  onClick={() => removeImageFromArray(field, index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <X size={16} />
                </button>
                <label className={`absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${uploading === `${field}_${index}` ? 'opacity-50' : ''}`}>
                  <Upload size={12} className="inline mr-1" />
                  Replace
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploading === `${field}_${index}`}
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const newUrl = await handleFileUpload(file, `${field}_${index}`)
                        if (newUrl) updateImageInArray(field, index, newUrl)
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            ))}
            {images.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
                {isExactCount 
                  ? `Please add exactly ${maxCount} images. Click "Add Image" to get started.`
                  : 'No images added yet. Click "Add Image" to get started.'
                }
              </div>
            )}
            {isExactCount && images.length > 0 && images.length < maxCount && (
              <div className="col-span-full text-center py-4 text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="font-semibold">⚠️ You need {maxCount - images.length} more image{maxCount - images.length > 1 ? 's' : ''} to complete the slider.</p>
              </div>
            )}
          </div>
        </div>
      )
    }

    return null
  }

  const currentPageImages = editingPage ? PAGE_IMAGES[editingPage] || [] : []

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg">
            <FileText className="text-white" size={32} />
          </div>
          Pages Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Manage images for each page. Images will update on the frontend immediately after saving.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PAGE_LIST.map((page) => {
          const pageData = pages.find(p => p.page_slug === page.slug)
          const hasImages = pageData?.images && Object.keys(pageData.images).length > 0
          return (
            <div
              key={page.slug}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl bg-gradient-to-br from-red-50 to-yellow-50 dark:from-red-900/20 dark:to-yellow-900/20 p-3 rounded-xl">
                    {page.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{page.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">/{page.slug === 'home' ? '' : page.slug}</p>
                  </div>
                </div>
                {hasImages && (
                  <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                    Has Images
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    setEditingPage(page.slug)
                    await loadPageImages()
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-semibold"
                >
                  <Edit size={18} />
                  Edit Images
                </button>
                <Link
                  href={`/${page.slug === 'home' ? '' : page.slug}`}
                  target="_blank"
                  className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-3 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center"
                >
                  <Eye size={18} />
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit Modal */}
      {editingPage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeInUp">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto border-2 border-gray-200 dark:border-gray-700">
            <div className="sticky top-0 bg-gradient-to-r from-red-600 to-yellow-500 text-white p-6 rounded-t-2xl z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-1">
                    Edit Images - {PAGE_LIST.find(p => p.slug === editingPage)?.name} Page
                  </h2>
                  <p className="text-white/90 text-sm">Update images that appear on this page</p>
                </div>
                <button
                  onClick={() => {
                    setEditingPage(null)
                    setPageImages({})
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={28} className="text-white" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {currentPageImages.length > 0 ? (
                <div className="space-y-6">
                  {currentPageImages.map((imgConfig) => renderImageField(imgConfig))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No image fields defined for this page.
                </div>
              )}

              <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                <button
                  onClick={savePageImages}
                  className="flex-1 bg-gradient-to-r from-red-600 to-yellow-500 text-white py-4 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Save size={20} />
                  Save Images
                </button>
                <button
                  onClick={() => {
                    setEditingPage(null)
                    setPageImages({})
                  }}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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
