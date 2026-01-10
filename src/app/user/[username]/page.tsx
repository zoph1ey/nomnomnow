import { notFound } from 'next/navigation'
import { getProfileByUsername } from '@/lib/supabase/profiles'
import { getRestaurantsByUserId } from '@/lib/supabase/restaurants'
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

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params

  const profile = await getProfileByUsername(username)

  if (!profile || !profile.username) {
    notFound()
  }

  const restaurants = await getRestaurantsByUserId(profile.id)

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
