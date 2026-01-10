import { createClient } from './client'

export interface SavedRestaurant {
  id: string
  user_id: string
  name: string
  address: string
  place_id: string
  tags: string[]
  notes: string | null
  what_to_order: string | null
  rating: number | null
  created_at: string
}

export async function saveRestaurant(restaurant: {
  name: string
  address: string
  place_id: string
  tags?: string[]
  notes?: string
  what_to_order?: string
  rating?: number | null
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
      notes: restaurant.notes || null,
      what_to_order: restaurant.what_to_order || null,
      rating: restaurant.rating ?? null
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
