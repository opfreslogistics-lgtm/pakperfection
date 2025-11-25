'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin } from 'lucide-react'

interface AddressAutocompleteProps {
  value: string
  onChange: (address: string, details?: any) => void
  onAddressSelect: (address: {
    street: string
    city: string
    state: string
    zip: string
    fullAddress: string
  }) => void
  placeholder?: string
  required?: boolean
}

export default function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Start typing your address...",
  required = false
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const autocompleteServiceRef = useRef<any>(null)
  const placesServiceRef = useRef<any>(null)

  useEffect(() => {
    // Load Google Maps API
    if (typeof window !== 'undefined' && !window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      document.head.appendChild(script)
      
      script.onload = () => {
        if (window.google?.maps?.places) {
          autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService()
          placesServiceRef.current = new window.google.maps.places.PlacesService(
            document.createElement('div')
          )
        }
      }
    } else if (window.google?.maps?.places) {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService()
      placesServiceRef.current = new window.google.maps.places.PlacesService(
        document.createElement('div')
      )
    }
  }, [])

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    onChange(inputValue)

    if (inputValue.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    if (!autocompleteServiceRef.current) {
      return
    }

    setLoading(true)
    setShowSuggestions(true)

    autocompleteServiceRef.current.getPlacePredictions(
      {
        input: inputValue,
        componentRestrictions: { country: 'us' },
        types: ['address']
      },
      (predictions: any[], status: string) => {
        setLoading(false)
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions)
        } else {
          setSuggestions([])
        }
      }
    )
  }

  const handleSelectSuggestion = (placeId: string, description: string) => {
    if (!placesServiceRef.current) return

    setLoading(true)
    setShowSuggestions(false)

    placesServiceRef.current.getDetails(
      {
        placeId: placeId,
        fields: ['address_components', 'formatted_address']
      },
      (place: any, status: string) => {
        setLoading(false)
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          let street = ''
          let city = ''
          let state = ''
          let zip = ''

          place.address_components.forEach((component: any) => {
            const types = component.types
            if (types.includes('street_number')) {
              street = component.long_name + ' '
            }
            if (types.includes('route')) {
              street += component.long_name
            }
            if (types.includes('locality')) {
              city = component.long_name
            }
            if (types.includes('administrative_area_level_1')) {
              state = component.short_name
            }
            if (types.includes('postal_code')) {
              zip = component.long_name
            }
          })

          const addressData = {
            street: street.trim() || description,
            city: city || '',
            state: state || '',
            zip: zip || '',
            fullAddress: place.formatted_address || description
          }

          onChange(place.formatted_address || description, addressData)
          onAddressSelect(addressData)
        }
      }
    )
  }

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => value.length >= 3 && setShowSuggestions(true)}
          placeholder={placeholder}
          required={required}
          className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.place_id}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion.place_id, suggestion.description)}
              className="w-full text-left px-4 py-3 hover:bg-red-50 dark:hover:bg-gray-700 transition-colors flex items-start gap-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
            >
              <MapPin className="text-red-600 mt-0.5 flex-shrink-0" size={18} />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {suggestion.structured_formatting.main_text}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {suggestion.structured_formatting.secondary_text}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: any
  }
}
