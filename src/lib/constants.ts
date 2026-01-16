import { DietaryTag, ContextTag } from './supabase/restaurants'

// Display labels for dietary filter chips
export const DIETARY_LABELS: Record<DietaryTag, string> = {
  'halal': 'Halal',
  'vegetarian': 'Vegetarian',
  'vegan': 'Vegan',
  'gluten-free': 'Gluten-Free',
  'dairy-free': 'Dairy-Free',
  'nut-free': 'Nut-Free',
}

// Display labels for context/occasion filter chips
export const CONTEXT_LABELS: Record<ContextTag, string> = {
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

// Price level display options
export const PRICE_LEVELS = [
  { level: 1, label: '$' },
  { level: 2, label: '$$' },
  { level: 3, label: '$$$' },
  { level: 4, label: '$$$$' },
] as const
