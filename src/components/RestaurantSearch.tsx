'use client'

import { useState, useRef } from 'react'
import { useLoadScript, Autocomplete } from '@react-google-maps/api'
import { SearchIcon, type SearchIconHandle } from '@/components/ui/search'

const libraries: ("places")[] = ['places']

interface Restaurant {
  name: string
  address: string
  placeId: string
  countryCode: string | null  // ISO country code (e.g., 'MY', 'US')
}

interface Props {
  onSelect: (restaurant: Restaurant) => void
}

// Map country codes to currencies
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  // North America
  US: 'USD', CA: 'CAD', MX: 'MXN',

  // South America
  BR: 'BRL', AR: 'ARS', CL: 'CLP', CO: 'COP', PE: 'PEN',

  // Europe - Eurozone
  DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR', BE: 'EUR', AT: 'EUR',
  PT: 'EUR', IE: 'EUR', FI: 'EUR', GR: 'EUR', SK: 'EUR', SI: 'EUR', EE: 'EUR',
  LV: 'EUR', LT: 'EUR', CY: 'EUR', MT: 'EUR', LU: 'EUR',

  // Europe - Non-Eurozone
  GB: 'GBP', CH: 'CHF', SE: 'SEK', NO: 'NOK', DK: 'DKK', PL: 'PLN',
  CZ: 'CZK', HU: 'HUF', RO: 'RON', TR: 'TRY', RU: 'RUB', UA: 'UAH',

  // Asia
  MY: 'MYR', SG: 'SGD', JP: 'JPY', CN: 'CNY', HK: 'HKD', TW: 'TWD',
  KR: 'KRW', TH: 'THB', VN: 'VND', ID: 'IDR', PH: 'PHP', IN: 'INR',
  PK: 'PKR', BD: 'BDT', LK: 'LKR', NP: 'NPR', MM: 'MMK', KH: 'KHR',

  // Middle East
  AE: 'AED', SA: 'SAR', QA: 'QAR', KW: 'KWD', BH: 'BHD', OM: 'OMR',
  JO: 'JOD', IL: 'ILS', EG: 'EGP',

  // Africa
  ZA: 'ZAR', NG: 'NGN', KE: 'KES', GH: 'GHS', MA: 'MAD', TZ: 'TZS',

  // Oceania
  AU: 'AUD', NZ: 'NZD', FJ: 'FJD',
}

export function getCountryCurrency(countryCode: string | null): string {
  if (!countryCode) return 'USD'
  return COUNTRY_TO_CURRENCY[countryCode] || 'USD'
}

export default function RestaurantSearch({ onSelect }: Props) {
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)
  const searchIconRef = useRef<SearchIconHandle>(null)

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY!,
    libraries,
  })

  const handlePlaceSelect = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace()

      if (place.place_id) {
        // Extract country code from address components
        const countryComponent = place.address_components?.find(
          component => component.types.includes('country')
        )
        const countryCode = countryComponent?.short_name || null

        onSelect({
          name: place.name || '',
          address: place.formatted_address || '',
          placeId: place.place_id,
          countryCode,
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
      <div
        className="relative"
        onMouseEnter={() => searchIconRef.current?.startAnimation()}
        onMouseLeave={() => searchIconRef.current?.stopAnimation()}
      >
        <SearchIcon
          ref={searchIconRef}
          size={20}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search for a restaurant..."
          className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border-orange-200"
        />
      </div>
    </Autocomplete>
  )
}