'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, Calendar, Upload, Save, X, Star } from 'lucide-react'
import Image from 'next/image'

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    event_date: '',
    event_time: '',
    location: '',
    price: '',
    available_spots: '',
    featured: false,
  })
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true })

    if (data) {
      setEvents(data)
    }
    setLoading(false)
  }

  const handleFileUpload = async (file: File) => {
    try {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return null
      }

      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid file type. Please upload an image')
        return null
      }

      setUploading(true)
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `events_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `events/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        toast.error('Upload failed: ' + uploadError.message)
        setUploading(false)
        return null
      }

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath)

      setUploading(false)
      return publicUrl
    } catch (error: any) {
      toast.error('Upload error: ' + error.message)
      setUploading(false)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.event_date) {
      toast.error('Please fill in required fields')
      return
    }

    try {
      // Combine date and time
      const eventDateTime = new Date(`${formData.event_date}T${formData.event_time || '12:00'}`)
      
      const eventData = {
        title: formData.title,
        description: formData.description || null,
        image_url: formData.image_url || null,
        event_date: eventDateTime.toISOString(),
        location: formData.location || null,
        price: formData.price ? parseFloat(formData.price) : null,
        available_spots: formData.available_spots ? parseInt(formData.available_spots) : null,
        featured: formData.featured,
      }

      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id)

        if (error) throw error
        toast.success('Event updated successfully!')
      } else {
        const { error } = await supabase
          .from('events')
          .insert(eventData)

        if (error) throw error
        toast.success('Event created successfully!')
      }

      setShowModal(false)
      resetForm()
      loadEvents()
    } catch (error: any) {
      toast.error('Error saving event: ' + error.message)
    }
  }

  const handleEdit = (event: any) => {
    const eventDate = new Date(event.event_date)
    const dateStr = eventDate.toISOString().split('T')[0]
    const timeStr = eventDate.toTimeString().slice(0, 5)
    
    setEditingEvent(event)
    setFormData({
      title: event.title || '',
      description: event.description || '',
      image_url: event.image_url || '',
      event_date: dateStr,
      event_time: timeStr,
      location: event.location || '',
      price: event.price ? event.price.toString() : '',
      available_spots: event.available_spots ? event.available_spots.toString() : '',
      featured: event.featured || false,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Event deleted successfully!')
      loadEvents()
    } catch (error: any) {
      toast.error('Error deleting event: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      event_date: '',
      event_time: '',
      location: '',
      price: '',
      available_spots: '',
      featured: false,
    })
    setEditingEvent(null)
  }

  const upcomingEvents = events.filter(e => new Date(e.event_date) >= new Date())
  const pastEvents = events.filter(e => new Date(e.event_date) < new Date())

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-red-500 to-yellow-500 rounded-xl shadow-lg">
              <Calendar className="text-white" size={32} />
            </div>
            Events Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your restaurant events and special occasions</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-yellow-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all"
        >
          <Plus size={20} />
          Add Event
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-red-500 to-yellow-500 text-white p-6 rounded-2xl shadow-lg">
          <div className="text-3xl font-bold mb-2">{events.length}</div>
          <div className="text-white/90">Total Events</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white p-6 rounded-2xl shadow-lg">
          <div className="text-3xl font-bold mb-2">{upcomingEvents.length}</div>
          <div className="text-white/90">Upcoming</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white p-6 rounded-2xl shadow-lg">
          <div className="text-3xl font-bold mb-2">{pastEvents.length}</div>
          <div className="text-white/90">Past Events</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-6 rounded-2xl shadow-lg">
          <div className="text-3xl font-bold mb-2">{events.filter(e => e.featured).length}</div>
          <div className="text-white/90">Featured</div>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">All Events</h2>
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No events yet. Create your first event!</div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const eventDate = new Date(event.event_date)
              const isUpcoming = eventDate >= new Date()
              
              return (
                <div
                  key={event.id}
                  className="flex items-center gap-6 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-red-500 dark:hover:border-red-500 transition-all"
                >
                  {event.image_url && (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={event.image_url} alt={event.title} fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{event.title}</h3>
                      {event.featured && (
                        <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                          <Star size={12} />
                          Featured
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        isUpcoming 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {isUpcoming ? 'Upcoming' : 'Past'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {eventDate.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </p>
                    {event.location && (
                      <p className="text-sm text-gray-500 dark:text-gray-500">{event.location}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(event)}
                      className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="p-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-red-600 to-yellow-500 text-white p-6 rounded-t-2xl z-10">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} className="text-white" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Event Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 dark:bg-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 dark:bg-gray-700"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Event Date *</label>
                  <input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 dark:bg-gray-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Event Time</label>
                  <input
                    type="time"
                    value={formData.event_time}
                    onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 dark:bg-gray-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 dark:bg-gray-700"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Available Spots</label>
                  <input
                    type="number"
                    value={formData.available_spots}
                    onChange={(e) => setFormData({ ...formData, available_spots: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 dark:bg-gray-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Event Image</label>
                {formData.image_url && (
                  <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden">
                    <Image src={formData.image_url} alt="Preview" fill className="object-cover" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const url = await handleFileUpload(file)
                      if (url) {
                        setFormData({ ...formData, image_url: url })
                        toast.success('Image uploaded successfully!')
                      }
                    }
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 dark:bg-gray-700"
                  disabled={uploading}
                />
                {uploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="featured" className="ml-3 text-sm font-semibold flex items-center gap-2">
                  <Star size={16} className="text-yellow-500" />
                  Feature on Homepage
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-red-600 to-yellow-500 text-white py-4 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

