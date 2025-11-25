'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, Eye, Upload, Save, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import RichTextEditor from '@/components/admin/rich-text-editor'

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPost, setEditingPost] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image_url: '',
    category_id: '',
    author_name: '',
    tags: [] as string[],
    published: false,
  })
  const [tagInput, setTagInput] = useState('')
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [postsRes, categoriesRes] = await Promise.all([
      supabase.from('blog_posts').select('*, blog_categories(name)').order('created_at', { ascending: false }),
      supabase.from('blog_categories').select('*').order('name'),
    ])

    if (postsRes.data) setPosts(postsRes.data)
    if (categoriesRes.data) setCategories(categoriesRes.data)
    setLoading(false)
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleFileUpload = async (file: File) => {
    try {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return null
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid file type. Please upload an image (JPEG, PNG, GIF, or WebP)')
        return null
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `blog_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `blog/${fileName}`

      toast.loading('Uploading image...')

      // Upload the file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        toast.dismiss()
        
        // Provide more specific error messages
        if (uploadError.message.includes('Bucket not found')) {
          toast.error('Storage bucket not configured. Please run the storage migration.')
        } else if (uploadError.message.includes('duplicate')) {
          toast.error('File already exists. Please try again.')
        } else if (uploadError.message.includes('JWT')) {
          toast.error('Authentication error. Please log in again.')
        } else {
          toast.error(`Upload failed: ${uploadError.message}`)
        }
        return null
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath)
      
      toast.dismiss()
      toast.success('Image uploaded successfully!')
      
      return urlData.publicUrl
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.dismiss()
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`)
      return null
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] })
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })
  }

  const savePost = async () => {
    if (!formData.title) {
      toast.error('Title is required')
      return
    }
    
    // Auto-generate slug if not provided
    const finalSlug = formData.slug || generateSlug(formData.title)

    // Handle content - convert to JSONB format
    let contentData: any = formData.content
    if (typeof formData.content === 'string') {
      contentData = { html: formData.content }
    }

    // Handle tags - convert array to JSONB
    let tagsData: any = formData.tags
    if (Array.isArray(formData.tags)) {
      tagsData = formData.tags
    }

    const postData: any = {
      title: formData.title,
      slug: finalSlug,
      excerpt: formData.excerpt || null,
      content: contentData,
      featured_image_url: formData.featured_image_url || null,
      category_id: formData.category_id || null,
      author_name: formData.author_name || null,
      tags: tagsData,
      published: formData.published || false,
      published_at: formData.published ? new Date().toISOString() : null,
    }

    try {
      if (editingPost) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id)
        if (error) {
          console.error('Update error:', error)
          throw error
        }
        toast.success('Post updated!')
      } else {
        const { error } = await supabase.from('blog_posts').insert(postData)
        if (error) {
          console.error('Insert error:', error)
          throw error
        }
        toast.success('Post created!')
      }
      setShowModal(false)
      setEditingPost(null)
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        featured_image_url: '',
        category_id: '',
        author_name: '',
        tags: [],
        published: false,
      })
      loadData()
    } catch (error: any) {
      console.error('Save error:', error)
      toast.error(error.message || 'Failed to save post')
    }
  }

  const deletePost = async (id: string) => {
    if (!confirm('Are you sure?')) return
    const { error } = await supabase.from('blog_posts').delete().eq('id', id)
    if (error) {
      toast.error('Failed to delete')
    } else {
      toast.success('Post deleted!')
      loadData()
    }
  }

  const createCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Category name is required')
      return
    }

    const slug = newCategoryName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    try {
      const { error } = await supabase
        .from('blog_categories')
        .insert({
          name: newCategoryName.trim(),
          slug: slug
        })

      if (error) {
        if (error.code === '23505') {
          toast.error('Category already exists')
        } else {
          throw error
        }
      } else {
        toast.success('Category created!')
        setNewCategoryName('')
        setShowCategoryModal(false)
        loadData()
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create category')
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Loading blog posts...</p>
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
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg">
              <Eye className="text-white" size={32} />
            </div>
            Blog Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Create and manage blog posts</p>
        </div>
        <button
          onClick={() => {
            setEditingPost(null)
            setFormData({
              title: '',
              slug: '',
              excerpt: '',
              content: '',
              featured_image_url: '',
              category_id: '',
              author_name: '',
              tags: [],
              published: false,
            })
            setShowModal(true)
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-yellow-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all shadow-lg"
        >
          <Plus size={20} />
          New Post
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl shadow-lg p-6 border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <Eye className="text-white" size={28} />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Total Posts</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{posts.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl shadow-lg p-6 border-2 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
              <Save className="text-white" size={28} />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Published</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{posts.filter(p => p.published).length}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl shadow-lg p-6 border-2 border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <Plus className="text-white" size={28} />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Categories</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{categories.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all hover:scale-105">
            {post.featured_image_url && (
              <div className="relative h-48">
                <Image
                  src={post.featured_image_url}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
                {post.published && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                    Published
                  </div>
                )}
              </div>
            )}
            <div className="p-5">
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{post.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingPost(post)
                      // Handle content - could be JSONB object or string
                      let contentValue = ''
                      if (typeof post.content === 'object' && post.content !== null) {
                        contentValue = post.content.html || post.content.text || JSON.stringify(post.content)
                      } else {
                        contentValue = post.content || ''
                      }
                      
                      // Handle tags - could be array or JSONB
                      let tagsValue: string[] = []
                      if (Array.isArray(post.tags)) {
                        tagsValue = post.tags
                      } else if (typeof post.tags === 'string') {
                        try {
                          tagsValue = JSON.parse(post.tags)
                        } catch {
                          tagsValue = []
                        }
                      }

                      setFormData({
                        title: post.title || '',
                        slug: post.slug || '',
                        excerpt: post.excerpt || '',
                        content: contentValue,
                        featured_image_url: post.featured_image_url || '',
                        category_id: post.category_id || '',
                        author_name: post.author_name || '',
                        tags: tagsValue,
                        published: post.published || false,
                      })
                      setShowModal(true)
                    }}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className="text-blue-600 hover:underline"
                >
                  <Eye size={18} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeInUp">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border-2 border-gray-200 dark:border-gray-700">
            <div className="sticky top-0 bg-gradient-to-r from-red-600 to-yellow-500 text-white p-6 rounded-t-2xl z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-1">{editingPost ? 'Edit Post' : 'Create New Post'}</h2>
                  <p className="text-white/90 text-sm">Write and format your blog post content</p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setEditingPost(null)
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={28} className="text-white" />
                </button>
              </div>
            </div>
            <div className="p-8">

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-2 font-bold text-gray-900 dark:text-white">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({ ...formData, title: e.target.value, slug: generateSlug(e.target.value) })
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                      placeholder="Enter blog post title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-bold text-gray-900 dark:text-white">Slug *</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                      placeholder="url-friendly-slug"
                      required
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Auto-generated from title, but you can edit it</p>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-bold text-gray-900 dark:text-white">Excerpt</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                    rows={3}
                    placeholder="Brief summary of the blog post (shown in listings)"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">A short description that appears in blog listings</p>
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-lg">Content *</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Use the rich text editor to format your content. You can add headings, lists, links, images, and more.
                  </p>
                  <div className="border-2 border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden">
                    <RichTextEditor
                      value={formData.content}
                      onChange={(value) => setFormData({ ...formData, content: value })}
                      placeholder="Start writing your blog post content here..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-2 font-bold text-gray-900 dark:text-white">Category</label>
                    <div className="flex gap-2">
                      <select
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowCategoryModal(true)}
                        className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg font-semibold"
                        title="Add New Category"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 font-bold text-gray-900 dark:text-white">Author Name</label>
                    <input
                      type="text"
                      value={formData.author_name}
                      onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                      placeholder="Author name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-bold text-gray-900 dark:text-white">Featured Image</label>
                  {formData.featured_image_url && (
                    <div className="mb-4 relative w-full max-w-md h-48 rounded-xl overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                      <Image 
                        src={formData.featured_image_url} 
                        alt="Featured" 
                        fill
                        className="object-cover"
                      />
                      <button
                        onClick={() => setFormData({ ...formData, featured_image_url: '' })}
                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 shadow-lg"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                  <label className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-yellow-500 text-white px-6 py-3 rounded-xl cursor-pointer w-fit hover:shadow-xl hover:scale-105 transition-all shadow-lg font-semibold">
                    <Upload size={20} />
                    {formData.featured_image_url ? 'Change Image' : 'Upload Featured Image'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          toast.loading('Uploading image...')
                          const url = await handleFileUpload(file)
                          if (url) {
                            setFormData({ ...formData, featured_image_url: url })
                            toast.dismiss()
                            toast.success('Image uploaded!')
                          } else {
                            toast.dismiss()
                          }
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Recommended: 1200x630px for best display</p>
                </div>

                <div>
                  <label className="block mb-2 font-bold text-gray-900 dark:text-white">Tags</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                      placeholder="Add tag and press Enter"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg font-semibold"
                    >
                      Add Tag
                    </button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-md"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-red-600"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
                  <input
                    type="checkbox"
                    id="publish-checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 text-green-600 focus:ring-2 focus:ring-green-500"
                  />
                  <label htmlFor="publish-checkbox" className="font-bold text-gray-900 dark:text-white cursor-pointer">
                    Publish immediately
                  </label>
                  <span className="text-sm text-gray-600 dark:text-gray-400">(Uncheck to save as draft)</span>
                </div>

                <div className="flex gap-4 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                  <button
                    onClick={savePost}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-yellow-500 text-white py-4 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all shadow-lg"
                  >
                    <Save size={20} />
                    {formData.published ? 'Publish Post' : 'Save as Draft'}
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false)
                      setEditingPost(null)
                    }}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add New Category</h3>
              <button
                onClick={() => {
                  setShowCategoryModal(false)
                  setNewCategoryName('')
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-semibold">Category Name</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                  placeholder="e.g., Recipes, News, Events"
                  onKeyPress={(e) => e.key === 'Enter' && createCategory()}
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={createCategory}
                  className="flex-1 bg-gradient-to-r from-red-600 to-yellow-500 text-white py-2 rounded-lg font-semibold hover:opacity-90"
                >
                  Create Category
                </button>
                <button
                  onClick={() => {
                    setShowCategoryModal(false)
                    setNewCategoryName('')
                  }}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 py-2 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

