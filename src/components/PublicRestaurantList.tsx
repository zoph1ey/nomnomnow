'use client'

import { useState } from 'react'
import type { SavedRestaurant } from '@/lib/supabase/restaurants'

function StarRating({ value }: { value: number | null }) {
  if (!value) return null
  return (
    <span className="text-yellow-500 dark:text-yellow-400 text-sm flex-shrink-0">
      {'★'.repeat(value)}
    </span>
  )
}

function PublicRestaurantCard({ restaurant }: { restaurant: SavedRestaurant }) {
  const [expanded, setExpanded] = useState(false)

  const hasDetails = restaurant.rating ||
    restaurant.what_to_order ||
    restaurant.notes ||
    (restaurant.tags && restaurant.tags.length > 0)

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
      <div
        className={`${hasDetails ? 'cursor-pointer' : ''}`}
        onClick={() => hasDetails && setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{restaurant.name}</h3>
            <StarRating value={restaurant.rating} />
          </div>
          {hasDetails && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm truncate">{restaurant.address}</p>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2 text-sm">
          {restaurant.tags && restaurant.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {restaurant.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
          {restaurant.what_to_order && (
            <p>
              <span className="text-gray-500 dark:text-gray-400">Order:</span>{' '}
              <span className="text-gray-800 dark:text-gray-200">{restaurant.what_to_order}</span>
            </p>
          )}
          {restaurant.notes && (
            <p>
              <span className="text-gray-500 dark:text-gray-400">Notes:</span>{' '}
              <span className="text-gray-700 dark:text-gray-300 italic">{restaurant.notes}</span>
            </p>
          )}
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
      <p className="text-gray-600 dark:text-gray-400 text-center py-8">
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
