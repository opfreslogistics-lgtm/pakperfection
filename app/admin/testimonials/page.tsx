'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, Save, X, Upload, Star, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    text: '',
    rating: 5,
    position: 'Verified Customer',
    profile_image_url: '',
    order_index: 0,
    featured: true
  })
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadTestimonials()
  }, [])

  const loadTestimonials = async () => {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('order_index', { ascending: true })

    if (data) {
      setTestimonials(data)
    }
    setLoading(false)
  }

  const handleFileUpload = async (file: File): Promise<string | null> => {
    try {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB')
        return null
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `testimonials_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `testimonials/${fileName}`

      setUploading(true)
      toast.loading('Uploading image...')

      const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

      if (uploadError) {
        toast.dismiss()
        toast.error('Failed to upload: ' + uploadError.message)
        setUploading(false)
        return null
      }

      const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath)
      toast.dismiss()
      toast.success('Image uploaded!')
      setUploading(false)
      return urlData.publicUrl
    } catch (error: any) {
      toast.dismiss()
      toast.error('Upload failed: ' + error.message)
      setUploading(false)
      return null
    }
  }

  const handleEdit = (testimonial: any) => {
    setEditingId(testimonial.id)
    setFormData({
      name: testimonial.name,
      text: testimonial.text,
      rating: testimonial.rating,
      position: testimonial.position || 'Verified Customer',
      profile_image_url: testimonial.profile_image_url || '',
      order_index: testimonial.order_index || 0,
      featured: testimonial.featured || false
    })
    setShowAddForm(false)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.text) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('testimonials')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId)

        if (error) throw error
        toast.success('Testimonial updated!')
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert({
            ...formData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (error) throw error
        toast.success('Testimonial added!')
      }

      setEditingId(null)
      setShowAddForm(false)
      setFormData({
        name: '',
        text: '',
        rating: 5,
        position: 'Verified Customer',
        profile_image_url: '',
        order_index: 0,
        featured: true
      })
      loadTestimonials()
    } catch (error: any) {
      toast.error('Failed to save: ' + error.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return

    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Testimonial deleted!')
      loadTestimonials()
    } catch (error: any) {
      toast.error('Failed to delete: ' + error.message)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setShowAddForm(false)
    setFormData({
      name: '',
      text: '',
      rating: 5,
      position: 'Verified Customer',
      profile_image_url: '',
      order_index: 0,
      featured: true
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p>Loading testimonials...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg">
              <Star className="text-white" size={32} />
            </div>
            Testimonials Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Manage customer testimonials and reviews</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true)
            setEditingId(null)
            setFormData({
              name: '',
              text: '',
              rating: 5,
              position: 'Verified Customer',
              profile_image_url: '',
              order_index: testimonials.length,
              featured: true
            })
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-yellow-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all shadow-lg"
        >
          <Plus size={20} />
          Add Testimonial
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-2xl shadow-lg p-6 border-2 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg">
              <Star className="text-white" size={28} />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Total Testimonials</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{testimonials.length}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl shadow-lg p-6 border-2 border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
              <Star className="text-white fill-white" size={28} />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Featured</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{testimonials.filter(t => t.featured).length}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-2xl shadow-lg p-6 border-2 border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
              <ImageIcon className="text-white" size={28} />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">With Images</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{testimonials.filter(t => t.profile_image_url).length}</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6 shadow-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
          <strong>Note:</strong> Featured testimonials will appear on the homepage. Maximum 3 featured testimonials are displayed.
        </p>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border-2 border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Star className="text-red-600 dark:text-red-400" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {editingId ? 'Edit Testimonial' : 'Add New Testimonial'}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Customer Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                placeholder="Sarah Johnson"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Position/Title</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                placeholder="Verified Customer"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Review Text *</label>
              <textarea
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                rows={4}
                placeholder="Absolutely amazing food! The flavors are authentic..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Rating (1-5)</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating })}
                    className={`p-2 rounded transition-colors ${
                      formData.rating >= rating
                        ? 'text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  >
                    <Star
                      size={24}
                      className={formData.rating >= rating ? 'fill-current' : ''}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  {formData.rating} / 5
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Order Index</label>
              <input
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Profile Picture</label>
              {formData.profile_image_url && (
                <div className="mb-4 relative inline-block">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-red-600">
                    <Image
                      src={formData.profile_image_url}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    onClick={() => setFormData({ ...formData, profile_image_url: '' })}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <label className={`flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-yellow-500 text-white px-6 py-3 rounded-lg cursor-pointer w-fit hover:opacity-90 transition-opacity ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Upload size={20} />
                {uploading ? 'Uploading...' : (formData.profile_image_url ? 'Replace Image' : 'Upload Profile Picture')}
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const url = await handleFileUpload(file)
                      if (url) setFormData({ ...formData, profile_image_url: url })
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <span className="text-sm font-medium">Featured (Show on homepage)</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-red-600 to-yellow-500 text-white py-3 rounded-lg font-semibold hover:opacity-90 flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {editingId ? 'Update Testimonial' : 'Add Testimonial'}
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-200 dark:bg-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Testimonials List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Profile</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Review</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Featured</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {testimonials.map((testimonial) => (
                <tr key={testimonial.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {testimonial.profile_image_url ? (
                      <div className="relative w-12 h-12 rounded-full overflow-hidden">
                        <Image
                          src={testimonial.profile_image_url}
                          alt={testimonial.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-yellow-500 flex items-center justify-center text-white font-bold">
                        {testimonial.name.charAt(0)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">{testimonial.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 max-w-md truncate">
                      {testimonial.text}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.position || 'Verified Customer'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {testimonial.featured ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Featured
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        Not Featured
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(testimonial)}
                        className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(testimonial.id)}
                        className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {testimonials.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
              <p>No testimonials yet. Click "Add Testimonial" to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



