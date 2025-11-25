'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

export default function MediaPage() {
  const [media, setMedia] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadMedia()
  }, [])

  const loadMedia = async () => {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setMedia(data)
    }
    setLoading(false)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `media/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file)

    if (uploadError) {
      toast.error('Failed to upload image')
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath)

    const { error: insertError } = await supabase
      .from('media')
      .insert({
        file_url: urlData.publicUrl,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
      })

    if (insertError) {
      toast.error('Failed to save media record')
    } else {
      toast.success('Image uploaded!')
      loadMedia()
    }
    setUploading(false)
  }

  const deleteMedia = async (id: string, fileUrl: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    // Extract file path from URL
    const pathMatch = fileUrl.match(/media\/(.+)$/)
    if (pathMatch) {
      const { error } = await supabase.storage
        .from('media')
        .remove([pathMatch[1]])
    }

    const { error } = await supabase.from('media').delete().eq('id', id)
    if (error) {
      toast.error('Failed to delete')
    } else {
      toast.success('Deleted!')
      loadMedia()
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Loading media...</p>
          </div>
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
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg">
              <ImageIcon className="text-white" size={32} />
            </div>
            Media Library
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Manage all your uploaded images and media files</p>
        </div>
        <label className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl cursor-pointer hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl font-semibold">
          <Upload size={20} />
          {uploading ? 'Uploading...' : 'Upload Image'}
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {/* Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ImageIcon className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Total Media Files</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{media.length} {media.length === 1 ? 'file' : 'files'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {media.map((item) => (
          <div key={item.id} className="relative group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all hover:scale-105">
            <div className="aspect-square relative">
              <Image
                src={item.file_url}
                alt={item.alt_text || item.file_name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-xs font-semibold truncate">{item.file_name}</p>
                </div>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => deleteMedia(item.id, item.file_url)}
                  className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 shadow-lg transition-all"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {media.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700">
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
            <ImageIcon size={48} className="text-gray-400" />
          </div>
          <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No media files yet</p>
          <p className="text-gray-600 dark:text-gray-400">Upload your first image to get started</p>
        </div>
      )}
    </div>
  )
}




