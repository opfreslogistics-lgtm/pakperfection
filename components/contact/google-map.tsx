'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'

export default function GoogleMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
    
    if (!GOOGLE_MAPS_API_KEY) {
      setError('Google Maps API key is not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable.')
      setIsLoading(false)
      return
    }

    const loadMap = () => {
      // Check if script already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
      
      if (existingScript) {
        // Script already loaded, just initialize map
        if (window.google && window.google.maps) {
          initMap()
        } else {
          // Wait for script to load
          existingScript.addEventListener('load', initMap)
        }
        return
      }

      // Load the Google Maps script
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => {
        initMap()
      }
      script.onerror = () => {
        setError('Failed to load Google Maps. Please check your internet connection.')
        setIsLoading(false)
      }
      document.head.appendChild(script)
    }

    const initMap = () => {
      try {
        if (!mapRef.current) {
          setError('Map reference not found')
          setIsLoading(false)
          return
        }

        if (!window.google || !window.google.maps) {
          setError('Google Maps API failed to load')
          setIsLoading(false)
          return
        }

        // Pak Perfection location: 1502 OAKLAND PKWY, LIMA, OH 45805
        const location = { lat: 40.7420, lng: -84.1053 }
        
        const map = new window.google.maps.Map(mapRef.current, {
          center: location,
          zoom: 15,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#d4e7f5' }]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#ffffff' }]
            },
            {
              featureType: 'landscape',
              elementType: 'geometry',
              stylers: [{ color: '#f5f5f5' }]
            }
          ],
          mapTypeControl: false,
          fullscreenControl: true,
          streetViewControl: true,
          zoomControl: true,
          gestureHandling: 'cooperative'
        })

        // Add custom marker
        const marker = new window.google.maps.Marker({
          position: location,
          map: map,
          title: 'Pak Perfection',
          animation: window.google.maps.Animation.DROP,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#dc2626',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3
          }
        })

        // Info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 15px; max-width: 250px;">
              <h3 style="margin: 0 0 10px 0; font-weight: bold; color: #1f2937; font-size: 18px;">🍽️ Pak Perfection</h3>
              <p style="margin: 0 0 8px 0; color: #4b5563; line-height: 1.5;">
                <strong>📍 Address:</strong><br>
                1502 OAKLAND PKWY<br>
                LIMA, OH 45805
              </p>
              <p style="margin: 0 0 8px 0;">
                <strong>📞 Phone:</strong><br>
                <a href="tel:+14195168739" style="color: #059669; text-decoration: none; font-weight: 600;">+1 (419) 516-8739</a>
              </p>
              <p style="margin: 0;">
                <strong>✉️ Email:</strong><br>
                <a href="mailto:info@pakperfectioninter.com" style="color: #059669; text-decoration: none; font-weight: 600;">info@pakperfectioninter.com</a>
              </p>
              <a href="https://www.google.com/maps/dir/?api=1&destination=40.7420,-84.1053" 
                 target="_blank" 
                 style="display: inline-block; margin-top: 10px; padding: 8px 16px; background: #059669; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
                Get Directions
              </a>
            </div>
          `
        })

        // Open info window on marker click
        marker.addListener('click', () => {
          infoWindow.open(map, marker)
        })

        // Open info window by default
        setTimeout(() => {
          infoWindow.open(map, marker)
        }, 500)

        setIsLoading(false)
      } catch (err) {
        setError('Failed to initialize map')
        setIsLoading(false)
      }
    }

    loadMap()

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.innerHTML = ''
      }
    }
  }, [])

  return (
    <div className="w-full h-full min-h-[500px] rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-200 dark:border-gray-700 relative bg-gray-100 dark:bg-gray-800">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 font-semibold">Loading map...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900/20 z-10">
          <div className="text-center p-6">
            <MapPin className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 font-semibold mb-2">Map Loading Error</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      <div ref={mapRef} className="w-full h-full min-h-[500px]" />
    </div>
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    google: any
  }
}

