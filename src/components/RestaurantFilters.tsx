'use client'

import { DietaryTag, ContextTag, DIETARY_TAGS, CONTEXT_TAGS } from '@/lib/supabase/restaurants'
import { DIETARY_LABELS, CONTEXT_LABELS, PRICE_LEVELS } from '@/lib/constants'

interface RestaurantFiltersProps {
  priceFilter: number[]
  dietaryFilter: DietaryTag[]
  contextFilter: ContextTag[]
  onPriceChange: (prices: number[]) => void
  onDietaryChange: (tags: DietaryTag[]) => void
  onContextChange: (tags: ContextTag[]) => void
}

export default function RestaurantFilters({
  priceFilter,
  dietaryFilter,
  contextFilter,
  onPriceChange,
  onDietaryChange,
  onContextChange,
}: RestaurantFiltersProps) {
  const togglePrice = (level: number) => {
    onPriceChange(
      priceFilter.includes(level)
        ? priceFilter.filter(l => l !== level)
        : [...priceFilter, level]
    )
  }

  const toggleDietary = (tag: DietaryTag) => {
    onDietaryChange(
      dietaryFilter.includes(tag)
        ? dietaryFilter.filter(t => t !== tag)
        : [...dietaryFilter, tag]
    )
  }

  const toggleContext = (tag: ContextTag) => {
    onContextChange(
      contextFilter.includes(tag)
        ? contextFilter.filter(t => t !== tag)
        : [...contextFilter, tag]
    )
  }

  return (
    <div className="space-y-3 mt-6">
      {/* Price Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-600 dark:text-gray-400">Filter by price:</span>
        {PRICE_LEVELS.map(({ level, label }) => (
          <button
            key={level}
            onClick={() => togglePrice(level)}
            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
              priceFilter.includes(level)
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400'
            }`}
          >
            {label}
          </button>
        ))}
        {priceFilter.length > 0 && (
          <button
            onClick={() => onPriceChange([])}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Dietary Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-600 dark:text-gray-400">Dietary:</span>
        {DIETARY_TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => toggleDietary(tag)}
            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
              dietaryFilter.includes(tag)
                ? 'bg-green-500 text-white border-green-500'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-green-400'
            }`}
          >
            {DIETARY_LABELS[tag]}
          </button>
        ))}
        {dietaryFilter.length > 0 && (
          <button
            onClick={() => onDietaryChange([])}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Context/Occasion Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-600 dark:text-gray-400">Best for:</span>
        {CONTEXT_TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => toggleContext(tag)}
            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
              contextFilter.includes(tag)
                ? 'bg-purple-500 text-white border-purple-500'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-purple-400'
            }`}
          >
            {CONTEXT_LABELS[tag]}
          </button>
        ))}
        {contextFilter.length > 0 && (
          <button
            onClick={() => onContextChange([])}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
