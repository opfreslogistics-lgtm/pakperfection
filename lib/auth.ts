import { createClient } from './supabase/server'
import { redirect } from 'next/navigation'

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile() {
  const user = await getUser()
  if (!user) return null

  const supabase = await createClient()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user profile:', error)
    return null
  }

  return profile
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }
  return user
}

export async function requireAdmin() {
  const profile = await getUserProfile()
  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }
  return profile
}

