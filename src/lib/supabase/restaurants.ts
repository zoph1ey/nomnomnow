import { createClient } from './client'

// Standardized dietary tags
export const DIETARY_TAGS = [
  'halal',
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'nut-free'
] as const

export type DietaryTag = typeof DIETARY_TAGS[number]

// Context/occasion tags - describe WHEN or HOW a restaurant is best used
export const CONTEXT_TAGS = [
  'date-night',
  'solo-friendly',
  'group-friendly',
  'special-occasion',
  'quick-lunch',
  'late-night',
  'family-friendly',
  'work-meeting',
  'casual-hangout'
] as const

export type ContextTag = typeof CONTEXT_TAGS[number]

export interface SavedRestaurant {
  id: string
  user_id: string
  name: string
  address: string
  place_id: string
  tags: string[]
  dietary_tags: DietaryTag[]
  context_tags: ContextTag[]
  notes: string | null
  what_to_order: string | null
  rating: number | null
  price_range: number | null  // 1-4 representing budget tiers
  currency: string | null     // Currency code based on restaurant location (e.g., 'MYR', 'USD')
  created_at: string
}

export async function saveRestaurant(restaurant: {
  name: string
  address: string
  place_id: string
  tags?: string[]
  dietary_tags?: DietaryTag[]
  context_tags?: ContextTag[]
  notes?: string
  what_to_order?: string
  rating?: number | null
  price_range?: number | null
  currency?: string | null
}): Promise<SavedRestaurant> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not logged in')

  const { data, error } = await supabase
    .from('restaurants')
    .insert({
      user_id: user.id,
      name: restaurant.name,
      address: restaurant.address,
      place_id: restaurant.place_id,
      tags: restaurant.tags || [],
      dietary_tags: restaurant.dietary_tags || [],
      context_tags: restaurant.context_tags || [],
      notes: restaurant.notes || null,
      what_to_order: restaurant.what_to_order || null,
      rating: restaurant.rating ?? null,
      price_range: restaurant.price_range ?? null,
      currency: restaurant.currency ?? 'USD'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Fetches all saved restaurants for the current user.
 * Returns them sorted by creation date (newest first).
 */
export async function getSavedRestaurants(): Promise<SavedRestaurant[]> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not logged in')

  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Deletes a restaurant by ID.
 * Security: Only allows deletion if the restaurant belongs to the current user.
 * This is enforced by matching both the restaurant ID and the user's ID.
 */
export async function deleteRestaurant(restaurantId: string): Promise<void> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not logged in')

  // Delete only if the restaurant belongs to the current user
  // The .eq('user_id', user.id) ensures users can only delete their own restaurants
  const { error } = await supabase
    .from('restaurants')
    .delete()
    .eq('id', restaurantId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Updates a restaurant's editable fields.
 * Security: Only allows update if the restaurant belongs to the current user.
 */
export async function updateRestaurant(
  restaurantId: string,
  updates: {
    notes?: string | null
    what_to_order?: string | null
    rating?: number | null
    tags?: string[]
    dietary_tags?: DietaryTag[]
    context_tags?: ContextTag[]
    price_range?: number | null
  }
): Promise<SavedRestaurant> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not logged in')

  const { data, error } = await supabase
    .from('restaurants')
    .update(updates)
    .eq('id', restaurantId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Fetches all saved restaurants for a specific user by their user ID.
 * This is used for public profile pages and doesn't require authentication.
 */
export async function getRestaurantsByUserId(userId: string): Promise<SavedRestaurant[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}
