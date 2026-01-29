'use client'

import { useState } from 'react'
import { SavedRestaurant, DietaryTag, ContextTag } from '@/lib/supabase/restaurants'
import { DietaryBadges } from './DietaryBadges'
import { ContextBadges } from './ContextBadges'
import PriceDisplay from './PriceDisplay'
import RestaurantEditForm from './RestaurantEditForm'
import { ChevronDownIcon } from '@/components/ui/chevron-down'
import { ChevronUpIcon } from '@/components/ui/chevron-up'
import { DeleteIcon } from '@/components/ui/delete'
import { SquarePenIcon } from '@/components/ui/square-pen'

interface RestaurantCardProps {
  restaurant: SavedRestaurant
  onUpdate: (id: string, updates: {
    notes: string
    what_to_order: string
    rating: number | null
    price_range: number | null
    dietary_tags: DietaryTag[]
    context_tags: ContextTag[]
    is_public: boolean
  }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
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

export default function RestaurantCard({ restaurant, onUpdate, onDelete }: RestaurantCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isLoading = saving || deleting

  const handleSave = async (updates: {
    notes: string
    what_to_order: string
    rating: number | null
    price_range: number | null
    dietary_tags: DietaryTag[]
    context_tags: ContextTag[]
    is_public: boolean
  }) => {
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

  const hasDetails = restaurant.rating || restaurant.what_to_order || restaurant.notes ||
    (restaurant.tags && restaurant.tags.length > 0) ||
    (restaurant.dietary_tags && restaurant.dietary_tags.length > 0) ||
    (restaurant.context_tags && restaurant.context_tags.length > 0)

  return (
    <div className={`p-3 sm:p-4 border rounded-lg bg-white dark:bg-gray-900 max-w-3xl ${isLoading ? 'opacity-75' : ''}`}>
      {/* Header row */}
      <div
        className="flex justify-between items-start gap-4 cursor-pointer"
        onClick={() => !editing && setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{restaurant.name}</h3>
            {!restaurant.is_public && (
              <span className="text-gray-400 flex-shrink-0" title="Hidden from public profile">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </span>
            )}
            {restaurant.rating && (
              <span className="text-yellow-500 text-base flex-shrink-0">
                {'★'.repeat(restaurant.rating)}
              </span>
            )}
            <PriceDisplay value={restaurant.price_range} currency={restaurant.currency} />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm truncate">{restaurant.address}</p>
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
              {hasDetails && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  disabled={isLoading}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={expanded ? 'Collapse' : 'View details'}
                >
                  {expanded ? (
                    <ChevronUpIcon size={20} />
                  ) : (
                    <ChevronDownIcon size={20} />
                  )}
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
                <SquarePenIcon size={20} />
              </button>
            </>
          )}

          {confirmDelete ? (
            <div className="flex items-center gap-1 flex-wrap sm:flex-nowrap">
              <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">Delete?</span>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? '...' : 'Yes'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={isLoading}
                className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <DeleteIcon size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex justify-between items-start gap-2">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 dark:hover:text-red-300 flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Expanded view (read-only details) */}
      {expanded && !editing && (
        <div className="mt-3 pt-3 border-t dark:border-gray-700 space-y-2 text-sm">
          {restaurant.tags && restaurant.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {restaurant.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
          {restaurant.what_to_order && (
            <p><span className="text-gray-400">Order:</span> <span className="text-gray-700 dark:text-gray-300">{restaurant.what_to_order}</span></p>
          )}
          <p><span className="text-gray-400">Notes:</span> <span className="text-gray-600 dark:text-gray-400 italic">{restaurant.notes || 'No notes'}</span></p>
        </div>
      )}

      {/* Edit form */}
      {editing && (
        <RestaurantEditForm
          restaurant={restaurant}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
          saving={saving}
        />
      )}
    </div>
  )
}
