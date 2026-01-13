'use client'

import { ContextTag } from '@/lib/supabase/restaurants'

// Color mapping for context badges - outlined style to distinguish from dietary badges
const CONTEXT_COLORS: Record<ContextTag, { border: string; text: string; darkBorder: string; darkText: string }> = {
  'date-night': { border: 'border-pink-400', text: 'text-pink-600', darkBorder: 'dark:border-pink-500', darkText: 'dark:text-pink-400' },
  'solo-friendly': { border: 'border-blue-400', text: 'text-blue-600', darkBorder: 'dark:border-blue-500', darkText: 'dark:text-blue-400' },
  'group-friendly': { border: 'border-purple-400', text: 'text-purple-600', darkBorder: 'dark:border-purple-500', darkText: 'dark:text-purple-400' },
  'special-occasion': { border: 'border-amber-400', text: 'text-amber-600', darkBorder: 'dark:border-amber-500', darkText: 'dark:text-amber-400' },
  'quick-lunch': { border: 'border-cyan-400', text: 'text-cyan-600', darkBorder: 'dark:border-cyan-500', darkText: 'dark:text-cyan-400' },
  'late-night': { border: 'border-indigo-400', text: 'text-indigo-600', darkBorder: 'dark:border-indigo-500', darkText: 'dark:text-indigo-400' },
  'family-friendly': { border: 'border-teal-400', text: 'text-teal-600', darkBorder: 'dark:border-teal-500', darkText: 'dark:text-teal-400' },
  'work-meeting': { border: 'border-slate-400', text: 'text-slate-600', darkBorder: 'dark:border-slate-500', darkText: 'dark:text-slate-400' },
  'casual-hangout': { border: 'border-orange-400', text: 'text-orange-600', darkBorder: 'dark:border-orange-500', darkText: 'dark:text-orange-400' },
}

// Display labels (user-friendly names)
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

interface ContextBadgesProps {
  tags: ContextTag[]
  size?: 'sm' | 'md'
  maxDisplay?: number  // Limit how many tags to show (to avoid clutter)
}

export function ContextBadges({ tags, size = 'sm', maxDisplay }: ContextBadgesProps) {
  if (!tags || tags.length === 0) return null

  const displayTags = maxDisplay ? tags.slice(0, maxDisplay) : tags
  const remainingCount = maxDisplay && tags.length > maxDisplay ? tags.length - maxDisplay : 0

  const sizeClasses = size === 'sm'
    ? 'px-1.5 py-0.5 text-xs'
    : 'px-2 py-1 text-sm'

  return (
    <div className="flex flex-wrap gap-1">
      {displayTags.map(tag => {
        const colors = CONTEXT_COLORS[tag]
        return (
          <span
            key={tag}
            className={`${sizeClasses} border ${colors.border} ${colors.text} ${colors.darkBorder} ${colors.darkText} rounded-full font-medium bg-transparent`}
          >
            {CONTEXT_LABELS[tag]}
          </span>
        )
      })}
      {remainingCount > 0 && (
        <span className={`${sizeClasses} border border-gray-300 text-gray-500 dark:border-gray-600 dark:text-gray-400 rounded-full font-medium`}>
          +{remainingCount}
        </span>
      )}
    </div>
  )
}

// Export labels for use in forms
export { CONTEXT_LABELS }
