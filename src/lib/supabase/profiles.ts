import { createClient } from './client'

export interface Profile {
  id: string
  username: string | null
  created_at: string
  updated_at: string
}

// Username validation: 3-20 chars, lowercase letters/numbers/underscores, must start with letter
const USERNAME_REGEX = /^[a-z][a-z0-9_]{2,19}$/

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username) {
    return { valid: false, error: 'Username is required' }
  }

  const normalized = username.toLowerCase().trim()

  if (normalized.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' }
  }

  if (normalized.length > 20) {
    return { valid: false, error: 'Username must be 20 characters or less' }
  }

  if (!USERNAME_REGEX.test(normalized)) {
    return { valid: false, error: 'Username can only contain lowercase letters, numbers, and underscores, and must start with a letter' }
  }

  if (normalized.includes('__')) {
    return { valid: false, error: 'Username cannot contain consecutive underscores' }
  }

  return { valid: true }
}

/**
 * Get the current user's profile.
 */
export async function getMyProfile(): Promise<Profile | null> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    // Profile doesn't exist yet - create it
    if (error.code === 'PGRST116') {
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({ id: user.id })
        .select()
        .single()

      if (insertError) throw insertError
      return newProfile
    }
    throw error
  }

  return data
}

/**
 * Get a profile by username (for public profile pages).
 * This works without authentication.
 */
export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username.toLowerCase())
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }

  return data
}

/**
 * Check if a username is available.
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username.toLowerCase())
    .single()

  if (error) {
    if (error.code === 'PGRST116') return true // Not found = available
    throw error
  }

  // If the username belongs to current user, it's "available" for them
  if (user && data.id === user.id) return true

  return false
}

/**
 * Update the current user's username.
 * Validates and normalizes the username before saving.
 */
export async function updateUsername(username: string): Promise<Profile> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not logged in')

  // Validate username
  const normalized = username.toLowerCase().trim()
  const validation = validateUsername(normalized)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // Check availability
  const available = await isUsernameAvailable(normalized)
  if (!available) {
    throw new Error('This username is already taken')
  }

  // Update profile
  const { data, error } = await supabase
    .from('profiles')
    .update({
      username: normalized,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)
    .select()
    .single()

  if (error) throw error
  return data
}
