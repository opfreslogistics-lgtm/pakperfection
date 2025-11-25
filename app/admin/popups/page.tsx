'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, Bell, ToggleLeft, ToggleRight } from 'lucide-react'

export default function PopupsPage() {
  const [popups, setPopups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadPopups()
  }, [])

  const loadPopups = async () => {
    const { data, error } = await supabase
      .from('popups')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setPopups(data)
    }
    setLoading(false)
  }

  const togglePopup = async (id: string, currentEnabled: boolean) => {
    const { error } = await supabase
      .from('popups')
      .update({ enabled: !currentEnabled })
      .eq('id', id)

    if (error) {
      toast.error('Failed to update')
    } else {
      toast.success('Popup updated!')
      loadPopups()
    }
  }

  const deletePopup = async (id: string) => {
    if (!confirm('Are you sure?')) return

    const { error } = await supabase.from('popups').delete().eq('id', id)
    if (error) {
      toast.error('Failed to delete')
    } else {
      toast.success('Popup deleted!')
      loadPopups()
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Loading popups...</p>
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
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg">
              <Bell className="text-white" size={32} />
            </div>
            Pop-ups Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Manage website popups and notifications</p>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-yellow-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all shadow-lg">
          <Plus size={20} />
          Add Pop-up
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl shadow-lg p-6 border-2 border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
              <Bell className="text-white" size={28} />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Total Popups</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{popups.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl shadow-lg p-6 border-2 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
              <ToggleRight className="text-white" size={28} />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Active</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{popups.filter(p => p.enabled).length}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-2xl shadow-lg p-6 border-2 border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl shadow-lg">
              <ToggleLeft className="text-white" size={28} />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Inactive</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{popups.filter(p => !p.enabled).length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {popups.map((popup) => (
          <div key={popup.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Bell size={24} className="text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white capitalize">{popup.type?.replace('_', ' ')}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{popup.title}</p>
                </div>
              </div>
              <button
                onClick={() => togglePopup(popup.id, popup.enabled)}
                className="text-2xl hover:scale-110 transition-transform"
              >
                {popup.enabled ? (
                  <ToggleRight className="text-green-500" size={32} />
                ) : (
                  <ToggleLeft className="text-gray-400" size={32} />
                )}
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {popup.text}
            </p>
            <div className="flex gap-2">
              <button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md">
                Edit
              </button>
              <button
                onClick={() => deletePopup(popup.id)}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {popups.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700">
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
            <Bell size={48} className="text-gray-400" />
          </div>
          <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No pop-ups yet</p>
          <p className="text-gray-600 dark:text-gray-400">Create your first popup to get started</p>
        </div>
      )}
    </div>
  )
}




