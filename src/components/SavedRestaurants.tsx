'use client'

import { useState, useEffect } from 'react'
import {
  getSavedRestaurants,
  deleteRestaurant,
  updateRestaurant,
  SavedRestaurant,
  DIETARY_TAGS,
  DietaryTag,
  CONTEXT_TAGS,
  ContextTag
} from '@/lib/supabase/restaurants'
import { getCurrencyConfig } from '@/lib/currency'
import { DietaryBadges } from './DietaryBadges'
import { ContextBadges } from './ContextBadges'

// Display labels for dietary tags
const DIETARY_LABELS: Record<DietaryTag, string> = {
  'halal': 'Halal',
  'vegetarian': 'Vegetarian',
  'vegan': 'Vegan',
  'gluten-free': 'Gluten-Free',
  'dairy-free': 'Dairy-Free',
  'nut-free': 'Nut-Free',
}

// Display labels for context tags
const CONTEXT_LABELS: Record<ContextTag, string> = {
  'date-night': 'Date Night',
  'solo-friendly': 'Solo Friendly',
  'group-friendly': 'Group Friendly',
  'special-occasion': 'Special Occasion',
  'quick-lunch': 'Quick Lunch',
  'late-night': 'Late Night',
  'family-friendly': 'Family Friendly',
  'work-meeting': 'Work Meeting',
  'casual-hangout': 'Casual Hangout',
}

interface SavedRestaurantsProps {
  refreshTrigger?: number
  priceFilter?: number[]  // Array of price levels to show (empty = show all)
  dietaryFilter?: DietaryTag[]  // Array of dietary tags to filter by (empty = show all)
  contextFilter?: ContextTag[]  // Array of context tags to filter by (empty = show all)
}

// Star rating component for display and input
function StarRating({
  value,
  onChange,
  readonly = false
}: {
  value: number | null
  onChange?: (rating: number | null) => void
  readonly?: boolean
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(value === star ? null : star)}
          className={`text-lg ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform text-yellow-500`}
        >
          {value && star <= value ? '★' : '☆'}
        </button>
      ))}
    </div>
  )
}

// Price range display component - uses universal $ symbols for consistency
function PriceDisplay({ value, currency }: { value: number | null; currency: string | null }) {
  if (!value) return null
  const config = getCurrencyConfig(currency || 'USD')
  return (
    <span className="text-sm flex-shrink-0" title={config.labels[value - 1]}>
      {[1, 2, 3, 4].map(level => (
        <span
          key={level}
          className={level <= value ? 'text-blue-500' : 'text-gray-300'}
        >
          $
        </span>
      ))}
    </span>
  )
}

// Price range selector for edit form
function PriceRangeSelector({
  value,
  onChange
}: {
  value: number | null
  onChange: (price: number | null) => void
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4].map(level => (
        <button
          key={level}
          type="button"
          onClick={() => onChange(value === level ? null : level)}
          className={`px-2 py-1 text-sm rounded border transition-colors ${
            value === level
              ? 'bg-blue-500 text-white border-blue-500'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
          }`}
        >
          {'$'.repeat(level)}
        </button>
      ))}
    </div>
  )
}

