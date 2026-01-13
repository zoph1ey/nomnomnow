'use client'

import { DietaryTag } from '@/lib/supabase/restaurants'

// Color mapping for dietary badges - chosen for quick visual recognition
const DIETARY_COLORS: Record<DietaryTag, { bg: string; text: string; darkBg: string; darkText: string }> = {
  'halal': { bg: 'bg-green-100', text: 'text-green-800', darkBg: 'dark:bg-green-900', darkText: 'dark:text-green-200' },
  'vegetarian': { bg: 'bg-lime-100', text: 'text-lime-800', darkBg: 'dark:bg-lime-900', darkText: 'dark:text-lime-200' },
  'vegan': { bg: 'bg-emerald-100', text: 'text-emerald-800', darkBg: 'dark:bg-emerald-900', darkText: 'dark:text-emerald-200' },
  'gluten-free': { bg: 'bg-amber-100', text: 'text-amber-800', darkBg: 'dark:bg-amber-900', darkText: 'dark:text-amber-200' },
  'dairy-free': { bg: 'bg-sky-100', text: 'text-sky-800', darkBg: 'dark:bg-sky-900', darkText: 'dark:text-sky-200' },
  'nut-free': { bg: 'bg-orange-100', text: 'text-orange-800', darkBg: 'dark:bg-orange-900', darkText: 'dark:text-orange-200' },
}

// Display labels (capitalize nicely)
const DIETARY_LABELS: Record<DietaryTag, string> = {
  'halal': 'Halal',
  'vegetarian': 'Vegetarian',
  'vegan': 'Vegan',
  'gluten-free': 'Gluten-Free',
  'dairy-free': 'Dairy-Free',
  'nut-free': 'Nut-Free',
}

interface DietaryBadgesProps {
  tags: DietaryTag[]
  size?: 'sm' | 'md'
}

export function DietaryBadges({ tags, size = 'sm' }: DietaryBadgesProps) {
  if (!tags || tags.length === 0) return null

  const sizeClasses = size === 'sm'
    ? 'px-1.5 py-0.5 text-xs'
    : 'px-2 py-1 text-sm'

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map(tag => {
        const colors = DIETARY_COLORS[tag]
        return (
          <span
            key={tag}
            className={`${sizeClasses} ${colors.bg} ${colors.text} ${colors.darkBg} ${colors.darkText} rounded-full font-medium`}
          >
            {DIETARY_LABELS[tag]}
          </span>
        )
      })}
    </div>
  )
}
