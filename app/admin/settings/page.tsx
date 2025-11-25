'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Save, Palette, RefreshCw } from 'lucide-react'

export default function SettingsPage() {
  const [theme, setTheme] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const { data: themeRes, error: themeError } = await supabase
        .from('theme_settings')
        .select('*')
        .maybeSingle()

      if (themeError && themeError.code !== 'PGRST116') {
        console.error('Error loading theme:', themeError)
      }

      if (themeRes) {
        setTheme(themeRes)
      } else {
        // Initialize empty theme if none exists
        setTheme({})
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      setTheme({})
    } finally {
      setLoading(false)
    }
  }

  const saveTheme = async () => {
    try {
      const themeData = {
        ...theme,
        id: theme.id || undefined
      }

      const { error } = await supabase
        .from('theme_settings')
        .upsert(themeData, {
          onConflict: 'id'
        })

      if (error) {
        toast.error('Failed to save theme: ' + error.message)
      } else {
        toast.success('Theme saved successfully!')
      }
    } catch (error: any) {
      toast.error('Failed to save theme')
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Loading settings...</p>
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
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <Palette className="text-white" size={32} />
            </div>
            Site Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Customize your website's appearance and theme</p>
        </div>
        <button
          onClick={loadSettings}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg hover:shadow-xl"
        >
          <RefreshCw size={20} />
          Refresh
        </button>
      </div>

      <div className="space-y-6">
        {/* Info Box */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6 shadow-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
            <strong>Note:</strong> Logo and branding management has been moved to the <a href="/admin/branding" className="underline font-semibold hover:text-blue-600">Branding</a> page in the admin sidebar.
          </p>
        </div>

        {/* Full Color Customization */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border-2 border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Palette className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Color Customization</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block mb-2 font-semibold">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.primary_color || '#000000'}
                  onChange={(e) => setTheme({ ...theme, primary_color: e.target.value })}
                  className="w-16 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.primary_color || '#000000'}
                  onChange={(e) => setTheme({ ...theme, primary_color: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700"
                  placeholder="#000000"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 font-semibold">Secondary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.secondary_color || '#ffffff'}
                  onChange={(e) => setTheme({ ...theme, secondary_color: e.target.value })}
                  className="w-16 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.secondary_color || '#ffffff'}
                  onChange={(e) => setTheme({ ...theme, secondary_color: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 font-semibold">Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.accent_color || '#ef4444'}
                  onChange={(e) => setTheme({ ...theme, accent_color: e.target.value })}
                  className="w-16 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.accent_color || '#ef4444'}
                  onChange={(e) => setTheme({ ...theme, accent_color: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700"
                  placeholder="#ef4444"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 font-semibold">Button Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.button_color || '#ef4444'}
                  onChange={(e) => setTheme({ ...theme, button_color: e.target.value })}
                  className="w-16 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.button_color || '#ef4444'}
                  onChange={(e) => setTheme({ ...theme, button_color: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700"
                  placeholder="#ef4444"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 font-semibold">Button Hover Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.button_hover_color || '#dc2626'}
                  onChange={(e) => setTheme({ ...theme, button_hover_color: e.target.value })}
                  className="w-16 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.button_hover_color || '#dc2626'}
                  onChange={(e) => setTheme({ ...theme, button_hover_color: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700"
                  placeholder="#dc2626"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 font-semibold">Text Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.text_color || '#000000'}
                  onChange={(e) => setTheme({ ...theme, text_color: e.target.value })}
                  className="w-16 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.text_color || '#000000'}
                  onChange={(e) => setTheme({ ...theme, text_color: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700"
                  placeholder="#000000"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 font-semibold">Background Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.background_color || '#ffffff'}
                  onChange={(e) => setTheme({ ...theme, background_color: e.target.value })}
                  className="w-16 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.background_color || '#ffffff'}
                  onChange={(e) => setTheme({ ...theme, background_color: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 font-semibold">Header Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.header_color || '#ffffff'}
                  onChange={(e) => setTheme({ ...theme, header_color: e.target.value })}
                  className="w-16 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.header_color || '#ffffff'}
                  onChange={(e) => setTheme({ ...theme, header_color: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 font-semibold">Footer Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.footer_color || '#000000'}
                  onChange={(e) => setTheme({ ...theme, footer_color: e.target.value })}
                  className="w-16 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.footer_color || '#000000'}
                  onChange={(e) => setTheme({ ...theme, footer_color: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <h3 className="font-semibold mb-3">Color Preview</h3>
            <div className="flex gap-2 flex-wrap">
              <div 
                className="px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: theme.button_color || '#ef4444' }}
              >
                Button
              </div>
              <div 
                className="px-4 py-2 rounded-lg"
                style={{ 
                  backgroundColor: theme.background_color || '#ffffff',
                  color: theme.text_color || '#000000',
                  border: `2px solid ${theme.primary_color || '#000000'}`
                }}
              >
                Text Sample
              </div>
            </div>
          </div>

          <button
            onClick={saveTheme}
            className="mt-6 flex items-center gap-2 bg-gradient-to-r from-red-600 to-yellow-500 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all shadow-lg"
          >
            <Save size={20} />
            Save Theme Colors
          </button>
        </div>
      </div>
    </div>
  )
}
