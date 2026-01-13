'use client'

import { useState } from 'react'
import { getCurrencyConfig } from '@/lib/currency'
import { getCountryCurrency } from './RestaurantSearch'
import { DIETARY_TAGS, DietaryTag } from '@/lib/supabase/restaurants'

// Display labels for dietary tags
const DIETARY_LABELS: Record<DietaryTag, string> = {
  'halal': 'Halal',
  'vegetarian': 'Vegetarian',
  'vegan': 'Vegan',
  'gluten-free': 'Gluten-Free',
  'dairy-free': 'Dairy-Free',
  'nut-free': 'Nut-Free',
}

const SUGGESTED_TAGS = [
  'korean', 'japanese', 'chinese', 'thai', 'vietnamese', 'italian', 'mexican', 'indian',
  'cafe', 'fast food', 'fine dining',
  'late night', 'breakfast', 'lunch', 'dinner',
  'date night', 'family friendly'
]

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
    notes: string
    what_to_order: string
    rating: number | null
    price_range: number | null
    currency: string
  }) => Promise<void>
  onCancel: () => void
}

function StarRating({
  value,
  onChange
}: {
  value: number | null
  onChange: (rating: number | null) => void
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(value === star ? null : star)}
          className="text-2xl cursor-pointer hover:scale-110 transition-transform text-yellow-500"
        >
          {value && star <= value ? '★' : '☆'}
        </button>
      ))}
    </div>
  )
}

function TagSelector({
  selected,
  onChange
}: {
  selected: string[]
  onChange: (tags: string[]) => void
}) {
  const [customTag, setCustomTag] = useState('')

  const toggleTag = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter(t => t !== tag))
    } else {
      onChange([...selected, tag])
    }
  }

  const addCustomTag = () => {
    const tag = customTag.trim().toLowerCase()
    if (tag && !selected.includes(tag)) {
      onChange([...selected, tag])
    }
    setCustomTag('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCustomTag()
    }
  }

  // Custom tags are ones not in the suggested list
  const customTags = selected.filter(tag => !SUGGESTED_TAGS.includes(tag))

  return (
    <div className="space-y-3">
      {/* Custom tag input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customTag}
          onChange={e => setCustomTag(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add custom tag..."
          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={addCustomTag}
          disabled={!customTag.trim()}
          className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>

      {/* Selected custom tags */}
      {customTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {customTags.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className="px-3 py-1 text-sm rounded-full bg-blue-500 text-white border border-blue-500 flex items-center gap-1"
            >
              {tag}
              <span className="text-blue-200">×</span>
            </button>
          ))}
        </div>
      )}

      {/* Suggested tags */}
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_TAGS.map(tag => (
          <button
            key={tag}
            type="button"
            onClick={() => toggleTag(tag)}
            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
              selected.includes(tag)
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  )
}

function PriceRangeSelector({
  value,
  onChange,
  currency
}: {
  value: number | null
  onChange: (price: number | null) => void
  currency: string
}) {
  const config = getCurrencyConfig(currency)
  const symbols = ['$', '$$', '$$$', '$$$$']  // Universal symbols for buttons

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {[1, 2, 3, 4].map(level => (
          <button
            key={level}
            type="button"
            onClick={() => onChange(value === level ? null : level)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              value === level
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
            }`}
          >
            {symbols[level - 1]}
          </button>
        ))}
      </div>
      {value && (
        <p className="text-sm text-gray-600">{config.labels[value - 1]}</p>
      )}
    </div>
  )
}

export default function SaveRestaurantModal({
  restaurant,
  onSave,
  onCancel
}: SaveRestaurantModalProps) {
  // Derive currency from restaurant's country
  const currency = getCountryCurrency(restaurant.countryCode)
  const [tags, setTags] = useState<string[]>([])
  const [dietaryTags, setDietaryTags] = useState<DietaryTag[]>([])
  const [notes, setNotes] = useState('')
  const [whatToOrder, setWhatToOrder] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [priceRange, setPriceRange] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleDietaryTag = (tag: DietaryTag) => {
    if (dietaryTags.includes(tag)) {
      setDietaryTags(dietaryTags.filter(t => t !== tag))
    } else {
      setDietaryTags([...dietaryTags, tag])
    }
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
        notes,
        what_to_order: whatToOrder,
        rating,
        price_range: priceRange,
        currency
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
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Save Restaurant</h2>
          </div>

          {/* Content */}
          <div className="p-4 space-y-5">
            {/* Restaurant info (read-only) */}
            <div className="p-3 bg-gray-100 rounded-lg">
              <h3 className="font-medium text-gray-900">{restaurant.name}</h3>
              <p className="text-sm text-gray-600">{restaurant.address}</p>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Your Rating <span className="text-red-500">*</span>
              </label>
              <StarRating value={rating} onChange={setRating} />
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Price Range <span className="text-red-500">*</span>
              </label>
              <PriceRangeSelector value={priceRange} onChange={setPriceRange} currency={currency} />
            </div>

            {/* Dietary Options */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                This restaurant accommodates:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DIETARY_TAGS.map(tag => (
                  <label
                    key={tag}
                    className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors"
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

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Tags
              </label>
              <TagSelector selected={tags} onChange={setTags} />
            </div>

            {/* What to order */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                What to Order
              </label>
              <input
                type="text"
                value={whatToOrder}
                onChange={e => setWhatToOrder(e.target.value)}
                placeholder="e.g., Spicy ramen, crispy gyoza"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any personal notes about this place..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t">
            {(!rating || !priceRange) && (
              <p className="text-sm text-amber-600 mb-3">
                Please select: {[
                  !rating && 'rating',
                  !priceRange && 'price range'
                ].filter(Boolean).join(' and ')}
              </p>
            )}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onCancel}
                disabled={saving}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
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
