'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Mail, Save, TestTube, Info } from 'lucide-react'

export default function EmailSettingsPage() {
  const [settings, setSettings] = useState({
    smtp_host: '',
    smtp_port: '587',
    smtp_user: '',
    smtp_pass: '',
    smtp_from: 'info@pakperfectioninter.com',
    smtp_from_name: 'Pak Perfection',
    smtp_secure: false,
  })
  const [loading, setLoading] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [testing, setTesting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle()

      if (error) {
        console.error('Error loading settings:', error)
        // If row doesn't exist, create default row
        if (error.code === 'PGRST116' || error.message?.includes('No rows')) {
          const { data: newData, error: insertError } = await supabase
            .from('email_settings')
            .insert({
              id: 1,
              smtp_host: 'smtp.gmail.com',
              smtp_port: '587',
              smtp_from: 'info@pakperfectioninter.com',
              smtp_from_name: 'Pak Perfection',
            })
            .select()
            .single()

          if (!insertError && newData) {
            setSettings(newData)
          }
        }
        return
      }

      if (data) {
        setSettings(data)
      } else {
        // No data found, create default row
        const { data: newData, error: insertError } = await supabase
          .from('email_settings')
          .insert({
            id: 1,
            smtp_host: 'smtp.gmail.com',
            smtp_port: '587',
            smtp_from: 'info@pakperfectioninter.com',
            smtp_from_name: 'Pak Perfection',
          })
          .select()
          .single()

        if (!insertError && newData) {
          setSettings(newData)
        }
      }
    } catch (error: any) {
      console.error('Error in loadSettings:', error)
    }
  }

  const handleSave = async () => {
    // Validate required fields
    if (!settings.smtp_host || !settings.smtp_user || !settings.smtp_pass) {
      toast.error('Please fill in all required fields (Host, Username, Password)')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('email_settings')
        .upsert({
          id: 1,
          ...settings,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
        .select()

      if (error) {
        console.error('Save error:', error)
        throw error
      }

      console.log('Settings saved:', data)
      toast.success('Email settings saved successfully!')
      
      // Reload settings to confirm
      await loadSettings()
    } catch (error: any) {
      console.error('Failed to save:', error)
      toast.error('Failed to save settings: ' + (error.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleDebugSettings = async () => {
    try {
      const response = await fetch('/api/email/debug-settings')
      const debugInfo = await response.json()
      console.log('Email Settings Debug Info:', debugInfo)
      alert(`Debug Info:\n\nActive Source: ${debugInfo.activeSource}\n\nDatabase: ${JSON.stringify(debugInfo.sources.database, null, 2)}\n\nEnvironment: ${JSON.stringify(debugInfo.sources.environment, null, 2)}\n\nCheck browser console for full details.`)
    } catch (error: any) {
      toast.error('Failed to get debug info: ' + error.message)
    }
  }

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter an email address to test')
      return
    }

    if (!settings.smtp_host || !settings.smtp_user || !settings.smtp_pass) {
      toast.error('Please fill in all required SMTP fields before testing')
      return
    }

    setTesting(true)
    try {
      const response = await fetch('/api/email/send-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          to: testEmail,
          settings: settings
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success('Test email sent successfully! Please check your inbox (and spam folder).', {
          duration: 5000,
        })
      } else {
        // Show detailed error message
        const errorMsg = result.details || result.error || 'Unknown error'
        toast.error(`Failed to send test email: ${errorMsg}`, {
          duration: 8000,
        })
        console.error('Email test error details:', result)
      }
    } catch (error: any) {
      toast.error('Failed to send test email: ' + error.message, {
        duration: 8000,
      })
      console.error('Email test error:', error)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-red-500 to-yellow-500 rounded-xl shadow-lg">
              <Mail className="text-white" size={32} />
            </div>
            Email Settings (SMTP)
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure your SMTP settings to send automatic emails to customers
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Info className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-3 text-lg">📧 How to Set Up Email Notifications</h3>
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
              <strong>Important:</strong> Customers will NOT receive emails until you configure SMTP settings below. Once configured, emails will be sent automatically for orders and reservations.
            </p>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1 font-bold">✓</span>
                <span><strong>Gmail Setup (IMPORTANT):</strong></span>
              </li>
              <li className="ml-6 space-y-1">
                <div>1. Enable <strong>2-Step Verification</strong> on your Google Account</div>
                <div>2. Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google App Passwords</a></div>
                <div>3. Create an App Password (select "Mail" and "Other" device)</div>
                <div>4. Copy the 16-character password (no spaces)</div>
                <div>5. Use <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">smtp.gmail.com</code> (port <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">587</code>, secure: <strong>OFF</strong>)</div>
                <div>6. <strong>CRITICAL:</strong> "From Email" must match your Gmail address exactly</div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1 font-bold">✓</span>
                <span><strong>Outlook:</strong> Use <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">smtp-mail.outlook.com</code> (port 587)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1 font-bold">✓</span>
                <span><strong>Custom SMTP:</strong> Check with your email provider for SMTP settings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1 font-bold">✓</span>
                <span><strong>Test First:</strong> Always send a test email to verify your settings work before saving</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SMTP Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border-2 border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Mail className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">SMTP Configuration</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">SMTP Host *</label>
              <input
                type="text"
                value={settings.smtp_host}
                onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                placeholder="smtp.gmail.com"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 dark:bg-gray-700 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">SMTP Port *</label>
              <input
                type="number"
                value={settings.smtp_port}
                onChange={(e) => setSettings({ ...settings, smtp_port: e.target.value })}
                placeholder="587"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 dark:bg-gray-700 transition-all"
              />
              <p className="text-sm text-gray-500 mt-1">
                Common ports: <strong>587</strong> (TLS/STARTTLS - Recommended for Gmail), <strong>465</strong> (SSL), 25 (Plain)
              </p>
              {settings.smtp_host.includes('gmail') && (
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1 font-semibold">
                  ⚠️ For Gmail, use port 587 and keep "Secure Connection" OFF
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">SMTP Username/Email *</label>
              <input
                type="text"
                value={settings.smtp_user}
                onChange={(e) => setSettings({ ...settings, smtp_user: e.target.value })}
                placeholder="your-email@gmail.com"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 dark:bg-gray-700 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">SMTP Password *</label>
              <input
                type="password"
                value={settings.smtp_pass}
                onChange={(e) => setSettings({ ...settings, smtp_pass: e.target.value })}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 dark:bg-gray-700 transition-all"
              />
              <p className="text-sm text-gray-500 mt-1">For Gmail, use an App Password, not your regular password</p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="secure"
                checked={settings.smtp_secure}
                onChange={(e) => setSettings({ ...settings, smtp_secure: e.target.checked })}
                className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <label htmlFor="secure" className="ml-3 text-sm font-semibold">
                Use Secure Connection (SSL/TLS)
              </label>
            </div>
          </div>
        </div>

        {/* Email Display Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border-2 border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Mail className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Email Display Settings</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">From Email *</label>
              <input
                type="email"
                value={settings.smtp_from}
                onChange={(e) => setSettings({ ...settings, smtp_from: e.target.value })}
                placeholder="info@pakperfectioninter.com"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 dark:bg-gray-700 transition-all"
              />
              <p className="text-sm text-gray-500 mt-1">This email will appear as the sender</p>
              {settings.smtp_host.includes('gmail') && settings.smtp_from !== settings.smtp_user && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1 font-semibold">
                  ⚠️ For Gmail, "From Email" must match "SMTP Username" exactly!
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">From Name *</label>
              <input
                type="text"
                value={settings.smtp_from_name}
                onChange={(e) => setSettings({ ...settings, smtp_from_name: e.target.value })}
                placeholder="Pak Perfection"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 dark:bg-gray-700 transition-all"
              />
              <p className="text-sm text-gray-500 mt-1">This name will appear as the sender</p>
            </div>

            {/* Test Email Section */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-semibold mb-2">Test Email</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                  className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-4 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700"
                />
                <button
                  onClick={handleTestEmail}
                  disabled={testing}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <TestTube size={20} />
                  {testing ? 'Sending...' : 'Test'}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">Send a test email to verify your SMTP settings</p>
            </div>

            {/* Email Preview */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-3">Email Preview</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-sm">
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>From:</strong> "{settings.smtp_from_name}" &lt;{settings.smtp_from}&gt;
                </p>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  <strong>To:</strong> customer@example.com
                </p>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  <strong>Subject:</strong> Order Confirmation - #ABC12345 - Pak Perfection
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button & Debug */}
      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={handleDebugSettings}
          className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all flex items-center gap-2"
        >
          🔍 Debug Settings
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-8 py-4 bg-gradient-to-r from-red-600 to-yellow-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 flex items-center gap-3"
        >
          <Save size={24} />
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Environment Variables Alternative */}
      <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-100 mb-3">
          🔧 Alternative: Use Environment Variables
        </h3>
        <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
          If saving to the database isn't working, you can set up email using environment variables in <code className="bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded">.env.local</code> file.
        </p>
        <details className="text-sm">
          <summary className="cursor-pointer font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
            Click to see instructions
          </summary>
          <div className="mt-3 space-y-2 text-yellow-800 dark:text-yellow-200">
            <p>1. Create a file named <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">.env.local</code> in your project root</p>
            <p>2. Add these lines:</p>
            <pre className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded text-xs overflow-x-auto">
{`SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
SMTP_FROM_NAME=Pak Perfection`}
            </pre>
            <p>3. Replace with your actual Gmail and App Password</p>
            <p>4. Restart your server</p>
            <p className="mt-2">
              <strong>See <code>ENV_EMAIL_SETUP.md</code> for detailed instructions.</strong>
            </p>
          </div>
        </details>
      </div>

      {/* Email Templates Info */}
      <div className="mt-12 bg-gradient-to-r from-green-50 to-yellow-50 dark:from-green-900/20 dark:to-yellow-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
          <Mail className="text-green-600" size={28} />
          Automatic Email Notifications
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Once configured, the system will automatically send beautiful, professional emails to customers for:
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <span className="text-green-600 font-bold">✓</span> Order Confirmations
          </li>
          <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <span className="text-green-600 font-bold">✓</span> Order Status Updates
          </li>
          <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <span className="text-green-600 font-bold">✓</span> Delivery Notifications
          </li>
          <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <span className="text-green-600 font-bold">✓</span> Order Completion
          </li>
        </ul>
      </div>
    </div>
  )
}

