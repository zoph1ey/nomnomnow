import { createClient } from './client'
import type { Profile } from './profiles'

export type FriendshipStatus = 'pending' | 'accepted' | 'rejected'

export interface Friendship {
  id: string
  requester_id: string
  addressee_id: string
  status: FriendshipStatus
  created_at: string
  updated_at: string
}

export interface FriendshipWithProfile extends Friendship {
  requester?: Profile
  addressee?: Profile
}

/**
 * Send a friend request to another user.
 */
export async function sendFriendRequest(addresseeId: string): Promise<Friendship> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')

  if (user.id === addresseeId) {
    throw new Error('Cannot send friend request to yourself')
  }

  // Check if a friendship already exists in either direction
  const { data: existing } = await supabase
    .from('friendships')
    .select('*')
    .or(`and(requester_id.eq.${user.id},addressee_id.eq.${addresseeId}),and(requester_id.eq.${addresseeId},addressee_id.eq.${user.id})`)
    .single()

  if (existing) {
    if (existing.status === 'accepted') {
      throw new Error('Already friends with this user')
    }
    if (existing.status === 'pending') {
      throw new Error('Friend request already pending')
    }
  }

  const { data, error } = await supabase
    .from('friendships')
    .insert({
      requester_id: user.id,
      addressee_id: addresseeId
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Accept a pending friend request.
 */
export async function acceptFriendRequest(friendshipId: string): Promise<Friendship> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')

  const { data, error } = await supabase
    .from('friendships')
    .update({
      status: 'accepted',
      updated_at: new Date().toISOString()
    })
    .eq('id', friendshipId)
    .eq('addressee_id', user.id)
    .eq('status', 'pending')
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Reject a pending friend request.
 */
export async function rejectFriendRequest(friendshipId: string): Promise<void> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')

  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId)
    .eq('addressee_id', user.id)
    .eq('status', 'pending')

  if (error) throw error
}

/**
 * Cancel a sent friend request.
 */
export async function cancelFriendRequest(friendshipId: string): Promise<void> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')

  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId)
    .eq('requester_id', user.id)
    .eq('status', 'pending')

  if (error) throw error
}

/**
 * Remove a friendship (unfriend).
 */
export async function unfriend(friendshipId: string): Promise<void> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')

  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId)

  if (error) throw error
}

/**
 * Get all accepted friends for the current user.
 */
export async function getFriends(): Promise<FriendshipWithProfile[]> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')

  const { data, error } = await supabase
    .from('friendships')
    .select(`
      *,
      requester:profiles!friendships_requester_id_fkey(*),
      addressee:profiles!friendships_addressee_id_fkey(*)
    `)
    .eq('status', 'accepted')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

  if (error) throw error
  return data || []
}

/**
 * Get count of pending friend requests received by the current user.
 */
export async function getPendingRequestsCount(): Promise<number> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const { count, error } = await supabase
    .from('friendships')
    .select('*', { count: 'exact', head: true })
    .eq('addressee_id', user.id)
    .eq('status', 'pending')

  if (error) return 0
  return count || 0
}

/**
 * Get pending friend requests received by the current user.
 */
export async function getPendingRequests(): Promise<FriendshipWithProfile[]> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')

  const { data, error } = await supabase
    .from('friendships')
    .select(`
      *,
      requester:profiles!friendships_requester_id_fkey(*)
    `)
    .eq('addressee_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get friend requests sent by the current user that are still pending.
 */
export async function getSentRequests(): Promise<FriendshipWithProfile[]> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')

  const { data, error } = await supabase
    .from('friendships')
    .select(`
      *,
      addressee:profiles!friendships_addressee_id_fkey(*)
    `)
    .eq('requester_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Check if two users are friends.
 * This function works without authentication for public profile checks.
 */
export async function areFriends(userId1: string, userId2: string): Promise<boolean> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('friendships')
    .select('id')
    .eq('status', 'accepted')
    .or(`and(requester_id.eq.${userId1},addressee_id.eq.${userId2}),and(requester_id.eq.${userId2},addressee_id.eq.${userId1})`)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return false // Not found
    throw error
  }

  return !!data
}

/**
 * Search for a user by username (for sending friend requests).
 */
export async function searchUserByUsername(username: string): Promise<Profile | null> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username.toLowerCase())
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  // Don't return self
  if (data.id === user.id) return null

  return data
}
