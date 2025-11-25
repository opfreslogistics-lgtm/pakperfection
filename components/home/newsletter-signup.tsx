'use client'

import { useState } from 'react'
import { Mail, Send, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // TODO: Implement newsletter signup
    setTimeout(() => {
      toast.success('Thank you for subscribing!')
      setEmail('')
      setLoading(false)
    }, 1000)
  }

  return (
    <section className="relative py-24 px-4 overflow-hidden bg-white dark:bg-gray-900">
      <div className="container mx-auto relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Green gradient background card */}
          <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-10 md:p-12 shadow-2xl">
            <div className="text-center text-white">
              {/* Icon with animation */}
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative bg-white/20 backdrop-blur-sm p-5 rounded-full border-2 border-white/30">
                  <Mail size={48} className="mx-auto" />
                </div>
                <Sparkles className="absolute -top-2 -right-2 text-yellow-300 animate-bounce" size={24} />
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-yellow-200">
                Stay in the Loop!
              </h2>
              <p className="text-lg md:text-xl mb-8 text-white/90 max-w-xl mx-auto leading-relaxed">
                Subscribe to our newsletter and be the first to know about exclusive offers, 
                new menu items, special events, and delicious surprises! 🎉
              </p>

              {/* Enhanced form */}
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <div className="flex-1 relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 bg-white shadow-lg focus:ring-4 focus:ring-yellow-300 focus:outline-none transition-all placeholder:text-gray-400 font-medium"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-8 py-4 rounded-xl font-bold hover:from-yellow-300 hover:to-yellow-400 transition-all disabled:opacity-50 shadow-lg hover:shadow-2xl hover:scale-105 transform duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Subscribe
                    </>
                  )}
                </button>
              </form>

              {/* Trust badge */}
              <p className="mt-6 text-sm text-white/70 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                We respect your privacy. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}



