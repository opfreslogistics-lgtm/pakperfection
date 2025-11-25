'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Upload, Save, CreditCard, RefreshCw, DollarSign, Smartphone } from 'lucide-react'
import Image from 'next/image'

export default function PaymentSettingsPage() {
  const [settings, setSettings] = useState({
    zelle: { enabled: true, email: '', phone: '', logo_url: '', instructions: '' },
    cashapp: { enabled: true, cashtag: '', qr_code_url: '', instructions: '' },
    cash: { enabled: true, image_url: '', instructions: '' },
  })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const { data, error } = await supabase
      .from('payment_settings')
      .select('*')

    if (data) {
      const formatted: any = {}
      data.forEach((item: any) => {
        formatted[item.method] = {
          enabled: item.enabled,
          ...item.settings,
        }
      })
      setSettings(formatted)
    }
  }

  const handleFileUpload = async (file: File, method: string, field: string) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${method}_${field}_${Date.now()}.${fileExt}`
    const filePath = `payment-methods/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file)

    if (uploadError) {
      toast.error('Failed to upload image')
      return null
    }

    const { data } = supabase.storage.from('media').getPublicUrl(filePath)
    return data.publicUrl
  }

  const handleSave = async (method: string) => {
    setLoading(true)
    try {
      const methodSettings = settings[method as keyof typeof settings]
      
      // Use upsert with onConflict to handle duplicate key
      const { error } = await supabase
        .from('payment_settings')
        .upsert({
          method,
          enabled: methodSettings.enabled,
          settings: methodSettings,
        }, {
          onConflict: 'method'
        })

      if (error) throw error
      toast.success(`${method.toUpperCase()} settings saved!`)
      loadSettings() // Reload to reflect changes
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = (method: string, field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [method]: {
        ...prev[method as keyof typeof settings],
        [field]: value,
      },
    }))
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
              <CreditCard className="text-white" size={32} />
            </div>
            Payment Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Configure payment methods for your customers</p>
        </div>
        <button
          onClick={loadSettings}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg hover:shadow-xl"
        >
          <RefreshCw size={20} />
          Refresh
        </button>
      </div>

      {/* Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Zelle Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <DollarSign className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Zelle</h2>
            </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.zelle.enabled}
              onChange={(e) => updateSetting('zelle', 'enabled', e.target.checked)}
              className="w-5 h-5"
            />
            <span>Enable Zelle</span>
          </label>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">Zelle Email</label>
            <input
              type="email"
              value={settings.zelle.email}
              onChange={(e) => updateSetting('zelle', 'email', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="zelle@example.com"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">Zelle Phone (Optional)</label>
            <input
              type="tel"
              value={settings.zelle.phone}
              onChange={(e) => updateSetting('zelle', 'phone', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">Zelle Logo</label>
            {settings.zelle.logo_url && (
              <div className="mb-3 relative w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                <Image
                  src={settings.zelle.logo_url}
                  alt="Zelle Logo"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <label className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-3 rounded-xl cursor-pointer hover:from-gray-600 hover:to-gray-700 transition-all shadow-md">
              <Upload size={18} />
              Upload Logo
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const url = await handleFileUpload(file, 'zelle', 'logo')
                    if (url) updateSetting('zelle', 'logo_url', url)
                  }
                }}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">Instructions</label>
            <textarea
              value={settings.zelle.instructions}
              onChange={(e) => updateSetting('zelle', 'instructions', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              rows={3}
              placeholder="Send payment to this Zelle email. Include your order ID as the description."
            />
          </div>

          <button
            onClick={() => handleSave('zelle')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            Save Zelle Settings
          </button>
        </div>
      </div>

        {/* CashApp Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Smartphone className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">CashApp</h2>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.cashapp.enabled}
                onChange={(e) => updateSetting('cashapp', 'enabled', e.target.checked)}
                className="w-5 h-5 rounded"
              />
              <span className="font-semibold">Enable</span>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">CashApp Cashtag</label>
              <input
                type="text"
                value={settings.cashapp.cashtag}
                onChange={(e) => updateSetting('cashapp', 'cashtag', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="$PakPerfection"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">QR Code Image</label>
              {settings.cashapp.qr_code_url && (
                <div className="mb-3 relative w-32 h-32 rounded-xl overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                  <Image
                    src={settings.cashapp.qr_code_url}
                    alt="CashApp QR Code"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <label className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-3 rounded-xl cursor-pointer hover:from-gray-600 hover:to-gray-700 transition-all shadow-md">
                <Upload size={18} />
                Upload QR Code
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const url = await handleFileUpload(file, 'cashapp', 'qr_code')
                      if (url) updateSetting('cashapp', 'qr_code_url', url)
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">Instructions</label>
              <textarea
                value={settings.cashapp.instructions}
                onChange={(e) => updateSetting('cashapp', 'instructions', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                rows={3}
                placeholder="Scan the QR code or send to our cashtag. Include your order number in the note."
              />
            </div>

            <button
              onClick={() => handleSave('cashapp')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              Save CashApp Settings
            </button>
          </div>
        </div>

        {/* Cash Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <DollarSign className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cash Payment</h2>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.cash.enabled}
                onChange={(e) => updateSetting('cash', 'enabled', e.target.checked)}
                className="w-5 h-5 rounded"
              />
              <span className="font-semibold">Enable</span>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">Cash Icon/Image</label>
              {settings.cash.image_url && (
                <div className="mb-3 relative w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                  <Image
                    src={settings.cash.image_url}
                    alt="Cash Icon"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <label className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-3 rounded-xl cursor-pointer hover:from-gray-600 hover:to-gray-700 transition-all shadow-md">
                <Upload size={18} />
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const url = await handleFileUpload(file, 'cash', 'image')
                      if (url) updateSetting('cash', 'image_url', url)
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">Instructions</label>
              <textarea
                value={settings.cash.instructions}
                onChange={(e) => updateSetting('cash', 'instructions', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                rows={3}
                placeholder="Pay with cash upon pickup or delivery."
              />
            </div>

            <button
              onClick={() => handleSave('cash')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              Save Cash Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

