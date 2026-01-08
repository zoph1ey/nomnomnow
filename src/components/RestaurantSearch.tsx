'use client'

import { useState } from 'react'
import { useLoadScript, Autocomplete } from '@react-google-maps/api'

const libraries: ("places")[] = ['places']

interface Restaurant {
  name: string
  address: string
  placeId: string
}

interface Props {
  onSelect: (restaurant: Restaurant) => void
}

export default function RestaurantSearch({ onSelect }: Props) {
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY!,
    libraries,
  })

  const handlePlaceSelect = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace()
      
      if (place.place_id) {
        onSelect({
          name: place.name || '',
          address: place.formatted_address || '',
          placeId: place.place_id,
        })
      }
    }
  }

  if (loadError) return <p>Error loading Google Maps</p>
  if (!isLoaded) return <p>Loading...</p>

  return (
    <Autocomplete
      onLoad={(auto) => setAutocomplete(auto)}
      onPlaceChanged={handlePlaceSelect}
      options={{
        types: ['restaurant', 'cafe', 'bar', 'food'],
      }}
    >
      <input
        type="text"
        placeholder="Search for a restaurant..."
        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </Autocomplete>
  )
}