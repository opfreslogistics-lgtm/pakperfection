import { createClient } from '@/lib/supabase/server'
import Navigation from '@/components/navigation-new'
import Footer from '@/components/footer'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, User, ArrowRight, Search, Tag, TrendingUp, Clock, BookOpen } from 'lucide-react'
import BlogClient from './blog-client'

export const dynamic = 'force-dynamic'

export default async function BlogPage() {
  const supabase = await createClient()
  
  const { data: branding } = await supabase
    .from('branding')
    .select('*')
    .single()
  
  const { data: navSettings } = await supabase
    .from('navigation_settings')
    .select('*')
    .single()
  
  const { data: footer } = await supabase
    .from('footer_settings')
    .select('*')
    .single()
  
  const { data: theme } = await supabase
    .from('theme_settings')
    .select('*')
    .single()

  // Fetch published blog posts from database
  const { data: blogPostsData } = await supabase
    .from('blog_posts')
    .select(`
      *,
      blog_categories (
        id,
        name,
        slug
      )
    `)
    .eq('published', true)
    .order('created_at', { ascending: false })

  // Fetch all categories for sidebar
  const { data: categoriesData } = await supabase
    .from('blog_categories')
    .select('*')
    .order('name')

  // Fetch recent posts for sidebar
  const { data: recentPosts } = await supabase
    .from('blog_posts')
    .select('id, title, slug, featured_image_url, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(5)

  const blogPosts = blogPostsData || []
  const categories = categoriesData || []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation branding={branding} navSettings={navSettings} theme={theme} />
      
      {/* Enhanced Hero Section */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-yellow-500 to-green-600 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="relative z-10 h-full flex items-center justify-center text-white px-4">
          <div className="text-center max-w-4xl">
            <div className="inline-block mb-6">
              <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold">
                📖 Latest Stories & Recipes
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fadeInUp">
              Our Blog
            </h1>
            <p className="text-xl md:text-2xl opacity-95 mb-8 animate-fadeInUp">
              Stories, Recipes, and Culinary Adventures from Pak Perfection
            </p>
            <div className="flex items-center justify-center gap-8 text-sm md:text-base opacity-90">
              <div className="flex items-center gap-2">
                <BookOpen size={20} />
                <span>{blogPosts.length} Articles</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp size={20} />
                <span>Fresh Content</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent"></div>
      </section>

      <section className="py-16 px-4 -mt-12 relative z-20">
        <div className="container mx-auto max-w-7xl">
          <BlogClient 
            initialPosts={blogPosts} 
            categories={categories} 
            recentPosts={recentPosts || []}
          />
        </div>
      </section>

      <Footer footer={footer} branding={branding} theme={theme} />
    </div>
  )
}
