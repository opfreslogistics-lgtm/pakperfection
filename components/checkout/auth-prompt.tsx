'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { X, Mail, Lock, User, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface AuthPromptProps {
  onContinue: () => void
  onAuthSuccess: () => void
}

export default function AuthPrompt({ onContinue, onAuthSuccess }: AuthPromptProps) {
  const [mode, setMode] = useState<'choice' | 'login' | 'register'>('choice')
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      })

      if (error) throw error

      toast.success('Welcome back!')
      onAuthSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (registerData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            name: registerData.name,
          }
        }
      })

      if (error) throw error

      toast.success('Account created! Please check your email to verify your account.')
      onAuthSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  if (mode === 'choice') {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent">
              Account Options
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Choose how you'd like to proceed with your order
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setMode('login')}
              className="w-full bg-gradient-to-r from-red-600 to-yellow-500 text-white py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg"
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className="w-full bg-white dark:bg-gray-700 border-2 border-red-600 text-red-600 dark:text-red-400 py-4 rounded-xl font-semibold hover:bg-red-50 dark:hover:bg-gray-600 transition-colors"
            >
              Create Account
            </button>
            <button
              onClick={onContinue}
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-4 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </h2>
          <button
            onClick={() => setMode('choice')}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block mb-2 font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block mb-2 font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-yellow-500 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
            <p className="text-center text-sm">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-red-600 hover:underline font-semibold"
              >
                Sign up
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block mb-2 font-medium">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700"
                  placeholder="John Doe"
                />
              </div>
            </div>
            <div>
              <label className="block mb-2 font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block mb-2 font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div>
              <label className="block mb-2 font-medium">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-yellow-500 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
            <p className="text-center text-sm">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-red-600 hover:underline font-semibold"
              >
                Sign in
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}





