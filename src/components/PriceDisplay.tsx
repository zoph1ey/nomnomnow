import { getCurrencyConfig } from '@/lib/currency'

interface PriceDisplayProps {
  value: number | null
  currency?: string | null
}

export default function PriceDisplay({ value, currency }: PriceDisplayProps) {
  if (!value) return null

  const config = getCurrencyConfig(currency || 'USD')

  return (
    <span className="text-sm flex-shrink-0" title={config.labels[value - 1]}>
      {[1, 2, 3, 4].map(level => (
        <span
          key={level}
          className={level <= value ? 'text-blue-500' : 'text-gray-300 dark:text-gray-600'}
        >
          $
        </span>
      ))}
    </span>
  )
}
