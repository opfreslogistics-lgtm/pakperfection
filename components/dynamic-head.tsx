'use client'

import { useEffect } from 'react'

export default function DynamicHead() {
  useEffect(() => {
    // Use the provided favicon URL directly
    const faviconUrl = 'https://opanykhlbusuwmnbswkb.supabase.co/storage/v1/object/public/branding/PK.JPG'
    
    // Remove all existing favicon links
    const existingLinks = document.querySelectorAll("link[rel~='icon']")
    existingLinks.forEach(link => link.remove())
    
    // Add new favicon link
    const newLink = document.createElement('link')
    newLink.rel = 'icon'
    newLink.type = 'image/jpeg'
    newLink.href = faviconUrl
    document.head.appendChild(newLink)
  }, [])

  return null
}

