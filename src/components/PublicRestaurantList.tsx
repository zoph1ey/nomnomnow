'use client'

import { useState } from 'react'
import type { SavedRestaurant } from '@/lib/supabase/restaurants'
import { getCurrencyConfig } from '@/lib/currency'
import { DietaryBadges } from './DietaryBadges'
import { ContextBadges } from './ContextBadges'

function StarRating({ value }: { value: number | null }) {
  if (!value) return null
  return (
    <span className="text-yellow-500 text-sm flex-shrink-0">
      {'★'.repeat(value)}
    </span>
  )
}

function PriceDisplay({ value, currency }: { value: number | null; currency: string | null }) {
  if (!value) return null
  const config = getCurrencyConfig(currency || 'USD')
  return (
    <span className="text-sm flex-shrink-0" title={config.labels[value - 1]}>
      {[1, 2, 3, 4].map(level => (
        <span
          key={level}
          className={level <= value ? 'text-orange-500' : 'text-gray-300'}
        >
          $
        </span>
      ))}
    </span>
  )
}

function PublicRestaurantCard({ restaurant }: { restaurant: SavedRestaurant }) {
  const [expanded, setExpanded] = useState(false)

  const hasDetails = restaurant.rating ||
    restaurant.what_to_order ||
    (restaurant.tags && restaurant.tags.length > 0) ||
    (restaurant.dietary_tags && restaurant.dietary_tags.length > 0) ||
    (restaurant.context_tags && restaurant.context_tags.length > 0) ||
    true // Always expandable to show notes (even if empty, we show "No notes")

  return (
    <div className="p-4 border border-orange-100 rounded-lg bg-white/80">
      <div
        className={`${hasDetails ? 'cursor-pointer' : ''}`}
        onClick={() => hasDetails && setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <h3 className="font-medium truncate">{restaurant.name}</h3>
            <StarRating value={restaurant.rating} />
            <PriceDisplay value={restaurant.price_range} currency={restaurant.currency} />
          </div>
          {hasDetails && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 text-orange-400 transition-transform flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
        <p className="text-muted-foreground text-sm truncate">{restaurant.address}</p>
        {/* Show tags preview */}
        {(restaurant.dietary_tags?.length > 0 || restaurant.context_tags?.length > 0) && (
          <div className="mt-2 flex flex-wrap gap-1">
            {restaurant.dietary_tags && restaurant.dietary_tags.length > 0 && (
              <DietaryBadges tags={restaurant.dietary_tags} />
            )}
            {restaurant.context_tags && restaurant.context_tags.length > 0 && (
              <ContextBadges tags={restaurant.context_tags} />
            )}
          </div>
        )}
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-orange-100 space-y-2 text-sm">
          {restaurant.tags && restaurant.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {restaurant.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-orange-50 text-orange-700 text-xs rounded-full border border-orange-200">
                  {tag}
                </span>
              ))}
            </div>
          )}
          {restaurant.what_to_order && (
            <p>
              <span className="text-muted-foreground">Order:</span>{' '}
              <span>{restaurant.what_to_order}</span>
            </p>
          )}
          <p>
            <span className="text-muted-foreground">Notes:</span>{' '}
            <span className="italic">
              {restaurant.notes || 'No notes'}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}

interface PublicRestaurantListProps {
  restaurants: SavedRestaurant[]
}

export default function PublicRestaurantList({ restaurants }: PublicRestaurantListProps) {
  if (restaurants.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No saved restaurants yet.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {restaurants.map(restaurant => (
        <PublicRestaurantCard key={restaurant.id} restaurant={restaurant} />
      ))}
    </div>
  )
}
