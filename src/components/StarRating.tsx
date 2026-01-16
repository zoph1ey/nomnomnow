'use client'

interface StarRatingProps {
  value: number | null
  onChange?: (rating: number | null) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'text-lg gap-0.5',
  md: 'text-xl gap-1',
  lg: 'text-2xl gap-1',
}

export default function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
}: StarRatingProps) {
  return (
    <div className={`flex ${sizeClasses[size]}`}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(value === star ? null : star)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform text-yellow-500`}
        >
          {value && star <= value ? '★' : '☆'}
        </button>
      ))}
    </div>
  )
}
