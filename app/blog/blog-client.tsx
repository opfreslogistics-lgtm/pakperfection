'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, User, ArrowRight, Search, Tag, Clock, TrendingUp, Filter } from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  featured_image_url?: string
  author_name?: string
  created_at: string
  tags?: string[]
  blog_categories?: {
    id: string
    name: string
    slug: string
  }
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function BlogClient({ 
  initialPosts, 
  categories, 
  recentPosts 
}: { 
  initialPosts: BlogPost[]
  categories: Category[]
  recentPosts: any[]
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')

  // Filter and search posts
  const filteredPosts = useMemo(() => {
    let filtered = [...initialPosts]

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => 
        post.blog_categories?.id === selectedCategory
      )
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(term) ||
        post.excerpt?.toLowerCase().includes(term) ||
        post.tags?.some(tag => tag.toLowerCase().includes(term)) ||
        post.author_name?.toLowerCase().includes(term)
      )
    }

    // Sort posts
    if (sortBy === 'oldest') {
      filtered.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    } else {
      filtered.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    }

    return filtered
  }, [initialPosts, searchTerm, selectedCategory, sortBy])

  // Calculate reading time (approximate)
  const getReadingTime = (excerpt?: string) => {
    if (!excerpt) return 3
    const words = excerpt.split(' ').length
    return Math.max(1, Math.ceil(words / 200))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-3">
        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search articles, tags, authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
                className="px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            Showing <span className="font-bold text-gray-900 dark:text-white">{filteredPosts.length}</span> article{filteredPosts.length !== 1 ? 's' : ''}
            {selectedCategory !== 'all' && (
              <span> in <span className="font-bold">{categories.find(c => c.id === selectedCategory)?.name}</span></span>
            )}
          </p>
        </div>

        {/* Blog Posts Grid */}
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-red-500/20"
              >
                {post.featured_image_url && (
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={post.featured_image_url}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {post.blog_categories && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-gradient-to-r from-red-600 to-yellow-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                          {post.blog_categories.name}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2 text-sm">
                        <Clock size={14} />
                        <span className="font-semibold text-gray-900">{getReadingTime(post.excerpt)} min</span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {post.author_name && (
                      <div className="flex items-center gap-1">
                        <User size={16} className="text-red-600" />
                        <span className="font-medium">{post.author_name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar size={16} className="text-yellow-600" />
                      <span>{new Date(post.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 leading-relaxed">
                    {post.excerpt || 'No excerpt available.'}
                  </p>
                  {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border border-gray-300 dark:border-gray-500"
                        >
                          <Tag size={12} />
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                          +{post.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                  <Link
                    href={`/blog/${post.slug || post.id}`}
                    className="inline-flex items-center gap-2 text-red-600 dark:text-red-400 font-bold hover:gap-3 transition-all group/link"
                  >
                    Read Full Article
                    <ArrowRight size={18} className="group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No articles found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm ? `No articles match "${searchTerm}"` : 'Try adjusting your filters'}
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                }}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-yellow-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        {/* Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <Filter size={20} className="text-red-600" />
            Categories
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`block w-full text-left px-4 py-3 rounded-xl transition-all font-semibold ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-red-600 to-yellow-500 text-white shadow-lg'
                  : 'hover:bg-red-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              All Posts
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`block w-full text-left px-4 py-3 rounded-xl transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-red-600 to-yellow-500 text-white shadow-lg font-semibold'
                    : 'hover:bg-red-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Posts */}
        {recentPosts.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-yellow-600" />
              Recent Posts
            </h3>
            <div className="space-y-4">
              {recentPosts.map((post: any) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug || post.id}`}
                  className="flex gap-3 group hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-xl transition-all"
                >
                  {post.featured_image_url && (
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                      <Image
                        src={post.featured_image_url}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      {post.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Newsletter */}
        <div className="bg-gradient-to-br from-red-600 via-yellow-500 to-green-600 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2">Newsletter</h3>
            <p className="mb-4 opacity-95 text-sm">Get the latest recipes and stories delivered to your inbox</p>
            <input
              type="email"
              placeholder="Your email address"
              className="w-full px-4 py-3 rounded-xl text-gray-900 mb-3 focus:ring-2 focus:ring-white focus:outline-none"
            />
            <button className="w-full bg-white text-red-600 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg">
              Subscribe Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


