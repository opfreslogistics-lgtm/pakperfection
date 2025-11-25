import { createClient } from '@/lib/supabase/server'
import Navigation from '@/components/navigation-new'
import Footer from '@/components/footer'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, User, ArrowLeft, Tag, Clock } from 'lucide-react'
import { notFound } from 'next/navigation'
import ShareButtons from './share-buttons'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = await createClient()
  
  // Try to find by slug first (if it doesn't look like a UUID)
  let post = null
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.slug)
  
  if (!isUUID) {
    const { data: postBySlug } = await supabase
      .from('blog_posts')
      .select(`
        *,
        blog_categories (
          id,
          name,
          slug
        )
      `)
      .eq('slug', params.slug)
      .eq('published', true)
      .single()
    
    if (postBySlug) {
      post = postBySlug
    }
  }
  
  // If not found by slug, try by id
  if (!post) {
    const { data: postById } = await supabase
      .from('blog_posts')
      .select(`
        *,
        blog_categories (
          id,
          name,
          slug
        )
      `)
      .eq('id', params.slug)
      .eq('published', true)
      .single()
    
    post = postById
  }

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: `${post.title} | Pak Perfection Blog`,
    description: post.excerpt || post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      images: post.featured_image_url ? [post.featured_image_url] : [],
    },
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
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

  // Fetch the blog post by slug or id
  // Try slug first (if slug is not empty), then fallback to id
  let post = null
  
  // Check if params.slug looks like a UUID (for id fallback)
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.slug)
  
  if (!isUUID) {
    // Try to find by slug first (only if it doesn't look like a UUID)
    const { data: postBySlug } = await supabase
      .from('blog_posts')
      .select(`
        *,
        blog_categories (
          id,
          name,
          slug
        )
      `)
      .eq('slug', params.slug)
      .eq('published', true)
      .single()
    
    if (postBySlug) {
      post = postBySlug
    }
  }
  
  // If not found by slug (or if it looks like a UUID), try by id
  if (!post) {
    const { data: postById } = await supabase
      .from('blog_posts')
      .select(`
        *,
        blog_categories (
          id,
          name,
          slug
        )
      `)
      .eq('id', params.slug)
      .eq('published', true)
      .single()
    
    post = postById
  }

  if (!post) {
    notFound()
  }

  // Fetch related posts (same category, excluding current post)
  const { data: relatedPosts } = await supabase
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
    .eq('category_id', post.category_id)
    .neq('id', post.id)
    .limit(3)
    .order('created_at', { ascending: false })

  // Parse content - could be JSONB object or string
  let content = ''
  let isHTML = false
  if (typeof post.content === 'object' && post.content !== null) {
    // If it's a JSONB object, try to extract text
    if (post.content.html) {
      content = post.content.html
      isHTML = true
    } else if (post.content.text) {
      content = post.content.text
    } else if (post.content.content) {
      content = post.content.content
      isHTML = typeof post.content.content === 'string' && post.content.content.includes('<')
    } else {
      content = JSON.stringify(post.content)
    }
  } else if (typeof post.content === 'string') {
    content = post.content
    isHTML = content.includes('<') && (content.includes('<p>') || content.includes('<div>') || content.includes('<br'))
  }

  // Calculate reading time (average 200 words per minute)
  // Strip HTML tags for accurate word count
  const textContent = isHTML 
    ? content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    : content
  const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <div className="min-h-screen">
      <Navigation branding={branding} navSettings={navSettings} theme={theme} />
      
      {/* Enhanced Hero Section with Featured Image */}
      {post.featured_image_url && (
        <section className="relative h-[500px] md:h-[600px] overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={post.featured_image_url}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20"></div>
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5"></div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
            <div className="container mx-auto max-w-4xl">
              <div className="flex items-center gap-3 mb-4">
                {post.blog_categories && (
                  <span className="inline-block bg-gradient-to-r from-red-600 to-yellow-500 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg">
                    {post.blog_categories.name}
                  </span>
                )}
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Clock size={16} />
                  <span className="text-sm font-semibold">{readingTime} min read</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight drop-shadow-2xl">{post.title}</h1>
              <div className="flex flex-wrap items-center gap-6 text-sm md:text-base">
                {post.author_name && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <User size={18} />
                    <span className="font-semibold">{post.author_name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Calendar size={18} />
                  <span className="font-semibold">
                    {new Date(post.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-gray-900 to-transparent"></div>
        </section>
      )}

      {/* Content Section */}
      <section className={`py-12 md:py-16 px-4 ${post.featured_image_url ? '-mt-12' : ''} relative z-10`}>
        <div className="container mx-auto max-w-4xl">
          {/* Back Button */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 mb-8 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-md"
          >
            <ArrowLeft size={20} />
            <span className="font-semibold">Back to Blog</span>
          </Link>

          {/* Article Content */}
          <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12 border-2 border-gray-100 dark:border-gray-700">
            {/* Title and Meta (if no featured image) */}
            {!post.featured_image_url && (
              <div className="mb-8 pb-8 border-b-2 border-gray-200 dark:border-gray-700">
                {post.blog_categories && (
                  <span className="inline-block bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                    {post.blog_categories.name}
                  </span>
                )}
                <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">{post.title}</h1>
                <div className="flex items-center gap-6 text-sm md:text-base text-gray-600 dark:text-gray-400">
                  {post.author_name && (
                    <div className="flex items-center gap-2">
                      <User size={18} />
                      <span>{post.author_name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar size={18} />
                    <span>
                      {new Date(post.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={18} />
                    <span>{readingTime} min read</span>
                  </div>
                </div>
              </div>
            )}

            {/* Excerpt */}
            {post.excerpt && (
              <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-yellow-50 dark:from-red-900/20 dark:to-yellow-900/20 rounded-xl border-l-4 border-red-600">
                <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 italic font-medium">
                  {post.excerpt}
                </p>
              </div>
            )}

            {/* Tags */}
            {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-8">
                {post.tags.map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 border border-gray-300 dark:border-gray-500 shadow-sm hover:shadow-md transition-all"
                  >
                    <Tag size={14} className="text-red-600 dark:text-red-400" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Main Content */}
            <div 
              className="prose prose-lg dark:prose-invert max-w-none mb-8
                prose-headings:text-gray-900 dark:prose-headings:text-white
                prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
                prose-strong:text-gray-900 dark:prose-strong:text-white
                prose-a:text-red-600 dark:prose-a:text-red-400
                prose-a:no-underline hover:prose-a:underline
                prose-ul:text-gray-700 dark:prose-ul:text-gray-300
                prose-ol:text-gray-700 dark:prose-ol:text-gray-300
                prose-li:text-gray-700 dark:prose-li:text-gray-300
                prose-blockquote:border-l-red-600 prose-blockquote:pl-4
                prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300
                prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
                prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl"
              dangerouslySetInnerHTML={{ 
                __html: isHTML 
                  ? content 
                  : content
                      .split(/\n\n+/)
                      .map(para => `<p>${para.replace(/\n/g, '<br />')}</p>`)
                      .join('')
              }}
            />

            {/* Share Section */}
            <ShareButtons 
              title={post.title} 
              excerpt={post.excerpt || undefined} 
              url={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/blog/${post.slug || post.id}`}
            />
          </article>

          {/* Related Posts */}
          {relatedPosts && relatedPosts.length > 0 && (
            <div className="mt-20">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-1 w-12 bg-gradient-to-r from-red-600 to-yellow-500 rounded-full"></div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Related Articles</h2>
                <div className="flex-1 h-1 bg-gradient-to-r from-yellow-500 to-transparent rounded-full"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost: any) => (
                  <Link
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.slug || relatedPost.id}`}
                    className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2 border-2 border-transparent hover:border-red-500/20"
                  >
                    {relatedPost.featured_image_url && (
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={relatedPost.featured_image_url}
                          alt={relatedPost.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    )}
                    <div className="p-6">
                      {relatedPost.blog_categories && (
                        <span className="inline-block bg-gradient-to-r from-red-600 to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-3 shadow-md">
                          {relatedPost.blog_categories.name}
                        </span>
                      )}
                      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                        {relatedPost.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                        {relatedPost.excerpt || 'No excerpt available.'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer footer={footer} branding={branding} theme={theme} />
    </div>
  )
}

