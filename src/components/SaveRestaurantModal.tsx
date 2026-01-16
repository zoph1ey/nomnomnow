'use client'

import { useState } from 'react'
import { getCountryCurrency } from './RestaurantSearch'
import { DIETARY_TAGS, DietaryTag, CONTEXT_TAGS, ContextTag } from '@/lib/supabase/restaurants'
import { DIETARY_LABELS, CONTEXT_LABELS } from '@/lib/constants'
import StarRating from './StarRating'
import PriceRangeSelector from './PriceRangeSelector'
import TagSelector from './TagSelector'

interface SaveRestaurantModalProps {
  restaurant: {
    name: string
    address: string
    placeId: string
    countryCode: string | null
  }
  onSave: (data: {
    name: string
    address: string
    place_id: string
    tags: string[]
    dietary_tags: DietaryTag[]
    context_tags: ContextTag[]
    notes: string
    what_to_order: string
    rating: number | null
    price_range: number | null
    currency: string
  }) => Promise<void>
  onCancel: () => void
}

export default function SaveRestaurantModal({
  restaurant,
  onSave,
  onCancel,
}: SaveRestaurantModalProps) {
  const currency = getCountryCurrency(restaurant.countryCode)

  const [tags, setTags] = useState<string[]>([])
  const [dietaryTags, setDietaryTags] = useState<DietaryTag[]>([])
  const [contextTags, setContextTags] = useState<ContextTag[]>([])
  const [notes, setNotes] = useState('')
  const [whatToOrder, setWhatToOrder] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [priceRange, setPriceRange] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleDietaryTag = (tag: DietaryTag) => {
    setDietaryTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const toggleContextTag = (tag: ContextTag) => {
    setContextTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      await onSave({
        name: restaurant.name,
        address: restaurant.address,
        place_id: restaurant.placeId,
        tags,
        dietary_tags: dietaryTags,
        context_tags: contextTags,
        notes,
        what_to_order: whatToOrder,
        rating,
        price_range: priceRange,
        currency,
      })
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      }
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="p-4 border-b dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Save Restaurant</h2>
          </div>

          {/* Content */}
          <div className="p-4 space-y-5">
            {/* Restaurant info */}
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">{restaurant.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{restaurant.address}</p>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Your Rating <span className="text-red-500">*</span>
              </label>
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Price Range <span className="text-red-500">*</span>
              </label>
              <PriceRangeSelector
                value={priceRange}
                onChange={setPriceRange}
                currency={currency}
                showLabel
              />
            </div>

            {/* Dietary Options */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                This restaurant accommodates:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DIETARY_TAGS.map(tag => (
                  <label
                    key={tag}
                    className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={dietaryTags.includes(tag)}
                      onChange={() => toggleDietaryTag(tag)}
                      className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{DIETARY_LABELS[tag]}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Context Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Best For
              </label>
              <div className="flex flex-wrap gap-2">
                {CONTEXT_TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleContextTag(tag)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                      contextTags.includes(tag)
                        ? 'bg-purple-500 text-white border-purple-500'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-purple-400'
                    }`}
                  >
                    {CONTEXT_LABELS[tag]}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Tags
              </label>
              <TagSelector selected={tags} onChange={setTags} />
            </div>

            {/* What to order */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                What to Order
              </label>
              <input
                type="text"
                value={whatToOrder}
                onChange={e => setWhatToOrder(e.target.value)}
                placeholder="e.g., Spicy ramen, crispy gyoza"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any personal notes about this place..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t dark:border-gray-700">
            {(!rating || !priceRange) && (
              <p className="text-sm text-amber-600 dark:text-amber-500 mb-3">
                Please select: {[!rating && 'rating', !priceRange && 'price range'].filter(Boolean).join(' and ')}
              </p>
            )}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onCancel}
                disabled={saving}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !rating || !priceRange}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Restaurant'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
