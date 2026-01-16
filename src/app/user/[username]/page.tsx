import { notFound } from 'next/navigation'
import { getProfileByUsername, type Profile } from '@/lib/supabase/profiles'
import { getPublicRestaurantsByUserId } from '@/lib/supabase/restaurants'
import { areFriends } from '@/lib/supabase/friends'
import { createClient } from '@/lib/supabase/server'
import PublicRestaurantList from '@/components/PublicRestaurantList'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props) {
  const { username } = await params
  return {
    title: `@${username}'s Restaurants | nomnomnow`,
    description: `Check out @${username}'s favorite restaurants on nomnomnow`
  }
}

// Privacy message component
function PrivacyMessage({ type, username }: { type: 'private' | 'friends_only'; username: string }) {
  return (
    <Card className="max-w-md mx-auto border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50/50 py-0">
      <CardContent className="py-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-orange-400"
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
        <h2 className="text-xl font-semibold mb-2">
          {type === 'private' ? 'This profile is private' : 'Friends only'}
        </h2>
        <p className="text-muted-foreground">
          {type === 'private'
            ? `@${username} has chosen to keep their restaurant list private.`
            : `@${username}'s restaurant list is only visible to friends.`}
        </p>
      </CardContent>
    </Card>
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
      <main className="min-h-screen bg-gradient-to-b from-orange-50/50 to-background">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold tracking-tight">
                <span className="text-orange-500">@</span>{profile.username}
              </h1>
              <Button asChild className="bg-orange-500 hover:bg-orange-600">
                <Link href="/">
                  🍜 Join <span style={{ color: '#C44411' }}>nomnomnow</span>
                </Link>
              </Button>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <PrivacyMessage type="private" username={profile.username} />
        </div>
      </main>
    )
  }

  // Handle friends-only profiles
  if (visibility === 'friends_only' && !isOwnProfile) {
    let isFriend = false
    if (currentUser) {
      isFriend = await areFriends(currentUser.id, profile.id)
    }

    if (!isFriend) {
      return (
        <main className="min-h-screen bg-gradient-to-b from-orange-50/50 to-background">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold tracking-tight">
                  <span className="text-orange-500">@</span>{profile.username}
                </h1>
                <Button asChild className="bg-orange-500 hover:bg-orange-600">
                  <Link href="/">
                    🍜 Join <span style={{ color: '#C44411' }}>nomnomnow</span>
                  </Link>
                </Button>
              </div>
            </div>
          </header>
          <div className="max-w-7xl mx-auto px-6 py-12">
            <PrivacyMessage type="friends_only" username={profile.username} />
          </div>
        </main>
      )
    }
  }

  // Fetch restaurants
  const restaurants = await getPublicRestaurantsByUserId(profile.id)

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50/50 to-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                <span className="text-orange-500">@</span>{profile.username}
              </h1>
              <p className="text-sm text-muted-foreground">
                {restaurants.length} saved restaurant{restaurants.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button asChild className="bg-orange-500 hover:bg-orange-600">
              <Link href="/">
                🍜 Join <span style={{ color: '#C44411' }}>nomnomnow</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {restaurants.length > 0 ? (
          <div className="bg-white/60 rounded-xl p-6 border border-orange-100/50">
            <PublicRestaurantList restaurants={restaurants} />
          </div>
        ) : (
          <Card className="max-w-md mx-auto border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50/50 py-0">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-3xl">🍜</span>
              </div>
              <h2 className="text-xl font-semibold mb-2">No restaurants yet</h2>
              <p className="text-muted-foreground">
                @{profile.username} hasn&apos;t saved any restaurants to share yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
