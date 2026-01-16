'use client'

import { useState } from 'react'
import Link from 'next/link'
import RestaurantSearch from '@/components/RestaurantSearch'
import SavedRestaurants from '@/components/SavedRestaurants'
import SaveRestaurantModal from '@/components/SaveRestaurantModal'
import CopyProfileLink from '@/components/CopyProfileLink'
import RestaurantFilters from '@/components/RestaurantFilters'
import { saveRestaurant, DietaryTag, ContextTag } from '@/lib/supabase/restaurants'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/supabase/profiles'
import type { User } from '@supabase/supabase-js'

interface Restaurant {
  name: string
  address: string
  placeId: string
  countryCode: string | null
}

interface HomePageProps {
  user: User
  profile: Profile | null
  onLogout: () => void
}

export default function HomePage({ user, profile, onLogout }: HomePageProps) {
  const [selected, setSelected] = useState<Restaurant | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [priceFilter, setPriceFilter] = useState<number[]>([])
  const [dietaryFilter, setDietaryFilter] = useState<DietaryTag[]>([])
  const [contextFilter, setContextFilter] = useState<ContextTag[]>([])

  const handleSave = async (data: {
    name: string
    address: string
    place_id: string
    tags: string[]
    dietary_tags: DietaryTag[]
    context_tags: ContextTag[]
    notes: string
    what_to_order: string
    rating: number | null
    price_range: number | null
    currency: string
  }) => {
    await saveRestaurant(data)
    setSelected(null)
    setShowSaveModal(false)
    setRefreshTrigger(prev => prev + 1)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    onLogout()
  }

  return (
    <main className="max-w-xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">NomNomNow 🍜</h1>
        <div className="text-sm">
          <div className="flex items-center gap-3">
            <span className="text-gray-600 dark:text-gray-400">{user.email}</span>
            <Link
              href="/settings"
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
            <button onClick={handleLogout} className="text-blue-500 hover:underline">
              Log out
            </button>
          </div>
        </div>
      </div>

      <RestaurantSearch onSelect={setSelected} />

      {selected && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{selected.name}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{selected.address}</p>
          <button
            onClick={() => setShowSaveModal(true)}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            + Save
          </button>
        </div>
      )}

      {showSaveModal && selected && (
        <SaveRestaurantModal
          restaurant={selected}
          onSave={handleSave}
          onCancel={() => {
            setShowSaveModal(false)
            setSelected(null)
          }}
        />
      )}

      <Link
        href="/picker"
        className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all font-medium"
      >
        Can&apos;t decide? Try AI Picker
      </Link>

      <RestaurantFilters
        priceFilter={priceFilter}
        dietaryFilter={dietaryFilter}
        contextFilter={contextFilter}
        onPriceChange={setPriceFilter}
        onDietaryChange={setDietaryFilter}
        onContextChange={setContextFilter}
      />

      <SavedRestaurants
        refreshTrigger={refreshTrigger}
        priceFilter={priceFilter}
        dietaryFilter={dietaryFilter}
        contextFilter={contextFilter}
      />

      {profile?.username ? (
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Share your restaurant list:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm bg-white dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto text-gray-800 dark:text-gray-200">
              /user/{profile.username}
            </code>
            <CopyProfileLink username={profile.username} />
          </div>
        </div>
      ) : (
        <div className="mt-6 p-4 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
            Set up your username to share your restaurant list with friends!
          </p>
          <Link
            href="/settings"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Go to settings
          </Link>
        </div>
      )}
    </main>
  )
}
