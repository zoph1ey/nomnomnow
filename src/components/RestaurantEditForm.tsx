'use client'

import { useState } from 'react'
import { DietaryTag, ContextTag, DIETARY_TAGS, CONTEXT_TAGS, SavedRestaurant } from '@/lib/supabase/restaurants'
import { DIETARY_LABELS, CONTEXT_LABELS } from '@/lib/constants'
import StarRating from './StarRating'
import PriceRangeSelector from './PriceRangeSelector'

interface RestaurantEditFormProps {
  restaurant: SavedRestaurant
  onSave: (updates: {
    notes: string
    what_to_order: string
    rating: number | null
    price_range: number | null
    dietary_tags: DietaryTag[]
    context_tags: ContextTag[]
    is_public: boolean
  }) => void
  onCancel: () => void
  saving: boolean
}

export default function RestaurantEditForm({
  restaurant,
  onSave,
  onCancel,
  saving,
}: RestaurantEditFormProps) {
  const [notes, setNotes] = useState(restaurant.notes || '')
  const [whatToOrder, setWhatToOrder] = useState(restaurant.what_to_order || '')
  const [rating, setRating] = useState<number | null>(restaurant.rating)
  const [priceRange, setPriceRange] = useState<number | null>(restaurant.price_range)
  const [dietaryTags, setDietaryTags] = useState<DietaryTag[]>(restaurant.dietary_tags || [])
  const [contextTags, setContextTags] = useState<ContextTag[]>(restaurant.context_tags || [])
  const [isPublic, setIsPublic] = useState(restaurant.is_public ?? true)

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      notes: notes || '',
      what_to_order: whatToOrder || '',
      rating,
      price_range: priceRange,
      dietary_tags: dietaryTags,
      context_tags: contextTags,
      is_public: isPublic,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 border-t pt-3">
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Rating</label>
        <StarRating value={rating} onChange={setRating} size="sm" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Price Range</label>
        <PriceRangeSelector value={priceRange} onChange={setPriceRange} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Dietary Options</label>
        <div className="grid grid-cols-2 gap-1">
          {DIETARY_TAGS.map(tag => (
            <label
              key={tag}
              className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Best For</label>
        <div className="flex flex-wrap gap-1.5">
          {CONTEXT_TAGS.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleContextTag(tag)}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
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

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">What to order</label>
        <input
          type="text"
          value={whatToOrder}
          onChange={e => setWhatToOrder(e.target.value)}
          placeholder="e.g., Spicy ramen, gyoza"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Personal notes..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      <div className="pt-2 border-t dark:border-gray-700">
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-10 h-6 rounded-full transition-colors ${isPublic ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isPublic ? 'translate-x-5' : 'translate-x-1'}`} />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {isPublic ? 'Visible on public profile' : 'Hidden from public profile'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isPublic ? 'Anyone viewing your profile can see this' : 'Only you can see this restaurant'}
            </p>
          </div>
        </label>
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
          className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
