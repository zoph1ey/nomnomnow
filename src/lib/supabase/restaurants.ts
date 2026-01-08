import { createClient } from './client'

export async function saveRestaurant(restaurant: {
  name: string
  address: string
  place_id: string
  tags?: string[]
}) {
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
      tags: restaurant.tags || []
    })
    .select()
    .single()

  if (error) throw error
  return data
}