// Edit form for a single restaurant
function EditForm({
  restaurant,
  onSave,
  onCancel,
  saving
}: {
  restaurant: SavedRestaurant
  onSave: (updates: { notes: string; what_to_order: string; rating: number | null; price_range: number | null; dietary_tags: DietaryTag[]; context_tags: ContextTag[] }) => void
  onCancel: () => void
  saving: boolean
}) {
  const [notes, setNotes] = useState(restaurant.notes || '')
  const [whatToOrder, setWhatToOrder] = useState(restaurant.what_to_order || '')
  const [rating, setRating] = useState<number | null>(restaurant.rating)
  const [priceRange, setPriceRange] = useState<number | null>(restaurant.price_range)
  const [dietaryTags, setDietaryTags] = useState<DietaryTag[]>(restaurant.dietary_tags || [])
  const [contextTags, setContextTags] = useState<ContextTag[]>(restaurant.context_tags || [])

  const toggleDietaryTag = (tag: DietaryTag) => {
    if (dietaryTags.includes(tag)) {
      setDietaryTags(dietaryTags.filter(t => t !== tag))
    } else {
      setDietaryTags([...dietaryTags, tag])
    }
  }

  const toggleContextTag = (tag: ContextTag) => {
    if (contextTags.includes(tag)) {
      setContextTags(contextTags.filter(t => t !== tag))
    } else {
      setContextTags([...contextTags, tag])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      notes: notes || '',
      what_to_order: whatToOrder || '',
      rating,
      price_range: priceRange,
      dietary_tags: dietaryTags,
      context_tags: contextTags
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 border-t pt-3">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">Rating</label>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">Price Range</label>
        <PriceRangeSelector value={priceRange} onChange={setPriceRange} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">Dietary Options</label>
        <div className="grid grid-cols-2 gap-1">
          {DIETARY_TAGS.map(tag => (
            <label
              key={tag}
              className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-gray-50 transition-colors"
            >
              <input
                type="checkbox"
                checked={dietaryTags.includes(tag)}
                onChange={() => toggleDietaryTag(tag)}
                className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{DIETARY_LABELS[tag]}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">Best For</label>
        <div className="flex flex-wrap gap-1.5">
          {CONTEXT_TAGS.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleContextTag(tag)}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                contextTags.includes(tag)
                  ? 'bg-purple-500 text-white border-purple-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
              }`}
            >
              {CONTEXT_LABELS[tag]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">What to order</label>
        <input
          type="text"
          value={whatToOrder}
          onChange={e => setWhatToOrder(e.target.value)}
          placeholder="e.g., Spicy ramen, gyoza"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Personal notes..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

// Convert error messages to user-friendly text
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Handle common Supabase/network errors
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return 'Network error. Please check your connection and try again.'
    }
    if (error.message.includes('JWT') || error.message.includes('token')) {
      return 'Your session has expired. Please refresh the page and log in again.'
    }
    if (error.message.includes('permission') || error.message.includes('policy')) {
      return 'You don\'t have permission to perform this action.'
    }
    if (error.message.includes('Not logged in')) {
      return 'Please log in to continue.'
    }
    return error.message
  }
  return 'Something went wrong. Please try again.'
}

// Single restaurant card
function RestaurantCard({
  restaurant,
  onUpdate,
  onDelete
}: {
  restaurant: SavedRestaurant
  onUpdate: (id: string, updates: { notes: string; what_to_order: string; rating: number | null; price_range: number | null; dietary_tags: DietaryTag[]; context_tags: ContextTag[] }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isLoading = saving || deleting

  const handleSave = async (updates: { notes: string; what_to_order: string; rating: number | null; price_range: number | null; dietary_tags: DietaryTag[]; context_tags: ContextTag[] }) => {
    setSaving(true)
    setError(null)
    try {
      await onUpdate(restaurant.id, updates)
      setEditing(false)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    setError(null)
    try {
      await onDelete(restaurant.id)
    } catch (err) {
      setError(getErrorMessage(err))
      setConfirmDelete(false)
    } finally {
      setDeleting(false)
    }
  }

  const hasDetails = restaurant.rating || restaurant.what_to_order || restaurant.notes || (restaurant.tags && restaurant.tags.length > 0) || (restaurant.dietary_tags && restaurant.dietary_tags.length > 0) || (restaurant.context_tags && restaurant.context_tags.length > 0)

  return (
    <div className={`p-4 border rounded-lg bg-white ${isLoading ? 'opacity-75' : ''}`}>
      {/* Header row - clickable to expand */}
      <div
        className="flex justify-between items-start gap-4 cursor-pointer"
        onClick={() => !editing && setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 truncate">{restaurant.name}</h3>
            {restaurant.rating && (
              <span className="text-yellow-500 text-sm flex-shrink-0">
                {'★'.repeat(restaurant.rating)}
              </span>
            )}
            <PriceDisplay value={restaurant.price_range} currency={restaurant.currency} />
          </div>
          <p className="text-gray-500 text-sm truncate">{restaurant.address}</p>
            {(restaurant.dietary_tags?.length > 0 || restaurant.context_tags?.length > 0) && (
              <div className="mt-1 flex flex-wrap gap-1">
                {restaurant.dietary_tags && restaurant.dietary_tags.length > 0 && (
                  <DietaryBadges tags={restaurant.dietary_tags} />
                )}
                {restaurant.context_tags && restaurant.context_tags.length > 0 && (
                  <ContextBadges tags={restaurant.context_tags} maxDisplay={3} />
                )}
              </div>
            )}
        </div>

        {/* Action buttons */}
        <div className="flex-shrink-0 flex gap-1" onClick={e => e.stopPropagation()}>
          {!editing && (
            <>
              {/* Expand/collapse chevron */}
              {hasDetails && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  disabled={isLoading}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={expanded ? 'Collapse' : 'View details'}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 transition-transform ${expanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}

              <button
                onClick={() => {
                  setError(null)
                  setExpanded(true)
                  setEditing(true)
                }}
                disabled={isLoading}
                className="p-2 text-gray-400 hover:text-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Edit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </>
          )}

          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">Delete?</span>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Yes'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={isLoading}
                className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex justify-between items-start gap-2">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Expanded view (read-only details) */}
      {expanded && !editing && (
        <div className="mt-3 pt-3 border-t space-y-2 text-sm">
          {restaurant.tags && restaurant.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {restaurant.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
          {restaurant.what_to_order && (
            <p><span className="text-gray-400">Order:</span> <span className="text-gray-700">{restaurant.what_to_order}</span></p>
          )}
          {restaurant.notes && (
            <p><span className="text-gray-400">Notes:</span> <span className="text-gray-600 italic">{restaurant.notes}</span></p>
          )}
        </div>
      )}

      {/* Edit form */}
      {editing && (
        <EditForm
          restaurant={restaurant}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
          saving={saving}
        />
      )}
    </div>
  )
}

export default function SavedRestaurants({ refreshTrigger = 0, priceFilter = [], dietaryFilter = [], contextFilter = [] }: SavedRestaurantsProps) {
  const [restaurants, setRestaurants] = useState<SavedRestaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Filter restaurants by price range, dietary tags, and context tags (empty filter = show all)
  const filteredRestaurants = restaurants.filter(r => {
    // Price filter: if no price filter selected, or restaurant matches price filter
    const matchesPrice = priceFilter.length === 0 || (r.price_range && priceFilter.includes(r.price_range))

    // Dietary filter: restaurant must have ALL selected dietary tags (AND logic)
    const matchesDietary = dietaryFilter.length === 0 ||
      dietaryFilter.every(tag => r.dietary_tags?.includes(tag))

    // Context filter: restaurant must have ANY selected context tags (OR logic - show if it fits ANY occasion)
    const matchesContext = contextFilter.length === 0 ||
      contextFilter.some(tag => r.context_tags?.includes(tag))

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

  async function handleUpdate(id: string, updates: { notes: string; what_to_order: string; rating: number | null; price_range: number | null; dietary_tags: DietaryTag[]; context_tags: ContextTag[] }) {
    const updated = await updateRestaurant(id, updates)
    setRestaurants(prev => prev.map(r => r.id === id ? updated : r))
  }

  async function handleDelete(id: string) {
    await deleteRestaurant(id)
    setRestaurants(prev => prev.filter(r => r.id !== id))
  }

  if (loading) {
    return <div className="mt-8 text-gray-500 text-sm">Loading saved restaurants...</div>
  }

  if (restaurants.length === 0) {
    return null
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Your Saved Restaurants</h2>

      {loadError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center">
          <p className="text-red-600 text-sm">{loadError}</p>
          <button
            onClick={fetchRestaurants}
            className="text-sm text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
        </div>
      )}

      {filteredRestaurants.length === 0 ? (
        <p className="text-gray-500 text-sm">No restaurants match the selected filters.</p>
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
