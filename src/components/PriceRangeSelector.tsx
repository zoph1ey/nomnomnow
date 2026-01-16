'use client'

import { getCurrencyConfig } from '@/lib/currency'

interface PriceRangeSelectorProps {
  value: number | null
  onChange: (price: number | null) => void
  currency?: string
  showLabel?: boolean
}

export default function PriceRangeSelector({
  value,
  onChange,
  currency = 'USD',
  showLabel = false,
}: PriceRangeSelectorProps) {
  const config = getCurrencyConfig(currency)

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(level => (
          <button
            key={level}
            type="button"
            onClick={() => onChange(value === level ? null : level)}
            className={`px-2 py-1 text-sm rounded border transition-colors ${
              value === level
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400'
            }`}
          >
            {'$'.repeat(level)}
          </button>
        ))}
      </div>
      {showLabel && value && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{config.labels[value - 1]}</p>
      )}
    </div>
  )
}
