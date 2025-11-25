'use client'

import { Share2, Twitter, Facebook, Link2, Copy, Check, Linkedin, Mail } from 'lucide-react'
import { useState } from 'react'

export default function ShareButtons({ title, excerpt, url }: { title: string; excerpt?: string; url: string }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: excerpt || '',
          url,
        })
      } catch (err) {
        // User cancelled or error occurred
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy to clipboard
      handleCopy()
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      color: 'bg-blue-400 hover:bg-blue-500',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      color: 'bg-blue-700 hover:bg-blue-800',
    },
    {
      name: 'Email',
      icon: Mail,
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
      color: 'bg-gray-600 hover:bg-gray-700',
    },
  ]

  return (
    <div className="mt-12 pt-8 border-t-2 border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-red-500 to-yellow-500 rounded-lg">
          <Share2 className="text-white" size={20} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Share this article</h3>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {shareLinks.map((link) => {
          const Icon = link.icon
          return (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${link.color} text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}
            >
              <Icon size={18} />
              <span>{link.name}</span>
            </a>
          )
        })}
        
        <button
          onClick={handleCopy}
          className={`${
            copied 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-gray-700 hover:bg-gray-800'
          } text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}
        >
          {copied ? (
            <>
              <Check size={18} />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={18} />
              <span>Copy Link</span>
            </>
          )}
        </button>

        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={handleShare}
            className="bg-gradient-to-r from-red-600 to-yellow-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <Share2 size={18} />
            <span>Share</span>
          </button>
        )}
      </div>

      {/* Share URL Display */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-2">
          <Link2 size={16} className="text-gray-500 dark:text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Article URL:</span>
        </div>
        <p className="mt-2 text-sm text-gray-900 dark:text-white break-all font-mono bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600">
          {url}
        </p>
      </div>
    </div>
  )
}
