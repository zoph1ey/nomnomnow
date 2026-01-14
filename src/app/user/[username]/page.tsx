import { notFound } from 'next/navigation'
import { getProfileByUsername, type Profile } from '@/lib/supabase/profiles'
import { getPublicRestaurantsByUserId } from '@/lib/supabase/restaurants'
import { areFriends } from '@/lib/supabase/friends'
import { createClient } from '@/lib/supabase/server'
import PublicRestaurantList from '@/components/PublicRestaurantList'
import CopyProfileLink from '@/components/CopyProfileLink'
import Link from 'next/link'

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props) {
  const { username } = await params
  return {
    title: `@${username}'s Restaurants | NomNomNow`,
    description: `Check out @${username}'s favorite restaurants on NomNomNow`
  }
}

// Privacy message component
function PrivacyMessage({ type, username }: { type: 'private' | 'friends_only'; username: string }) {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {type === 'private' ? 'This profile is private' : 'Friends only'}
      </h2>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
        {type === 'private'
          ? `@${username} has chosen to keep their restaurant list private.`
          : `@${username}'s restaurant list is only visible to friends.`}
      </p>
    </div>
  )
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params

  const profile = await getProfileByUsername(username) as (Profile & { profile_visibility?: string }) | null

  if (!profile || !profile.username) {
    notFound()
  }

  // Get current user to check friendship status
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  // Check if viewing own profile
  const isOwnProfile = currentUser?.id === profile.id

  // Determine what to show based on privacy settings
  const visibility = profile.profile_visibility || 'public'

  // Handle private profiles
  if (visibility === 'private' && !isOwnProfile) {
    return (
      <main className="max-w-xl mx-auto p-8">
        <div className="mb-6">
          <Link href="/" className="text-sm text-blue-500 dark:text-blue-400 hover:underline">
            NomNomNow
          </Link>
        </div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">@{profile.username}</h1>
        </div>
        <PrivacyMessage type="private" username={profile.username} />
      </main>
    )
  }

  // Handle friends-only profiles
  if (visibility === 'friends_only' && !isOwnProfile) {
    // Check if current user is a friend
    let isFriend = false
    if (currentUser) {
      isFriend = await areFriends(currentUser.id, profile.id)
    }

    if (!isFriend) {
      return (
        <main className="max-w-xl mx-auto p-8">
          <div className="mb-6">
            <Link href="/" className="text-sm text-blue-500 dark:text-blue-400 hover:underline">
              NomNomNow
            </Link>
          </div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">@{profile.username}</h1>
          </div>
          <PrivacyMessage type="friends_only" username={profile.username} />
        </main>
      )
    }
  }

  // Fetch restaurants - only public ones unless viewing own profile
  const restaurants = isOwnProfile
    ? await getPublicRestaurantsByUserId(profile.id) // Still filter by is_public for consistency
    : await getPublicRestaurantsByUserId(profile.id)

  return (
    <main className="max-w-xl mx-auto p-8">
      <div className="mb-6">
        <Link href="/" className="text-sm text-blue-500 dark:text-blue-400 hover:underline">
          NomNomNow
        </Link>
      </div>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">@{profile.username}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {restaurants.length} saved restaurant{restaurants.length !== 1 ? 's' : ''}
          </p>
        </div>
        <CopyProfileLink username={profile.username} />
      </div>

      <PublicRestaurantList restaurants={restaurants} />
    </main>
  )
}
