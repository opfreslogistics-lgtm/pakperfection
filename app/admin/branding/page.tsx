'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Save, Upload, Image as ImageIcon, Eye, X, RefreshCw, Link as LinkIcon } from 'lucide-react'
import Image from 'next/image'
import AdminAuthGuard from '@/components/admin/auth-guard'

export default function BrandingPage() {
  return (
    <AdminAuthGuard>
      <BrandingContent />
    </AdminAuthGuard>
  )
}

function BrandingContent() {
  const [branding, setBranding] = useState<any>({
    logo_url: null,
    dark_logo_url: null,
    favicon_url: null,
    footer_logo_url: null,
    loading_logo_url: null
  })
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [manualUrls, setManualUrls] = useState<Record<string, string>>({})
  const [showManualInput, setShowManualInput] = useState<Record<string, boolean>>({})
  const supabase = createClient()

  useEffect(() => {
    loadBranding()
  }, [])

  const loadBranding = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('branding')
        .select('*')
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading branding:', error)
        toast.error('Failed to load branding')
        return
      }

      if (data) {
        setBranding({
          id: data.id,
          logo_url: data.logo_url || null,
          dark_logo_url: data.dark_logo_url || null,
          favicon_url: data.favicon_url || null,
          footer_logo_url: data.footer_logo_url || null,
          loading_logo_url: data.loading_logo_url || null,
          created_at: data.created_at,
          updated_at: data.updated_at,
        })
      } else {
        // Initialize empty branding if none exists
        setBranding({
          logo_url: null,
          dark_logo_url: null,
          favicon_url: null,
          footer_logo_url: null,
          loading_logo_url: null
        })
      }
    } catch (error) {
      console.error('Error loading branding:', error)
      toast.error('Failed to load branding')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file: File, field: string) => {
    setUploading(field)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${field}_${Date.now()}.${fileExt}`
      const filePath = `branding/${fileName}`

      // Try uploading to branding bucket first
      let uploadError = null
      let publicUrl = null

      try {
        const { error, data } = await supabase.storage
          .from('branding')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          uploadError = error
          // If branding bucket doesn't exist, try media bucket as fallback
          console.warn('Branding bucket upload failed, trying media bucket:', error)
          const { error: mediaError, data: mediaData } = await supabase.storage
            .from('media')
            .upload(`branding/${fileName}`, file, {
              cacheControl: '3600',
              upsert: false
            })
          
          if (mediaError) {
            throw mediaError
          }
          
          const { data: urlData } = supabase.storage.from('media').getPublicUrl(`branding/${fileName}`)
          publicUrl = urlData?.publicUrl
        } else {
          // Get public URL from branding bucket
          const { data: urlData } = supabase.storage.from('branding').getPublicUrl(filePath)
          publicUrl = urlData?.publicUrl
        }
      } catch (storageError: any) {
        console.error('Storage upload error:', storageError)
        toast.error(`Storage upload failed: ${storageError.message}. You can enter the URL manually.`)
        setShowManualInput((prev) => ({ ...prev, [field]: true }))
        setUploading(null)
        return null
      }

      if (!publicUrl) {
        toast.error('Failed to get file URL. You can enter the URL manually.')
        setShowManualInput((prev) => ({ ...prev, [field]: true }))
        setUploading(null)
        return null
      }

      // Update branding state immediately
      setBranding((prev: any) => ({
        ...prev,
        [field]: publicUrl
      }))

      toast.success(`${field.replace('_', ' ')} uploaded successfully!`)
      setUploading(null)
      return publicUrl
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(`Failed to upload ${field}. You can enter the URL manually.`)
      setShowManualInput((prev) => ({ ...prev, [field]: true }))
      setUploading(null)
      return null
    }
  }

  const handleManualUrl = (field: string, url: string) => {
    setManualUrls((prev) => ({ ...prev, [field]: url }))
    setBranding((prev: any) => ({
      ...prev,
      [field]: url || null
    }))
    if (url) {
      toast.success(`${field.replace('_', ' ')} URL saved!`)
    }
  }

  const removeImage = (field: string) => {
    setBranding((prev: any) => ({
      ...prev,
      [field]: null
    }))
    toast.success(`${field.replace('_', ' ')} removed`)
  }

  const saveBranding = async () => {
    try {
      setSaving(true)
      toast.loading('Saving branding...')
      
      // Check if branding record exists
      const { data: existingBranding, error: checkError } = await supabase
        .from('branding')
        .select('id')
        .maybeSingle()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Check error:', checkError)
        throw checkError
      }

      // Prepare branding data
      const brandingData: any = {
        logo_url: branding?.logo_url || null,
        dark_logo_url: branding?.dark_logo_url || null,
        favicon_url: branding?.favicon_url || null,
        footer_logo_url: branding?.footer_logo_url || null,
        loading_logo_url: branding?.loading_logo_url || null,
        updated_at: new Date().toISOString()
      }

      // If we have an existing record, include the ID for update
      if (existingBranding?.id) {
        brandingData.id = existingBranding.id
      }

      // Use upsert - if id exists, update; otherwise insert
      let result
      if (existingBranding?.id) {
        // Update existing record
        result = await supabase
          .from('branding')
          .update(brandingData)
          .eq('id', existingBranding.id)
          .select()
      } else {
        // Insert new record
        result = await supabase
          .from('branding')
          .insert(brandingData)
          .select()
      }

      if (result.error) {
        console.error('Save error:', result.error)
        toast.dismiss()
        toast.error('Failed to save branding: ' + result.error.message)
        return
      }

      // Update state with saved data
      if (result.data && result.data[0]) {
        setBranding((prev: any) => ({
          ...prev,
          ...result.data[0]
        }))
      }

      toast.dismiss()
      toast.success('Branding saved successfully!')
      
      // Reload from database to ensure consistency
      await loadBranding()
    } catch (error: any) {
      console.error('Save error:', error)
      toast.dismiss()
      toast.error('Failed to save branding: ' + (error.message || 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Loading branding...</p>
          </div>
        </div>
      </div>
    )
  }

  const logoFields = [
    {
      key: 'logo_url',
      label: 'Website Logo (Light Mode)',
      description: 'Main logo displayed in navigation and header. Recommended: PNG with transparent background, max 200px height.',
      preview: branding?.logo_url
    },
    {
      key: 'dark_logo_url',
      label: 'Website Logo (Dark Mode)',
      description: 'Logo for dark mode theme. Recommended: PNG with transparent background, max 200px height.',
      preview: branding?.dark_logo_url
    },
    {
      key: 'footer_logo_url',
      label: 'Footer Logo',
      description: 'Logo displayed in the footer. Recommended: PNG with transparent background, max 120px height.',
      preview: branding?.footer_logo_url
    },
    {
      key: 'favicon_url',
      label: 'Favicon',
      description: 'Small icon displayed in browser tabs. Recommended: ICO or PNG, 32x32 or 16x16 pixels.',
      preview: branding?.favicon_url
    },
    {
      key: 'loading_logo_url',
      label: 'Loading Logo',
      description: 'Logo shown during page loading. Recommended: PNG with transparent background, animated GIF supported.',
      preview: branding?.loading_logo_url
    }
  ]

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <ImageIcon className="text-white" size={32} />
            </div>
            Branding & Logos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your website logos and branding assets. Uploaded logos will replace the text "Pak Perfection" throughout the site.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadBranding}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg hover:shadow-xl"
          >
            <RefreshCw size={20} />
            Refresh
          </button>
          <button
            onClick={saveBranding}
            disabled={saving || uploading !== null}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-yellow-500 text-white rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border-2 border-gray-200 dark:border-gray-700">
        <div className="space-y-8">
          {logoFields.map((field) => (
            <div key={field.key} className="border-b-2 border-gray-200 dark:border-gray-700 pb-8 last:border-b-0 last:pb-0">
              <div className="mb-6">
                <label className="block text-xl font-bold text-gray-900 dark:text-white mb-2">{field.label}</label>
                <p className="text-sm text-gray-600 dark:text-gray-400">{field.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Preview Section */}
                <div>
                  <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Preview</h3>
                  {field.preview ? (
                    <div className="relative p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                      <div className="flex items-center justify-center min-h-[120px]">
                        {field.key === 'favicon_url' ? (
                          <Image
                            key={field.preview}
                            src={field.preview}
                            alt={field.label}
                            width={32}
                            height={32}
                            className="object-contain"
                          />
                        ) : (
                          <Image
                            key={field.preview}
                            src={field.preview}
                            alt={field.label}
                            width={200}
                            height={80}
                            className="max-h-20 w-auto object-contain"
                          />
                        )}
                      </div>
                      <button
                        onClick={() => removeImage(field.key)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        title="Remove image"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
                      <ImageIcon size={48} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">No image uploaded</p>
                    </div>
                  )}
                </div>

                {/* Upload Section */}
                <div>
                  <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Upload</h3>
                  
                  {/* Manual URL Input */}
                  {(showManualInput[field.key] || !field.preview) && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Or enter image URL directly:</label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={manualUrls[field.key] || branding[field.key] || ''}
                          onChange={(e) => handleManualUrl(field.key, e.target.value)}
                          placeholder="https://example.com/logo.png"
                          className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700"
                        />
                        <button
                          onClick={() => setShowManualInput((prev) => ({ ...prev, [field.key]: false }))}
                          className="px-3 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                        >
                          <LinkIcon size={20} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Enter a direct URL to your logo image</p>
                    </div>
                  )}

                  {/* File Upload */}
                  <label className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary transition-colors bg-gray-50 dark:bg-gray-900">
                    <div className="flex flex-col items-center justify-center">
                      {uploading === field.key ? (
                        <>
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
                        </>
                      ) : (
                        <>
                          <Upload size={32} className="text-gray-400 mb-2" />
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {field.preview ? 'Replace Image' : 'Upload Image'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Click to select file</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          await handleFileUpload(file, field.key)
                        }
                      }}
                      className="hidden"
                      disabled={uploading === field.key}
                    />
                  </label>
                  
                  {!showManualInput[field.key] && field.preview && (
                    <button
                      onClick={() => setShowManualInput((prev) => ({ ...prev, [field.key]: true }))}
                      className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <LinkIcon size={14} />
                      Or enter URL manually
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Eye size={20} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">How It Works</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Uploaded logos will automatically replace the text "Pak Perfection" throughout the website</li>
              <li>• Logos update on the frontend within 10 seconds of saving</li>
              <li>• Make sure to save your changes after uploading images</li>
              <li>• The favicon appears in browser tabs and bookmarks</li>
              <li>• Dark mode logo is used when users switch to dark theme</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

