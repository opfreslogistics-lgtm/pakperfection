'use client'

import { ArrowLeft } from 'lucide-react'

export default function NotFoundBackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className="group flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-xl hover:scale-105 transition-all"
    >
      <ArrowLeft size={20} />
      Go Back
    </button>
  )
}


