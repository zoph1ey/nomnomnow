'use client'

import { useState, useEffect } from 'react'
import {
  getSavedRestaurants,
  deleteRestaurant,
  updateRestaurant,
  SavedRestaurant,
  DietaryTag,
  ContextTag
} from '@/lib/supabase/restaurants'
import RestaurantCard from './RestaurantCard'

interface SavedRestaurantsProps {
  refreshTrigger?: number
  priceFilter?: number[]
  dietaryFilter?: DietaryTag[]
  contextFilter?: ContextTag[]
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return 'Network error. Please check your connection and try again.'
    }
    if (error.message.includes('JWT') || error.message.includes('token')) {
      return 'Your session has expired. Please refresh the page and log in again.'
    }
    if (error.message.includes('Not logged in')) {
      return 'Please log in to continue.'
    }
    return error.message
  }
  return 'Something went wrong. Please try again.'
}

export default function SavedRestaurants({
  refreshTrigger = 0,
  priceFilter = [],
  dietaryFilter = [],
  contextFilter = [],
}: SavedRestaurantsProps) {
  const [restaurants, setRestaurants] = useState<SavedRestaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const filteredRestaurants = restaurants.filter(r => {
    const matchesPrice = priceFilter.length === 0 || (r.price_range && priceFilter.includes(r.price_range))
    const matchesDietary = dietaryFilter.length === 0 || dietaryFilter.every(tag => r.dietary_tags?.includes(tag))
    const matchesContext = contextFilter.length === 0 || contextFilter.some(tag => r.context_tags?.includes(tag))
    return matchesPrice && matchesDietary && matchesContext
  })

  useEffect(() => {
    fetchRestaurants()
  }, [refreshTrigger])

  async function fetchRestaurants() {
    try {
      setLoading(true)
      setLoadError(null)
      const data = await getSavedRestaurants()
      setRestaurants(data)
    } catch (err) {
      if (err instanceof Error && err.message !== 'Not logged in') {
        setLoadError(getErrorMessage(err))
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdate(
    id: string,
    updates: {
      notes: string
      what_to_order: string
      rating: number | null
      price_range: number | null
      dietary_tags: DietaryTag[]
      context_tags: ContextTag[]
      is_public: boolean
    }
  ) {
    const updated = await updateRestaurant(id, updates)
    setRestaurants(prev => prev.map(r => (r.id === id ? updated : r)))
  }

  async function handleDelete(id: string) {
    await deleteRestaurant(id)
    setRestaurants(prev => prev.filter(r => r.id !== id))
  }

  if (loading) {
    return <div className="mt-8 text-gray-500 dark:text-gray-400 text-sm">Loading saved restaurants...</div>
  }

  if (restaurants.length === 0) {
    return null
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Your Saved Restaurants</h2>

      {loadError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex justify-between items-center">
          <p className="text-red-600 dark:text-red-400 text-sm">{loadError}</p>
          <button
            onClick={fetchRestaurants}
            className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
          >
            Retry
          </button>
        </div>
      )}

      {filteredRestaurants.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">No restaurants match the selected filters.</p>
      ) : (
        <div className="space-y-3">
          {filteredRestaurants.map(restaurant => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
